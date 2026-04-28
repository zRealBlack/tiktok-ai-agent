import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("id");
  const url = request.nextUrl.searchParams.get("url");

  // Strategy 1: Serve cached base64 cover from KV (never expires)
  if (videoId) {
    try {
      const cached = await redis.get<string>(`cover:${videoId}`);
      if (cached) {
        // cached is "data:<mime>;base64,<data>" — extract the binary
        const match = cached.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          const buffer = Buffer.from(match[2], "base64");
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": match[1],
              "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=604800",
            },
          });
        }
      }
    } catch (err) {
      console.error("KV cover read error:", err);
    }
  }

  // Strategy 2: Try fetching from TikTok CDN directly (may fail if expired/blocked)
  if (url) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.tiktok.com/",
          "Accept": "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/jpeg";

        // Cache to KV for future use (so it survives URL expiration)
        if (videoId) {
          const b64 = `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
          // Fire and forget — don't block the response
          redis.set(`cover:${videoId}`, b64).catch(() => {});
        }

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=604800",
          },
        });
      }
    } catch {
      // fall through to placeholder
    }
  }

  // Strategy 3: Return a 1x1 transparent PNG placeholder
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  return new NextResponse(pixel, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
    },
  });
}
