import { GoogleGenAI } from '@google/genai';

async function run() {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyACBKXT7ztdbI2l0KnjkxbxLaZAn5SEeeM" });
  
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-pro",
      contents: "Hello, this is a test. Say hi back.",
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.text);
    }
    console.log("\nDone!");
  } catch(e) {
    console.error(e);
  }
}

run();
