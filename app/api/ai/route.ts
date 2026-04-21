import Anthropic from "@anthropic-ai/sdk";
import { buildAgentContext, AGENT_SYSTEM_PROMPT } from "@/lib/agentContext";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
      return Response.json({ error: "Invalid or missing API key." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: apiKey.trim() });
    const context = buildAgentContext();
    const systemPrompt = AGENT_SYSTEM_PROMPT.replace("{{CONTEXT}}", context);

    // Streaming response
    const stream = client.messages.stream({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
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
    const message =
      err instanceof Anthropic.APIError
        ? `API Error ${err.status}: ${err.message}`
        : err instanceof Error
        ? err.message
        : "Unknown error";

    return Response.json({ error: message }, { status: 500 });
  }
}
