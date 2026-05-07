import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

const redis = new Redis({
  url: "https://sure-shrew-104058.upstash.io",
  token: "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});

const MAX_MESSAGES = 120;

function parseKV(raw: unknown): any {
  if (!raw) return null;
  let result = raw;
  for (let i = 0; i < 5 && typeof result === "string"; i++) {
    try { result = JSON.parse(result); } catch { return null; }
  }
  return result ?? null;
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId || userId === "unknown") return Response.json({ messages: [] });

  try {
    const raw = await redis.get(`chat_history:${userId}`);
    const messages = parseKV(raw);
    return Response.json({ messages: Array.isArray(messages) ? messages : [] });
  } catch {
    return Response.json({ messages: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, messages } = await req.json();
    if (!userId || userId === "unknown" || !Array.isArray(messages)) {
      return Response.json({ ok: false });
    }
    const trimmed = messages.slice(-MAX_MESSAGES);
    await redis.set(`chat_history:${userId}`, JSON.stringify(trimmed));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId || userId === "unknown") return Response.json({ ok: false });
    await redis.del(`chat_history:${userId}`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
