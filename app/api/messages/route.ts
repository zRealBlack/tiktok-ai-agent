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

export async function PUT(req: Request) {
  try {
    const { id, emoji } = await req.json();
    if (!id || !emoji) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const messages = await redis.lrange("mas_team_messages", 0, -1);
    let updated = false;

    const newMessages = messages.map((rawMsg: any) => {
      const msg = typeof rawMsg === "string" ? JSON.parse(rawMsg) : rawMsg;
      if (msg.id === id) {
        updated = true;
        const reactions = msg.reactions || [];
        msg.reactions = reactions.includes(emoji)
          ? reactions.filter((r: string) => r !== emoji)
          : [...reactions, emoji];
      }
      return msg;
    });

    if (updated) {
      await redis.del("mas_team_messages");
      if (newMessages.length > 0) {
        await redis.rpush("mas_team_messages", ...newMessages);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to react" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const messages = await redis.lrange("mas_team_messages", 0, -1);
    let updated = false;
    
    const newMessages = messages.map((m: any) => typeof m === "string" ? JSON.parse(m) : m).filter((m: any) => {
      if (m.id === id) {
        updated = true;
        return false;
      }
      return true;
    });

    if (updated) {
      await redis.del("mas_team_messages");
      if (newMessages.length > 0) {
        await redis.rpush("mas_team_messages", ...newMessages);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
