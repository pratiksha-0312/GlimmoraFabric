"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Blocks, Download, Copy, CheckCircle2 } from "lucide-react";

interface Component {
  id: string;
  slug: string;
  name: string;
  category: string;
  framework: string;
  description: string;
  downloads: number;
  version: string;
  previewHtml: string;
  installCmd: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  UI: "#3b82f6", Data: "#22c55e", Auth: "#a855f7", Billing: "#f59e0b", Layout: "#ec4899",
};

export function StudioComponentMarketplace() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/components")
      .then((r) => r.json())
      .then((d: Component[]) => setComponents(d))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(components.map((c) => c.category))).sort()], [components]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return components.filter((c) => (
      (!q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      && (category === "All" || c.category === category)
    ));
  }, [components, search, category]);

  const copy = async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500); } catch { /* noop */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Blocks className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Component Marketplace</h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Ship faster with Glimmora-blessed React components.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search components..." className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const color = CATEGORY_COLOR[c.category] ?? "#9ca3af";
            return (
              <div key={c.id} className="rounded-xl border overflow-hidden flex flex-col" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {c.previewHtml ? (
                    <div className="p-4 text-[11px]" style={{ color: "var(--gf-text-secondary)" }} dangerouslySetInnerHTML={{ __html: c.previewHtml }} />
                  ) : (
                    <Blocks className="h-10 w-10 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}20` }}>{c.category}</span>
                    <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{c.framework}</span>
                    <span className="ml-auto text-xs flex items-center gap-1" style={{ color: "var(--gf-text-muted)" }}>
                      <Download className="h-3 w-3" />{c.downloads.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{c.name}</h3>
                  <p className="mt-1 text-xs line-clamp-2 flex-1" style={{ color: "var(--gf-text-secondary)" }}>{c.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 text-[10px] font-mono truncate rounded-md px-2 py-1.5" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)", border: "1px solid var(--gf-border)" }}>{c.installCmd}</code>
                    <button onClick={() => copy(c.id, c.installCmd)} className="rounded-md p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                      {copied === c.id ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#22c55e" }} /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
