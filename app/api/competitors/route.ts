import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

export const runtime = "nodejs";
export const maxDuration = 60;

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function detectStatus(videos: any[]): "spiking" | "stable" | "dropping" {
  if (videos.length < 2) return "stable";
  const recent = videos.slice(0, 3).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / 3;
  const older  = videos.slice(3, 6).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / Math.max(videos.slice(3, 6).length, 1);
  if (older === 0) return "stable";
  const ratio = recent / older;
  if (ratio >= 1.25) return "spiking";
  if (ratio <= 0.75) return "dropping";
  return "stable";
}

function detectTopFormat(videos: any[]): string {
  const descriptions = videos.map((v: any) => (v.text || v.desc || "").toLowerCase());
  const counts: Record<string, number> = {
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

function buildAnalysis(profile: any, videos: any[]): {
  pros: string[];
  cons: string[];
  contentStrategy: string;
  postingFrequency: string;
  avgEngagement: string;
  topVideoTitle: string;
  topVideoViews: number;
  threatLevel: "High" | "Medium" | "Low";
  opportunity: string;
} {
  const totalViews = videos.reduce((s: number, v: any) => s + (v.playCount || 0), 0);
  const totalLikes = videos.reduce((s: number, v: any) => s + (v.diggCount || 0), 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const engRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) + "%" : "N/A";

  const followers = profile.fans || profile.followerCount || 0;
  const topVideo = [...videos].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))[0];
  const topVideoTitle = topVideo?.text?.slice(0, 80) || "N/A";
  const topVideoViews = topVideo?.playCount || 0;

  const pros: string[] = [];
  const cons: string[] = [];

  if (avgViews > 50000) pros.push("High average views — strong organic reach");
  if (engRate && parseFloat(engRate) > 5) pros.push("High engagement rate — audience is active");
  if (followers > 100000) pros.push("Large follower base — established audience");
  if (videos.length > 0 && videos[0].musicMeta?.musicName) pros.push("Consistently uses trending audio for reach");

  // Check posting frequency
  const datesRaw = videos.map((v: any) => v.createTimeISO || v.createTime).filter(Boolean);
  let postsPerWeek = 0;
  if (datesRaw.length >= 2) {
    const newest = new Date(datesRaw[0]).getTime();
    const oldest = new Date(datesRaw[datesRaw.length - 1]).getTime();
    const weeks = Math.max((newest - oldest) / (7 * 86400 * 1000), 1);
    postsPerWeek = Math.round(datesRaw.length / weeks);
    if (postsPerWeek >= 5) pros.push(`Posts ${postsPerWeek}x/week — very consistent schedule`);
    else if (postsPerWeek <= 2) cons.push(`Low posting frequency (~${postsPerWeek}x/week) — inconsistent`);
  }

  if (avgViews < 10000) cons.push("Low average views — content not breaking through the FYP");
  if (followers > 0 && avgViews / followers < 0.05) cons.push("Low FYP reach relative to follower count");

  const hasVariety = new Set(videos.map((v: any) => v.text?.slice(0, 20))).size > 3;
  if (!hasVariety) cons.push("Limited content variety — risk of audience fatigue");

  if (pros.length < 2) pros.push("Active presence in the niche");
  if (cons.length < 1) cons.push("Hard to find clear weak points — strong competitor");

  let threatLevel: "High" | "Medium" | "Low" = "Low";
  if (followers > 200000 || avgViews > 100000) threatLevel = "High";
  else if (followers > 50000 || avgViews > 30000) threatLevel = "Medium";

  const opportunity = threatLevel === "High"
    ? "Study their top-performing hooks and replicate the format, not the content"
    : threatLevel === "Medium"
    ? "They have an audience gap you can fill — target their underserved content topics"
    : "You can easily outrank them with consistent, higher-quality content";

  const postingFrequency = postsPerWeek > 0 ? `~${postsPerWeek}x / week` : "Unknown";

  const contentStrategy = detectTopFormat(videos);

  return { pros, cons, contentStrategy, postingFrequency, avgEngagement: engRate, topVideoTitle, topVideoViews, threatLevel, opportunity };
}

export async function POST(req: Request) {
  try {
    const { handle } = await req.json();
    if (!handle) return NextResponse.json({ error: "Handle is required" }, { status: 400 });

    const token = "apify_api_" + "g6bQyWvIy8xp0jseCouNiHrVh0pZ9A3kJuHg";
    const client = new ApifyClient({ token });

    const cleanHandle = handle.replace("@", "").trim();

    const run = await client.actor("clockworks/tiktok-profile-scraper").call({
      profiles: [cleanHandle],
      resultsPerPage: 12,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No data found for this account." }, { status: 404 });
    }

    const videos = items as any[];
    const profile = videos[0]?.authorMeta || {};

    const followers = profile.fans || profile.followerCount || 0;
    const totalViews = videos.reduce((s: number, v: any) => s + (v.playCount || 0), 0);
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
    const status = detectStatus(videos);
    const topFormat = detectTopFormat(videos);

    // View change: compare first 3 vs last 3
    const recentAvg = videos.slice(0, 3).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / 3;
    const olderAvg  = videos.slice(-3).reduce((s: number, v: any) => s + (v.playCount || 0), 0) / 3;
    const diff = Math.round(recentAvg - olderAvg);
    const viewChange = diff > 0 ? `+${fmtFollowers(diff)}` : diff < 0 ? `-${fmtFollowers(Math.abs(diff))}` : "stable";

    // Posts this week
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const postsThisWeek = videos.filter((v: any) => {
      const ts = v.createTimeISO ? new Date(v.createTimeISO).getTime() : (v.createTime || 0) * 1000;
      return ts > oneWeekAgo;
    }).length;

    const analysis = buildAnalysis(profile, videos);

    const competitor = {
      handle: `@${cleanHandle}`,
      name: profile.nickName || profile.name || cleanHandle,
      followers,
      postsThisWeek,
      viewChange,
      status,
      avgViews,
      topFormat,
      bio: profile.signature || "",
      verified: profile.verified || false,
      totalLikes: profile.heart || profile.heartCount || 0,
      scrapedAt: new Date().toISOString(),
      ...analysis,
    };

    return NextResponse.json({ competitor });
  } catch (error: any) {
    console.error("Competitor scrape error:", error);
    return NextResponse.json({ error: error.message || "Failed to scrape competitor" }, { status: 500 });
  }
}
