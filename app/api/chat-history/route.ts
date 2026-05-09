import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { parseKV } from "@/lib/kv";

const MAX_MESSAGES = 120;
const MAX_SESSIONS = 50;

// GET /api/chat-history?userId=X             → { sessions: SessionMeta[] }
// GET /api/chat-history?userId=X&sessionId=Y → { messages: ChatMessage[] }
export async function GET(req: NextRequest) {
  const userId    = req.nextUrl.searchParams.get("userId");
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!userId || userId === "unknown") {
    return Response.json(sessionId ? { messages: [] } : { sessions: [] });
  }

  try {
    if (sessionId) {
      const raw = await redis.get(`chat_session:${userId}:${sessionId}`);
      const messages = parseKV(raw);
      return Response.json({ messages: Array.isArray(messages) ? messages : [] });
    } else {
      const raw = await redis.get(`chat_sessions:${userId}`);
      const sessions = parseKV(raw);
      return Response.json({ sessions: Array.isArray(sessions) ? sessions : [] });
    }
  } catch {
    return Response.json(sessionId ? { messages: [] } : { sessions: [] });
  }
}

// POST /api/chat-history
// body: { userId, sessionId, messages, title, lastMessage, ts }
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, messages, title, lastMessage, ts } = await req.json();
    if (!userId || userId === "unknown" || !sessionId || !Array.isArray(messages)) {
      return Response.json({ ok: false });
    }

    const trimmed = messages.slice(-MAX_MESSAGES);

    // Save messages for this session
    await redis.set(`chat_session:${userId}:${sessionId}`, JSON.stringify(trimmed));

    // Update the session index
    const rawIndex = await redis.get(`chat_sessions:${userId}`);
    const existing: any[] = Array.isArray(parseKV(rawIndex)) ? parseKV(rawIndex) : [];

    const sessionMeta = {
      id: sessionId,
      title: (title || "محادثة جديدة").slice(0, 50),
      lastMessage: (lastMessage || "").slice(0, 80),
      ts: ts || new Date().toISOString(),
      messageCount: trimmed.length,
    };

    // Put updated session at top, deduplicate by id
    const updated = [sessionMeta, ...existing.filter((s: any) => s.id !== sessionId)]
      .slice(0, MAX_SESSIONS);

    await redis.set(`chat_sessions:${userId}`, JSON.stringify(updated));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}

// DELETE /api/chat-history
// body: { userId, sessionId } → delete specific session
// body: { userId }            → delete all sessions
export async function DELETE(req: NextRequest) {
  try {
    const { userId, sessionId } = await req.json();
    if (!userId || userId === "unknown") return Response.json({ ok: false });

    if (sessionId) {
      // Delete specific session
      await redis.del(`chat_session:${userId}:${sessionId}`);
      const rawIndex = await redis.get(`chat_sessions:${userId}`);
      const existing: any[] = Array.isArray(parseKV(rawIndex)) ? parseKV(rawIndex) : [];
      const updated = existing.filter((s: any) => s.id !== sessionId);
      await redis.set(`chat_sessions:${userId}`, JSON.stringify(updated));
    } else {
      // Clear all — just wipe the index (sessions themselves remain but are unreachable)
      await redis.del(`chat_sessions:${userId}`);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
