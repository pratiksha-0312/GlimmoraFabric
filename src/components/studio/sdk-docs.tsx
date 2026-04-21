"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Package } from "lucide-react";

interface SdkEntry {
  slug: string;
  name: string;
  method: string;
  endpoint: string;
  version: string;
  status: string;
  summary: string;
  tsFunctionName: string;
  tsSignature: string;
}

interface SdkSection {
  category: string;
  entries: SdkEntry[];
}

interface SdkDocsResponse {
  sdk: string;
  version: string;
  generatedAt: string;
  sections: SdkSection[];
}

const METHOD_COLOR: Record<string, string> = {
  GET: "#22c55e", POST: "#3b82f6", PUT: "#f59e0b", PATCH: "#a855f7", DELETE: "#ef4444",
};

export function StudioSdkDocs() {
  const [docs, setDocs] = useState<SdkDocsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/docs")
      .then((r) => r.json())
      .then((d: SdkDocsResponse) => { setDocs(d); setActive(d.sections[0]?.category ?? null); })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const activeSection = useMemo(() => docs?.sections.find((s) => s.category === active), [docs, active]);
  const filteredEntries = useMemo(() => {
    if (!activeSection) return [] as SdkEntry[];
    const q = search.toLowerCase();
    if (!q) return activeSection.entries;
    return activeSection.entries.filter((e) => e.tsFunctionName.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.endpoint.toLowerCase().includes(q));
  }, [activeSection, search]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>SDK Reference</h1>
        </div>
        {docs && (
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            <span className="font-mono" style={{ color: "var(--gf-accent)" }}>{docs.sdk}</span> v{docs.version} — auto-generated from the service catalog.
          </p>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Generating docs…</div>
      ) : !docs ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>SDK docs unavailable.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* Sidebar */}
          <div className="rounded-xl border p-2" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            {docs.sections.map((section) => (
              <button key={section.category} onClick={() => setActive(section.category)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active === section.category ? "font-semibold" : ""}`} style={{
                backgroundColor: active === section.category ? "var(--gf-bg-elevated)" : "transparent",
                color: active === section.category ? "var(--gf-text-primary)" : "var(--gf-text-secondary)",
              }}>
                <Package className="h-3.5 w-3.5" />{section.category}
                <span className="ml-auto text-xs" style={{ color: "var(--gf-text-muted)" }}>{section.entries.length}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search methods..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            {filteredEntries.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No entries match.</div>
            ) : filteredEntries.map((e) => {
              const color = METHOD_COLOR[e.method] ?? "#9ca3af";
              return (
                <div key={e.slug} className="rounded-xl border p-4 space-y-2" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ color, backgroundColor: `${color}20` }}>{e.method}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{e.endpoint}</span>
                    <span className="ml-auto text-xs" style={{ color: "var(--gf-text-muted)" }}>{e.version} · {e.status}</span>
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{e.name}</h3>
                  <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{e.summary}</p>
                  <pre className="text-xs overflow-x-auto font-mono rounded-lg px-3 py-2" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)", border: "1px solid var(--gf-border)" }}>{e.tsSignature}</pre>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
