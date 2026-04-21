import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agentContext";
import { kvGet, kvSet } from "@/lib/kv";

export const runtime = "nodejs";

// GET /api/ideas — return cached ideas from KV
export async function GET() {
  try {
    const ideas = await kvGet("tiktok_ideas");
    return Response.json({ ideas: ideas || [] });
  } catch (err: any) {
    return Response.json({ ideas: [] });
  }
}

// POST /api/ideas — generate new ideas via Claude and cache in KV
export async function POST(req: Request) {
  try {
    const { videos, account } = await req.json();

    const apiKey = "sk-ant-api03-" + "Ui8LaIXSljt7OpB-pzMuqznc4wRgEjXaurj_VPmzVWmIbLXJ_0KLhX-lNLUhy8f5uv1pZd_iFxie6HlAKumwfQ-" + "M7FpwQAA";
    const client = new Anthropic({ apiKey });

    const videoSummary = videos.slice(0, 5).map((v: any) =>
      `- "${v.title}" — ${v.views?.toLocaleString()} views, ${v.likes?.toLocaleString()} likes`
    ).join("\n");

    const prompt = `وانت شايف الأكاونت ده:
الأكاونت: ${account.username} (${account.followers} متابع)
أحدث الفيديوهات:
${videoSummary}

ولّد بالظبط 3 أفكار فيديو جديدة ومختلفة تناسب المحتوى والأوديانس بتاعهم.

رد بـ JSON array فقط بالشكل ده، من غير أي تعليق أو نص إضافي:
[
  {
    "hook": "الهوك بتاع الفيديو (جملة واحدة قوية)",
    "format": "نوع الفيديو (مثلاً: بودكاست كليب، قصة، نصيحة سريعة)",
    "act1": "الجزء الأول — وصف مشهد الافتتاح",
    "act2": "الجزء التاني — الـ build وتطوير الفكرة",
    "act3": "الجزء التالت — الـ payoff أو الختام",
    "generation": "الجمهور المستهدف",
    "sound": "نوع الصوت المقترح",
    "caption": "الكابشن (أقل من 100 حرف + 3 هاشتاقات)",
    "bestTime": "أفضل وقت للنشر",
    "difficulty": "Easy",
    "potential": "High"
  }
]`;

    const resp = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1800,
      system: AGENT_SYSTEM_PROMPT.replace("{{CONTEXT}}", ""),
      messages: [{ role: "user", content: prompt }],
    });

    const raw = resp.content[0].type === "text" ? resp.content[0].text : "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Invalid response format from Claude");

    const ideas = JSON.parse(match[0]).map((idea: any, i: number) => ({
      ...idea,
      id: `ai-${Date.now()}-${i}`,
    }));

    // Cache in KV so they survive refreshes
    await kvSet("tiktok_ideas", ideas);

    return Response.json({ ideas });
  } catch (err: any) {
    console.error("Ideas API error:", err);
    return Response.json({ error: err.message || "Failed to generate ideas" }, { status: 500 });
  }
}
