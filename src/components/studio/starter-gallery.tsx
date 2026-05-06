"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, GitBranch, Star, ExternalLink, Rocket } from "lucide-react";

interface Starter {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  repoUrl: string;
  stars: number;
  language: string;
  license: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  "Full-stack": "#a855f7",
  Frontend: "#3b82f6",
  Backend: "#22c55e",
  Mobile: "#f59e0b",
  CLI: "#ec4899",
};

export function StudioStarterGallery() {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    // FastAPI has no `/studio/starters` endpoint yet — surface an empty
    // gallery so the page renders cleanly. The legacy Next.js route used
    // a static seed file; once the backend ships a starter catalog we can
    // swap this to `apiClient.get("/api/studio/starters")`.
    setStarters([]);
    setLoading(false);
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(starters.map((s) => s.category))).sort()], [starters]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return starters.filter((s) => (
      (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      && (category === "All" || s.category === category)
    ));
  }, [starters, search, category]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Starter Repo Gallery</h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Clone and go — production-ready templates wired to the Glimmora SDK.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search starters..." className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const color = CATEGORY_COLOR[s.category] ?? "#9ca3af";
            return (
              <div key={s.id} className="rounded-xl border p-5 flex flex-col" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}20` }}>{s.category}</span>
                  <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{s.language}</span>
                  <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{s.license}</span>
                  <span className="ml-auto text-xs flex items-center gap-1" style={{ color: "var(--gf-text-muted)" }}>
                    <Star className="h-3 w-3" />{s.stars.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>{s.name}</h3>
                <p className="text-xs flex-1" style={{ color: "var(--gf-text-secondary)" }}>{s.description}</p>
                <div className="mt-4 flex gap-2">
                  <a href={s.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                    <ExternalLink className="h-3.5 w-3.5" />View on GitHub
                  </a>
                  <code className="flex-1 text-[11px] font-mono truncate rounded-md px-2 py-1.5" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)", border: "1px solid var(--gf-border)" }}>
                    <GitBranch className="h-3 w-3 inline -mt-0.5 mr-1" />{s.repoUrl.replace("https://github.com/", "")}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
