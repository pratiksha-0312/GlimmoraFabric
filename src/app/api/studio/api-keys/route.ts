import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function randomToken(len = 32) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function serialize(k: {
  id: string;
  name: string;
  keyPrefix: string;
  keyMasked: string;
  scopes: string;
  status: string;
  lastUsed: Date | null;
  createdBy: string;
  createdAt: Date;
  revokedAt: Date | null;
}) {
  let scopes: string[] = [];
  try { scopes = JSON.parse(k.scopes || "[]"); } catch { scopes = []; }
  return {
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    keyMasked: k.keyMasked,
    scopes,
    status: k.status,
    lastUsed: k.lastUsed?.toISOString() ?? null,
    createdBy: k.createdBy,
    createdAt: k.createdAt.toISOString(),
    revokedAt: k.revokedAt?.toISOString() ?? null,
  };
}

export async function GET() {
  const keys = await prisma.studioApiKey.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(keys.map(serialize));
}

// POST /api/studio/api-keys — creates a new API key. The raw secret is
// returned ONCE here and then only the masked form is readable afterwards.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const scopes = Array.isArray(body.scopes)
    ? (body.scopes as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const mode = body.mode === "live" ? "live" : "test";
  const prefix = `gf_${mode}_`;
  const secret = randomToken(24);
  const fullKey = `${prefix}${secret}`;
  const masked = `${prefix}${"•".repeat(8)}${secret.slice(-4)}`;
  const createdBy = req.headers.get("x-user-name") || "Current User";

  const record = await prisma.studioApiKey.create({
    data: {
      name,
      keyPrefix: prefix,
      keyMasked: masked,
      scopes: JSON.stringify(scopes),
      createdBy,
    },
  });

  return NextResponse.json({
    ...serialize(record),
    // The raw key is only available once, at creation time.
    key: fullKey,
  }, { status: 201 });
}
