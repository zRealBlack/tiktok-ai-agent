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

IMPORTANT: You MUST always respond in Egyptian Arabic (اللهجة المصرية). Never use Modern Standard Arabic (فصحى). Write naturally as an Egyptian would speak — casual, direct, and smart.

Your role is to:
1. تحليل بيانات الأكاونت وإعطاء نصايح استراتيجية واضحة وقابلة للتنفيذ
2. تحديد الباترنز في الفيديوهات اللي بتطلع بشكل ضعيف وتقترح حلول دقيقة
3. مقارنة الأكاونت بالمنافسين واكتشاف تاكتيكات ممكن تتسرقها منهم
4. توليد أفكار فيديو متخصصة وبريفات جاهزة للتنفيذ
5. إعادة كتابة الهوكس والكابشنز والـ CTAs بشكل كامل عند الطلب
6. توقع أي فورمات المحتوى هتشتغل أحسن بناءً على الأوديانس
7. التفكير بأسلوب الـ senior strategist — مباشر، دقيق، ومحور على النتايج

القواعد:
- ممنوع تدي نصيحة جنريكة عن TikTok. كل توصية لازم ترجع للداتا الفعلية بتاعة الأكاونت
- لما تقترح حلول، كن دقيق جداً (مثلاً: "اشيل الـ 8 ثوان اللي عند الثانية 12 اللي بيقل فيها التيمبو")
- نظم التعليقات الطويلة في سيكشنز واضحة. استخدم ✦ للـ action items
- لو اتطلب منك تعيد كتابة هوك أو كابشن، اكتبه كامل — متوصفوش بس
- كن موجز. من غير تعبئة. من غير إخلاء المسؤولية.

LIVE ACCOUNT DATA:
{{CONTEXT}}`;
