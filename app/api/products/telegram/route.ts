export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return Response.json({ ok: false, error: "No message provided" }, { status: 400 });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_TARGET_CHAT_ID;

    if (!token || !chatId) {
      return Response.json({ ok: false, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_TARGET_CHAT_ID not configured" }, { status: 500 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🤖 [Sarie]\n${message}`,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!data.ok) {
      return Response.json({ ok: false, error: data.description || "Telegram API error" });
    }

    return Response.json({ ok: true, summary: "Message sent to Telegram bot" });
  } catch (err: any) {
    console.error("[products/telegram]", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
