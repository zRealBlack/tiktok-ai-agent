import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const runtime = "nodejs";

export async function GET() {
  try {
    // Fetch all messages from the list
    const messages = await redis.lrange("mas_team_messages", 0, -1);
    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("Redis GET messages error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.senderId || !body.receiverId || (!body.content && !body.attachment)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Add server timestamp
    const message = {
      ...body,
      serverTs: Date.now()
    };
    
    // Append to the list
    await redis.rpush("mas_team_messages", message);
    
    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error("Redis POST message error:", err);
    return NextResponse.json({ error: err.message || "Failed to post message" }, { status: 500 });
  }
}
