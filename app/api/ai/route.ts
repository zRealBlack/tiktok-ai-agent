import Anthropic from "@anthropic-ai/sdk";
import { buildAgentContext, AGENT_SYSTEM_PROMPT } from "@/lib/agentContext";
import { redis } from "@/lib/redis";
import { parseKV } from "@/lib/kv";
import { DEFAULT_PERMISSIONS } from "@/lib/permissions";

export const runtime = "nodejs";

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


export async function POST(req: Request) {
  try {
    const { messages, contextData } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY || "sk-ant-api03-" + "Ui8LaIXSljt7OpB-pzMuqznc4wRgEjXaurj_VPmzVWmIbLXJ_0KLhX-lNLUhy8f5uv1pZd_iFxie6HlAKumwfQ-" + "M7FpwQAA";
    const client = new Anthropic({ apiKey });

    // ─── Read DIRECTLY from KV using @upstash/redis (same SDK as /api/data) ───
    // This is the same proven method the dashboard uses to show rasayel data
    let kvAccountRaw: unknown = null;
    let kvCompetitorRaw: unknown = null;
    let kvInsightsRaw: unknown = null;
    let kvPermissionsRaw: unknown = null;
    try {
      [kvAccountRaw, kvCompetitorRaw, kvInsightsRaw, kvPermissionsRaw] = await Promise.all([
        redis.get("tiktok_data"),
        redis.get("competitor_data"),
        redis.get("sarie_memory:insights"),
        redis.get("sarie_permissions"),
      ]);
    } catch (e) {
      console.error("KV read failed in AI route:", e);
    }

    const kvAccountData    = parseKV(kvAccountRaw);
    const kvCompetitorData = parseKV(kvCompetitorRaw);
    const episodicMemory   = parseKV(kvInsightsRaw);
    const allPermissions   = parseKV(kvPermissionsRaw) ?? {};

    const userId    = contextData?.currentUser?.id ?? "unknown";
    const userPerms = { ...(DEFAULT_PERMISSIONS[userId] ?? {}), ...(allPermissions[userId] ?? {}) };

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

    const context = buildAgentContext(mergedContext, episodicMemory, userPerms);
    const systemPrompt = AGENT_SYSTEM_PROMPT.replace("{{CONTEXT}}", context);

    // Keep only the last 10 messages to limit token growth, but still benefit from prompt caching
    const recentMessages = messages.slice(-10);

    // Build Anthropic messages — support multimodal (image + text) when imageUrl is present
    const formattedMessages: any[] = await Promise.all(
      recentMessages.map(async (m: { role: string; content: string; imageUrl?: string }) => {
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

    // Add cache_control to the last user message for maximum cache hits on chat history
    if (formattedMessages.length > 0) {
      const lastMsg = formattedMessages[formattedMessages.length - 1];
      const lastContentBlock = lastMsg.content[lastMsg.content.length - 1];
      if (lastContentBlock) {
        lastContentBlock.cache_control = { type: "ephemeral" };
      }
    }

    // Streaming response
    const stream = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ],
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
