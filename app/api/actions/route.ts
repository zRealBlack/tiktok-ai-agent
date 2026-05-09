import { redis } from "@/lib/redis";
import { parseKV } from "@/lib/kv";
import { DEFAULT_PERMISSIONS, PermissionSet } from "@/lib/permissions";

async function getUserPermissions(userId: string): Promise<PermissionSet> {
  try {
    const stored = parseKV(await redis.get("sarie_permissions")) ?? {};
    return { ...DEFAULT_PERMISSIONS[userId], ...(stored[userId] ?? {}) };
  } catch {
    return DEFAULT_PERMISSIONS[userId] ?? {
      update_audit: false, send_messages: false, send_email: false,
      update_memory: false, trigger_sync: false,
    };
  }
}

export async function POST(req: Request) {
  try {
    const { userId, type, data } = await req.json();
    if (!userId || !type) return Response.json({ ok: false, error: "Missing fields" });

    const perms = await getUserPermissions(userId);

    if (type === "UPDATE_VIDEO") {
      if (!perms.update_audit) return Response.json({ ok: false, error: "مش عندك صلاحية تحديث الـ Audit" });
      const { videoTitle, field, value } = data;
      const tiktokData = parseKV(await redis.get("tiktok_data"));
      if (!tiktokData?.videos) return Response.json({ ok: false, error: "No video data found" });
      const idx = (tiktokData.videos as any[]).findIndex(
        (v: any) => v.title?.toLowerCase().includes((videoTitle || "").toLowerCase())
      );
      if (idx === -1) return Response.json({ ok: false, error: `Video "${videoTitle}" not found` });
      tiktokData.videos[idx][field] = value;
      await redis.set("tiktok_data", JSON.stringify(tiktokData));
      return Response.json({ ok: true, summary: `Updated **${field}** for "${tiktokData.videos[idx].title}"`, detail: String(value).slice(0, 80) });
    }

    if (type === "SEND_MESSAGE") {
      if (!perms.send_messages) return Response.json({ ok: false, error: "مش عندك صلاحية إرسال رسائل" });
      const { to, content } = data;
      const msgId = `sarie_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const msgPayload = {
        id: msgId, senderId: "sarie", receiverId: to,
        content: `[رسالة من ساري] ${content}`,
        ts: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      const existing: any[] = parseKV(await redis.get("team_messages")) ?? [];
      existing.push(JSON.stringify(msgPayload));
      if (existing.length > 500) existing.splice(0, existing.length - 500);
      await redis.set("team_messages", JSON.stringify(existing));
      return Response.json({ ok: true, summary: `Sent message to **${to}**`, detail: content.slice(0, 60) });
    }

    if (type === "UPDATE_MEMORY") {
      if (!perms.update_memory) return Response.json({ ok: false, error: "مش عندك صلاحية تحديث الذاكرة" });
      const { insight } = data;
      const existing = parseKV(await redis.get("sarie_memory:insights")) ?? { insights: [], decisions: [], sessions: [] };
      existing.insights = [...(existing.insights ?? []), insight].slice(-20);
      await redis.set("sarie_memory:insights", JSON.stringify(existing));
      return Response.json({ ok: true, summary: "Updated Sarie's memory", detail: insight.slice(0, 80) });
    }

    if (type === "TRIGGER_SYNC") {
      if (!perms.trigger_sync) return Response.json({ ok: false, error: "مش عندك صلاحية تشغيل الـ Sync" });
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "https://tiktok-agent.vercel.app"}/api/cron`, { method: "POST" });
      } catch {}
      return Response.json({ ok: true, summary: "Triggered TikTok data sync", detail: "Data will refresh in ~30 seconds" });
    }

    return Response.json({ ok: false, error: `Unknown action type: ${type}` });
  } catch (err) {
    console.error("[actions]", err);
    return Response.json({ ok: false, error: String(err) });
  }
}
