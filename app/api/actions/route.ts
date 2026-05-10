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
      update_memory: false, trigger_sync: false, product_search: false, send_telegram: false,
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

    if (type === "SEARCH_PRODUCT") {
      if (!(perms as any).product_search) return Response.json({ ok: false, error: "مش عندك صلاحية البحث عن صور المنتجات" });
      const { brand = "", model = "", category = "" } = data;
      const query = `${brand} ${model} product photo`.trim();

      // ── Google Custom Search API (from photos-bot, most accurate) ─────────
      let images: string[] = [];
      const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
      const googleCx = process.env.GOOGLE_SEARCH_CX;
      
      if (googleApiKey && googleCx) {
        try {
          const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(query)}&searchType=image&num=6&imgType=photo&imgSize=large&safe=active`;
          const googleRes = await fetch(googleUrl, { signal: AbortSignal.timeout(8000) });
          if (googleRes.ok) {
            const data = await googleRes.json();
            images = (data.items || [])
              .map((item: any) => item.link)
              .filter((u: string) => u && u.startsWith("http"))
              .slice(0, 6);
          }
        } catch { /* Google failed, proceed to fallback */ }
      }

      // ── Fallback 1: DuckDuckGo image search (if Google is missing/fails) ──
      if (images.length === 0) {
        try {
          const initRes = await fetch(
            `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml",
              },
              signal: AbortSignal.timeout(8000),
            }
          );
          const initHtml = await initRes.text();
          const vqdMatch = initHtml.match(/vqd=["']?([^"'&\s]+)["']?/);
          if (vqdMatch?.[1]) {
            const imgRes = await fetch(
              `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqdMatch[1]}&o=json&p=1&s=0&u=bing`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  "Referer": "https://duckduckgo.com/",
                  "Accept": "application/json",
                },
                signal: AbortSignal.timeout(8000),
              }
            );
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              images = (imgData.results || [])
                .map((r: any) => r.image as string)
                .filter((u: string) => u && u.startsWith("http"))
                .slice(0, 6);
            }
          }
        } catch { /* DDG failed */ }
      }

      // ── Fallback 2: Bing (if DDG also fails) ──────────────────────────────
      if (images.length === 0) {
        try {
          const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=10&qft=+filterui:imagesize-large`;
          const bingRes = await fetch(bingUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
              "Accept-Language": "en-US,en;q=0.9",
            },
            signal: AbortSignal.timeout(8000),
          });
          if (bingRes.ok) {
            const html = await bingRes.text();
            const patterns = [
              /murl&quot;:&quot;(https?:\/\/[^&"<\s]+)/g,
              /"murl":"(https?:\/\/[^"<\s]+)"/g,
            ];
            for (const pattern of patterns) {
              const matches = [...html.matchAll(pattern)];
              const urls = matches.map(m => m[1]).filter(u => /\.(jpg|jpeg|png|webp)/i.test(u)).slice(0, 6);
              if (urls.length > 0) { images = urls; break; }
            }
          }
        } catch { /* Bing also failed */ }
      }

      // ── Generate specs with Claude (best-effort, won't block images) ──────
      let cleanName = `${brand} ${model}`.trim();
      let specs = "";
      let colors = "";
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey && images.length > 0) {
        try {
          const { default: Anthropic } = await import("@anthropic-ai/sdk");
          const client = new Anthropic({ apiKey });
          const productName = [brand, model, category ? `(${category})` : ""].filter(Boolean).join(" ");
          const msg = await Promise.race([
            client.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 400,
              messages: [{
                role: "user",
                content: `Product: ${productName}\nReturn ONLY raw JSON with keys: "cleanName" (short English name), "specs" (bullet points with -), "colors" (e.g. "Black, White" or "N/A")`,
              }],
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 7000)),
          ]) as any;
          const text = ((msg.content[0] as any).text || "").trim().replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
          const parsed = JSON.parse(text);
          cleanName = parsed.cleanName || cleanName;
          specs = (parsed.specs || "").replace(/\*\*/g, "");
          colors = parsed.colors || "";
        } catch { /* spec gen failed — still return images */ }
      }

      return Response.json({
        ok: true,
        summary: `صور **${cleanName}**`,
        detail: specs ? specs.slice(0, 120) : undefined,
        type: "SEARCH_PRODUCT",
        images,
        specs,
        colors,
        cleanName,
      });
    }

    if (type === "SEND_TO_TELEGRAM") {
      if (!perms.send_telegram) return Response.json({ ok: false, error: "مش عندك صلاحية إرسال رسائل للبوت" });
      const { message } = data;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tiktok-agent.vercel.app";
      const res = await fetch(`${appUrl}/api/products/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const result = await res.json();
      if (!result.ok) return Response.json({ ok: false, error: result.error || "Telegram send failed" });
      return Response.json({ ok: true, summary: "✅ تم الإرسال للبوت على Telegram", detail: message.slice(0, 80) });
    }

    if (type === "GENERATE_FILE") {
      if (!perms.product_search) return Response.json({ ok: false, error: "مش عندك صلاحية توليد الملفات" });
      const { fileType = "excel", filename = "sarie_file", data: fileData, columns, title } = data;
      // Return a signed download URL — the frontend calls /api/products/generate-file directly
      // We pass the params back so the UI can trigger the download client-side
      return Response.json({
        ok: true,
        type: "GENERATE_FILE",
        summary: `📎 **${filename}**`,
        detail: `${(fileData || []).length} rows — click to download`,
        fileType,
        filename,
        fileData,
        columns,
        title,
      });
    }

    return Response.json({ ok: false, error: `Unknown action type: ${type}` });
  } catch (err) {
    console.error("[actions]", err);
    return Response.json({ ok: false, error: String(err) });
  }
}
