import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url:   process.env.KV_REST_API_URL   ?? "https://sure-shrew-104058.upstash.io",
  token: process.env.KV_REST_API_TOKEN ?? "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});
