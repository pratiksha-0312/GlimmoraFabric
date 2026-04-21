"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Radio, ChevronDown, ChevronRight } from "lucide-react";

interface StudioEvent {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  version: string;
  schema: Record<string, unknown>;
  updatedAt: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  System: "#a855f7",
  Billing: "#f59e0b",
  Workflow: "#3b82f6",
  Document: "#22c55e",
  User: "#ec4899",
};

export function StudioEventCatalog() {
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/events")
      .then((r) => r.json())
      .then((d: StudioEvent[]) => setEvents(d))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(events.map((e) => e.category))).sort()], [events]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((e) => {
      const okSearch = !q || e.name.toLowerCase().includes(q) || e.key.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
      return okSearch && (category === "All" || e.category === category);
    });
  }, [events, search, category]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Event Catalog</h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Every platform event you can subscribe to via webhooks.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search event keys, names..." className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading events…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No events match.</div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          {filtered.map((e) => {
            const color = CATEGORY_COLOR[e.category] ?? "#9ca3af";
            const open = expanded === e.id;
            return (
              <div key={e.id} className="border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                <button onClick={() => setExpanded(open ? null : e.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  {open ? <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--gf-text-muted)" }} /> : <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--gf-text-muted)" }} />}
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ color, backgroundColor: `${color}20` }}>{e.category}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{e.name}</p>
                    <p className="text-xs font-mono truncate" style={{ color: "var(--gf-text-muted)" }}>{e.key}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "var(--gf-text-muted)" }}>{e.version}</span>
                </button>
                {open && (
                  <div className="px-5 pb-4 pt-0 space-y-3">
                    <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{e.description}</p>
                    <div>
                      <p className="text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--gf-text-muted)" }}>Payload Schema</p>
                      <pre className="text-xs overflow-x-auto p-3 rounded-lg font-mono" style={{ color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)" }}>
{JSON.stringify(e.schema, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
