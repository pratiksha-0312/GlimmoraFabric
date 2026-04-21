"use client";

import { useEffect, useState } from "react";
import { Brain, Clock, AlertTriangle, TrendingUp, Zap, Activity } from "lucide-react";

interface Model {
  id: string;
  name: string;
  family: string;
  tokensPerSec: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  successRate: number;
  requests24h: number;
}

interface Series {
  date: string;
  latencyMs: number;
  errorRatePct: number;
  requests: number;
}

interface TopPrompt {
  prompt: string;
  count: number;
  avgLatencyMs: number;
}

interface PerformanceResponse {
  generatedAt: string;
  summary: {
    totalRequests24h: number;
    avgLatencyMs: number;
    errorRatePct: number;
    uptime30dPct: number;
    activeModels: number;
  };
  models: Model[];
  timeseries: Series[];
  topPrompts: TopPrompt[];
}

export function AiAnalyticsDashboard() {
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/analytics/performance")
      .then((r) => r.json())
      .then((d: PerformanceResponse) => setData(d))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading metrics…</div>;
  if (!data) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Metrics unavailable.</div>;

  const maxReq = Math.max(...data.timeseries.map((t) => t.requests));
  const maxLatency = Math.max(...data.timeseries.map((t) => t.latencyMs));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>AI Model Performance</h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Latency, throughput, and error rates across the Glimmora AI models.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Requests 24h", value: data.summary.totalRequests24h.toLocaleString(), icon: Activity },
          { label: "Avg Latency", value: `${data.summary.avgLatencyMs} ms`, icon: Clock },
          { label: "Error Rate", value: `${data.summary.errorRatePct.toFixed(2)}%`, icon: AlertTriangle },
          { label: "30d Uptime", value: `${data.summary.uptime30dPct.toFixed(2)}%`, icon: TrendingUp },
          { label: "Active Models", value: data.summary.activeModels.toString(), icon: Zap },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Model table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-5 py-3" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Model Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                {["Model", "Requests 24h", "Tokens/sec", "Avg Latency", "P95 Latency", "Success %", "Errors %"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.models.map((m) => (
                <tr key={m.id} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{m.name}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{m.id}</p>
                  </td>
                  <td className="px-5 py-3 tabular-nums" style={{ color: "var(--gf-text-secondary)" }}>{m.requests24h.toLocaleString()}</td>
                  <td className="px-5 py-3 tabular-nums" style={{ color: "var(--gf-text-secondary)" }}>{Math.round(m.tokensPerSec)}</td>
                  <td className="px-5 py-3 tabular-nums" style={{ color: "var(--gf-text-secondary)" }}>{Math.round(m.avgLatencyMs)} ms</td>
                  <td className="px-5 py-3 tabular-nums" style={{ color: "var(--gf-text-secondary)" }}>{Math.round(m.p95LatencyMs)} ms</td>
                  <td className="px-5 py-3 tabular-nums">
                    <span style={{ color: "#22c55e" }}>{m.successRate.toFixed(2)}%</span>
                  </td>
                  <td className="px-5 py-3 tabular-nums">
                    <span style={{ color: m.errorRate > 1 ? "#f59e0b" : "var(--gf-text-secondary)" }}>{m.errorRate.toFixed(2)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeseries chart (inline SVG bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Requests (14d)" series={data.timeseries.map((t) => ({ label: t.date, value: t.requests, max: maxReq }))} color="#22c55e" />
        <ChartCard title="Avg Latency (14d)" series={data.timeseries.map((t) => ({ label: t.date, value: t.latencyMs, max: maxLatency, suffix: "ms" }))} color="#3b82f6" />
      </div>

      {/* Top prompts */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-5 py-3" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Top Prompts (24h)</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
          {data.topPrompts.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
              <p className="text-sm flex-1 truncate" style={{ color: "var(--gf-text-primary)" }}>{p.prompt}</p>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs tabular-nums" style={{ color: "var(--gf-text-secondary)" }}>{p.count.toLocaleString()} calls</span>
                <span className="text-xs tabular-nums" style={{ color: "var(--gf-text-muted)" }}>{p.avgLatencyMs} ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, series, color }: { title: string; series: Array<{ label: string; value: number; max: number; suffix?: string }>; color: string }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>{title}</h3>
      <div className="flex items-end gap-1 h-40">
        {series.map((s, i) => {
          const h = Math.max(4, Math.round((s.value / s.max) * 100));
          return (
            <div key={i} className="flex-1 group relative">
              <div className="w-full rounded-t transition-opacity hover:opacity-80" style={{ height: `${h}%`, backgroundColor: color, opacity: 0.8 }} />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden whitespace-nowrap rounded px-2 py-1 text-[10px] group-hover:block" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-primary)", border: "1px solid var(--gf-border)" }}>
                {s.label}: {Math.round(s.value).toLocaleString()}{s.suffix ?? ""}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--gf-text-muted)" }}>
        <span>{series[0]?.label}</span>
        <span>{series[series.length - 1]?.label}</span>
      </div>
    </div>
  );
}
