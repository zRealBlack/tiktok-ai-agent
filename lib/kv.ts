// Shared helper for Upstash Redis REST API calls
// No npm package needed — raw fetch to avoid version issues

const KV_URL = "https://sure-shrew-104058.upstash.io";
const KV_TOKEN = "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA==";

export async function kvGet(key: string): Promise<any> {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`KV GET failed: ${res.status}`);
  const { result } = await res.json();
  if (!result) return null;
  try { return JSON.parse(result); } catch { return result; }
}

export async function kvSet(key: string, value: any): Promise<void> {
  const body = JSON.stringify(typeof value === "string" ? value : JSON.stringify(value));
  const res = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });
  if (!res.ok) throw new Error(`KV SET failed: ${res.status} ${await res.text()}`);
}
