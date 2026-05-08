import { Redis } from "@upstash/redis";
import { DEFAULT_PERMISSIONS, PermissionSet } from "@/app/api/permissions/route";

const redis = new Redis({
  url: "https://sure-shrew-104058.upstash.io",
  token: "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});

function parseKV(raw: unknown): any {
  if (!raw) return null;
  let r = raw;
  for (let i = 0; i < 5 && typeof r === "string"; i++) {
    try { r = JSON.parse(r); } catch { return null; }
  }
  return r ?? null;
}

async function getUserPermissions(userId: string): Promise<PermissionSet> {
  try {
    const raw = await redis.get("sarie_permissions");
    const stored = parseKV(raw) ?? {};
    return { ...DEFAULT_PERMISSIONS[userId], ...(stored[userId] ?? {}) };
  } catch {
    return DEFAULT_PERMISSIONS[userId] ?? { update_audit: false, send_messages: false, send_email: false, update_memory: false, trigger_sync: false };
  }
}

// POST /api/actions
// body: { userId, type, data }
// Possible types:
//   UPDATE_VIDEO    data: { videoTitle, field, value }
//   SEND_MESSAGE    data: { to, content }
//   UPDATE_MEMORY   data: { insight }
//   TRIGGER_SYNC    data: {}

export async function POST(req: Request) {
  try {
    const { userId, type, data } = await req.json();
    if (!userId || !type) return Response.json({ ok: false, error: "Missing fields" });

    const perms = await getUserPermissions(userId);

    // ── UPDATE_VIDEO ────────────────────────────────────────────────────────
    if (type === "UPDATE_VIDEO") {
      if (!perms.update_audit) {
        return Response.json({ ok: false, error: "مش عندك صلاحية تحديث الـ Audit" });
      }
      const { videoTitle, field, value } = data;
      const rawData = await redis.get("tiktok_data");
      const tiktokData = parseKV(rawData);
      if (!tiktokData?.videos) return Response.json({ ok: false, error: "No video data found" });

      const idx = (tiktokData.videos as any[]).findIndex(
        (v: any) => v.title?.toLowerCase().includes((videoTitle || "").toLowerCase())
      );
      if (idx === -1) return Response.json({ ok: false, error: `Video "${videoTitle}" not found` });

      tiktokData.videos[idx][field] = value;
      await redis.set("tiktok_data", JSON.stringify(tiktokData));

      return Response.json({
        ok: true,
        summary: `Updated **${field}** for "${tiktokData.videos[idx].title}"`,
        detail: `New value: ${String(value).slice(0, 80)}`,
      });
    }

    // ── SEND_MESSAGE ────────────────────────────────────────────────────────
    if (type === "SEND_MESSAGE") {
      if (!perms.send_messages) {
        return Response.json({ ok: false, error: "مش عندك صلاحية إرسال رسائل" });
      }
      const { to, content } = data;
      const msgId = `sarie_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const msgPayload = {
        id: msgId,
        senderId: "sarie",
        receiverId: to,
        content: `[رسالة من ساري] ${content}`,
        ts: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };

      const existing = parseKV(await redis.get("team_messages")) ?? [];
      existing.push(JSON.stringify(msgPayload));
      if (existing.length > 500) existing.splice(0, existing.length - 500);
      await redis.set("team_messages", JSON.stringify(existing));

      return Response.json({ ok: true, summary: `Sent message to **${to}**`, detail: content.slice(0, 60) });
    }

    // ── UPDATE_MEMORY ───────────────────────────────────────────────────────
    if (type === "UPDATE_MEMORY") {
      if (!perms.update_memory) {
        return Response.json({ ok: false, error: "مش عندك صلاحية تحديث الذاكرة" });
      }
      const { insight } = data;
      const raw = await redis.get("sarie_memory:insights");
      const existing = parseKV(raw) ?? { insights: [], decisions: [], sessions: [] };
      existing.insights = [...(existing.insights ?? []), insight].slice(-20);
      await redis.set("sarie_memory:insights", JSON.stringify(existing));
      return Response.json({ ok: true, summary: "Updated Sarie's memory", detail: insight.slice(0, 80) });
    }

    // ── TRIGGER_SYNC ────────────────────────────────────────────────────────
    if (type === "TRIGGER_SYNC") {
      if (!perms.trigger_sync) {
        return Response.json({ ok: false, error: "مش عندك صلاحية تشغيل الـ Sync" });
      }
      // Sync is triggered by calling the existing cron/sync endpoint
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://tiktok-agent.vercel.app"}/api/cron`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch {}
      return Response.json({ ok: true, summary: "Triggered TikTok data sync", detail: "Data will refresh in ~30 seconds" });
    }

    return Response.json({ ok: false, error: `Unknown action type: ${type}` });
  } catch (err) {
    console.error("[actions]", err);
    return Response.json({ ok: false, error: String(err) });
  }
}
