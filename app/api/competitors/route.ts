import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const APIFY_TOKEN       = "apify_api_" + "g6bQyWvIy8xp0jseCouNiHrVh0pZ9A3kJuHg";
const KV_REST_API_URL   = "https://sure-shrew-104058.upstash.io";
const KV_REST_API_TOKEN = "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA";

const COMPETITORS = [
  { handle: "dina_aamer",   name: "Dina Aamer" },
  { handle: "lamiaa.fahmy", name: "Lamiaa Fahmy" },
];

async function kvGet(key: string) {
  const res = await fetch(`${KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result;
}

async function kvSet(key: string, value: string) {
  const res = await fetch(`${KV_REST_API_URL}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV set failed: ${res.status}`);
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function detectStatus(videos: any[]): "spiking" | "stable" | "dropping" {
  if (videos.length < 4) return "stable";
  const recent = videos.slice(0, 3).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / 3;
  const older  = videos.slice(3, 6).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / Math.max(videos.slice(3, 6).length, 1);
  if (older === 0) return "stable";
  const ratio = recent / older;
  if (ratio >= 1.25) return "spiking";
  if (ratio <= 0.75) return "dropping";
  return "stable";
}

function detectTopFormat(videos: any[]): string {
  const descs = videos.map((v: any) => (v.text || v.desc || "").toLowerCase());
  const c: Record<string, number> = { "Day in the life / DITL": 0, "Educational / Tips": 0, "Behind the scenes": 0, "Storytelling / Vlog": 0, "Transformation": 0, "Q&A / Comment reply": 0 };
  for (const d of descs) {
    if (d.includes("يوم") || d.includes("day in") || d.includes("routine") || d.includes("روتين")) c["Day in the life / DITL"]++;
    if (d.includes("كيف") || d.includes("طريقة") || d.includes("tip") || d.includes("how to")) c["Educational / Tips"]++;
    if (d.includes("كواليس") || d.includes("behind") || d.includes("bts")) c["Behind the scenes"]++;
    if (d.includes("قصة") || d.includes("story") || d.includes("vlog")) c["Storytelling / Vlog"]++;
    if (d.includes("قبل") || d.includes("بعد") || d.includes("before") || d.includes("after")) c["Transformation"]++;
    if (d.includes("سؤال") || d.includes("reply") || d.includes("رد")) c["Q&A / Comment reply"]++;
  }
  const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return top[1] > 0 ? top[0] : "Mixed content";
}

function buildAnalysis(profile: any, videos: any[]) {
  const totalViews = videos.reduce((s: number, v: any) => s + (v.playCount || 0), 0);
  const totalLikes = videos.reduce((s: number, v: any) => s + (v.diggCount || 0), 0);
  const avgViews   = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const followers  = profile.fans || profile.followerCount || 0;
  const engRate    = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) + "%" : "N/A";
  const topVideo   = [...videos].sort((a: any, b: any) => (b.playCount || 0) - (a.playCount || 0))[0];

  const pros: string[] = [];
  const cons: string[] = [];

  if (avgViews > 50000) pros.push("High average views — strong organic reach");
  if (parseFloat(engRate) > 5) pros.push("High engagement rate — active audience");
  if (followers > 100000) pros.push("Large follower base — established presence");

  const datesRaw = videos.map((v: any) => v.createTime ? new Date(v.createTime * 1000).toISOString() : null).filter(Boolean) as string[];
  let postsPerWeek = 0;
  if (datesRaw.length >= 2) {
    const weeks = Math.max((new Date(datesRaw[0]).getTime() - new Date(datesRaw[datesRaw.length - 1]).getTime()) / (7 * 86400000), 1);
    postsPerWeek = parseFloat((datesRaw.length / weeks).toFixed(1));
    if (postsPerWeek >= 3) pros.push(`Consistent posting (~${postsPerWeek}x/week)`);
    else cons.push(`Low posting frequency (~${postsPerWeek}x/week)`);
  }

  if (avgViews < 10000) cons.push("Low avg views — not breaking through FYP");
  if (followers > 0 && avgViews / followers < 0.05) cons.push("Low FYP reach vs follower count");
  const trendingRatio = videos.filter((v: any) => v.musicMeta?.musicName && !v.musicMeta?.musicOriginal).length / videos.length;
  if (trendingRatio > 0.6) pros.push("Consistently uses trending audio for reach");

  if (pros.length < 2) pros.push("Active presence in the niche");
  if (cons.length < 1) cons.push("Hard to find weaknesses — monitor closely");

  let threatLevel: "High" | "Medium" | "Low" = "Low";
  if (followers > 200000 || avgViews > 100000) threatLevel = "High";
  else if (followers > 50000 || avgViews > 30000) threatLevel = "Medium";

  return {
    pros: pros.slice(0, 4),
    cons: cons.slice(0, 4),
    contentStrategy: detectTopFormat(videos),
    postingFrequency: postsPerWeek > 0 ? `~${postsPerWeek}x / week` : "Unknown",
    avgEngagement: engRate,
    topVideoTitle: (topVideo?.text || "N/A").slice(0, 80),
    topVideoViews: topVideo?.playCount || 0,
    threatLevel,
    opportunity: threatLevel === "High"
      ? "Study their top hooks and formats — replicate structure, not content"
      : threatLevel === "Medium"
      ? "Content gap exists — target their underserved topics"
      : "Outrank them with consistent, higher-quality production",
  };
}

async function scrapeOne(handle: string, name: string) {
  // Start Apify actor run via REST API (avoids bundler issues with the SDK)
  const startRes = await fetch(
    `https://api.apify.com/v2/acts/clockworks~tiktok-profile-scraper/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profiles: [handle], resultsPerPage: 15 }),
    }
  );

  if (!startRes.ok) {
    const txt = await startRes.text();
    throw new Error(`Apify start failed: ${startRes.status} — ${txt}`);
  }

  const { data: runData } = await startRes.json();
  const runId = runData.id;
  const datasetId = runData.defaultDatasetId;

  // Poll until finished (max 240s)
  let status = runData.status;
  const deadline = Date.now() + 240_000;
  while (status !== "SUCCEEDED" && status !== "FAILED" && status !== "ABORTED" && Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 5000));
    const pollRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    if (!pollRes.ok) break;
    const pollData = await pollRes.json();
    status = pollData.data?.status || status;
  }

  if (status !== "SUCCEEDED") throw new Error(`Apify run ended with status: ${status}`);

  // Fetch results
  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`,
  );
  if (!itemsRes.ok) throw new Error(`Dataset fetch failed: ${itemsRes.status}`);

  const items: any[] = await itemsRes.json();
  if (!items || items.length === 0) throw new Error(`No data found for @${handle}`);

  const videos  = items;
  const profile = videos[0]?.authorMeta || {};
  const followers = profile.fans || profile.followerCount || 0;
  const totalViews = videos.reduce((s: number, v: any) => s + (v.playCount || 0), 0);
  const avgViews   = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const status2    = detectStatus(videos);

  const recentAvg  = videos.slice(0, 3).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / 3;
  const olderAvg   = videos.slice(-3).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / 3;
  const diff       = Math.round(recentAvg - olderAvg);
  const viewChange = diff > 0 ? `+${fmtNum(diff)}` : diff < 0 ? `-${fmtNum(Math.abs(diff))}` : "stable";

  const oneWeekAgo    = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const postsThisWeek = videos.filter((v: any) => (v.createTime || 0) * 1000 > oneWeekAgo).length;

  const analysis = buildAnalysis(profile, videos);

  return {
    handle:         `@${handle}`,
    name:           name || profile.nickName || handle,
    followers,
    postsThisWeek,
    viewChange,
    status:         status2,
    avgViews,
    topFormat:      analysis.contentStrategy,
    bio:            profile.signature || "",
    verified:       profile.verified || false,
    totalLikes:     profile.heart || 0,
    scrapedAt:      new Date().toISOString(),
    needsScrape:    false,
    ...analysis,
  };
}

// GET — read cached competitor data from KV
export async function GET() {
  try {
    const raw = await kvGet("competitor_data");
    if (!raw) return NextResponse.json({ competitors: [] });
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — trigger a fresh scrape of all competitors (or a specific handle)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const handles = body.handle
      ? COMPETITORS.filter(c => c.handle === body.handle.replace("@", ""))
      : COMPETITORS;

    // Read existing data to merge partial updates
    const raw = await kvGet("competitor_data");
    let existing: any[] = [];
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      existing = parsed.competitors || [];
    }

    const results: any[] = [];
    const errors: string[] = [];

    for (const comp of handles) {
      try {
        console.log(`Scraping @${comp.handle}...`);
        const data = await scrapeOne(comp.handle, comp.name);
        results.push(data);
      } catch (err: any) {
        console.error(`Failed @${comp.handle}: ${err.message}`);
        errors.push(`@${comp.handle}: ${err.message}`);
        // Keep existing data for this competitor if scrape fails
        const prev = existing.find((c: any) => c.handle === `@${comp.handle}`);
        if (prev) results.push(prev);
      }
    }

    // Merge: new scraped results override existing ones by handle
    const mergedMap = new Map(existing.map((c: any) => [c.handle, c]));
    for (const r of results) mergedMap.set(r.handle, r);
    const merged = Array.from(mergedMap.values());

    const payload = { competitors: merged, syncedAt: new Date().toISOString() };
    await kvSet("competitor_data", JSON.stringify(payload));

    return NextResponse.json({
      success: true,
      scraped: results.length,
      errors: errors.length > 0 ? errors : undefined,
      competitors: merged,
      syncedAt: payload.syncedAt,
    });
  } catch (err: any) {
    console.error("Competitor sync error:", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
