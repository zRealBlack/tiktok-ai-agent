import Anthropic from "@anthropic-ai/sdk";
import { buildAgentContext, AGENT_SYSTEM_PROMPT } from "@/lib/agentContext";
import { redis } from "@/lib/redis";
import { parseKV } from "@/lib/kv";
import { DEFAULT_PERMISSIONS } from "@/lib/permissions";

export const runtime = "nodejs";

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const IMAGE_TYPES: ImageMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const TEXT_TYPES = ["text/plain","text/csv","text/markdown","text/html","text/xml","application/json","application/xml","application/javascript","application/typescript"];

// Extract base64 payload from a data URL (strips "data:<mime>;base64," prefix)
function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

// Build Anthropic content blocks for an attached file
function buildAttachmentBlocks(attachment: { name: string; url: string; mimeType?: string }): any[] {
  const mime = (attachment.mimeType || "").toLowerCase();
  const base64 = dataUrlToBase64(attachment.url);

  if (IMAGE_TYPES.includes(mime as ImageMediaType)) {
    return [{ type: "image", source: { type: "base64", media_type: mime as ImageMediaType, data: base64 } }];
  }

  if (mime === "application/pdf") {
    return [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }];
  }

  if (TEXT_TYPES.some(t => mime.startsWith(t.split("/")[0]) && mime.includes(t.split("/")[1])) || mime.startsWith("text/")) {
    try {
      const text = Buffer.from(base64, "base64").toString("utf-8");
      return [{ type: "text", text: `[File: ${attachment.name}]\n\`\`\`\n${text.slice(0, 30000)}\n\`\`\`` }];
    } catch { /* fall through */ }
  }

  // Unsupported binary (Excel, Word, etc.) — describe it so Sarie is aware
  const kb = Math.round((base64.length * 3) / 4 / 1024);
  return [{ type: "text", text: `[Attached file: ${attachment.name} (${kb} KB) — binary format, content not directly readable. Acknowledge the attachment and note its type.]` }];
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

    // Build Anthropic messages with multimodal support (images, PDFs, text files, etc.)
    const formattedMessages: any[] = recentMessages.map((m: { role: string; content: string; attachment?: { name: string; url: string; mimeType?: string } }) => {
      const content: any[] = [];
      if (m.attachment?.url) {
        content.push(...buildAttachmentBlocks(m.attachment));
      }
      if (m.content) content.push({ type: "text", text: m.content });
      // If there's only an attachment with no text, still need at least one content block
      if (content.length === 0) content.push({ type: "text", text: "" });
      return { role: m.role === "assistant" ? "assistant" : "user", content };
    });

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
      model: "claude-haiku-4-5-20251001",
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
