import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

// This route is called by Vercel Cron every 24h (see vercel.json)
// It triggers a full competitor scrape and saves to KV
export async function GET(req: Request) {
  // Optional: protect with a secret header for manual triggers
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow Vercel's own cron invocations (they don't send auth headers)
    // Only block if auth header is present but wrong
    if (authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log("[CRON] Starting competitor sync...");

    // Delegate to the main competitors POST endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://tiktok-ai-agent.vercel.app";

    const res = await fetch(`${baseUrl}/api/competitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const result = await res.json();

    console.log(`[CRON] Done. Scraped: ${result.scraped}`);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("[CRON] Competitor sync failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
