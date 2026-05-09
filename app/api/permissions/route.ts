import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { parseKV } from "@/lib/kv";
import { PermissionSet, DEFAULT_PERMISSIONS } from "@/lib/permissions";

export type { PermissionSet };

const ADMIN_IDS = ["yassin"];

export async function GET() {
  try {
    const stored = parseKV(await redis.get("sarie_permissions")) ?? {};
    const merged: Record<string, PermissionSet> = {};
    for (const uid of Object.keys(DEFAULT_PERMISSIONS)) {
      merged[uid] = { ...DEFAULT_PERMISSIONS[uid], ...(stored[uid] ?? {}) };
    }
    return Response.json({ permissions: merged });
  } catch {
    return Response.json({ permissions: DEFAULT_PERMISSIONS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requesterId, userId, permissions } = await req.json();
    if (!ADMIN_IDS.includes(requesterId)) {
      return Response.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }
    const current = parseKV(await redis.get("sarie_permissions")) ?? { ...DEFAULT_PERMISSIONS };
    current[userId] = { ...DEFAULT_PERMISSIONS[userId], ...permissions };
    await redis.set("sarie_permissions", JSON.stringify(current));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
