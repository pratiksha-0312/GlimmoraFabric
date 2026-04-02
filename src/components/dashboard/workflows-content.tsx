"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ArrowUpCircle,
  Zap,
  Timer,
  Eye,
  Play,
  Pencil,
  Archive,
  X,
  Plus,
  GripVertical,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TriggerType = "API" | "Event" | "Manual" | "Schedule";
type TemplateStatus = "Active" | "Draft" | "Archived";
type StepType = "Automated" | "Manual";

interface WorkflowStep {
  name: string;
  type: StepType;
  completed: boolean;
}

interface WorkflowTemplate {
  id: number;
  name: string;
  triggerType: TriggerType;
  steps: WorkflowStep[];
  sla: string;
  status: TemplateStatus;
  description: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const initialStats = [
  { label: "Workflow Templates", value: 14, icon: FileText },
  { label: "Active Workflows", value: 8, icon: GitBranch },
  { label: "Pending Approvals", value: 12, icon: Clock },
  { label: "SLA Breaches", value: 3, icon: AlertTriangle },
];

const initialWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 1,
    name: "User Onboarding",
    triggerType: "Event",
    steps: [
      { name: "Trigger Event Received", type: "Automated", completed: true },
      { name: "Assign to Team Lead", type: "Manual", completed: true },
      { name: "Send Notification to User", type: "Automated", completed: true },
      { name: "Await Approval", type: "Manual", completed: false },
      { name: "Mark Complete & Log Audit", type: "Automated", completed: false },
    ],
    sla: "24h",
    status: "Active",
    description: "Handles new user onboarding across teams.",
  },
  {
    id: 2,
    name: "Invoice Approval",
    triggerType: "Manual",
    steps: [
      { name: "Submit Invoice", type: "Manual", completed: true },
      { name: "Manager Review", type: "Manual", completed: true },
      { name: "Finance Validation", type: "Automated", completed: false },
      { name: "Approve & Notify", type: "Automated", completed: false },
    ],
    sla: "8h",
    status: "Active",
    description: "Multi-step invoice approval pipeline.",
  },
  {
    id: 3,
    name: "Access Request",
    triggerType: "API",
    steps: [
      { name: "Request Received", type: "Automated", completed: true },
      { name: "Security Review", type: "Manual", completed: true },
      { name: "Provision Access", type: "Automated", completed: true },
    ],
    sla: "4h",
    status: "Active",
    description: "Automated access provisioning with security gate.",
  },
  {
    id: 4,
    name: "Vendor Registration",
    triggerType: "Manual",
    steps: [
      { name: "Vendor Submission", type: "Manual", completed: true },
      { name: "Document Verification", type: "Manual", completed: false },
      { name: "Compliance Check", type: "Automated", completed: false },
      { name: "Background Screening", type: "Manual", completed: false },
      { name: "Approval", type: "Manual", completed: false },
      { name: "System Registration", type: "Automated", completed: false },
    ],
    sla: "48h",
    status: "Draft",
    description: "Full vendor onboarding and compliance flow.",
  },
  {
    id: 5,
    name: "Incident Response",
    triggerType: "Event",
    steps: [
      { name: "Alert Triggered", type: "Automated", completed: true },
      { name: "Triage", type: "Manual", completed: true },
      { name: "Assign Responder", type: "Manual", completed: true },
      { name: "Investigate", type: "Manual", completed: true },
      { name: "Apply Fix", type: "Manual", completed: false },
      { name: "Verify Resolution", type: "Automated", completed: false },
      { name: "Post-Mortem Log", type: "Automated", completed: false },
    ],
    sla: "1h",
    status: "Active",
    description: "Critical incident escalation and resolution workflow.",
  },
  {
    id: 6,
    name: "Contract Renewal",
    triggerType: "Manual",
    steps: [
      { name: "Renewal Notice Sent", type: "Automated", completed: true },
      { name: "Legal Review", type: "Manual", completed: true },
      { name: "Negotiation", type: "Manual", completed: true },
      { name: "Sign & Archive", type: "Automated", completed: true },
    ],
    sla: "72h",
    status: "Archived",
    description: "Contract lifecycle renewal management.",
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
  { workflow: "Invoice Approval", requestedBy: "Priya Sharma", currentStep: "Manager Review", slaDeadline: "4h remaining", slaStatus: "amber", status: "Pending" },
  { workflow: "Access Request", requestedBy: "Jordan Lee", currentStep: "Security Review", slaDeadline: "12h remaining", slaStatus: "green", status: "Pending" },
  { workflow: "Vendor Registration", requestedBy: "Mei Chen", currentStep: "Compliance Check", slaDeadline: "1h remaining", slaStatus: "red", status: "Urgent" },
  { workflow: "User Onboarding", requestedBy: "Alex Rivera", currentStep: "IT Provisioning", slaDeadline: "8h remaining", slaStatus: "green", status: "Pending" },
  { workflow: "Incident Response", requestedBy: "Rahul Verma", currentStep: "Triage", slaDeadline: "30m remaining", slaStatus: "red", status: "Urgent" },
];

