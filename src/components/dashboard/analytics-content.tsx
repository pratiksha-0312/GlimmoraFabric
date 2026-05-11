"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  X,
  Users,
  DollarSign,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const TABS = ["Overview", "Service Usage", "Cost Allocation"] as const;
type Tab = (typeof TABS)[number];

const PERIODS = ["Today", "7d", "30d", "90d"] as const;

interface Kpi {
  label: string;
  value: string;
  change: number;
  icon: typeof TrendingUp;
}

const KPI_DATA: Kpi[] = [];

/* Overview products */
interface Product {
  name: string;
  activeUsers: number;
  revenue: number;
  apiCalls: number;
  growth: number;
  apiLimit: number;
  storageUsed: number;
  storageLimit: number;
  bandwidthUsed: number;
  bandwidthLimit: number;
  trend: number[];
}

const PRODUCTS: Product[] = [];

/* Service Usage */
interface Service {
  name: string;
  calls: number;
  uptime: number;
  avgLatency: number;
}

const SERVICES: Service[] = [];

/* Cost Allocation */
type Plan = "Enterprise" | "Business" | "Starter";
interface Tenant {
  name: string;
  plan: Plan;
  usage: number;
  aiTokens: number;
  usagePct: number;
}

const TENANTS: Tenant[] = [];

const PLAN_COLORS: Record<Plan, string> = {
  Enterprise: "#0d9488",
  Business: "#3b82f6",
  Starter: "#f59e0b",
};

const PAGE_SIZE = 6;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt$(n: number) {
  return "$" + n.toLocaleString();
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function exportCsv(headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type SortDir = "asc" | "desc";

function useSortable<T>(data: T[], defaultKey: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggle(key: keyof T) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggle };
}

/* ------------------------------------------------------------------ */
/*  Small sub-components                                               */
/* ------------------------------------------------------------------ */

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th
      onClick={onClick}
      style={{
        cursor: "pointer",
        color: "var(--gf-text-secondary)",
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "10px 12px",
        textAlign: "left",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )
        ) : (
          <ChevronDown size={14} style={{ opacity: 0.25 }} />
        )}
      </span>
    </th>
  );
}

function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        padding: "10px 12px",
        color: "var(--gf-text-muted)",
        fontSize: 13,
      }}
    >
      <span>
        {page * PAGE_SIZE + 1}&ndash;
        {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
      </span>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        style={{
          background: "none",
          border: "none",
          cursor: page === 0 ? "default" : "pointer",
          opacity: page === 0 ? 0.3 : 1,
          color: "var(--gf-text-secondary)",
          padding: 2,
        }}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages - 1}
        style={{
          background: "none",
          border: "none",
          cursor: page >= pages - 1 ? "default" : "pointer",
          opacity: page >= pages - 1 ? 0.3 : 1,
          color: "var(--gf-text-secondary)",
          padding: 2,
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <tr>
      <td
        colSpan={99}
        style={{
          padding: 40,
          textAlign: "center",
          color: "var(--gf-text-muted)",
          fontSize: 14,
        }}
      >
        No results found.
      </td>
    </tr>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: 8,
        borderRadius: 4,
        background: "var(--gf-bg-base)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(pct, 100)}%`,
          height: "100%",
          borderRadius: 4,
          background: color,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: "relative", width: 220 }}>
      <Search
        size={15}
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--gf-text-muted)",
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        style={{
          width: "100%",
          padding: "7px 10px 7px 32px",
          fontSize: 13,
          borderRadius: 8,
          border: "1px solid var(--gf-border)",
          background: "var(--gf-bg-base)",
          color: "var(--gf-text-primary)",
          outline: "none",
        }}
      />
    </div>
  );
}

function ExportBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 8,
        border: "1px solid var(--gf-border)",
        background: "var(--gf-bg-surface)",
        color: "var(--gf-text-secondary)",
        cursor: "pointer",
      }}
    >
      <Download size={14} /> Export
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Detail Slide-over                                          */
/* ------------------------------------------------------------------ */

