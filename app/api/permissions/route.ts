import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

const redis = new Redis({
  url: "https://sure-shrew-104058.upstash.io",
  token: "gQAAAAAAAZZ6AAIgcDE4OGQ5NzI3Y2NlMTI0MTk0OTA3NjhmMjZkY2RiYmRhOA",
});

export interface PermissionSet {
  update_audit:    boolean; // Update video scores, suggestions, issues
  send_messages:   boolean; // Send team messages on user's behalf
  send_email:      boolean; // Send emails (future)
  update_memory:   boolean; // Add/modify Sarie's persistent memory
  trigger_sync:    boolean; // Trigger TikTok data re-sync
}

// Who can access this permissions page
const ADMIN_IDS = ["yassin"];

// Defaults applied when no KV record exists yet
export const DEFAULT_PERMISSIONS: Record<string, PermissionSet> = {
  yassin:  { update_audit: true,  send_messages: true,  send_email: true,  update_memory: true,  trigger_sync: true  },
  dina:    { update_audit: true,  send_messages: true,  send_email: true,  update_memory: false, trigger_sync: false },
  haitham: { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
  shahd:   { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
  sara:    { update_audit: true,  send_messages: true,  send_email: true,  update_memory: false, trigger_sync: false },
  shahdm:  { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
  yousef:  { update_audit: false, send_messages: true,  send_email: false, update_memory: false, trigger_sync: false },
};

function parseKV(raw: unknown): any {
  if (!raw) return null;
  let r = raw;
  for (let i = 0; i < 5 && typeof r === "string"; i++) {
    try { r = JSON.parse(r); } catch { return null; }
  }
  return typeof r === "object" ? r : null;
}

// GET /api/permissions?userId=X  → { permissions: Record<userId, PermissionSet> }
export async function GET() {
  try {
    const raw = await redis.get("sarie_permissions");
    const stored = parseKV(raw) ?? {};
    // Merge stored with defaults so new users get defaults automatically
    const merged: Record<string, PermissionSet> = { ...DEFAULT_PERMISSIONS };
    for (const [uid, perms] of Object.entries(stored)) {
      merged[uid] = { ...DEFAULT_PERMISSIONS[uid], ...(perms as Partial<PermissionSet>) };
    }
    return Response.json({ permissions: merged });
  } catch {
    return Response.json({ permissions: DEFAULT_PERMISSIONS });
  }
}

// POST /api/permissions  body: { requesterId, userId, permissions }
export async function POST(req: NextRequest) {
  try {
    const { requesterId, userId, permissions } = await req.json();
    if (!ADMIN_IDS.includes(requesterId)) {
      return Response.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }
    const raw = await redis.get("sarie_permissions");
    const current = parseKV(raw) ?? { ...DEFAULT_PERMISSIONS };
    current[userId] = { ...DEFAULT_PERMISSIONS[userId], ...permissions };
    await redis.set("sarie_permissions", JSON.stringify(current));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
