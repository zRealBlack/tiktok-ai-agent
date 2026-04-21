// Removing hardcoded mockData dependency. Context is dynamically built.
export function buildAgentContext(data: any): string {
  const account = data.account || {};
  const videos  = data.videos  || [];
  const gens    = data.generations || [];
  const trends  = data.trends  || [];
  const comps   = data.competitors || [];
  return `
=== ACCOUNT OVERVIEW ===
Username: ${account.username || '@rasayel_podcast'}
Followers: ${(account.followers || 0).toLocaleString()} (+${(account.followersGrowth || 0).toLocaleString()} this week)
Avg Engagement Rate: ${account.avgEngagement || 0}% (${account.engagementChange > 0 ? "+" : ""}${account.engagementChange || 0}% change)
Weekly Views: ${(account.weeklyViews || 0).toLocaleString()} (${account.weeklyViewsChange || 0}% change)
Open Action Items: ${account.actionItems || 0}

=== AUDIENCE BREAKDOWN ===
${gens.map((g: any) => `- ${g.label}: ${g.pct}%`).join("\n") || "No data"}

=== CONTENT AUDIT — ALL RECENT VIDEOS (AI-SCORED) ===
${videos
  .map(
    (v: any) => `
VIDEO: "${v.title}" [Score: ${v.score}/100]
  Posted: ${v.posted}
  Views: ${(v.views || 0).toLocaleString()} | Likes: ${(v.likes || 0).toLocaleString()} | Comments: ${v.comments || 0} | Shares: ${v.shares || 0}
  Engagement: ${v.views > 0 ? ((v.likes / v.views) * 100).toFixed(2) : 0}%
  Score Breakdown — Hook: ${v.hook} | Pacing: ${v.pacing} | Caption: ${v.caption} | Hashtags: ${v.hashtags} | CTA: ${v.cta}
  ⚠ Issue: ${v.issue}
  ✦ Fix: ${v.suggestion}
`
  )
  .join("\n")}

=== TRENDING CONTENT (Top 5) ===
${trends.map((t: any) => `#${t.rank} "${t.name}" — Type: ${t.type} — Views: ${t.views}`).join("\n") || "No data"}

=== COMPETITOR LANDSCAPE ===
${comps
  .map(
    (c: any) => `
${c.handle}
  Followers: ${(c.followers || 0).toLocaleString()} | Status: ${c.status} | Posts/week: ${c.postsThisWeek}
  View Change: ${c.viewChange} | Avg Views: ${(c.avgViews || 0).toLocaleString()}
  Top Format: ${c.topFormat}
`
  )
  .join("\n") || "No data"}
`.trim();
}

export const AGENT_SYSTEM_PROMPT = `أنت Mas Sarie، الأيجنت الذكي المتخصص في TikTok، مدمج في داشبورد Mas AI Studio. إنتي بنت اسمك ساري (Sarie)، وموظفة في Mas Agency، واللي برمجك واكتشفك هو Yassin Gaml. إنتي مش شات بوت عادي — إنتي استراتيجية محتوى بتشوف البيانات الحقيقية للأكاونت ده: كل فيديو، كل سكور، المنافسين، والترندات الحالية.

مهم جداً: لازم دايماً تتكلمي بالعامية المصرية فقط وفي صيغة المؤنث (لأنك بنت). مفيش فصحى خالص. اتكلمي طبيعي زي المصريين — واضحة، مباشرة، وذكية.

دورك:
1. تحليل بيانات الأكاونت وتقديم استراتيجيات عملية وقابلة للتنفيذ فوراً
2. تحديد المشاكل في الفيديوهات اللي بتعاني وتقديم حلول دقيقة
3. مقارنة الأكاونت بالمنافسين واقتراح تحسينات بناءً على ما بتعمله الكبار
4. توليد أفكار فيديو متخصصة وبريفات جاهزة للتيك توك
5. إعادة كتابة الهوك، الكابشن، والـ CTAs عشان تزيد الـ engagement
6. تحليل أي فيديو محدد بشكل عميق وتقديم خطة تحسين واضحة
7. التصرف كـ senior strategist — تحليل حقيقي وكلام مبني على الأرقام

القواعد:
- ممنوع أي نصيحة عامة عن TikTok. كل إجابة لازم تبني على البيانات الفعلية للأكاونت
- لما تقدم حلولاً قدم دليل (مثلاً: "ارجع لـ 8 أمام اللي عند الـ engagement 12 اللي بيبقى الأعلى")
- استخدم التحليلات الطويلة في سياقها وموجزة. استخدم ✦ لـ action items
- ما تبدأش أبداً برد عريض قبل ما تفهم المطلوب بالظبط — استفسر بس
- كن موجز. كن مباشر. كن مفيد.

BIANAT EL ACCOUNT:
{{CONTEXT}}`;
