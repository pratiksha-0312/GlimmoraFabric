"use client";

import { useState, useEffect } from "react";
import {
  Check,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface SlaData {
  summary: {
    totalActive: number;
    withinSLA: number;
    atRisk: number;
    breached: number;
    complianceRate: number;
  };
  byWorkflow: {
    workflow: string;
    total: number;
    withinSLA: number;
    atRisk: number;
    breached: number;
    avgCompletion: string;
    slaTarget: string;
  }[];
  trend: { month: string; compliance: number }[];
}

export default function SlaStatusDashboard() {
  const [data, setData] = useState<SlaData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/workflows/sla-status")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AuthGuard allowedRoles={["workflow_manager", "super_admin"] as UserRole[]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>SLA Status</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Monitor workflow SLA compliance across all active instances</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {!data ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--gf-accent)", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: <BarChart3 className="h-5 w-5" />, label: "Active Instances", value: data.summary.totalActive, color: "var(--gf-accent)" },
                { icon: <Check className="h-5 w-5" />, label: "Within SLA", value: data.summary.withinSLA, color: "#22c55e" },
                { icon: <AlertTriangle className="h-5 w-5" />, label: "At Risk", value: data.summary.atRisk, color: "#f59e0b" },
                { icon: <XCircle className="h-5 w-5" />, label: "Breached", value: data.summary.breached, color: "#ef4444" },
                { icon: <TrendingUp className="h-5 w-5" />, label: "Compliance Rate", value: `${data.summary.complianceRate}%`, color: "#22c55e" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</p>
                      <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Trend Chart */}
            <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>SLA Compliance Trend</h2>
              <div className="flex items-end gap-4 h-36">
                {data.trend.map((t) => (
                  <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold" style={{ color: t.compliance >= 85 ? "#22c55e" : t.compliance >= 75 ? "#f59e0b" : "#ef4444" }}>
                      {t.compliance}%
                    </span>
                    <div className="w-full rounded-t-md" style={{
                      height: `${(t.compliance / 100) * 100}%`,
                      minHeight: 8,
                      backgroundColor: t.compliance >= 85 ? "#22c55e" : t.compliance >= 75 ? "#f59e0b" : "#ef4444",
                      opacity: 0.7,
                    }} />
                    <span className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{t.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA by Workflow Table */}
            <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--gf-border)" }}>
                <h2 className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>SLA by Workflow</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                      {["Workflow", "Total", "Within SLA", "At Risk", "Breached", "Avg Completion", "SLA Target"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.byWorkflow.map((row) => (
                      <tr key={row.workflow} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
                        <td className="px-5 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{row.workflow}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{row.total}</td>
                        <td className="px-5 py-3"><span className="text-xs font-medium text-green-500">{row.withinSLA}</span></td>
                        <td className="px-5 py-3"><span className="text-xs font-medium text-amber-500">{row.atRisk}</span></td>
                        <td className="px-5 py-3"><span className="text-xs font-medium text-red-500">{row.breached}</span></td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{row.avgCompletion}</td>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{row.slaTarget}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
