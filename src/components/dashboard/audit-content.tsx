"use client";

import {
  FileText,
  Search,
  AlertTriangle,
  Clock,
  Shield,
  Download,
  CheckCircle,
  Loader,
  LogIn,
  Key,
  Smartphone,
  Eye,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface AuditEvent {
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  details: string;
  isCritical?: boolean;
}

const auditEvents: AuditEvent[] = [
  {
    timestamp: "2026-03-30 10:42 AM",
    actor: "Ishan Yadav",
    action: "Updated",
    entity: "User Role",
    details: "Changed Priya from Member to Admin",
  },
  {
    timestamp: "2026-03-30 10:38 AM",
    actor: "System",
    action: "Created",
    entity: "API Token",
    details: "Token for VerifAI service",
  },
  {
    timestamp: "2026-03-30 10:15 AM",
    actor: "Priya Sharma",
    action: "Deleted",
    entity: "Team Member",
    details: "Removed Dev Patel",
  },
  {
    timestamp: "2026-03-30 09:58 AM",
    actor: "System",
    action: "Alert",
    entity: "Security",
    details: "Failed login attempt from 45.33.x.x",
    isCritical: true,
  },
  {
    timestamp: "2026-03-30 09:30 AM",
    actor: "Ishan Yadav",
    action: "Modified",
    entity: "Settings",
    details: "Updated MFA policy",
  },
  {
    timestamp: "2026-03-30 09:12 AM",
    actor: "Rahul Verma",
    action: "Created",
    entity: "Workflow",
    details: "New approval flow for invoices",
  },
  {
    timestamp: "2026-03-29 08:45 AM",
    actor: "System",
    action: "Triggered",
    entity: "Notification",
    details: "Payment failed alert sent",
    isCritical: true,
  },
  {
    timestamp: "2026-03-29 08:20 AM",
    actor: "Ishan Yadav",
    action: "Created",
    entity: "Tenant",
    details: "Onboarded Diamond Corp",
  },
];

interface ComplianceReport {
  name: string;
  status: "Generated" | "Pending";
  date: string;
  icon: typeof FileText;
}

const complianceReports: ComplianceReport[] = [
  { name: "SOC2", status: "Generated", date: "2026-03-28", icon: Shield },
  { name: "GDPR", status: "Generated", date: "2026-03-25", icon: Shield },
  { name: "Banking Audit", status: "Pending", date: "2026-03-30", icon: FileText },
  { name: "Security Assessment", status: "Generated", date: "2026-03-20", icon: AlertTriangle },
];

interface SecurityEvent {
  timestamp: string;
  type: "Failed Login" | "Permission Change" | "MFA Event" | "Suspicious Activity";
  actor: string;
  details: string;
  severity: "high" | "medium" | "low";
}

const securityEvents: SecurityEvent[] = [
  {
    timestamp: "2026-03-30 10:58 AM",
    type: "Failed Login",
    actor: "unknown@external.io",
    details: "3 failed attempts from IP 45.33.x.x",
    severity: "high",
  },
  {
    timestamp: "2026-03-30 10:42 AM",
    type: "Permission Change",
    actor: "Ishan Yadav",
    details: "Elevated Priya Sharma to Admin role",
    severity: "medium",
  },
  {
    timestamp: "2026-03-30 09:30 AM",
    type: "MFA Event",
    actor: "Ishan Yadav",
    details: "MFA policy updated - enforced for all users",
    severity: "low",
  },
  {
    timestamp: "2026-03-30 08:15 AM",
    type: "Suspicious Activity",
    actor: "System",
    details: "Unusual API call volume from token tk_29x",
    severity: "high",
  },
  {
    timestamp: "2026-03-29 11:45 PM",
    type: "Failed Login",
    actor: "dev.patel@glimmora.com",
    details: "Account locked after 5 failed attempts",
    severity: "high",
  },
  {
    timestamp: "2026-03-29 06:10 PM",
    type: "Permission Change",
    actor: "Priya Sharma",
    details: "Revoked API access for staging environment",
    severity: "medium",
  },
];

const stats = [
  { label: "Total Events", value: "12,458", icon: FileText },
  { label: "Today", value: "342", icon: Clock },
  { label: "Critical Alerts", value: "2", icon: AlertTriangle },
  { label: "Compliance Score", value: "96%", icon: Shield },
];

const securityTypeIcons: Record<SecurityEvent["type"], typeof LogIn> = {
  "Failed Login": LogIn,
  "Permission Change": Key,
  "MFA Event": Smartphone,
  "Suspicious Activity": Eye,
};

const severityColors: Record<SecurityEvent["severity"], { bg: string; text: string }> = {
  high: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  low: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuditContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Audit &amp; Compliance
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--gf-text-secondary)" }}
        >
          Immutable audit trail with before/after values and compliance
          reporting
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border p-5"
              style={{
                borderColor: "var(--gf-border)",
                backgroundColor: "var(--gf-bg-surface)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--gf-text-secondary)" }}
                >
                  {stat.label}
                </span>
                <Icon
                  className="h-4 w-4"
                  style={{ color: "var(--gf-text-secondary)" }}
                />
              </div>
              <p
                className="mt-2 text-2xl font-bold"
                style={{ color: "var(--gf-text-primary)" }}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search / Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
        style={{
          borderColor: "var(--gf-border)",
          backgroundColor: "var(--gf-bg-elevated)",
        }}
      >
        <Search
          className="h-4 w-4 shrink-0"
          style={{ color: "var(--gf-text-secondary)" }}
        />
        <input
          type="text"
          placeholder="Search by actor, action, or entity..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
          style={{ color: "var(--gf-text-primary)" }}
        />
        <select
          className="rounded-lg border bg-transparent px-3 py-1.5 text-xs outline-none"
          style={{
            borderColor: "var(--gf-border)",
            color: "var(--gf-text-primary)",
          }}
          defaultValue=""
        >
          <option value="">All Users</option>
          <option value="ishan">Ishan Yadav</option>
          <option value="priya">Priya Sharma</option>
          <option value="rahul">Rahul Verma</option>
          <option value="system">System</option>
        </select>
        <select
          className="rounded-lg border bg-transparent px-3 py-1.5 text-xs outline-none"
          style={{
            borderColor: "var(--gf-border)",
            color: "var(--gf-text-primary)",
          }}
          defaultValue=""
        >
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="modified">Modified</option>
          <option value="alert">Alert</option>
        </select>
        <input
          type="date"
          className="rounded-lg border bg-transparent px-3 py-1.5 text-xs outline-none"
          style={{
            borderColor: "var(--gf-border)",
            color: "var(--gf-text-primary)",
          }}
        />
      </div>

      {/* Audit Logs Table */}
      <div>
        <h2
          className="mb-3 text-lg font-semibold"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Audit Logs
        </h2>
        <div
          className="overflow-hidden rounded-xl border"
          style={{
            borderColor: "var(--gf-border)",
            backgroundColor: "var(--gf-bg-surface)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                className="text-xs uppercase"
                style={{
                  backgroundColor: "var(--gf-bg-elevated)",
                  color: "var(--gf-text-secondary)",
                }}
              >
                <th className="px-6 py-3 text-left font-medium">Timestamp</th>
                <th className="px-6 py-3 text-left font-medium">Actor</th>
                <th className="px-6 py-3 text-left font-medium">Action</th>
                <th className="px-6 py-3 text-left font-medium">Entity</th>
                <th className="px-6 py-3 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((event, idx) => (
                <tr
                  key={idx}
                  className="border-b transition-colors last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                  style={{
                    borderColor: "var(--gf-border)",
                    borderLeft: event.isCritical
                      ? "3px solid #ef4444"
                      : "3px solid transparent",
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--gf-text-secondary)" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "var(--gf-text-secondary)" }}
                      >
                        {event.timestamp}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-medium"
                      style={{
                        color:
                          event.actor === "System"
                            ? "var(--gf-text-secondary)"
                            : "var(--gf-text-primary)",
                      }}
                    >
                      {event.actor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: event.isCritical
                          ? "rgba(239, 68, 68, 0.15)"
                          : "var(--gf-bg-elevated)",
                        color: event.isCritical
                          ? "#ef4444"
                          : "var(--gf-text-primary)",
                      }}
                    >
                      {event.action}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {event.entity}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {event.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Reports */}
      <div>
        <h2
          className="mb-3 text-lg font-semibold"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Compliance Reports
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {complianceReports.map((report) => {
            const Icon = report.icon;
            const isGenerated = report.status === "Generated";
            return (
              <div
                key={report.name}
                className="flex flex-col rounded-xl border p-5"
                style={{
                  borderColor: "var(--gf-border)",
                  backgroundColor: "var(--gf-bg-surface)",
                }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--gf-bg-elevated)" }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "var(--gf-text-secondary)" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--gf-text-primary)" }}
                    >
                      {report.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      {report.date}
                    </p>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-1.5">
                  {isGenerated ? (
                    <CheckCircle className="h-3.5 w-3.5" style={{ color: "#22c55e" }} />
                  ) : (
                    <Loader className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
                  )}
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isGenerated ? "#22c55e" : "#f59e0b",
                    }}
                  >
                    {report.status}
                  </span>
                </div>
                <button
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/5"
                  style={{
                    borderColor: "var(--gf-border)",
                    color: "var(--gf-text-primary)",
                  }}
                  disabled={!isGenerated}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Report
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Logs */}
      <div>
        <h2
          className="mb-3 text-lg font-semibold"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Security Logs
        </h2>
        <div
          className="overflow-hidden rounded-xl border"
          style={{
            borderColor: "var(--gf-border)",
            backgroundColor: "var(--gf-bg-surface)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                className="text-xs uppercase"
                style={{
                  backgroundColor: "var(--gf-bg-elevated)",
                  color: "var(--gf-text-secondary)",
                }}
              >
                <th className="px-6 py-3 text-left font-medium">Timestamp</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Actor</th>
                <th className="px-6 py-3 text-left font-medium">Details</th>
                <th className="px-6 py-3 text-left font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {securityEvents.map((event, idx) => {
                const TypeIcon = securityTypeIcons[event.type];
                const sevColor = severityColors[event.severity];
                return (
                  <tr
                    key={idx}
                    className="border-b transition-colors last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      borderColor: "var(--gf-border)",
                      borderLeft:
                        event.severity === "high"
                          ? "3px solid #ef4444"
                          : "3px solid transparent",
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock
                          className="h-3.5 w-3.5"
                          style={{ color: "var(--gf-text-secondary)" }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "var(--gf-text-secondary)" }}
                        >
                          {event.timestamp}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon
                          className="h-3.5 w-3.5"
                          style={{ color: sevColor.text }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--gf-text-primary)" }}
                        >
                          {event.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-sm"
                        style={{ color: "var(--gf-text-primary)" }}
                      >
                        {event.actor}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      {event.details}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                        style={{
                          backgroundColor: sevColor.bg,
                          color: sevColor.text,
                        }}
                      >
                        {event.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
