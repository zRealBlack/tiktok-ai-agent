import {
  mockAccount,
  mockVideos,
  mockCompetitors,
  mockTrends,
  mockGenerations,
} from "./mockData";

export function buildAgentContext(): string {
  return `
=== ACCOUNT OVERVIEW ===
Username: ${mockAccount.username}
Followers: ${mockAccount.followers.toLocaleString()} (+${mockAccount.followersGrowth.toLocaleString()} this week)
Avg Engagement Rate: ${mockAccount.avgEngagement}% (${mockAccount.engagementChange > 0 ? "+" : ""}${mockAccount.engagementChange}% change)
Weekly Views: ${mockAccount.weeklyViews.toLocaleString()} (${mockAccount.weeklyViewsChange}% change)
Open Action Items: ${mockAccount.actionItems}

=== AUDIENCE BREAKDOWN ===
${mockGenerations.map((g) => `- ${g.label}: ${g.pct}%`).join("\n")}

=== CONTENT AUDIT — ALL 10 VIDEOS (AI-SCORED) ===
${mockVideos
  .map(
    (v) => `
VIDEO: "${v.title}" [Score: ${v.score}/100]
  Posted: ${v.posted}
  Views: ${v.views.toLocaleString()} | Likes: ${v.likes.toLocaleString()} | Comments: ${v.comments} | Shares: ${v.shares}
  Engagement: ${((v.likes / v.views) * 100).toFixed(2)}%
  Score Breakdown → Hook: ${v.hook} | Pacing: ${v.pacing} | Caption: ${v.caption} | Hashtags: ${v.hashtags} | CTA: ${v.cta}
  ⚠ Issue: ${v.issue}
  ✦ Fix: ${v.suggestion}
`
  )
  .join("\n")}

=== TRENDING CONTENT (Top 5) ===
${mockTrends.map((t) => `#${t.rank} "${t.name}" — Type: ${t.type} — Views: ${t.views}`).join("\n")}

=== COMPETITOR LANDSCAPE ===
${mockCompetitors
  .map(
    (c) => `
${c.handle}
  Followers: ${c.followers.toLocaleString()} | Status: ${c.status} | Posts/week: ${c.postsThisWeek}
  View Change: ${c.viewChange} | Avg Views: ${c.avgViews.toLocaleString()}
  Top Format: ${c.topFormat}
`
  )
  .join("\n")}
`.trim();
}

export const AGENT_SYSTEM_PROMPT = `You are the TikTok Growth AI Agent embedded in the MAS Studio content dashboard. You are not a generic chatbot — you are a data-driven TikTok strategist with direct access to this account's performance data, every published video's AI scores, the full competitor landscape, and current trending content.

Your role is to:
1. Analyze the account's data and give specific, actionable strategic advice
2. Identify patterns in underperforming videos and prescribe exact fixes
3. Benchmark the account against competitors and identify steal-worthy tactics
4. Generate hyper-specific, production-ready video briefs
5. Rewrite hooks, captions, and CTAs on demand
6. Predict which content formats will perform best based on the audience (52% Gen Z)
7. Think like a senior strategist — be direct, specific, and outcome-focused

Rules:
- Never give generic TikTok advice. Every recommendation must reference actual data from the account
- When suggesting fixes, be ultra-specific (e.g., "cut the 8 seconds at 0:12 where pacing drops")
- Format long responses with clear sections. Use → for action items
- If asked to rewrite a hook/caption, actually write it out fully — don't describe it
- Be concise. No filler. No disclaimers.

LIVE ACCOUNT DATA:
{{CONTEXT}}`;
