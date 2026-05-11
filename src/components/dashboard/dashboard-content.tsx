"use client";

import {
  Building2,
  Users,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Bell,
  CreditCard,
  Brain,
  GitBranch,
  FileText,
  Server,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/roles";

const stats = [];

type HealthStatus = "Operational" | "Degraded" | "Down";

const serviceHealth: { name: string; status: HealthStatus; uptime: string; latency: string }[] = [];

const healthColors: Record<HealthStatus, string> = {
  Operational: "#22c55e",
  Degraded: "#f59e0b",
  Down: "#ef4444",
};

const recentActivities = [];

const alerts = [];

const severityColors: Record<string, string> = {
  Critical: "#ef4444",
  Warning: "#f59e0b",
  Info: "#3b82f6",
};

export function DashboardContent() {
  const { user } = useAuth();
  const userRole = user?.role ?? "developer";
  const roleLabel = ROLE_LABELS[userRole];
  const roleColor = ROLE_COLORS[userRole];
  const firstName = user?.fullName?.split(" ")[0] ?? "User";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            Welcome back, {firstName}
          </h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor.bg} ${roleColor.text}`}>
            {roleLabel}
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Platform overview and real-time health status
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                {stat.label}
              </span>
              <stat.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--gf-accent)" }}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
            Alerts
          </h2>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ backgroundColor: "var(--gf-bg-surface)", border: `1px solid ${severityColors[alert.severity]}30` }}
              >
                <AlertTriangle className="h-4.5 w-4.5 mt-0.5 shrink-0" style={{ color: severityColors[alert.severity] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${severityColors[alert.severity]}20`, color: severityColors[alert.severity] }}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{alert.service}</span>
                    <span className="text-xs ml-auto" style={{ color: "var(--gf-text-muted)" }}>{alert.time}</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "var(--gf-text-primary)" }}>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service Health Status */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Service Health Status
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Service", "Status", "Uptime", "Latency"].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serviceHealth.map((svc) => (
                <tr key={svc.name} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-2.5 text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>{svc.name}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${healthColors[svc.status]}15`, color: healthColors[svc.status] }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: healthColors[svc.status] }} />
                      {svc.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{svc.uptime}</td>
                  <td className="px-5 py-2.5 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{svc.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activities */}
        <div
          className="rounded-xl"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Recent Activities
            </h2>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {recentActivities.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "var(--gf-accent-bg)" }}
                >
                  <item.icon className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs" style={{ color: "var(--gf-text-primary)" }}>{item.action}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--gf-text-muted)" }}>
                    {item.user} &middot; {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
