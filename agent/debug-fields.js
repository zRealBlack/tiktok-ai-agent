const { ApifyClient } = require("apify-client");
const APIFY_TOKEN = "apify_api_" + "g6bQyWvIy8xp0jseCouNiHrVh0pZ9A3kJuHg";

async function run() {
  const client = new ApifyClient({ token: APIFY_TOKEN });
  const run = await client.actor("clockworks/tiktok-profile-scraper").call({
    profiles: ["rasayel_podcast"],
    resultsPerPage: 1,
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  if (items.length) {
    const v = items[0];
    console.log("\nvideoMeta:", JSON.stringify(v.videoMeta, null, 2));
    console.log("\nmediaUrls:", JSON.stringify(v.mediaUrls, null, 2));
    console.log("\nwebVideoUrl:", v.webVideoUrl);
  }
}
run().catch(console.error);
