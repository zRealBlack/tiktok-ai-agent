import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const raw = await redis.get("tiktok_data");

    if (!raw) {
      return NextResponse.json({ error: "No data synced yet. Run: node agent/sync.js" }, { status: 404 });
    }

    // raw could be a string or already parsed object depending on how it was stored
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("KV read error:", err);
    return NextResponse.json({ error: err.message || "Failed to read from KV" }, { status: 500 });
  }
}
