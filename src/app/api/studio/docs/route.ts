import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Auto-generated SDK docs index. Each service in the catalog becomes an entry
// in the SDK reference (JS/TS bindings). The UI expands individual entries
// to show the full markdown + sample payloads.
export async function GET() {
  const services = await prisma.studioService.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  const sections = new Map<string, Array<{
    slug: string;
    name: string;
    method: string;
    endpoint: string;
    version: string;
    status: string;
    summary: string;
    tsFunctionName: string;
    tsSignature: string;
  }>>();

  for (const s of services) {
    const fn = s.slug
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((word, i) => i === 0 ? word : word[0].toUpperCase() + word.slice(1))
      .join("");
    const hasBody = s.method === "POST" || s.method === "PUT" || s.method === "PATCH";
    const tsSignature = `glimmora.${fn}(${hasBody ? "input: Record<string, unknown>" : ""}): Promise<unknown>`;
    const entry = {
      slug: s.slug,
      name: s.name,
      method: s.method,
      endpoint: s.endpoint,
      version: s.version,
      status: s.status,
      summary: s.description,
      tsFunctionName: fn,
      tsSignature,
    };
    const list = sections.get(s.category) ?? [];
    list.push(entry);
    sections.set(s.category, list);
  }

  return NextResponse.json({
    sdk: "@glimmora/sdk",
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    sections: Array.from(sections.entries()).map(([category, entries]) => ({ category, entries })),
  });
}
