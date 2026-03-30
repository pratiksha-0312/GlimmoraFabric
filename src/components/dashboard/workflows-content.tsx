"use client";

import {
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ArrowUpCircle,
  Zap,
  Timer,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const stats = [
  { label: "Workflow Templates", value: 14, icon: FileText },
  { label: "Active Workflows", value: 8, icon: GitBranch },
  { label: "Pending Approvals", value: 12, icon: Clock },
  { label: "SLA Breaches", value: 3, icon: AlertTriangle },
];

type TriggerType = "API" | "Event" | "Manual";
type TemplateStatus = "Active" | "Draft" | "Archived";

interface WorkflowTemplate {
  name: string;
  triggerType: TriggerType;
  steps: number;
  sla: string;
  status: TemplateStatus;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    name: "User Onboarding",
    triggerType: "Event",
    steps: 5,
    sla: "24h",
    status: "Active",
  },
  {
    name: "Invoice Approval",
    triggerType: "Manual",
    steps: 4,
    sla: "8h",
    status: "Active",
  },
  {
    name: "Access Request",
    triggerType: "API",
    steps: 3,
    sla: "4h",
    status: "Active",
  },
  {
    name: "Vendor Registration",
    triggerType: "Manual",
    steps: 6,
    sla: "48h",
    status: "Draft",
  },
  {
    name: "Incident Response",
    triggerType: "Event",
    steps: 7,
    sla: "1h",
    status: "Active",
  },
  {
    name: "Contract Renewal",
    triggerType: "Manual",
    steps: 4,
    sla: "72h",
    status: "Archived",
  },
];

type SlaStatus = "green" | "amber" | "red";

interface PendingApproval {
  workflow: string;
  requestedBy: string;
  currentStep: string;
  slaDeadline: string;
  slaStatus: SlaStatus;
  status: string;
}

const pendingApprovals: PendingApproval[] = [
  {
    workflow: "Invoice Approval",
    requestedBy: "Priya Sharma",
    currentStep: "Manager Review",
    slaDeadline: "4h remaining",
    slaStatus: "amber",
    status: "Pending",
  },
  {
    workflow: "Access Request",
    requestedBy: "Jordan Lee",
    currentStep: "Security Review",
    slaDeadline: "12h remaining",
    slaStatus: "green",
    status: "Pending",
  },
  {
    workflow: "Vendor Registration",
    requestedBy: "Mei Chen",
    currentStep: "Compliance Check",
    slaDeadline: "1h remaining",
    slaStatus: "red",
    status: "Urgent",
  },
  {
    workflow: "User Onboarding",
    requestedBy: "Alex Rivera",
    currentStep: "IT Provisioning",
    slaDeadline: "8h remaining",
    slaStatus: "green",
    status: "Pending",
  },
  {
    workflow: "Incident Response",
    requestedBy: "Rahul Verma",
    currentStep: "Triage",
    slaDeadline: "30m remaining",
    slaStatus: "red",
    status: "Urgent",
  },
];

interface SlaTier {
  tier: string;
  responseTime: string;
  resolutionTime: string;
  escalationAfter: string;
  color: string;
}

const slaTiers: SlaTier[] = [
  {
    tier: "Critical",
    responseTime: "15 min",
    resolutionTime: "1h",
    escalationAfter: "30 min",
    color: "#ef4444",
  },
  {
    tier: "High",
    responseTime: "30 min",
    resolutionTime: "4h",
    escalationAfter: "2h",
    color: "#f59e0b",
  },
  {
    tier: "Medium",
    responseTime: "2h",
    resolutionTime: "24h",
    escalationAfter: "8h",
    color: "#3b82f6",
  },
  {
    tier: "Low",
    responseTime: "8h",
    resolutionTime: "72h",
    escalationAfter: "48h",
    color: "#22c55e",
  },
];

interface EscalationRule {
  rule: string;
  trigger: string;
  action: string;
  notifyRole: string;
  status: "Enabled" | "Disabled";
}

const escalationRules: EscalationRule[] = [
  {
    rule: "SLA Breach Alert",
    trigger: "SLA deadline exceeded",
    action: "Escalate to manager",
    notifyRole: "Manager",
    status: "Enabled",
  },
  {
    rule: "Approval Timeout",
    trigger: "No response in 4h",
    action: "Re-assign to backup approver",
    notifyRole: "Team Lead",
    status: "Enabled",
  },
  {
    rule: "Critical Path Delay",
    trigger: "Critical step blocked > 1h",
    action: "Alert executive sponsor",
    notifyRole: "Director",
    status: "Enabled",
  },
  {
    rule: "Repeat Failure",
    trigger: "3 consecutive failures",
    action: "Pause workflow & notify",
    notifyRole: "Admin",
    status: "Disabled",
  },
];

interface WorkflowLog {
  timestamp: string;
  workflow: string;
  event: string;
  actor: string;
  result: "Success" | "Failed" | "Warning";
}

