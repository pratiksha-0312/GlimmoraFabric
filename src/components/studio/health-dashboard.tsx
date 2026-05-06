"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Clock } from "lucide-react";

interface HealthComponent {
  name: string;
  status: "operational" | "degraded" | "outage";
  latencyMs: number;
  uptimePct: number;
}

interface HealthIncident {
  id: string;
  title: string;
  status: string;
  startedAt: string;
}

interface HealthResponse {
  status: "operational" | "degraded" | "outage";
  checkedAt: string;
  summary: { services: number; events: number; components: number; activeApiKeys: number };
  components: HealthComponent[];
  incidents: HealthIncident[];
}

const STATUS_COLOR: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  operational: { bg: "rgba(34,197,94,0.15)", text: "#22c55e", icon: CheckCircle2 },
  degraded: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", icon: AlertTriangle },
  outage: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", icon: XCircle },
};

export function StudioHealthDashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    (async () => {
      try {
        const { healthDashboardApi } = await import("@/lib/api");
        const d = (await healthDashboardApi.get()) as HealthResponse | null;
        if (d) setHealth(d);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000); // live-ish: poll every 15s
    return () => clearInterval(t);
  }, []);

  if (loading) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading health…</div>;
  if (!health) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Health data unavailable.</div>;

  const overall = STATUS_COLOR[health.status];
  const OverallIcon = overall.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Platform Health</h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Live status of every subsystem. Refreshes every 15 seconds.</p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--gf-text-muted)" }}>
          <Clock className="h-3.5 w-3.5" />Last checked {new Date(health.checkedAt).toLocaleTimeString()}
          <button onClick={refresh} className="ml-2 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <RefreshCw className="h-3 w-3" />Refresh
          </button>
        </div>
      </div>

      {/* Overall */}
      <div className="rounded-xl border p-5 flex items-center gap-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: overall.bg, color: overall.text }}>
          <OverallIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold capitalize" style={{ color: overall.text }}>{health.status}</p>
          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>All systems monitored live.</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Services", value: health.summary.services },
          { label: "Events", value: health.summary.events },
          { label: "Components", value: health.summary.components },
          { label: "Active API Keys", value: health.summary.activeApiKeys },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Components */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-5 py-3" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Subsystems</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
          {health.components.map((c) => {
            const color = STATUS_COLOR[c.status] ?? STATUS_COLOR.operational;
            const Icon = color.icon;
            return (
              <div key={c.name} className="flex items-center gap-3 px-5 py-3 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: color.bg, color: color.text }}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{c.name}</p>
                  <p className="text-xs capitalize" style={{ color: color.text }}>{c.status}</p>
                </div>
                <div className="text-right text-xs" style={{ color: "var(--gf-text-muted)" }}>
                  <p>{c.latencyMs} ms</p>
                  <p>{c.uptimePct.toFixed(2)}% uptime</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents */}
      {health.incidents.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Active Incidents</h3>
          <div className="space-y-2">
            {health.incidents.map((inc) => (
              <div key={inc.id} className="flex items-start gap-3 rounded-lg border p-3" style={{ borderColor: "rgba(245,158,11,0.3)", backgroundColor: "rgba(245,158,11,0.05)" }}>
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{inc.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>
                    <span className="capitalize">{inc.status}</span> · started {new Date(inc.startedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
