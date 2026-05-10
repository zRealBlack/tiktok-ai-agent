import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://sure-shrew-104058.upstash.io",
  token: "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});

export const runtime = "nodejs";
// Using dynamic to ensure it fetches fresh data on every request
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userIds = ["yassin", "dina", "haitham", "shahd", "sara", "shahdm", "yousef", "ahmed"];
    const keys = userIds.map(id => `spend:${id}`);
    
    const values = await redis.mget(...keys);
    
    const usageMap: Record<string, number> = {};
    userIds.forEach((id, index) => {
      usageMap[id] = parseFloat((values[index] as string) || "0");
    });

    return Response.json({ usage: usageMap });
  } catch (err: any) {
    return Response.json({ error: err.message, usage: {} }, { status: 500 });
  }
}
