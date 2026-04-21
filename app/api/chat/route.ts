import { kvGet, kvSet } from "@/lib/kv";

export const runtime = "nodejs";

// GET /api/chat — load chat history from KV
export async function GET() {
  try {
    const messages = await kvGet("chat_history");
    return Response.json({ messages: messages || [] });
  } catch (err: any) {
    return Response.json({ messages: [] });
  }
}

// POST /api/chat — save chat history to KV
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    await kvSet("chat_history", messages);
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
