import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const APIFY_TOKEN       = "apify_api_" + "g6bQyWvIy8xp0jseCouNiHrVh0pZ9A3kJuHg";
const KV_REST_API_URL   = "https://sure-shrew-104058.upstash.io";
const KV_REST_API_TOKEN = "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA";

// Source of truth — all tracked competitors. Handle = exact TikTok handle (no @)
const TRACKED_COMPETITORS = [
  { handle: "dina_aamer",   name: "Dina Aamer" },
  { handle: "lamiaa.fahmy", name: "Lamiaa Fahmy" },
];

// Empty seed for a competitor not yet scraped
function emptySeed(handle: string, name: string) {
  return {
    handle: `@${handle}`,
    name,
    followers: 0,
    postsThisWeek: 0,
    viewChange: "—",
    status: "stable",
    avgViews: 0,
    topFormat: "—",
    bio: "",
    scrapedAt: null,
    needsScrape: true,
    pros: [],
    cons: [],
    contentStrategy: "—",
    postingFrequency: "—",
    avgEngagement: "—",
    topVideoTitle: "—",
    topVideoViews: 0,
    threatLevel: "Medium",
    opportunity: "Click 'Analyze Live' to scrape real data",
  };
}

async function kvGet(key: string) {
  const res = await fetch(`${KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  let raw = json.result;
  if (!raw) return null;
  // Handle multi-level string encoding (sync scripts double-stringify)
  for (let i = 0; i < 5 && typeof raw === "string"; i++) {
    try { raw = JSON.parse(raw); } catch { break; }
  }
  return typeof raw === "object" ? raw : null;
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

// Always return full competitor list — KV data merged with empty seeds for missing ones
async function getFullCompetitorList(): Promise<any[]> {
  const parsed = await kvGet("competitor_data");
  let kvCompetitors: any[] = [];
  if (parsed) {
    kvCompetitors = parsed.competitors || [];
  }

  // Build a map keyed by handle (with @)
  const kvMap = new Map(kvCompetitors.map((c: any) => [c.handle, c]));

  // Ensure every tracked competitor exists in the result
  return TRACKED_COMPETITORS.map(tc => {
    const key = `@${tc.handle}`;
    return kvMap.get(key) || emptySeed(tc.handle, tc.name);
  });
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
  const c: Record<string, number> = {
    "Day in the life / DITL": 0,
    "Educational / Tips": 0,
    "Behind the scenes": 0,
    "Storytelling / Vlog": 0,
    "Transformation": 0,
    "Q&A / Comment reply": 0,
  };
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

  if (avgViews > 200000) pros.push("Extremely high average views — dominant FYP presence");
  else if (avgViews > 50000) pros.push("High average views — strong organic reach");
  else if (avgViews > 20000) pros.push("Above-average FYP penetration");

  const engNum = parseFloat(engRate);
  if (engNum > 8) pros.push("Exceptional engagement rate — highly active audience");
  else if (engNum > 5) pros.push("High engagement rate — audience is active");

  if (followers > 500000) pros.push("Massive follower base — industry authority");
  else if (followers > 100000) pros.push("Large follower base — established presence");
  else if (followers > 50000) pros.push("Sizable following in the niche");

  const datesRaw = videos
    .map((v: any) => v.createTime ? new Date(v.createTime * 1000).toISOString() : null)
    .filter(Boolean) as string[];
  let postsPerWeek = 0;
  if (datesRaw.length >= 2) {
    const weeks = Math.max(
      (new Date(datesRaw[0]).getTime() - new Date(datesRaw[datesRaw.length - 1]).getTime()) / (7 * 86400000),
      1
    );
    postsPerWeek = parseFloat((datesRaw.length / weeks).toFixed(1));
    if (postsPerWeek >= 5) pros.push(`Very consistent posting (${postsPerWeek}x/week)`);
    else if (postsPerWeek >= 3) pros.push(`Regular posting cadence (~${postsPerWeek}x/week)`);
    else cons.push(`Low posting frequency (~${postsPerWeek}x/week) — inconsistent`);
  }

  if (avgViews < 10000) cons.push("Low avg views — content not breaking through FYP");
  if (followers > 0 && avgViews / followers < 0.05) cons.push("Low FYP reach relative to follower count");

  const trendingRatio = videos.filter((v: any) => v.musicMeta?.musicName && !v.musicMeta?.musicOriginal).length / videos.length;
  if (trendingRatio > 0.6) pros.push("Consistently uses trending audio for algorithmic boost");
  else if (trendingRatio < 0.2 && videos.length > 3) cons.push("Rarely uses trending audio — missing reach opportunities");

  if (pros.length < 2) pros.push("Active presence in the niche");
  if (cons.length < 1) cons.push("Hard to find clear weaknesses — monitor closely");

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
      ? "Content gap exists — target their underserved topics to capture their audience"
      : "Outrank them with consistent, higher-quality production",
  };
}

async function scrapeOne(handle: string, name: string) {
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

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`
  );
  if (!itemsRes.ok) throw new Error(`Dataset fetch failed: ${itemsRes.status}`);

  const items: any[] = await itemsRes.json();
  if (!items || items.length === 0) throw new Error(`No data found for @${handle}`);

  const videos   = items;
  const profile  = videos[0]?.authorMeta || {};
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

// GET — always returns ALL tracked competitors (KV data + empty seeds for unscraped ones)
export async function GET() {
  try {
    const competitors = await getFullCompetitorList();
    return NextResponse.json({ competitors, syncedAt: null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — scrape one or all competitors, always persist ALL to KV, always return ALL
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const toScrape = body.handle
      ? TRACKED_COMPETITORS.filter(c => c.handle === body.handle.replace("@", "").trim())
      : TRACKED_COMPETITORS;

    // Get the current full list (ensures we never drop existing data)
    const currentList = await getFullCompetitorList();
    const merged = new Map(currentList.map(c => [c.handle, c]));

    const errors: string[] = [];

    for (const comp of toScrape) {
      try {
        console.log(`Scraping @${comp.handle}...`);
        const data = await scrapeOne(comp.handle, comp.name);
        merged.set(data.handle, data); // Override with fresh data
      } catch (err: any) {
        console.error(`Failed @${comp.handle}: ${err.message}`);
        errors.push(`@${comp.handle}: ${err.message}`);
        // Existing entry stays in merged (not overwritten) — data preserved
      }
    }

    const allCompetitors = Array.from(merged.values());
    const payload = { competitors: allCompetitors, syncedAt: new Date().toISOString() };

    // Persist to KV — same pattern as tiktok_data
    await kvSet("competitor_data", JSON.stringify(payload));

    return NextResponse.json({
      success: true,
      scraped: toScrape.length - errors.length,
      errors: errors.length > 0 ? errors : undefined,
      competitors: allCompetitors,
      syncedAt: payload.syncedAt,
    });
  } catch (err: any) {
    console.error("Competitor sync error:", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
