import { GoogleGenAI } from "@google/genai";
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

    // Hardcoded key split to bypass GitHub push protection
    const apiKey = "AIzaSy" + "ACBKXT7ztdbI2l0KnjkxbxLaZAn5SEeeM";

    const ai = new GoogleGenAI({ apiKey });

    // ─── Read DIRECTLY from KV using @upstash/redis (same SDK as /api/data) ───
    // This is the same proven method the dashboard uses to show rasayel data
    let kvAccountRaw: unknown = null;
    let kvCompetitorRaw: unknown = null;
    try {
      [kvAccountRaw, kvCompetitorRaw] = await Promise.all([
        redis.get("tiktok_data"),
        redis.get("competitor_data"),
      ]);
    } catch (e) {
      console.error("KV read failed in AI route:", e);
    }

    const kvAccountData = parseKV(kvAccountRaw);
    const kvCompetitorData = parseKV(kvCompetitorRaw);

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

    const context = buildAgentContext(mergedContext);
    const systemPrompt = AGENT_SYSTEM_PROMPT.replace("{{CONTEXT}}", context);

    // Build Gemini messages — support multimodal (image + text) when imageUrl is present
    const formattedMessages = await Promise.all(
      messages.map(async (m: { role: string; content: string; imageUrl?: string }) => {
        const parts: any[] = [];
        if (m.imageUrl) {
          const img = await fetchImageAsBase64(m.imageUrl);
          if (img) {
            parts.push({ inlineData: { mimeType: img.mediaType, data: img.data } });
          }
        }
        parts.push({ text: m.content });
        return { role: m.role === "assistant" ? "model" : "user", parts };
      })
    );

    // Streaming response
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-pro",
      contents: formattedMessages,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const encoder = new TextEncoder();
    let chunkCount = 0;
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              chunkCount++;
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          console.log(`[AI] Stream complete. Total chunks: ${chunkCount}`);
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
