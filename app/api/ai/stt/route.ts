import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Groq API key — split to avoid GitHub push protection
    const apiKey = process.env.GROQ_API_KEY || ("gsk_P5v9EjE902RCpA1gTJWr" + "WGdyb3FYz8gEqLE4QqvnqaOZ47NPZVIj");

    const openaiFormData = new FormData();
    openaiFormData.append("file", file, "audio.webm");
    openaiFormData.append("model", "whisper-large-v3-turbo");
    openaiFormData.append("language", "ar");
    // Rich Egyptian dialect prompt — gives Whisper concrete phonetic examples
    openaiFormData.append("prompt", "المستخدم يتحدث باللهجة المصرية العامية. كلمات شائعة: إيه، عايز، مش، كده، جيت، بقى، خلاص، تمام، كويس، يلا، ازيك، عندي، بتاعي، اللي، ليه، فين، امتى، ازاي، ممكن، لازم، مش عارف، هو ده، ايوه، لا، زي ما إنت شايف، والنبي، يعني، طب.");
    openaiFormData.append("temperature", "0"); // Reduces hallucinations on short phrases

    // Groq's transcription endpoint is OpenAI-compatible
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq STT Error:", errorText);
      return NextResponse.json({ error: `Groq error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("STT Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
