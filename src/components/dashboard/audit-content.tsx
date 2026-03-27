"use client";

import { FileText, Search, AlertTriangle, Clock } from "lucide-react";

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
    timestamp: "10:42 AM",
    actor: "Ishan Yadav",
    action: "Updated",
    entity: "User Role",
    details: "Changed Priya from Member to Admin",
  },
  {
    timestamp: "10:38 AM",
    actor: "System",
    action: "Created",
    entity: "API Token",
    details: "Token for VerifAI service",
  },
  {
    timestamp: "10:15 AM",
    actor: "Priya Sharma",
    action: "Deleted",
    entity: "Team Member",
    details: "Removed Dev Patel",
  },
  {
    timestamp: "09:58 AM",
    actor: "System",
    action: "Alert",
    entity: "Security",
    details: "Failed login attempt from 45.33.x.x",
    isCritical: true,
  },
  {
    timestamp: "09:30 AM",
    actor: "Ishan Yadav",
    action: "Modified",
    entity: "Settings",
    details: "Updated MFA policy",
  },
  {
    timestamp: "09:12 AM",
    actor: "Rahul Verma",
    action: "Created",
    entity: "Workflow",
    details: "New approval flow for invoices",
  },
  {
    timestamp: "08:45 AM",
    actor: "System",
    action: "Triggered",
    entity: "Notification",
    details: "Payment failed alert sent",
    isCritical: true,
  },
  {
    timestamp: "08:20 AM",
    actor: "Ishan Yadav",
    action: "Created",
    entity: "Tenant",
    details: "Onboarded Diamond Corp",
  },
];

const stats = [
  { label: "Total Events", value: "12,458", icon: FileText },
  { label: "Today", value: "342", icon: Clock },
  { label: "Critical Alerts", value: "2", icon: AlertTriangle },
  { label: "Compliance Score", value: "96%", icon: FileText },
];

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
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
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
          placeholder="Search audit logs by actor, action, or entity..."
          className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
          style={{
            color: "var(--gf-text-primary)",
          }}
        />
      </div>

      {/* Audit Log Table */}
      <div
        className="rounded-xl border overflow-hidden"
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
                className="border-b last:border-0 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
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
  );
}
