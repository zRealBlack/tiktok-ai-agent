import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const BING_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

async function searchBingImages(query: string, count = 8): Promise<string[]> {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=${count}&qft=+filterui:imagesize-large`;
    const res = await fetch(url, { headers: BING_HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const html = await res.text();
    // Extract murl image URLs from Bing's HTML (same regex as Python bot)
    const matches = [...html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g)];
    const urls = matches.map((m) => m[1]).filter((u) => u.match(/\.(jpg|jpeg|png|webp)/i));
    return urls.slice(0, count);
  } catch {
    return [];
  }
}

async function searchGoogleImages(query: string, count = 6): Promise<string[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) return [];
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=${count}&imgType=photo&imgSize=large&safe=active`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((item: any) => item.link);
  } catch {
    return [];
  }
}

async function generateSpecs(
  brand: string,
  model: string,
  category: string
): Promise<{ specs: string; colors: string; cleanName: string }> {
  const fallback = { specs: "", colors: "", cleanName: `${brand} ${model}`.trim() };
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { specs: "", colors: "", cleanName: `${brand} ${model}`.trim() };
    const client = new Anthropic({ apiKey });
    const productName = [brand, model, category ? `(${category})` : ""].filter(Boolean).join(" ");
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `Analyze this product: ${productName}

Return a JSON object with EXACTLY these three keys:
1. "cleanName": Clean, professional short name in ENGLISH only (e.g. "Philips Air Fryer NA322")
2. "specs": Bulleted technical specs using hyphens (-). No title, no markdown asterisks. Just the bullets.
3. "colors": Available colors (e.g. "Black, White, Silver") or "N/A"

Return ONLY the raw JSON, no code blocks.`,
        },
      ],
    });

    const text = (msg.content[0] as any).text?.trim() || "";
    const cleaned = text.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      cleanName: parsed.cleanName || fallback.cleanName,
      specs: (parsed.specs || "").replace(/\*\*/g, ""),
      colors: parsed.colors || "",
    };
  } catch {
    return fallback;
  }
}

export async function POST(req: Request) {
  try {
    const { brand = "", model = "", category = "" } = await req.json();
    if (!brand && !model) {
      return Response.json({ ok: false, error: "Provide brand or model" }, { status: 400 });
    }

    const query = `${brand} ${model} product photo`.trim();

    // Try Google first (if configured), fall back to Bing
    let imageUrls = await searchGoogleImages(query);
    if (!imageUrls.length) imageUrls = await searchBingImages(query);

    // Also get specs from Claude in parallel — but don't block if it fails
    const specsResult = await generateSpecs(brand, model, category);

    return Response.json({
      ok: true,
      query,
      images: imageUrls.slice(0, 6), // max 6 images
      ...specsResult,
    });
  } catch (err: any) {
    console.error("[products/search]", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
