import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

export async function POST(req: Request) {
  try {
    const { handle } = await req.json();
    if (!handle) {
      return NextResponse.json({ error: "TikTok Handle is required" }, { status: 400 });
    }

    const token = process.env.APIFY_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Server is missing Apify API Token" }, { status: 500 });
    }
    const client = new ApifyClient({ token });
    
    // We will scrape both the profile info and the recent videos
    const run = await client.actor("clockworks/tiktok-profile-scraper").call({
      profiles: [handle.replace("@", "")],
      resultsPerPage: 10 // Grab 10 most recent videos
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No data found for this account. Ensure the handle is correct and public." }, { status: 404 });
    }

    // The first item usually contains authorMeta if it's a video, but we need general profile data.
    // The scraper returns videos. Every video has authorMeta.
    const videos = items;
    const profile = videos[0]?.authorMeta || {};

    return NextResponse.json({ profile, videos });
  } catch (error: any) {
    console.error("Apify API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape TikTok data." },
      { status: 500 }
    );
  }
}
