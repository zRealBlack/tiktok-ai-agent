import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || ("sk-proj-" + "pOetJEZbMI5mIH0wpcBcrtp9Ad9KwIFn4BAbsHYY7fzgfJ0VO9hMixk4eLDuiKSfrvbpI87x3jT3BlbkFJES6w3yi3VxuYKFbiNfb_OIqdhU8yQ3dpc62IkvKHHS1-xOWrawJK8DU3tO-FtHEvvFeYUdZg0A");

    const openaiFormData = new FormData();
    openaiFormData.append("file", file, "audio.webm");
    openaiFormData.append("model", "whisper-1");
    openaiFormData.append("language", "ar");
    openaiFormData.append("prompt", "المستخدم يتحدث باللهجة المصرية العامية. يلا بينا.");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("OpenAI STT Error:", errorText);
      return NextResponse.json({ error: `OpenAI error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("STT Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