function ProductDetail({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const maxTrend = Math.max(...product.trend);
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: 420,
          maxWidth: "90vw",
          height: "100%",
          background: "var(--gf-bg-surface)",
          borderLeft: "1px solid var(--gf-border)",
          overflowY: "auto",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "var(--gf-text-primary)",
            }}
          >
            {product.name}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--gf-text-muted)",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { l: "Active Users", v: fmtNum(product.activeUsers) },
            { l: "Revenue (MTD)", v: fmt$(product.revenue) },
            { l: "API Calls", v: fmtNum(product.apiCalls) },
            {
              l: "Growth",
              v: (product.growth >= 0 ? "+" : "") + product.growth + "%",
            },
          ].map((m) => (
            <div
              key={m.l}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "var(--gf-bg-elevated)",
                border: "1px solid var(--gf-border)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--gf-text-muted)",
                  marginBottom: 4,
                }}
              >
                {m.l}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--gf-text-primary)",
                }}
              >
                {m.v}
              </div>
            </div>
          ))}
        </div>

        {/* Usage Breakdown */}
        <div>
          <h4
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--gf-text-primary)",
            }}
          >
            Usage Breakdown
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                l: "API Calls",
                used: product.apiCalls,
                limit: product.apiLimit,
              },
              {
                l: "Storage (GB)",
                used: product.storageUsed,
                limit: product.storageLimit,
              },
              {
                l: "Bandwidth (GB)",
                used: product.bandwidthUsed,
                limit: product.bandwidthLimit,
              },
            ].map((u) => {
              const pct = Math.round((u.used / u.limit) * 100);
              return (
                <div key={u.l}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--gf-text-secondary)",
                      marginBottom: 4,
                    }}
                  >
                    <span>{u.l}</span>
                    <span>
                      {fmtNum(u.used)} / {fmtNum(u.limit)} ({pct}%)
                    </span>
                  </div>
                  <ProgressBar
                    pct={pct}
                    color={
                      pct > 85
                        ? "#ef4444"
                        : pct > 60
                          ? "#f59e0b"
                          : "#22c55e"
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div>
          <h4
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--gf-text-primary)",
            }}
          >
            Monthly Revenue Trend
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              height: 120,
              padding: "0 4px",
            }}
          >
            {product.trend.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 10, color: "var(--gf-text-muted)" }}>
                  {fmt$(v * 1000)}
                </span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 36,
                    height: `${(v / maxTrend) * 90}%`,
                    minHeight: 4,
                    borderRadius: "4px 4px 0 0",
                    background: "var(--gf-accent)",
                    opacity: 0.8 + (i / product.trend.length) * 0.2,
                  }}
                />
                <span style={{ fontSize: 10, color: "var(--gf-text-muted)" }}>
                  {months[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Overview                                                      */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(
    () =>
      PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );
  const { sorted, sortKey, sortDir, toggle } = useSortable(
    filtered,
    "revenue"
  );
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleExport() {
    exportCsv(
      ["Product", "Active Users", "Revenue (MTD)", "API Calls", "Growth"],
      sorted.map((p) => [
        p.name,
        String(p.activeUsers),
        String(p.revenue),
        String(p.apiCalls),
        p.growth + "%",
      ])
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
        />
        <ExportBtn onClick={handleExport} />
      </div>
      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--gf-border)",
          overflow: "hidden",
          background: "var(--gf-bg-surface)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              <SortHeader
                label="Product"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggle("name")}
              />
              <SortHeader
                label="Active Users"
                active={sortKey === "activeUsers"}
                dir={sortDir}
                onClick={() => toggle("activeUsers")}
              />
              <SortHeader
                label="Revenue (MTD)"
                active={sortKey === "revenue"}
                dir={sortDir}
                onClick={() => toggle("revenue")}
              />
              <SortHeader
                label="API Calls"
                active={sortKey === "apiCalls"}
                dir={sortDir}
                onClick={() => toggle("apiCalls")}
              />
              <SortHeader
                label="Growth"
                active={sortKey === "growth"}
                dir={sortDir}
                onClick={() => toggle("growth")}
              />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <EmptyState />
            ) : (
              paged.map((p) => (
                <tr
                  key={p.name}
                  onClick={() => setSelected(p)}
                  style={{
                    borderBottom: "1px solid var(--gf-border)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--gf-bg-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--gf-text-primary)",
                    }}
                  >
                    {p.name}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--gf-text-secondary)",
                    }}
                  >
                    {fmtNum(p.activeUsers)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--gf-text-secondary)",
                    }}
                  >
                    {fmt$(p.revenue)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--gf-text-secondary)",
                    }}
                  >
                    {fmtNum(p.apiCalls)}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: p.growth >= 0 ? "#22c55e" : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {p.growth >= 0 ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      {p.growth >= 0 ? "+" : ""}
                      {p.growth}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
      {selected && (
        <ProductDetail
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Service Usage                                                 */
/* ------------------------------------------------------------------ */

function ServiceUsageTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      SERVICES.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );
  const { sorted, sortKey, sortDir, toggle } = useSortable(filtered, "calls");
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function latencyColor(ms: number) {
    if (ms < 100) return "#22c55e";
    if (ms < 500) return "#f59e0b";
    return "#ef4444";
  }

  function handleExport() {
    exportCsv(
      ["Service", "Calls (MTD)", "Uptime", "Avg Latency"],
      sorted.map((s) => [
        s.name,
        String(s.calls),
        s.uptime + "%",
        s.avgLatency + "ms",
      ])
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
        />
        <ExportBtn onClick={handleExport} />
      </div>
      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--gf-border)",
          overflow: "hidden",
          background: "var(--gf-bg-surface)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              <SortHeader
                label="Service"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggle("name")}
              />
              <SortHeader
                label="Calls (MTD)"
                active={sortKey === "calls"}
                dir={sortDir}
                onClick={() => toggle("calls")}
              />
              <SortHeader
                label="Uptime"
                active={sortKey === "uptime"}
                dir={sortDir}
                onClick={() => toggle("uptime")}
              />
              <SortHeader
                label="Avg Latency"
                active={sortKey === "avgLatency"}
                dir={sortDir}
                onClick={() => toggle("avgLatency")}
              />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <EmptyState />
            ) : (
              paged.map((s) => (
                <tr
                  key={s.name}
                  style={{
                    borderBottom: "1px solid var(--gf-border)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--gf-bg-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--gf-text-primary)",
                    }}
                  >
                    {s.name}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--gf-text-secondary)",
                    }}
                  >
                    {fmtNum(s.calls)}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ width: 80 }}>
                        <ProgressBar pct={s.uptime} color="#22c55e" />
                      </div>
                      <span
                        style={{
                          color: "var(--gf-text-secondary)",
                          fontSize: 12,
                        }}
                      >
                        {s.uptime}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ width: 60 }}>
                        <ProgressBar
                          pct={Math.min(
                            (s.avgLatency / 500) * 100,
                            100
                          )}
                          color={latencyColor(s.avgLatency)}
                        />
                      </div>
                      <span
                        style={{
                          color: latencyColor(s.avgLatency),
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {s.avgLatency}ms
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Cost Allocation                                               */
/* ------------------------------------------------------------------ */

function CostAllocationTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      TENANTS.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );
  const { sorted, sortKey, sortDir, toggle } = useSortable(filtered, "usage");
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleExport() {
    exportCsv(
      ["Tenant", "Plan", "Usage ($, MTD)", "AI Tokens", "Usage %"],
      sorted.map((t) => [
        t.name,
        t.plan,
        String(t.usage),
        String(t.aiTokens),
        t.usagePct + "%",
      ])
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(0);
          }}
        />
        <ExportBtn onClick={handleExport} />
      </div>
      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--gf-border)",
          overflow: "hidden",
          background: "var(--gf-bg-surface)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              <SortHeader
                label="Tenant"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggle("name")}
              />
              <th
                style={{
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--gf-text-secondary)",
                  textAlign: "left",
                }}
              >
                Plan
              </th>
              <SortHeader
                label="Usage ($, MTD)"
                active={sortKey === "usage"}
                dir={sortDir}
                onClick={() => toggle("usage")}
              />
              <SortHeader
                label="AI Tokens"
                active={sortKey === "aiTokens"}
                dir={sortDir}
                onClick={() => toggle("aiTokens")}
              />
              <SortHeader
                label="Usage Bar"
                active={sortKey === "usagePct"}
                dir={sortDir}
                onClick={() => toggle("usagePct")}
              />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <EmptyState />
            ) : (
              paged.map((t) => (
                <tr
                  key={t.name}
                  style={{
                    borderBottom: "1px solid var(--gf-border)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--gf-bg-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--gf-text-primary)",
                    }}
                  >
                    {t.name}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#fff",
                        background: PLAN_COLORS[t.plan],
                      }}
                    >
                      {t.plan}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--gf-text-secondary)",
                    }}
                  >
                    {fmt$(t.usage)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--gf-text-secondary)",
                    }}
                  >
                    {fmtNum(t.aiTokens)}
                  </td>
                  <td style={{ padding: "10px 12px", minWidth: 140 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <ProgressBar
                          pct={t.usagePct}
                          color={
                            t.usagePct > 85
                              ? "#ef4444"
                              : t.usagePct > 60
                                ? "#f59e0b"
                                : "#22c55e"
                          }
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--gf-text-secondary)",
                          minWidth: 32,
                          textAlign: "right",
                        }}
                      >
                        {t.usagePct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function AnalyticsContent() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [period, setPeriod] = useState<string>("30d");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "var(--gf-text-primary)",
            }}
          >
            Reports &amp; Analytics
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "var(--gf-text-muted)",
            }}
          >
            Monitor platform performance, usage patterns, and cost allocation
            across all tenants.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {/* Period toggles */}
          <div
            style={{
              display: "flex",
              gap: 2,
              borderRadius: 8,
              padding: 2,
              background: "var(--gf-bg-surface)",
              border: "1px solid var(--gf-border)",
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background:
                    period === p ? "var(--gf-accent)" : "transparent",
                  color: period === p ? "#fff" : "var(--gf-text-secondary)",
                  transition: "all 0.15s",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={() => {
              exportCsv(["Report"], [["Analytics export placeholder"]]);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 8,
              border: "1px solid var(--gf-border)",
              background: "var(--gf-bg-surface)",
              color: "var(--gf-text-secondary)",
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Export CSV
          </button>

          {/* Refresh */}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--gf-border)",
              background: "var(--gf-bg-surface)",
              color: "var(--gf-text-secondary)",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {KPI_DATA.map((k) => {
          const positive =
            k.label === "Avg Response Time" ? k.change < 0 : k.change > 0;
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              style={{
                padding: 16,
                borderRadius: 12,
                background: "var(--gf-bg-surface)",
                border: "1px solid var(--gf-border)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--gf-text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {k.label}
                </span>
                <Icon size={16} style={{ color: "var(--gf-text-muted)" }} />
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--gf-text-primary)",
                }}
              >
                {k.value}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 600,
                    color: positive ? "#22c55e" : "#ef4444",
                  }}
                >
                  {positive ? (
                    <TrendingUp size={13} />
                  ) : (
                    <TrendingDown size={13} />
                  )}
                  {k.change > 0 ? "+" : ""}
                  {k.change}%
                </span>
                <span
                  style={{ fontSize: 11, color: "var(--gf-text-muted)" }}
                >
                  vs last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-lg p-1"
        style={{
          background: "var(--gf-bg-surface)",
          border: "1px solid var(--gf-border)",
          width: "fit-content",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background:
                tab === t ? "var(--gf-accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--gf-text-secondary)",
              transition: "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Overview" && <OverviewTab />}
      {tab === "Service Usage" && <ServiceUsageTab />}
      {tab === "Cost Allocation" && <CostAllocationTab />}
    </div>
  );
}
