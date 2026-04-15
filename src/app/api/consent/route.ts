import { NextResponse } from "next/server";

interface ConsentItem {
  id: string;
  enabled: boolean;
  lastUpdated: string;
}

const globalKey = "__gf_consent__";
type G = typeof globalThis & { [globalKey]?: ConsentItem[] };
const g = globalThis as G;

const consents: ConsentItem[] = (g[globalKey] ??= [
  { id: "essential", enabled: true, lastUpdated: "2026-01-15" },
  { id: "analytics", enabled: true, lastUpdated: "2026-03-20" },
  { id: "marketing", enabled: false, lastUpdated: "2026-03-20" },
  { id: "thirdparty", enabled: true, lastUpdated: "2026-02-10" },
  { id: "profiling", enabled: false, lastUpdated: "2026-03-20" },
  { id: "logging", enabled: true, lastUpdated: "2026-01-15" },
]);

export async function GET() {
  return NextResponse.json({ items: consents });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { items?: ConsentItem[] };
  if (Array.isArray(body.items)) {
    const today = new Date().toISOString().slice(0, 10);
    body.items.forEach((next) => {
      const existing = consents.find((c) => c.id === next.id);
      if (existing) {
        if (existing.enabled !== next.enabled) existing.lastUpdated = today;
        existing.enabled = next.enabled;
      }
    });
  }
  return NextResponse.json({ items: consents });
}