interface SlaTier {
  tier: string;
  responseTime: string;
  resolutionTime: string;
  escalationAfter: string;
  color: string;
}

const slaTiers: SlaTier[] = [
  { tier: "Critical", responseTime: "15 min", resolutionTime: "1h", escalationAfter: "30 min", color: "#ef4444" },
  { tier: "High", responseTime: "30 min", resolutionTime: "4h", escalationAfter: "2h", color: "#f59e0b" },
  { tier: "Medium", responseTime: "2h", resolutionTime: "24h", escalationAfter: "8h", color: "#3b82f6" },
  { tier: "Low", responseTime: "8h", resolutionTime: "72h", escalationAfter: "48h", color: "#22c55e" },
];

interface EscalationRule {
  rule: string;
  trigger: string;
  action: string;
  notifyRole: string;
  status: "Enabled" | "Disabled";
}

const escalationRules: EscalationRule[] = [
  { rule: "SLA Breach Alert", trigger: "SLA deadline exceeded", action: "Escalate to manager", notifyRole: "Manager", status: "Enabled" },
  { rule: "Approval Timeout", trigger: "No response in 4h", action: "Re-assign to backup approver", notifyRole: "Team Lead", status: "Enabled" },
  { rule: "Critical Path Delay", trigger: "Critical step blocked > 1h", action: "Alert executive sponsor", notifyRole: "Director", status: "Enabled" },
  { rule: "Repeat Failure", trigger: "3 consecutive failures", action: "Pause workflow & notify", notifyRole: "Admin", status: "Disabled" },
];

interface WorkflowLog {
  timestamp: string;
  workflow: string;
  event: string;
  actor: string;
  result: "Success" | "Failed" | "Warning";
}

const workflowLogs: WorkflowLog[] = [
  { timestamp: "10:42 AM", workflow: "User Onboarding", event: "Step completed: IT Provisioning", actor: "System", result: "Success" },
  { timestamp: "10:38 AM", workflow: "Invoice Approval", event: "Escalated: Manager Review timeout", actor: "System", result: "Warning" },
  { timestamp: "10:15 AM", workflow: "Access Request", event: "Approval granted", actor: "Jordan Lee", result: "Success" },
  { timestamp: "09:58 AM", workflow: "Incident Response", event: "SLA breach: Triage exceeded 1h", actor: "System", result: "Failed" },
  { timestamp: "09:30 AM", workflow: "Vendor Registration", event: "Step completed: Document Upload", actor: "Mei Chen", result: "Success" },
  { timestamp: "09:12 AM", workflow: "Contract Renewal", event: "Workflow started", actor: "Priya Sharma", result: "Success" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slaColor(status: SlaStatus): string {
  switch (status) {
    case "green": return "#22c55e";
    case "amber": return "#f59e0b";
    case "red": return "#ef4444";
  }
}

function triggerBadgeColor(trigger: TriggerType): string {
  switch (trigger) {
    case "API": return "#8b5cf6";
    case "Event": return "#3b82f6";
    case "Manual": return "#6b7280";
    case "Schedule": return "#f59e0b";
  }
}

function templateStatusColor(status: TemplateStatus): string {
  switch (status) {
    case "Active": return "#22c55e";
    case "Draft": return "#f59e0b";
    case "Archived": return "#6b7280";
  }
}

function logResultColor(result: WorkflowLog["result"]): string {
  switch (result) {
    case "Success": return "#22c55e";
    case "Failed": return "#ef4444";
    case "Warning": return "#f59e0b";
  }
}

const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--gf-bg-base)",
  borderColor: "var(--gf-border)",
  color: "var(--gf-text-primary)",
};

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

