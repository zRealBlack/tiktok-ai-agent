/**
 * Competitor Sync Script — Standalone Node.js
 *
 * Scrapes @dina_aamer and @lamiaa.fahmy via Apify,
 * analyzes their content, and stores results in Vercel KV (Upstash).
 *
 * Usage: node agent/sync-competitors.js
 * Cron:  runs automatically every 24h via Vercel cron
 */

const { ApifyClient } = require("apify-client");

// ─── CONFIG ────────────────────────────────────────────────────────────────
const APIFY_TOKEN      = "apify_api_" + "g6bQyWvIy8xp0jseCouNiHrVh0pZ9A3kJuHg";
const KV_REST_API_URL  = "https://sure-shrew-104058.upstash.io";
const KV_REST_API_TOKEN= "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA";

const COMPETITORS = [
  { handle: "dina_aamer",   name: "Dina Aamer" },
  { handle: "lamiaa.fahmy", name: "Lamiaa Fahmy" },
];
// ───────────────────────────────────────────────────────────────────────────

async function kvSet(key, value) {
  const res = await fetch(`${KV_REST_API_URL}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV set failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function detectStatus(videos) {
  if (videos.length < 4) return "stable";
  const recent = videos.slice(0, 3).reduce((s, v) => s + (v.playCount || 0), 0) / 3;
  const older  = videos.slice(3, 6).reduce((s, v) => s + (v.playCount || 0), 0) / Math.max(videos.slice(3, 6).length, 1);
  if (older === 0) return "stable";
  const ratio = recent / older;
  if (ratio >= 1.25) return "spiking";
  if (ratio <= 0.75) return "dropping";
  return "stable";
}

function detectTopFormat(videos) {
  const descriptions = videos.map(v => (v.text || v.desc || "").toLowerCase());
  const counts = {
    "Day in the life / DITL": 0,
    "Educational / Tips": 0,
    "Behind the scenes": 0,
    "Storytelling / Vlog": 0,
    "Transformation": 0,
    "Q&A / Comment reply": 0,
  };
  for (const d of descriptions) {
    if (d.includes("يوم") || d.includes("day in") || d.includes("routine") || d.includes("روتين")) counts["Day in the life / DITL"]++;
    if (d.includes("كيف") || d.includes("طريقة") || d.includes("نصيحة") || d.includes("tip") || d.includes("how to")) counts["Educational / Tips"]++;
    if (d.includes("كواليس") || d.includes("behind") || d.includes("bts")) counts["Behind the scenes"]++;
    if (d.includes("قصة") || d.includes("حكاية") || d.includes("story") || d.includes("vlog")) counts["Storytelling / Vlog"]++;
    if (d.includes("قبل") || d.includes("بعد") || d.includes("before") || d.includes("after") || d.includes("transformation")) counts["Transformation"]++;
    if (d.includes("سؤال") || d.includes("reply") || d.includes("رد") || d.includes("q&a")) counts["Q&A / Comment reply"]++;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top[1] > 0 ? top[0] : "Mixed content";
}

function buildAnalysis(profile, videos) {
  const totalViews = videos.reduce((s, v) => s + (v.playCount || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.diggCount || 0), 0);
  const avgViews   = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const followers  = profile.fans || profile.followerCount || 0;
  const engRate    = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) + "%" : "N/A";

  const topVideo      = [...videos].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))[0];
  const topVideoTitle = (topVideo?.text || "N/A").slice(0, 80);
  const topVideoViews = topVideo?.playCount || 0;

  const pros = [];
  const cons = [];

  if (avgViews > 50000) pros.push("High average views — strong organic reach");
  if (avgViews > 20000) pros.push("Above-average FYP penetration");
  if (parseFloat(engRate) > 5) pros.push("High engagement rate — audience is active");
  if (followers > 100000) pros.push("Large follower base — established audience");
  if (followers > 50000) pros.push("Sizable following in the niche");

  const datesRaw = videos.map(v => v.createTimeISO || (v.createTime ? new Date(v.createTime * 1000).toISOString() : null)).filter(Boolean);
  let postsPerWeek = 0;
  if (datesRaw.length >= 2) {
    const newest = new Date(datesRaw[0]).getTime();
    const oldest = new Date(datesRaw[datesRaw.length - 1]).getTime();
    const weeks  = Math.max((newest - oldest) / (7 * 86400 * 1000), 1);
    postsPerWeek = parseFloat((datesRaw.length / weeks).toFixed(1));
    if (postsPerWeek >= 5) pros.push(`Very consistent posting (${postsPerWeek}x/week)`);
    else if (postsPerWeek >= 3) pros.push(`Regular posting cadence (~${postsPerWeek}x/week)`);
    else cons.push(`Low posting frequency (~${postsPerWeek}x/week) — inconsistent`);
  }

  if (avgViews < 10000) cons.push("Low average views — content not breaking through FYP");
  if (followers > 0 && avgViews / followers < 0.05) cons.push("Low FYP reach relative to follower count");
  const hasVariety = new Set(videos.map(v => (v.text || "").slice(0, 15))).size > videos.length / 2;
  if (!hasVariety) cons.push("Low content variety — risk of audience fatigue");

  // Check trending audio usage
  const trendingAudioCount = videos.filter(v => v.musicMeta?.musicName && !v.musicMeta?.musicOriginal).length;
  if (trendingAudioCount / videos.length > 0.6) pros.push("Consistently uses trending audio for reach");

  if (pros.length < 2) pros.push("Active presence in the niche");
  if (cons.length < 1) cons.push("Hard to find clear weaknesses — monitor closely");

  let threatLevel = "Low";
  if (followers > 200000 || avgViews > 100000) threatLevel = "High";
  else if (followers > 50000 || avgViews > 30000) threatLevel = "Medium";

  const opportunity = threatLevel === "High"
    ? "Study their top hooks and formats — replicate structure, not content"
    : threatLevel === "Medium"
    ? "Content gap exists — target their underserved topics to capture their audience"
    : "You can outrank them with consistent, higher-quality production";

  const postingFrequency = postsPerWeek > 0 ? `~${postsPerWeek}x / week` : "Unknown";

  return {
    pros: pros.slice(0, 4),
    cons: cons.slice(0, 4),
    contentStrategy: detectTopFormat(videos),
    postingFrequency,
    avgEngagement: engRate,
    topVideoTitle,
    topVideoViews,
    threatLevel,
    opportunity,
  };
}

async function scrapeCompetitor(client, handle, name) {
  console.log(`\n🔍 Scraping @${handle}...`);

  const run = await client.actor("clockworks/tiktok-profile-scraper").call({
    profiles: [handle],
    resultsPerPage: 15,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  if (!items || items.length === 0) {
    console.warn(`  ⚠ No data found for @${handle}`);
    return null;
  }

  const videos  = items;
  const profile = videos[0]?.authorMeta || {};
  const followers = profile.fans || profile.followerCount || 0;

  const totalViews = videos.reduce((s, v) => s + (v.playCount || 0), 0);
  const avgViews   = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const status     = detectStatus(videos);
  const topFormat  = detectTopFormat(videos);

  // View change: recent 3 vs older 3
  const recentAvg = videos.slice(0, 3).reduce((s, v) => s + (v.playCount || 0), 0) / 3;
  const olderAvg  = videos.slice(-3).reduce((s, v) => s + (v.playCount || 0), 0) / 3;
  const diff      = Math.round(recentAvg - olderAvg);
  const viewChange = diff > 0 ? `+${fmtNum(diff)}` : diff < 0 ? `-${fmtNum(Math.abs(diff))}` : "stable";

  // Posts this week
  const oneWeekAgo   = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const postsThisWeek = videos.filter(v => {
    const ts = v.createTime ? v.createTime * 1000 : 0;
    return ts > oneWeekAgo;
  }).length;

  const analysis = buildAnalysis(profile, videos);

  const result = {
    handle:        `@${handle}`,
    name:          name || profile.nickName || handle,
    followers,
    postsThisWeek,
    viewChange,
    status,
    avgViews,
    topFormat,
    bio:           profile.signature || "",
    verified:      profile.verified || false,
    totalLikes:    profile.heart || 0,
    scrapedAt:     new Date().toISOString(),
    needsScrape:   false,
    ...analysis,
  };

  console.log(`  ✅ @${handle} — ${fmtNum(followers)} followers | avg ${fmtNum(avgViews)} views | ${status}`);
  return result;
}

async function run() {
  console.log("\n🏁 Starting competitor sync...\n");

  const client = new ApifyClient({ token: APIFY_TOKEN });
  const results = [];

  for (const comp of COMPETITORS) {
    try {
      const data = await scrapeCompetitor(client, comp.handle, comp.name);
      if (data) results.push(data);
    } catch (err) {
      console.error(`  ❌ Failed @${comp.handle}: ${err.message}`);
    }
  }

  if (results.length === 0) {
    throw new Error("All competitor scrapes failed");
  }

  const payload = {
    competitors: results,
    syncedAt: new Date().toISOString(),
  };

  console.log("\n📤 Uploading competitor data to KV...");
  await kvSet("competitor_data", JSON.stringify(payload));

  console.log(`\n✅ Competitor sync done! (${results.length}/${COMPETITORS.length} scraped)`);
  console.log(`   Synced at: ${payload.syncedAt}\n`);
}

run().catch(err => {
  console.error("\n❌ Competitor sync failed:", err.message);
  process.exit(1);
});
