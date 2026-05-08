import { Redis } from "@upstash/redis";

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
  return typeof r === "object" ? r : null;
}

// GET /api/memory
// Returns the full episodic memory: insights, decisions, sessions
export async function GET() {
  try {
    const raw = await redis.get("sarie_memory:insights");
    const data = parseKV(raw);
    return Response.json({
      insights:  Array.isArray(data?.insights)  ? data.insights  : [],
      decisions: Array.isArray(data?.decisions) ? data.decisions : [],
      sessions:  Array.isArray(data?.sessions)  ? data.sessions  : [],
      lastUpdated: data?.sessions?.[0]?.date ?? null,
    });
  } catch {
    return Response.json({ insights: [], decisions: [], sessions: [], lastUpdated: null });
  }
}