const workflowLogs: WorkflowLog[] = [
  {
    timestamp: "10:42 AM",
    workflow: "User Onboarding",
    event: "Step completed: IT Provisioning",
    actor: "System",
    result: "Success",
  },
  {
    timestamp: "10:38 AM",
    workflow: "Invoice Approval",
    event: "Escalated: Manager Review timeout",
    actor: "System",
    result: "Warning",
  },
  {
    timestamp: "10:15 AM",
    workflow: "Access Request",
    event: "Approval granted",
    actor: "Jordan Lee",
    result: "Success",
  },
  {
    timestamp: "09:58 AM",
    workflow: "Incident Response",
    event: "SLA breach: Triage exceeded 1h",
    actor: "System",
    result: "Failed",
  },
  {
    timestamp: "09:30 AM",
    workflow: "Vendor Registration",
    event: "Step completed: Document Upload",
    actor: "Mei Chen",
    result: "Success",
  },
  {
    timestamp: "09:12 AM",
    workflow: "Contract Renewal",
    event: "Workflow started",
    actor: "Priya Sharma",
    result: "Success",
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

function triggerBadgeColor(trigger: TriggerType): string {
  switch (trigger) {
    case "API":
      return "#8b5cf6";
    case "Event":
      return "#3b82f6";
    case "Manual":
      return "#6b7280";
  }
}

function templateStatusColor(status: TemplateStatus): string {
  switch (status) {
    case "Active":
      return "#22c55e";
    case "Draft":
      return "#f59e0b";
    case "Archived":
      return "#6b7280";
  }
}

function logResultColor(result: WorkflowLog["result"]): string {
  switch (result) {
    case "Success":
      return "#22c55e";
    case "Failed":
      return "#ef4444";
    case "Warning":
      return "#f59e0b";
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

      {/* Workflow Templates Table */}
      <div>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Workflow Templates
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
                {["Template Name", "Trigger Type", "Steps", "SLA", "Status"].map(
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
              {workflowTemplates.map((tpl, i) => (
                <tr
                  key={tpl.name}
                  style={{
                    borderBottom:
                      i < workflowTemplates.length - 1
                        ? "1px solid var(--gf-border)"
                        : undefined,
                  }}
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "var(--gf-accent)" }}
                      />
                      {tpl.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${triggerBadgeColor(tpl.triggerType)}20`,
                        color: triggerBadgeColor(tpl.triggerType),
                      }}
                    >
                      {tpl.triggerType}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {tpl.steps} steps
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {tpl.sla}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${templateStatusColor(tpl.status)}20`,
                        color: templateStatusColor(tpl.status),
                      }}
                    >
                      {tpl.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Flows Table */}
      <div>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Approval Flows
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
                {[
                  "Workflow",
                  "Requested By",
                  "Current Step",
                  "SLA Deadline",
                  "Status",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {col}
                  </th>
                ))}
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
                    className="px-4 py-3 font-medium"
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
                    {row.currentStep}
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: slaColor(row.slaStatus) }}
                  >
                    {row.slaDeadline}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor:
                          row.status === "Urgent"
                            ? "#ef444420"
                            : "var(--gf-border)",
                        color:
                          row.status === "Urgent"
                            ? "#ef4444"
                            : "var(--gf-text-primary)",
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

      {/* SLA Settings */}
      <div>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--gf-text-primary)" }}
        >
          SLA Settings
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {slaTiers.map((tier) => (
            <div
              key={tier.tier}
              className="rounded-xl p-5"
              style={{
                backgroundColor: "var(--gf-bg-surface)",
                border: "1px solid var(--gf-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Timer
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: tier.color }}
                />
                <h3
                  className="text-sm font-semibold"
                  style={{ color: tier.color }}
                >
                  {tier.tier}
                </h3>
              </div>
              <div
                className="space-y-2 text-xs"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {tier.responseTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution Time</span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {tier.resolutionTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Escalation After</span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {tier.escalationAfter}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Escalation Rules */}
      <div>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Task Escalation Rules
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
                {["Rule", "Trigger", "Action", "Notify", "Status"].map(
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
              {escalationRules.map((rule, i) => (
                <tr
                  key={rule.rule}
                  style={{
                    borderBottom:
                      i < escalationRules.length - 1
                        ? "1px solid var(--gf-border)"
                        : undefined,
                  }}
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "var(--gf-accent)" }}
                      />
                      {rule.rule}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {rule.trigger}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {rule.action}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {rule.notifyRole}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor:
                          rule.status === "Enabled"
                            ? "#22c55e20"
                            : "var(--gf-border)",
                        color:
                          rule.status === "Enabled"
                            ? "#22c55e"
                            : "var(--gf-text-secondary)",
                      }}
                    >
                      {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Logs */}
      <div>
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: "var(--gf-text-primary)" }}
        >
          Workflow Logs
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
                {["Time", "Workflow", "Event", "Actor", "Result"].map(
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
              {workflowLogs.map((log, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < workflowLogs.length - 1
                        ? "1px solid var(--gf-border)"
                        : undefined,
                  }}
                >
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {log.timestamp}
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {log.workflow}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {log.event}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--gf-text-primary)" }}
                  >
                    {log.actor}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${logResultColor(log.result)}20`,
                        color: logResultColor(log.result),
                      }}
                    >
                      {log.result}
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
