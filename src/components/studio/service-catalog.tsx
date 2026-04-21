"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Zap, ArrowRight, Package } from "lucide-react";

interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  endpoint: string;
  method: string;
  version: string;
  status: string;
  auth: string;
  updatedAt: string;
}

const METHOD_COLOR: Record<string, string> = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  PATCH: "#a855f7",
  DELETE: "#ef4444",
};

const STATUS_COLOR: Record<string, string> = {
  stable: "#22c55e",
  beta: "#3b82f6",
  preview: "#a855f7",
  deprecated: "#ef4444",
};

export function StudioServiceCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("/api/studio/services")
      .then((r) => r.json())
      .then((d: Service[]) => setServices(d))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(services.map((s) => s.category))).sort()], [services]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter((s) => {
      const okSearch = !q || s.name.toLowerCase().includes(q) || s.endpoint.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      const okCat = category === "All" || s.category === category;
      return okSearch && okCat;
    });
  }, [services, search, category]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Service Catalog</h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Every API surface exposed by Glimmora Fabric, grouped by domain.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search endpoints, names, descriptions..." className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading services…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No services match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link key={s.id} href={`/studio/services/${s.slug}`} className="rounded-xl border p-5 transition-all hover:shadow-lg hover:border-[var(--gf-accent)]/60" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ color: METHOD_COLOR[s.method] ?? "#9ca3af", backgroundColor: `${METHOD_COLOR[s.method] ?? "#9ca3af"}20` }}>{s.method}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: STATUS_COLOR[s.status] ?? "#9ca3af", backgroundColor: `${STATUS_COLOR[s.status] ?? "#9ca3af"}20` }}>{s.status}</span>
                <span className="ml-auto text-xs" style={{ color: "var(--gf-text-muted)" }}>{s.version}</span>
              </div>
              <p className="text-xs font-mono mb-2 truncate" style={{ color: "var(--gf-accent)" }}>{s.endpoint}</p>
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>{s.name}</h3>
              <p className="text-xs line-clamp-2" style={{ color: "var(--gf-text-secondary)" }}>{s.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{s.category}</span>
                <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--gf-accent)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-xl border p-4 flex items-start gap-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <Zap className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--gf-accent)" }} />
        <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
          Looking to try an endpoint without writing code? Head to the <Link href="/studio/playground" className="font-medium" style={{ color: "var(--gf-accent)" }}>API playground</Link>.
        </p>
      </div>
    </div>
  );
}
