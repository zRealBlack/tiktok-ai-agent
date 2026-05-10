import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://sure-shrew-104058.upstash.io",
  token: "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});

async function run() {
  const keys = await redis.keys("spend:*");
  for (const k of keys) {
    const val = await redis.get(k);
    console.log(`${k}: $${val}`);
  }
}
run();
