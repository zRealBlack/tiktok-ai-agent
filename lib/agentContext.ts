// Removing hardcoded mockData dependency. Context is dynamically built.
export function buildAgentContext(data: any): string {
  return `
=== ACCOUNT OVERVIEW ===
Username: ${data.account.username}
Followers: ${data.account.followers.toLocaleString()} (+${data.account.followersGrowth.toLocaleString()} this week)
Avg Engagement Rate: ${data.account.avgEngagement}% (${data.account.engagementChange > 0 ? "+" : ""}${data.account.engagementChange}% change)
Weekly Views: ${data.account.weeklyViews.toLocaleString()} (${data.account.weeklyViewsChange}% change)
Open Action Items: ${data.account.actionItems}

=== AUDIENCE BREAKDOWN ===
${data.generations.map((g: any) => `- ${g.label}: ${g.pct}%`).join("\n")}

=== CONTENT AUDIT — ALL RECENT VIDEOS (AI-SCORED) ===
${data.videos
  .map(
    (v: any) => `
VIDEO: "${v.title}" [Score: ${v.score}/100]
  Posted: ${v.posted}
  Views: ${v.views.toLocaleString()} | Likes: ${v.likes.toLocaleString()} | Comments: ${v.comments} | Shares: ${v.shares}
  Engagement: ${v.views > 0 ? ((v.likes / v.views) * 100).toFixed(2) : 0}%
  Score Breakdown — Hook: ${v.hook} | Pacing: ${v.pacing} | Caption: ${v.caption} | Hashtags: ${v.hashtags} | CTA: ${v.cta}
  ⚠ Issue: ${v.issue}
  ✦ Fix: ${v.suggestion}
`
  )
  .join("\n")}

=== TRENDING CONTENT (Top 5) ===
${data.trends.map((t: any) => `#${t.rank} "${t.name}" — Type: ${t.type} — Views: ${t.views}`).join("\n")}

=== COMPETITOR LANDSCAPE ===
${data.competitors
  .map(
    (c: any) => `
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
- Format long responses with clear sections. Use ✦ for action items
- If asked to rewrite a hook/caption, actually write it out fully — don't describe it
- Be concise. No filler. No disclaimers.

LIVE ACCOUNT DATA:
{{CONTEXT}}`;
