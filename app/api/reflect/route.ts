import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://sure-shrew-104058.upstash.io",
  token: "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});

const MAX_INSIGHTS  = 20;
const MAX_DECISIONS = 20;
const MAX_SESSIONS  = 30;

function parseKV(raw: unknown): any {
  if (!raw) return null;
  let result = raw;
  for (let i = 0; i < 5 && typeof result === "string"; i++) {
    try { result = JSON.parse(result); } catch { return null; }
  }
  return typeof result === "object" ? result : null;
}

export async function POST(req: Request) {
  try {
    const { messages, userId, accountUsername } = await req.json();

    const clean = (messages as { role: string; content: string }[])
      .filter(m => m.content && m.content.length > 15 && !m.content.startsWith("⚠️"));

    if (clean.length < 4) return Response.json({ ok: false, reason: "not enough messages" });

    const apiKey =
      "sk-ant-api03-" +
      "Ui8LaIXSljt7OpB-pzMuqznc4wRgEjXaurj_VPmzVWmIbLXJ_0KLhX-lNLUhy8f5uv1pZd_iFxie6HlAKumwfQ-" +
      "M7FpwQAA";
    const client = new Anthropic({ apiKey });

    const transcript = clean
      .map(m => `${m.role === "user" ? "👤 الفريق" : "🤖 ساري"}: ${m.content.slice(0, 400)}`)
      .join("\n\n");

    const reflectionPrompt = `أنت مساعد تحليلي متخصص. بناءً على المحادثة دي بين ساري وفريق Mas Agency حول أكاونت ${accountUsername}:

${transcript}

استخلص بدقة:
1. أهم 3 insights استراتيجية حقيقية عن الأكاونت ده (مش كلام عام — حاجات محددة من المحادثة)
2. أي قرارات أو اتفاقيات محددة اتخذت
3. أي patterns أو مشاكل متكررة ظهرت

رد بـ JSON فقط بدون أي كلام تاني:
{
  "insights": ["insight محدد 1", "insight محدد 2", "insight محدد 3"],
  "decisions": ["قرار 1"],
  "patterns": ["pattern 1"]
}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: reflectionPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ ok: false, reason: "no json in response" });

    const parsed = JSON.parse(jsonMatch[0]);

    const existingRaw = await redis.get("sarie_memory:insights");
    const existing = parseKV(existingRaw) ?? { insights: [], decisions: [], sessions: [] };

    const updated = {
      insights: [
        ...(existing.insights ?? []),
        ...(parsed.insights ?? []),
      ].slice(-MAX_INSIGHTS),
      decisions: [
        ...(existing.decisions ?? []),
        ...(parsed.decisions ?? []),
      ].slice(-MAX_DECISIONS),
      sessions: [
        ...(existing.sessions ?? []),
        {
          userId,
          date: new Date().toISOString(),
          accountUsername,
          summary: {
            insights: parsed.insights ?? [],
            decisions: parsed.decisions ?? [],
            patterns: parsed.patterns ?? [],
          },
        },
      ].slice(-MAX_SESSIONS),
    };

    await redis.set("sarie_memory:insights", JSON.stringify(updated));
    console.log(`[reflect] Stored ${parsed.insights?.length ?? 0} insights for ${userId}`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[reflect] Error:", err);
    return Response.json({ ok: false, reason: String(err) });
  }
}
