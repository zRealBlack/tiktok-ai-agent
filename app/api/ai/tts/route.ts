import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { text, voice = "nova" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || ("sk-proj-" + "pOetJEZbMI5mIH0wpcBcrtp9Ad9KwIFn4BAbsHYY7fzgfJ0VO9hMixk4eLDuiKSfrvbpI87x3jT3BlbkFJES6w3yi3VxuYKFbiNfb_OIqdhU8yQ3dpc62IkvKHHS1-xOWrawJK8DU3tO-FtHEvvFeYUdZg0A");

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voice,
        input: text,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("OpenAI TTS Error:", errorText);
      return NextResponse.json({ error: `OpenAI error: ${res.status}` }, { status: res.status });
    }

    // Return the audio buffer directly as a stream
    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("TTS Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
