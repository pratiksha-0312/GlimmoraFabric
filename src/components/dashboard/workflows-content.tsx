"use client";

import {
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const stats = [
  { label: "Active Workflows", value: 8, icon: GitBranch },
  { label: "Pending Approvals", value: 12, icon: Clock },
  { label: "Completed Today", value: 34, icon: CheckCircle },
  { label: "SLA Breaches", value: 1, icon: AlertTriangle },
];

const workflows = [
  {
    name: "User Onboarding",
    steps: 3,
    activeInstances: 5,
    avgCompletion: "2.4 hours",
    progress: 65,
  },
  {
    name: "Invoice Approval",
    steps: 4,
    activeInstances: 8,
    avgCompletion: "1.2 days",
    progress: 40,
  },
  {
    name: "Access Request",
    steps: 2,
    activeInstances: 3,
    avgCompletion: "45 min",
    progress: 80,
  },
  {
    name: "Vendor Registration",
    steps: 5,
    activeInstances: 2,
    avgCompletion: "3 days",
    progress: 25,
  },
];

type SlaStatus = "green" | "amber" | "red";

const pendingApprovals: {
  workflow: string;
  requestedBy: string;
  step: string;
  sla: string;
  slaStatus: SlaStatus;
  status: string;
}[] = [
  {
    workflow: "Invoice Approval",
    requestedBy: "Priya Sharma",
    step: "Manager Review",
    sla: "4h remaining",
    slaStatus: "amber",
    status: "Pending",
  },
  {
    workflow: "Access Request",
    requestedBy: "Jordan Lee",
    step: "Security Review",
    sla: "12h remaining",
    slaStatus: "green",
    status: "Pending",
  },
  {
    workflow: "Vendor Registration",
    requestedBy: "Mei Chen",
    step: "Compliance Check",
    sla: "1h remaining",
    slaStatus: "red",
    status: "Pending",
  },
  {
    workflow: "User Onboarding",
    requestedBy: "Alex Rivera",
    step: "IT Provisioning",
    sla: "8h remaining",
    slaStatus: "green",
    status: "Pending",
  },
];

function slaColor(status: SlaStatus): string {
  switch (status) {
    case "green":
      return "#22c55e";
    case "amber":
      return "#f59e0b";
    case "red":
      return "#ef4444";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowsContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Workflow Engine
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--gf-text-secondary)" }}
        >
          Approvals, onboarding flows, escalations, and SLA management
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 flex items-center gap-4"
            style={{
              backgroundColor: "var(--gf-bg-surface)",
              border: "1px solid var(--gf-border)",
            }}
          >
            <stat.icon
              className="h-6 w-6 flex-shrink-0"
              style={{ color: "var(--gf-accent)" }}
            />
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--gf-text-primary)" }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Workflows */}
      <div>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Active Workflows
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {workflows.map((wf) => (
            <div
              key={wf.name}
              className="rounded-xl p-5"
              style={{
                backgroundColor: "var(--gf-bg-surface)",
                border: "1px solid var(--gf-border)",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch
                    className="h-5 w-5"
                    style={{ color: "var(--gf-accent)" }}
                  />
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {wf.name}
                  </h3>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--gf-accent)",
                    color: "var(--gf-bg-surface)",
                  }}
                >
                  {wf.activeInstances} active
                </span>
              </div>

              <div
                className="mt-3 flex items-center gap-4 text-xs"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <span>{wf.steps} steps</span>
                <span>Avg: {wf.avgCompletion}</span>
              </div>

              {/* Progress indicator */}
              <div
                className="mt-3 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--gf-border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${wf.progress}%`,
                    backgroundColor: "var(--gf-accent)",
                  }}
                />
              </div>
              <p
                className="mt-1 text-xs text-right"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                {wf.progress}% avg progress
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Pending Approvals
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--gf-bg-surface)",
            border: "1px solid var(--gf-border)",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--gf-border)",
                }}
              >
                {["Workflow", "Requested By", "Step", "SLA", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-xs font-medium"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < pendingApprovals.length - 1
                        ? "1px solid var(--gf-border)"
                        : undefined,
                  }}
                >
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {row.workflow}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {row.requestedBy}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {row.step}
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: slaColor(row.slaStatus) }}
                  >
                    {row.sla}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--gf-border)",
                        color: "var(--gf-text-primary)",
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
