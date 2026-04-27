export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return new Response("missing url", { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return new Response("upstream error", { status: 502 });

    const ct = res.headers.get("content-type") || "image/jpeg";
    const buf = await res.arrayBuffer();

    return new Response(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400", // cache 24h
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
