import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/",
        "Accept": "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      },
    });

    if (!response.ok) {
      // Fallback: if proxy fails (e.g. Vercel IP blocked), redirect the client to try loading it directly
      return NextResponse.redirect(url);
    }

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    
    // Pass along the content type or default to jpeg
    headers.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
    // Cache the image heavily on the CDN and browser since it's immutable
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400");

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Proxy image error:", error);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
