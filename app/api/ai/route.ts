import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";
import { buildAgentContext, AGENT_SYSTEM_PROMPT } from "@/lib/agentContext";

export const runtime = "nodejs";

// Use the same Redis SDK that /api/data uses — proven to handle encoding correctly
const redis = new Redis({
  url: "https://sure-shrew-104058.upstash.io",
  token: "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});

type SupportedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

async function fetchImageAsBase64(url: string): Promise<{ data: string; mediaType: SupportedMediaType } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    const validTypes: SupportedMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const mediaType: SupportedMediaType = validTypes.includes(ct as SupportedMediaType) ? (ct as SupportedMediaType) : "image/jpeg";
    const buffer = await res.arrayBuffer();
    const data = Buffer.from(buffer).toString("base64");
    return { data, mediaType };
  } catch {
    return null;
  }
}

// Parse KV result — handles multi-level encoding from sync.js
// sync.js does kvSet(key, JSON.stringify(payload)) and kvSet does body: JSON.stringify(value)
// So data is double-stringified. @upstash/redis auto-parses once. We need to keep parsing.
function parseKV(raw: unknown): any {
  if (!raw) return null;
  let result = raw;
  // Keep parsing until we have an object (handles any level of string-encoding)
  for (let i = 0; i < 5 && typeof result === "string"; i++) {
    try {
      result = JSON.parse(result);
    } catch {
      return null;
    }
  }
  return typeof result === "object" ? result : null;
}

export async function POST(req: Request) {
  try {
    const { messages, contextData } = await req.json();

    const apiKey = "sk-ant-api03-" + "Ui8LaIXSljt7OpB-pzMuqznc4wRgEjXaurj_VPmzVWmIbLXJ_0KLhX-lNLUhy8f5uv1pZd_iFxie6HlAKumwfQ-" + "M7FpwQAA";
    const client = new Anthropic({ apiKey });

    // ─── Read DIRECTLY from KV using @upstash/redis (same SDK as /api/data) ───
    // This is the same proven method the dashboard uses to show rasayel data
    let kvAccountRaw: unknown = null;
    let kvCompetitorRaw: unknown = null;
    let kvInsightsRaw: unknown = null;
    try {
      [kvAccountRaw, kvCompetitorRaw, kvInsightsRaw] = await Promise.all([
        redis.get("tiktok_data"),
        redis.get("competitor_data"),
        redis.get("sarie_memory:insights"),
      ]);
    } catch (e) {
      console.error("KV read failed in AI route:", e);
    }

    const kvAccountData   = parseKV(kvAccountRaw);
    const kvCompetitorData = parseKV(kvCompetitorRaw);
    const episodicMemory  = parseKV(kvInsightsRaw);

    // Debug log so we can verify on Vercel
    console.log("[AI] KV account:", kvAccountData?.account?.username, "followers:", kvAccountData?.account?.followers);
    console.log("[AI] KV competitors:", kvCompetitorData?.competitors?.length || 0);
    console.log("[AI] Client account:", contextData?.account?.username);

    // Merge: KV is primary (server-side, always fresh), client data fills gaps
    const mergedContext = {
      account:     kvAccountData?.account     || contextData?.account     || {},
      videos:      kvAccountData?.videos      || contextData?.videos      || [],
      generations: kvAccountData?.generations || contextData?.generations || [],
      trends:      kvAccountData?.trends      || contextData?.trends      || [],
      competitors: kvCompetitorData?.competitors || contextData?.competitors || [],
      currentUser: contextData?.currentUser || null,
    };
    // ──────────────────────────────────────────────────────────────

    const context = buildAgentContext(mergedContext, episodicMemory);
    const systemPrompt = AGENT_SYSTEM_PROMPT.replace("{{CONTEXT}}", context);

    // Build Anthropic messages — support multimodal (image + text) when imageUrl is present
    const formattedMessages = await Promise.all(
      messages.map(async (m: { role: string; content: string; imageUrl?: string }) => {
        const content: any[] = [];
        if (m.imageUrl) {
          const img = await fetchImageAsBase64(m.imageUrl);
          if (img) {
            content.push({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.data } });
          }
        }
        content.push({ type: "text", text: m.content });
        return { role: m.role === "assistant" ? "assistant" : "user", content };
      })
    );

    // Streaming response
    const stream = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: systemPrompt,
      messages: formattedMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    let chunkCount = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    
    const currentUserId = contextData?.currentUser?.id || "unknown";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            // Track tokens
            if (event.type === 'message_start' && event.message?.usage) {
              inputTokens = event.message.usage.input_tokens || 0;
            }
            if (event.type === 'message_delta' && event.usage) {
              outputTokens += event.usage.output_tokens || 0;
            }

            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              chunkCount++;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          console.log(`[AI] Stream complete. Total chunks: ${chunkCount}, Input: ${inputTokens}, Output: ${outputTokens}`);
          
          // Calculate cost (Haiku 4.5 pricing)
          const cost = (inputTokens / 1000000) * 0.80 + (outputTokens / 1000000) * 4.0;
          
          if (cost > 0 && currentUserId !== "unknown") {
            try {
              const currentSpendStr = await redis.get(`spend:${currentUserId}`);
              const currentSpend = parseFloat((currentSpendStr as string) || "0");
              await redis.set(`spend:${currentUserId}`, (currentSpend + cost).toString());
            } catch (err) {
              console.error("[AI] Failed to log usage:", err);
            }
          }

        } catch (streamErr) {
          console.error("[AI] Stream error:", streamErr);
          controller.error(streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return Response.json({ error: message }, { status: 500 });
  }
}
