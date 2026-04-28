import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const maxDuration = 60;

export async function GET() {
  try {
    // 1. Read all video data from KV
    const raw = await redis.get("tiktok_data");
    if (!raw) {
      return NextResponse.json({ error: "No data in KV" }, { status: 404 });
    }
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    const videos = (data as any).videos || [];

    const results: { id: string; status: string }[] = [];

    // 2. For each video, download cover and cache as base64
    for (const v of videos) {
      if (!v.coverUrl) {
        results.push({ id: v.id, status: "skipped (no coverUrl)" });
        continue;
      }

      // Check if already cached
      const existing = await redis.get<string>(`cover:${v.id}`);
      if (existing) {
        results.push({ id: v.id, status: "already cached" });
        continue;
      }

      try {
        const res = await fetch(v.coverUrl, {
          signal: AbortSignal.timeout(10000),
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.tiktok.com/",
            "Accept": "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
        });

        if (!res.ok) {
          results.push({ id: v.id, status: `failed (HTTP ${res.status})` });
          continue;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;

        await redis.set(`cover:${v.id}`, dataUri);
        results.push({ id: v.id, status: "cached OK" });
      } catch (err: any) {
        results.push({ id: v.id, status: `error: ${err.message}` });
      }
    }

    const cached = results.filter(r => r.status === "cached OK").length;
    const alreadyCached = results.filter(r => r.status === "already cached").length;
    const failed = results.filter(r => r.status.startsWith("failed") || r.status.startsWith("error")).length;

    return NextResponse.json({
      summary: `${cached} newly cached, ${alreadyCached} already cached, ${failed} failed out of ${videos.length} videos`,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
