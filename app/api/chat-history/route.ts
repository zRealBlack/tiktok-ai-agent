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
// body: { userId, sessionId, title, renameOnly: true }  ← rename without touching messages
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId, messages, title, lastMessage, ts, renameOnly } = await req.json();
    if (!userId || userId === "unknown" || !sessionId) return Response.json({ ok: false });

    const rawIndex = await redis.get(`chat_sessions:${userId}`);
    const existing: any[] = Array.isArray(parseKV(rawIndex)) ? parseKV(rawIndex) : [];

    if (renameOnly) {
      // Only update the title in the index — don't touch message data
      const updated = existing.map((s: any) =>
        s.id === sessionId ? { ...s, title: (title || s.title || "محادثة جديدة").slice(0, 50) } : s
      );
      await redis.set(`chat_sessions:${userId}`, JSON.stringify(updated));
      return Response.json({ ok: true });
    }

    if (!Array.isArray(messages)) return Response.json({ ok: false });

    const trimmed = messages.slice(-MAX_MESSAGES);
    await redis.set(`chat_session:${userId}:${sessionId}`, JSON.stringify(trimmed));

    const sessionMeta = {
      id: sessionId,
      title: (title || "محادثة جديدة").slice(0, 50),
      lastMessage: (lastMessage || "").slice(0, 80),
      ts: ts || new Date().toISOString(),
      messageCount: trimmed.length,
    };

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
