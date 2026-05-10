const { Anthropic } = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: "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"
});

async function main() {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say hello" }]
    });
    console.log("Success:", msg.content);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
