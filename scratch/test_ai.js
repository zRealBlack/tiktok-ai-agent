// Using native fetch
async function test() {
  const res = await fetch("http://localhost:3000/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "hello" }],
      contextData: { 
        currentUser: { name: "Yassin Gaml", role: "Ai Specialist", bio: "Testing" },
        account: { username: "yassin" }
      }
    })
  });
  if (!res.ok) {
    console.error("Error:", res.status, await res.text());
  } else {
    console.log("Success. Stream:");
    const reader = res.body;
    for await (const chunk of reader) {
      process.stdout.write(chunk.toString());
    }
  }
}
test();