interface ToastState {
  message: string;
  type: "success" | "error";
}

function Toast({ toast, onDone }: { toast: ToastState | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-2xl"
      style={{
        backgroundColor: "var(--gf-bg-surface)",
        borderColor: "var(--gf-border)",
      }}
    >
      <CheckCircle className="h-5 w-5 shrink-0" style={{ color: toast.type === "success" ? "#22c55e" : "#ef4444" }} />
      <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{toast.message}</span>
      <button onClick={onDone} className="ml-2 rounded p-0.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View Steps Modal
// ---------------------------------------------------------------------------

function ViewStepsModal({ workflow, onClose }: { workflow: WorkflowTemplate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
            {workflow.name} &mdash; Steps
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="px-6 py-5">
          <div className="relative">
            {workflow.steps.map((step, idx) => {
              const isLast = idx === workflow.steps.length - 1;
              return (
                <div key={idx} className="flex gap-4 relative" style={{ paddingBottom: isLast ? 0 : 24 }}>
                  {/* Vertical line */}
                  {!isLast && (
                    <div
                      className="absolute left-[11px] top-[24px] w-0.5"
                      style={{
                        height: "calc(100% - 16px)",
                        backgroundColor: step.completed ? "#f59e0b" : "var(--gf-border)",
                      }}
                    />
                  )}
                  {/* Circle */}
                  <div
                    className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5"
                    style={{
                      borderColor: step.completed ? "#f59e0b" : "var(--gf-border)",
                      backgroundColor: step.completed ? "#f59e0b" : "transparent",
                    }}
                  >
                    {step.completed && (
                      <CheckCircle className="h-3.5 w-3.5" style={{ color: "#fff" }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
                        Step {idx + 1} &rarr; {step.name}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{
                        backgroundColor: step.type === "Automated" ? "#3b82f620" : "#f59e0b20",
                        color: step.type === "Automated" ? "#3b82f6" : "#f59e0b",
                      }}
                    >
                      {step.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end" style={{ borderColor: "var(--gf-border)" }}>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg border hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trigger Confirmation Modal
// ---------------------------------------------------------------------------

function TriggerModal({ workflow, onConfirm, onCancel }: { workflow: WorkflowTemplate; onConfirm: (notes: string) => void; onCancel: () => void }) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Trigger Workflow</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>
            Manually trigger <strong>{workflow.name}</strong> workflow?
          </p>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Context / Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 resize-none"
              style={fieldStyle}
              placeholder="Add context or notes..."
            />
          </div>
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-3" style={{ borderColor: "var(--gf-border)" }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(notes)}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90"
            style={{ backgroundColor: "#22c55e" }}
          >
            Yes, Trigger
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Archive Confirmation Modal
// ---------------------------------------------------------------------------

function ArchiveModal({ workflow, onConfirm, onCancel }: { workflow: WorkflowTemplate; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Archive Workflow</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>
            Archive <strong>{workflow.name}</strong> workflow? It will no longer be available for triggering.
          </p>
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-3" style={{ borderColor: "var(--gf-border)" }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90"
            style={{ backgroundColor: "#ef4444" }}
          >
            Yes, Archive
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Drawer
// ---------------------------------------------------------------------------

function EditDrawer({ workflow, onSave, onCancel }: { workflow: WorkflowTemplate; onSave: (updated: WorkflowTemplate) => void; onCancel: () => void }) {
  const [name, setName] = useState(workflow.name);
  const [triggerType, setTriggerType] = useState<TriggerType>(workflow.triggerType);
  const [slaValue, setSlaValue] = useState(() => parseInt(workflow.sla) || 24);
  const [slaUnit, setSlaUnit] = useState<"h" | "d">(() => workflow.sla.includes("d") ? "d" : "h");
  const [status, setStatus] = useState<TemplateStatus>(workflow.status);
  const [description, setDescription] = useState(workflow.description);
  const [steps, setSteps] = useState<WorkflowStep[]>(() => workflow.steps.map((s) => ({ ...s })));

  const handleSave = () => {
    onSave({
      ...workflow,
      name,
      triggerType,
      sla: `${slaValue}${slaUnit}`,
      status,
      description,
      steps,
    });
  };

  const updateStepName = (idx: number, val: string) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, name: val } : s)));
  };

  const updateStepType = (idx: number, val: StepType) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, type: val } : s)));
  };

  const removeStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { name: "", type: "Manual", completed: false }]);
  };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    setSteps((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const selectStyle: React.CSSProperties = {
    ...fieldStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: "32px",
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onCancel} />
      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 z-10" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Edit Workflow</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Template Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
          </div>

          {/* Trigger Type */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Trigger Type</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as TriggerType)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={selectStyle}
            >
              {(["Event", "Manual", "API", "Schedule"] as TriggerType[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* SLA */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>SLA</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={slaValue}
                onChange={(e) => setSlaValue(Number(e.target.value))}
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              <select
                value={slaUnit}
                onChange={(e) => setSlaUnit(e.target.value as "h" | "d")}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={selectStyle}
              >
                <option value="h">hours</option>
                <option value="d">days</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
            <div className="flex gap-2">
              {(["Active", "Draft", "Archived"] as TemplateStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
                  style={{
                    borderColor: status === s ? templateStatusColor(s) : "var(--gf-border)",
                    backgroundColor: status === s ? `${templateStatusColor(s)}20` : "transparent",
                    color: status === s ? templateStatusColor(s) : "var(--gf-text-secondary)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 resize-none"
              style={fieldStyle}
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Steps</label>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border p-2"
                  style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}
                >
                  {/* Drag handle / reorder buttons */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => moveStep(idx, idx - 1)}
                      disabled={idx === 0}
                      className="text-xs p-0.5 rounded hover:opacity-70 disabled:opacity-30"
                      style={{ color: "var(--gf-text-secondary)" }}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveStep(idx, idx + 1)}
                      disabled={idx === steps.length - 1}
                      className="text-xs p-0.5 rounded hover:opacity-70 disabled:opacity-30"
                      style={{ color: "var(--gf-text-secondary)" }}
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="text-xs font-medium flex-shrink-0 w-5 text-center" style={{ color: "var(--gf-text-secondary)" }}>{idx + 1}</span>
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => updateStepName(idx, e.target.value)}
                    className="flex-1 rounded-md border px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                    style={fieldStyle}
                    placeholder="Step name"
                  />
                  <select
                    value={step.type}
                    onChange={(e) => updateStepType(idx, e.target.value as StepType)}
                    className="rounded-md border px-2 py-1 text-xs outline-none"
                    style={selectStyle}
                  >
                    <option value="Automated">Automated</option>
                    <option value="Manual">Manual</option>
                  </select>
                  <button
                    onClick={() => removeStep(idx)}
                    className="rounded p-1 hover:opacity-70 flex-shrink-0"
                    style={{ color: "#ef4444" }}
                    title="Remove step"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addStep}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Step
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-3 sticky bottom-0" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg text-white hover:opacity-90"
            style={{ backgroundColor: "#f59e0b" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowsContent() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(initialWorkflowTemplates);
  const [stats, setStats] = useState(initialStats);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Modal state
  const [viewSteps, setViewSteps] = useState<WorkflowTemplate | null>(null);
  const [triggerTarget, setTriggerTarget] = useState<WorkflowTemplate | null>(null);
  const [editTarget, setEditTarget] = useState<WorkflowTemplate | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<WorkflowTemplate | null>(null);

  const showToast = (message: string, type: ToastState["type"] = "success") => {
    setToast({ message, type });
  };

  const handleTrigger = (wf: WorkflowTemplate, _notes: string) => {
    setTriggerTarget(null);
    showToast("Workflow triggered successfully \u2713");
    setStats((prev) =>
      prev.map((s) => s.label === "Active Workflows" ? { ...s, value: s.value + 1 } : s)
    );
  };

  const handleSaveEdit = (updated: WorkflowTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditTarget(null);
    showToast("Workflow updated \u2713");
  };

  const handleArchive = (wf: WorkflowTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === wf.id ? { ...t, status: "Archived" as TemplateStatus } : t))
    );
    setArchiveTarget(null);
    showToast("Workflow archived \u2713", "error");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Workflow Engine
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Approvals, onboarding flows, escalations, and SLA management
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 flex items-center gap-4"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <stat.icon className="h-6 w-6 flex-shrink-0" style={{ color: "var(--gf-accent)" }} />
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Templates Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Workflow Templates
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Template Name", "Trigger Type", "Steps", "SLA", "Status", "Actions"].map((col) => (
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
              {templates.map((tpl, i) => (
                <tr
                  key={tpl.id}
                  style={{
                    borderBottom: i < templates.length - 1 ? "1px solid var(--gf-border)" : undefined,
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 flex-shrink-0" style={{ color: "var(--gf-accent)" }} />
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
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {tpl.steps.length} steps
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
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
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* View Steps */}
                      <button
                        onClick={() => setViewSteps(tpl)}
                        className="rounded-lg p-1.5 hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "#3b82f620", color: "#3b82f6" }}
                        title="View Steps"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Trigger — only Active */}
                      {tpl.status === "Active" && (
                        <button
                          onClick={() => setTriggerTarget(tpl)}
                          className="rounded-lg p-1.5 hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "#22c55e20", color: "#22c55e" }}
                          title="Trigger Workflow"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {/* Edit */}
                      <button
                        onClick={() => setEditTarget(tpl)}
                        className="rounded-lg p-1.5 hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
                        title="Edit Workflow"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {/* Archive */}
                      <button
                        onClick={() => setArchiveTarget(tpl)}
                        className="rounded-lg p-1.5 hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "#ef444420", color: "#ef4444" }}
                        title="Archive Workflow"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Flows Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Approval Flows
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Workflow", "Requested By", "Current Step", "SLA Deadline", "Status"].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < pendingApprovals.length - 1 ? "1px solid var(--gf-border)" : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{row.workflow}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{row.requestedBy}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{row.currentStep}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: slaColor(row.slaStatus) }}>{row.slaDeadline}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: row.status === "Urgent" ? "#ef444420" : "var(--gf-border)",
                        color: row.status === "Urgent" ? "#ef4444" : "var(--gf-text-primary)",
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
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          SLA Settings
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {slaTiers.map((tier) => (
            <div
              key={tier.tier}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-5 w-5 flex-shrink-0" style={{ color: tier.color }} />
                <h3 className="text-sm font-semibold" style={{ color: tier.color }}>{tier.tier}</h3>
              </div>
              <div className="space-y-2 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{tier.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution Time</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{tier.resolutionTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Escalation After</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{tier.escalationAfter}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Escalation Rules */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Task Escalation Rules
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Rule", "Trigger", "Action", "Notify", "Status"].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {escalationRules.map((rule, i) => (
                <tr key={rule.rule} style={{ borderBottom: i < escalationRules.length - 1 ? "1px solid var(--gf-border)" : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--gf-accent)" }} />
                      {rule.rule}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{rule.trigger}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{rule.action}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{rule.notifyRole}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: rule.status === "Enabled" ? "#22c55e20" : "var(--gf-border)",
                        color: rule.status === "Enabled" ? "#22c55e" : "var(--gf-text-secondary)",
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
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Workflow Logs
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Time", "Workflow", "Event", "Actor", "Result"].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workflowLogs.map((log, i) => (
                <tr key={i} style={{ borderBottom: i < workflowLogs.length - 1 ? "1px solid var(--gf-border)" : undefined }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-secondary)" }}>{log.timestamp}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{log.workflow}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{log.event}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{log.actor}</td>
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

      {/* Modals */}
      {viewSteps && <ViewStepsModal workflow={viewSteps} onClose={() => setViewSteps(null)} />}
      {triggerTarget && (
        <TriggerModal
          workflow={triggerTarget}
          onConfirm={(notes) => handleTrigger(triggerTarget, notes)}
          onCancel={() => setTriggerTarget(null)}
        />
      )}
      {archiveTarget && (
        <ArchiveModal
          workflow={archiveTarget}
          onConfirm={() => handleArchive(archiveTarget)}
          onCancel={() => setArchiveTarget(null)}
        />
      )}
      {editTarget && (
        <EditDrawer
          workflow={editTarget}
          onSave={handleSaveEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}

      {/* Toast */}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
