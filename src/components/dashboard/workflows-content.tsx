"use client";

import { useState, useEffect } from "react";
import {
  GitBranch, Clock, CheckCircle, AlertTriangle, FileText, ArrowUpCircle, Zap, Timer,
  Eye, Play, Pencil, Archive, X, Plus, Search, FilterX, Trash2, Check, Pause, Square,
  Download, Info, MessageSquare,
} from "lucide-react";

// ===========================================================================
// Types
// ===========================================================================

type TriggerType = "API" | "Event" | "Manual" | "Schedule";
type TemplateStatus = "Active" | "Draft" | "Archived";
type StepType = "Automated" | "Manual";

interface WorkflowStep { name: string; type: StepType; completed: boolean; }

interface WorkflowTemplate {
  id: number; name: string; triggerType: TriggerType; steps: WorkflowStep[];
  sla: string; status: TemplateStatus; description: string;
}

type ApprovalStatus = "Pending" | "Urgent" | "Approved" | "Rejected" | "Escalated";

interface PendingApproval {
  id: number; workflow: string; requestedBy: string; currentStep: string;
  slaDeadline: string; slaStatus: "green" | "amber" | "red"; status: ApprovalStatus;
  priority: string; startedAt: string;
  steps: { name: string; status: "Completed" | "In Progress" | "Pending" }[];
  comments: { by: string; text: string; date: string }[];
}

interface SlaTier { tier: string; responseTime: string; resolutionTime: string; escalationAfter: string; color: string; }

interface EscalationRule {
  id: number; rule: string; trigger: string; triggerType: string; triggerValue: string;
  action: string; notifyRole: string; status: "Enabled" | "Disabled";
}

interface ActiveWf {
  id: number; name: string; triggeredBy: string; started: string;
  currentStep: number; totalSteps: number; stepName: string;
  status: "Running" | "Paused"; steps: string[];
}

interface HistoryRow {
  workflow: string; requestedBy: string; action: "Approved" | "Rejected";
  actionedBy: string; date: string; slaMet: boolean; comment: string;
}

interface WorkflowLog { timestamp: string; workflow: string; event: string; actor: string; result: "Success" | "Failed" | "Warning"; }

interface ToastState { message: string; type: "success" | "error" | "warning"; }

// ===========================================================================
// Data
// ===========================================================================

const initialStats = [
  { key: "templates", label: "Workflow Templates", value: 14, icon: FileText },
  { key: "active", label: "Active Workflows", value: 8, icon: GitBranch },
  { key: "pending", label: "Pending Approvals", value: 12, icon: Clock },
  { key: "breaches", label: "SLA Breaches", value: 3, icon: AlertTriangle },
];

const initialWorkflowTemplates: WorkflowTemplate[] = [
  { id: 1, name: "User Onboarding", triggerType: "Event", steps: [
    { name: "Trigger Event Received", type: "Automated", completed: true }, { name: "Assign to Team Lead", type: "Manual", completed: true },
    { name: "Send Notification to User", type: "Automated", completed: true }, { name: "Await Approval", type: "Manual", completed: false },
    { name: "Mark Complete & Log Audit", type: "Automated", completed: false },
  ], sla: "24h", status: "Active", description: "Handles new user onboarding across teams." },
  { id: 2, name: "Invoice Approval", triggerType: "Manual", steps: [
    { name: "Submit Invoice", type: "Manual", completed: true }, { name: "Manager Review", type: "Manual", completed: true },
    { name: "Finance Validation", type: "Automated", completed: false }, { name: "Approve & Notify", type: "Automated", completed: false },
  ], sla: "8h", status: "Active", description: "Multi-step invoice approval pipeline." },
  { id: 3, name: "Access Request", triggerType: "API", steps: [
    { name: "Request Received", type: "Automated", completed: true }, { name: "Security Review", type: "Manual", completed: true },
    { name: "Provision Access", type: "Automated", completed: true },
  ], sla: "4h", status: "Active", description: "Automated access provisioning with security gate." },
  { id: 4, name: "Vendor Registration", triggerType: "Manual", steps: [
    { name: "Vendor Submission", type: "Manual", completed: true }, { name: "Document Verification", type: "Manual", completed: false },
    { name: "Compliance Check", type: "Automated", completed: false }, { name: "Background Screening", type: "Manual", completed: false },
    { name: "Approval", type: "Manual", completed: false }, { name: "System Registration", type: "Automated", completed: false },
  ], sla: "48h", status: "Draft", description: "Full vendor onboarding and compliance flow." },
  { id: 5, name: "Incident Response", triggerType: "Event", steps: [
    { name: "Alert Triggered", type: "Automated", completed: true }, { name: "Triage", type: "Manual", completed: true },
    { name: "Assign Responder", type: "Manual", completed: true }, { name: "Investigate", type: "Manual", completed: true },
    { name: "Apply Fix", type: "Manual", completed: false }, { name: "Verify Resolution", type: "Automated", completed: false },
    { name: "Post-Mortem Log", type: "Automated", completed: false },
  ], sla: "1h", status: "Active", description: "Critical incident escalation and resolution workflow." },
  { id: 6, name: "Contract Renewal", triggerType: "Manual", steps: [
    { name: "Renewal Notice Sent", type: "Automated", completed: true }, { name: "Legal Review", type: "Manual", completed: true },
    { name: "Negotiation", type: "Manual", completed: true }, { name: "Sign & Archive", type: "Automated", completed: true },
  ], sla: "72h", status: "Archived", description: "Contract lifecycle renewal management." },
];

const initialApprovals: PendingApproval[] = [
  { id: 1, workflow: "Invoice Approval", requestedBy: "Priya Sharma", currentStep: "Manager Review", slaDeadline: "4h remaining", slaStatus: "amber", status: "Pending", priority: "High", startedAt: "Apr 02, 2026 — 10:30 AM",
    steps: [{ name: "Submitted", status: "Completed" }, { name: "Initial Review", status: "Completed" }, { name: "Manager Review", status: "In Progress" }, { name: "Final Approval", status: "Pending" }],
    comments: [{ by: "System", text: "Auto-routed to finance team", date: "10:30 AM" }] },
  { id: 2, workflow: "Access Request", requestedBy: "Jordan Lee", currentStep: "Security Review", slaDeadline: "12h remaining", slaStatus: "green", status: "Pending", priority: "Medium", startedAt: "Apr 02, 2026 — 09:15 AM",
    steps: [{ name: "Request Filed", status: "Completed" }, { name: "Security Review", status: "In Progress" }, { name: "Provisioning", status: "Pending" }],
    comments: [] },
  { id: 3, workflow: "Vendor Registration", requestedBy: "Mei Chen", currentStep: "Compliance Check", slaDeadline: "1h remaining", slaStatus: "red", status: "Urgent", priority: "Critical", startedAt: "Apr 01, 2026 — 02:00 PM",
    steps: [{ name: "Submission", status: "Completed" }, { name: "Document Upload", status: "Completed" }, { name: "Compliance Check", status: "In Progress" }, { name: "Background Screening", status: "Pending" }, { name: "Approval", status: "Pending" }],
    comments: [{ by: "Admin", text: "Missing compliance docs", date: "03:15 PM" }] },
  { id: 4, workflow: "User Onboarding", requestedBy: "Alex Rivera", currentStep: "IT Provisioning", slaDeadline: "8h remaining", slaStatus: "green", status: "Pending", priority: "Low", startedAt: "Apr 02, 2026 — 08:00 AM",
    steps: [{ name: "Request", status: "Completed" }, { name: "HR Review", status: "Completed" }, { name: "IT Provisioning", status: "In Progress" }, { name: "Welcome Email", status: "Pending" }],
    comments: [] },
  { id: 5, workflow: "Incident Response", requestedBy: "Rahul Verma", currentStep: "Triage", slaDeadline: "30m remaining", slaStatus: "red", status: "Urgent", priority: "Critical", startedAt: "Apr 02, 2026 — 11:45 AM",
    steps: [{ name: "Alert", status: "Completed" }, { name: "Triage", status: "In Progress" }, { name: "Assign", status: "Pending" }, { name: "Investigate", status: "Pending" }, { name: "Resolve", status: "Pending" }],
    comments: [{ by: "System", text: "SLA breach imminent", date: "11:50 AM" }] },
];

const initialSlaTiers: SlaTier[] = [
  { tier: "Critical", responseTime: "15 min", resolutionTime: "1h", escalationAfter: "30 min", color: "#ef4444" },
  { tier: "High", responseTime: "30 min", resolutionTime: "4h", escalationAfter: "2h", color: "#f59e0b" },
  { tier: "Medium", responseTime: "2h", resolutionTime: "24h", escalationAfter: "8h", color: "#3b82f6" },
  { tier: "Low", responseTime: "8h", resolutionTime: "72h", escalationAfter: "48h", color: "#22c55e" },
];

const initialEscalationRules: EscalationRule[] = [
  { id: 1, rule: "SLA Breach Alert", trigger: "SLA deadline exceeded", triggerType: "SLA Breach", triggerValue: "after 0 hours", action: "Escalate to manager", notifyRole: "Manager", status: "Enabled" },
  { id: 2, rule: "Approval Timeout", trigger: "No response in 4h", triggerType: "No Response", triggerValue: "after 4 hours", action: "Re-assign to backup approver", notifyRole: "Team Lead", status: "Enabled" },
  { id: 3, rule: "Critical Path Delay", trigger: "Critical step blocked > 1h", triggerType: "Time Based", triggerValue: "after 1 hours", action: "Alert executive sponsor", notifyRole: "Director", status: "Enabled" },
  { id: 4, rule: "Repeat Failure", trigger: "3 consecutive failures", triggerType: "Manual", triggerValue: "after 3 failures", action: "Pause workflow & notify", notifyRole: "Admin", status: "Disabled" },
];

const initialActiveWfs: ActiveWf[] = [
  { id: 1, name: "User Onboarding — Alex Rivera", triggeredBy: "Alex Rivera", started: "2 hours ago", currentStep: 3, totalSteps: 5, stepName: "IT Provisioning", status: "Running", steps: ["Request", "HR Review", "IT Provisioning", "Account Setup", "Welcome Email"] },
  { id: 2, name: "Invoice Approval — Priya Sharma", triggeredBy: "Priya Sharma", started: "1 hour ago", currentStep: 3, totalSteps: 4, stepName: "Manager Review", status: "Running", steps: ["Submitted", "Initial Review", "Manager Review", "Final Approval"] },
  { id: 3, name: "Vendor Registration — Mei Chen", triggeredBy: "Mei Chen", started: "3 hours ago", currentStep: 2, totalSteps: 6, stepName: "Document Verification", status: "Running", steps: ["Submission", "Doc Verification", "Compliance", "Screening", "Approval", "Registration"] },
  { id: 4, name: "Incident Response — Rahul Verma", triggeredBy: "Rahul Verma", started: "30 min ago", currentStep: 2, totalSteps: 5, stepName: "Triage", status: "Running", steps: ["Alert", "Triage", "Assign", "Investigate", "Resolve"] },
  { id: 5, name: "Access Request — Jordan Lee", triggeredBy: "Jordan Lee", started: "45 min ago", currentStep: 2, totalSteps: 3, stepName: "Security Review", status: "Running", steps: ["Request Filed", "Security Review", "Provisioning"] },
  { id: 6, name: "Contract Renewal — Emily Chen", triggeredBy: "Emily Chen", started: "5 hours ago", currentStep: 3, totalSteps: 4, stepName: "Negotiation", status: "Running", steps: ["Notice", "Legal Review", "Negotiation", "Sign & Archive"] },
  { id: 7, name: "User Onboarding — Sara Wilson", triggeredBy: "Sara Wilson", started: "4 hours ago", currentStep: 4, totalSteps: 5, stepName: "Account Setup", status: "Running", steps: ["Request", "HR Review", "IT Provisioning", "Account Setup", "Welcome Email"] },
  { id: 8, name: "Invoice Approval — Tom Brown", triggeredBy: "Tom Brown", started: "6 hours ago", currentStep: 2, totalSteps: 4, stepName: "Initial Review", status: "Paused", steps: ["Submitted", "Initial Review", "Manager Review", "Final Approval"] },
];

const historyData: HistoryRow[] = [
  { workflow: "Invoice Approval", requestedBy: "Priya Sharma", action: "Approved", actionedBy: "Super Admin", date: "Apr 01, 2026", slaMet: true, comment: "Looks good" },
  { workflow: "Access Request", requestedBy: "Jordan Lee", action: "Rejected", actionedBy: "Admin", date: "Mar 31, 2026", slaMet: true, comment: "Missing docs" },
  { workflow: "User Onboarding", requestedBy: "Emma Davis", action: "Approved", actionedBy: "Super Admin", date: "Mar 30, 2026", slaMet: false, comment: "SLA breached" },
  { workflow: "Vendor Registration", requestedBy: "Mei Chen", action: "Rejected", actionedBy: "Admin", date: "Mar 29, 2026", slaMet: true, comment: "Incomplete info" },
  { workflow: "Incident Response", requestedBy: "Rahul Verma", action: "Approved", actionedBy: "Super Admin", date: "Mar 28, 2026", slaMet: true, comment: "Critical — fast-tracked" },
  { workflow: "Contract Renewal", requestedBy: "Lisa Park", action: "Approved", actionedBy: "Admin", date: "Mar 27, 2026", slaMet: false, comment: "Delayed review" },
  { workflow: "Invoice Approval", requestedBy: "Tom Brown", action: "Rejected", actionedBy: "Manager", date: "Mar 26, 2026", slaMet: true, comment: "Duplicate submission" },
  { workflow: "Access Request", requestedBy: "Sara Wilson", action: "Approved", actionedBy: "Super Admin", date: "Mar 25, 2026", slaMet: true, comment: "Verified" },
  { workflow: "User Onboarding", requestedBy: "Carlos Rivera", action: "Approved", actionedBy: "Admin", date: "Mar 24, 2026", slaMet: true, comment: "All clear" },
  { workflow: "Vendor Registration", requestedBy: "Alex Rivera", action: "Rejected", actionedBy: "Compliance", date: "Mar 23, 2026", slaMet: false, comment: "Failed background check" },
];

const workflowLogs: WorkflowLog[] = [
  { timestamp: "10:42 AM", workflow: "User Onboarding", event: "Step completed: IT Provisioning", actor: "System", result: "Success" },
  { timestamp: "10:38 AM", workflow: "Invoice Approval", event: "Escalated: Manager Review timeout", actor: "System", result: "Warning" },
  { timestamp: "10:15 AM", workflow: "Access Request", event: "Approval granted", actor: "Jordan Lee", result: "Success" },
  { timestamp: "09:58 AM", workflow: "Incident Response", event: "SLA breach: Triage exceeded 1h", actor: "System", result: "Failed" },
  { timestamp: "09:30 AM", workflow: "Vendor Registration", event: "Step completed: Document Upload", actor: "Mei Chen", result: "Success" },
  { timestamp: "09:12 AM", workflow: "Contract Renewal", event: "Workflow started", actor: "Priya Sharma", result: "Success" },
];

// ===========================================================================
// Helpers
// ===========================================================================

function triggerBadgeColor(t: TriggerType) { return t === "API" ? "#8b5cf6" : t === "Event" ? "#3b82f6" : t === "Schedule" ? "#f59e0b" : "#6b7280"; }
function templateStatusColor(s: TemplateStatus) { return s === "Active" ? "#22c55e" : s === "Draft" ? "#f59e0b" : "#6b7280"; }
function logResultColor(r: WorkflowLog["result"]) { return r === "Success" ? "#22c55e" : r === "Failed" ? "#ef4444" : "#f59e0b"; }
function approvalStatusColor(s: ApprovalStatus) {
  return s === "Pending" ? "#6b7280" : s === "Urgent" ? "#ef4444" : s === "Approved" ? "#22c55e" : s === "Rejected" ? "#ef4444" : "#8b5cf6";
}

const fieldStyle: React.CSSProperties = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };
const selectStyle: React.CSSProperties = { ...fieldStyle, appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "32px" };

// ===========================================================================
// Toast
// ===========================================================================

function Toast({ toast, onDone }: { toast: ToastState | null; onDone: () => void }) {
  useEffect(() => { if (!toast) return; const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [toast, onDone]);
  if (!toast) return null;
  const bg = toast.type === "success" ? "#22c55e" : toast.type === "error" ? "#ef4444" : "#f59e0b";
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl text-white text-sm font-medium" style={{ backgroundColor: bg }}>
      {toast.message}
      <button onClick={onDone} className="ml-2 rounded p-0.5 hover:opacity-70"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ===========================================================================
// Component
// ===========================================================================

export function WorkflowsContent() {
  const [templates, setTemplates] = useState(initialWorkflowTemplates);
  const [stats, setStats] = useState(initialStats);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Template actions
  const [viewSteps, setViewSteps] = useState<WorkflowTemplate | null>(null);
  const [triggerTarget, setTriggerTarget] = useState<WorkflowTemplate | null>(null);
  const [editTarget, setEditTarget] = useState<WorkflowTemplate | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<WorkflowTemplate | null>(null);
  const [triggerNotes, setTriggerNotes] = useState("");

  // Edit drawer state
  const [editName, setEditName] = useState("");
  const [editTriggerType, setEditTriggerType] = useState<TriggerType>("Event");
  const [editSlaVal, setEditSlaVal] = useState(24);
  const [editSlaUnit, setEditSlaUnit] = useState<"h" | "d">("h");
  const [editStatus, setEditStatus] = useState<TemplateStatus>("Active");
  const [editDesc, setEditDesc] = useState("");
  const [editSteps, setEditSteps] = useState<WorkflowStep[]>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<"approvals" | "active" | "history">("approvals");

  // Approval Flows — PART 1 & 2
  const [approvals, setApprovals] = useState(initialApprovals);
  const [approvalSearch, setApprovalSearch] = useState("");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("All");
  const [approvalSlaFilter, setApprovalSlaFilter] = useState("All");
  const [approvalSort, setApprovalSort] = useState("SLA Deadline");
  const [viewApproval, setViewApproval] = useState<PendingApproval | null>(null);
  const [approveTarget, setApproveTarget] = useState<PendingApproval | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingApproval | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<PendingApproval | null>(null);
  const [approveComment, setApproveComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [newComment, setNewComment] = useState("");

  // SLA — PART 3
  const [slaTiers, setSlaTiers] = useState(initialSlaTiers);
  const [editSla, setEditSla] = useState<SlaTier | null>(null);
  const [slaForm, setSlaForm] = useState({ respVal: 15, respUnit: "min", resolVal: 1, resolUnit: "h", escVal: 30, escUnit: "min" });

  // Escalation Rules — PART 4
  const [escRules, setEscRules] = useState(initialEscalationRules);
  const [editEscRule, setEditEscRule] = useState<EscalationRule | null>(null);
  const [deleteEscRule, setDeleteEscRule] = useState<EscalationRule | null>(null);
  const [escDrawer, setEscDrawer] = useState(false);
  const [escForm, setEscForm] = useState({ rule: "", triggerType: "SLA Breach", triggerValue: "", action: "Notify Manager", notifyRole: "Team Lead", status: "Enabled" as "Enabled" | "Disabled" });
  const [nextEscId, setNextEscId] = useState(5);

  // Active Workflows — PART 5
  const [activeWfs, setActiveWfs] = useState(initialActiveWfs);
  const [cancelWf, setCancelWf] = useState<ActiveWf | null>(null);

  // History — PART 6
  const [histSearch, setHistSearch] = useState("");
  const [histActionFilter, setHistActionFilter] = useState("All");
  const [histSlaFilter, setHistSlaFilter] = useState("All");
  const [histDateFilter, setHistDateFilter] = useState("Last 30 days");

  const showToast = (message: string, type: ToastState["type"] = "success") => setToast({ message, type });

  // Approval filters
  const approvalFiltersActive = approvalSearch !== "" || approvalStatusFilter !== "All" || approvalSlaFilter !== "All";
  const filteredApprovals = approvals.filter((a) => {
    if (approvalSearch) { const q = approvalSearch.toLowerCase(); if (!a.workflow.toLowerCase().includes(q) && !a.requestedBy.toLowerCase().includes(q)) return false; }
    if (approvalStatusFilter !== "All" && a.status !== approvalStatusFilter) return false;
    if (approvalSlaFilter !== "All") {
      const p = a.priority; if (approvalSlaFilter !== p) return false;
    }
    return true;
  }).sort((a, b) => {
    if (approvalSort === "Most Recent") return b.id - a.id;
    // Sort by SLA urgency
    const order = { red: 0, amber: 1, green: 2 }; return (order[a.slaStatus] ?? 2) - (order[b.slaStatus] ?? 2);
  });

  // History filters
  const filteredHistory = historyData.filter((h) => {
    if (histSearch) { const q = histSearch.toLowerCase(); if (!h.workflow.toLowerCase().includes(q) && !h.requestedBy.toLowerCase().includes(q)) return false; }
    if (histActionFilter !== "All" && h.action !== histActionFilter) return false;
    if (histSlaFilter === "Yes" && !h.slaMet) return false;
    if (histSlaFilter === "No" && h.slaMet) return false;
    return true;
  });

  // Handlers
  const handleApprove = (a: PendingApproval) => {
    setApprovals((p) => p.map((x) => x.id === a.id ? { ...x, status: "Approved" as ApprovalStatus } : x));
    setStats((p) => p.map((s) => s.key === "pending" ? { ...s, value: s.value - 1 } : s));
    setApproveTarget(null); setApproveComment(""); showToast("Workflow approved \u2713");
  };
  const handleReject = (a: PendingApproval) => {
    if (!rejectReason.trim()) return;
    setApprovals((p) => p.map((x) => x.id === a.id ? { ...x, status: "Rejected" as ApprovalStatus } : x));
    setStats((p) => p.map((s) => s.key === "pending" ? { ...s, value: s.value - 1 } : s));
    setRejectTarget(null); setRejectReason(""); showToast("Workflow rejected \u2713", "error");
  };
  const handleEscalate = (a: PendingApproval) => {
    setApprovals((p) => p.map((x) => x.id === a.id ? { ...x, status: "Escalated" as ApprovalStatus } : x));
    setStats((p) => p.map((s) => s.key === "breaches" ? { ...s, value: s.value + 1 } : s));
    setEscalateTarget(null); showToast("Workflow escalated \u2713", "warning");
  };

  const handleTrigger = () => {
    setStats((p) => p.map((s) => s.key === "active" ? { ...s, value: s.value + 1 } : s));
    setTriggerTarget(null); setTriggerNotes(""); showToast("Workflow triggered successfully \u2713");
  };
  const handleSaveEdit = () => {
    if (!editTarget) return;
    setTemplates((p) => p.map((t) => t.id === editTarget.id ? { ...t, name: editName, triggerType: editTriggerType, sla: `${editSlaVal}${editSlaUnit}`, status: editStatus, description: editDesc, steps: editSteps } : t));
    setEditTarget(null); showToast("Workflow updated \u2713");
  };
  const handleArchive = (wf: WorkflowTemplate) => {
    setTemplates((p) => p.map((t) => t.id === wf.id ? { ...t, status: "Archived" as TemplateStatus } : t));
    setArchiveTarget(null); showToast("Workflow archived \u2713", "error");
  };

  const openEditDrawer = (tpl: WorkflowTemplate) => {
    setEditTarget(tpl); setEditName(tpl.name); setEditTriggerType(tpl.triggerType);
    setEditSlaVal(parseInt(tpl.sla) || 24); setEditSlaUnit(tpl.sla.includes("d") ? "d" : "h");
    setEditStatus(tpl.status); setEditDesc(tpl.description); setEditSteps(tpl.steps.map((s) => ({ ...s })));
  };

  const openEditEsc = (r: EscalationRule) => {
    setEditEscRule(r); setEscForm({ rule: r.rule, triggerType: r.triggerType, triggerValue: r.triggerValue, action: r.action, notifyRole: r.notifyRole, status: r.status });
    setEscDrawer(true);
  };
  const openNewEsc = () => {
    setEditEscRule(null); setEscForm({ rule: "", triggerType: "SLA Breach", triggerValue: "", action: "Notify Manager", notifyRole: "Team Lead", status: "Enabled" });
    setEscDrawer(true);
  };
  const saveEscRule = () => {
    if (!escForm.rule.trim()) return;
    if (editEscRule) {
      setEscRules((p) => p.map((r) => r.id === editEscRule.id ? { ...r, ...escForm, trigger: `${escForm.triggerType} — ${escForm.triggerValue}` } : r));
      showToast("Escalation rule updated \u2713");
    } else {
      setEscRules((p) => [...p, { id: nextEscId, ...escForm, trigger: `${escForm.triggerType} — ${escForm.triggerValue}` }]);
      setNextEscId((p) => p + 1); showToast("Escalation rule created \u2713");
    }
    setEscDrawer(false);
  };

  const exportHistory = () => {
    const headers = "Workflow,Requested By,Action,Actioned By,Date,SLA Met,Comment";
    const rows = filteredHistory.map((h) => [h.workflow, h.requestedBy, h.action, h.actionedBy, h.date, h.slaMet ? "Yes" : "No", h.comment].map((v) => `"${v}"`).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `glimmora-approval-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url); showToast("History exported \u2713");
  };

  // Compute active wf count for stat
  useEffect(() => {
    const running = activeWfs.filter((w) => w.status === "Running").length;
    setStats((p) => p.map((s) => s.key === "active" ? { ...s, value: running } : s));
  }, [activeWfs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Workflow Engine</h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Approvals, onboarding flows, escalations, and SLA management</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
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
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Workflow Templates</h2>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              {["Template Name", "Trigger Type", "Steps", "SLA", "Status", "Actions"].map((c) => (
                <th key={c} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{c}</th>
              ))}
            </tr></thead>
            <tbody>{templates.map((tpl, i) => (
              <tr key={tpl.id} style={{ borderBottom: i < templates.length - 1 ? "1px solid var(--gf-border)" : undefined }}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                  <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 flex-shrink-0" style={{ color: "var(--gf-accent)" }} />{tpl.name}</div>
                </td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${triggerBadgeColor(tpl.triggerType)}20`, color: triggerBadgeColor(tpl.triggerType) }}>{tpl.triggerType}</span></td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{tpl.steps.length} steps</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{tpl.sla}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${templateStatusColor(tpl.status)}20`, color: templateStatusColor(tpl.status) }}>{tpl.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setViewSteps(tpl)} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#3b82f620", color: "#3b82f6" }} title="View Steps"><Eye className="h-4 w-4" /></button>
                    {tpl.status === "Active" && <button onClick={() => { setTriggerTarget(tpl); setTriggerNotes(""); }} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#22c55e20", color: "#22c55e" }} title="Trigger"><Play className="h-4 w-4" /></button>}
                    <button onClick={() => openEditDrawer(tpl)} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }} title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setArchiveTarget(tpl)} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#ef444420", color: "#ef4444" }} title="Archive"><Archive className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Tabs — PART 5/6 */}
      <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", width: "fit-content" }}>
        {(["approvals", "active", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{ backgroundColor: activeTab === tab ? "#f97316" : "transparent", color: activeTab === tab ? "#fff" : "var(--gf-text-secondary)" }}>
            {tab === "approvals" ? "Approval Flows" : tab === "active" ? "Active Workflows" : "History"}
          </button>
        ))}
      </div>

      {/* TAB: Approval Flows */}
      {activeTab === "approvals" && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Approval Flows</h2>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />
              <input type="text" placeholder="Search by workflow or requester..." value={approvalSearch} onChange={(e) => setApprovalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" style={{ backgroundColor: "var(--gf-bg-elevated, var(--gf-bg-base))", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <select value={approvalStatusFilter} onChange={(e) => setApprovalStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...selectStyle, border: "1px solid var(--gf-border)" }}>
              {["All", "Pending", "Urgent", "Approved", "Rejected", "Escalated"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select value={approvalSlaFilter} onChange={(e) => setApprovalSlaFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...selectStyle, border: "1px solid var(--gf-border)" }}>
              {["All", "Critical", "High", "Medium", "Low"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select value={approvalSort} onChange={(e) => setApprovalSort(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...selectStyle, border: "1px solid var(--gf-border)" }}>
              {["SLA Deadline", "Most Recent"].map((o) => <option key={o}>{o}</option>)}
            </select>
            {approvalFiltersActive && (
              <button onClick={() => { setApprovalSearch(""); setApprovalStatusFilter("All"); setApprovalSlaFilter("All"); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80"
                style={{ color: "#f97316", border: "1px solid #f97316", backgroundColor: "rgba(249,115,22,0.08)" }}>
                <FilterX className="h-4 w-4" /> Clear Filters
              </button>
            )}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Workflow", "Requested By", "Current Step", "SLA Deadline", "Status", "Actions"].map((c) => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{c}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredApprovals.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--gf-text-secondary)" }}>No approval flows match filters.</td></tr>}
                {filteredApprovals.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < filteredApprovals.length - 1 ? "1px solid var(--gf-border)" : undefined, borderLeft: a.status === "Urgent" ? "3px solid #ef4444" : "3px solid transparent" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                      <div className="flex items-center gap-2">
                        {a.status === "Urgent" && <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#f97316" }} />}
                        {a.workflow}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{a.requestedBy}</td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{a.currentStep}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: a.slaStatus === "green" ? "#22c55e" : a.slaStatus === "amber" ? "#f59e0b" : "#ef4444" }}>{a.slaDeadline}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${approvalStatusColor(a.status)}20`, color: approvalStatusColor(a.status) }}>{a.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setViewApproval(a); setNewComment(""); }} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#3b82f620", color: "#3b82f6" }} title="View Details"><Eye className="h-4 w-4" /></button>
                        {(a.status === "Pending" || a.status === "Urgent") && <>
                          <button onClick={() => { setApproveTarget(a); setApproveComment(""); }} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#22c55e20", color: "#22c55e" }} title="Approve"><Check className="h-4 w-4" /></button>
                          <button onClick={() => { setRejectTarget(a); setRejectReason(""); }} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#ef444420", color: "#ef4444" }} title="Reject"><X className="h-4 w-4" /></button>
                        </>}
                        {a.status === "Urgent" && (
                          <button onClick={() => setEscalateTarget(a)} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#f59e0b20", color: "#f59e0b" }} title="Escalate"><Zap className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Active Workflows — PART 5 */}
      {activeTab === "active" && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Active Workflows</h2>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {activeWfs.map((wf) => {
              const pct = Math.round((wf.currentStep / wf.totalSteps) * 100);
              const sc = wf.status === "Running" ? "#22c55e" : "#f59e0b";
              return (
                <div key={wf.id} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{wf.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${sc}20`, color: sc }}>{wf.status}</span>
                  </div>
                  <div className="space-y-1 text-xs mb-3" style={{ color: "var(--gf-text-secondary)" }}>
                    <p>Triggered by: {wf.triggeredBy}</p>
                    <p>Started: {wf.started}</p>
                    <p>Current Step: Step {wf.currentStep} of {wf.totalSteps} — {wf.stepName}</p>
                  </div>
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--gf-text-secondary)" }}>Progress</span>
                      <span style={{ color: "var(--gf-text-primary)" }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "var(--gf-border)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#f97316" }} />
                    </div>
                  </div>
                  {/* Steps */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {wf.steps.map((s, idx) => {
                      const isDone = idx < wf.currentStep;
                      const isCurrent = idx === wf.currentStep - 1;
                      return (
                        <span key={idx} className="text-xs px-1.5 py-0.5 rounded" style={{
                          backgroundColor: isDone ? "#22c55e20" : isCurrent ? "#f59e0b20" : "var(--gf-border)",
                          color: isDone ? "#22c55e" : isCurrent ? "#f59e0b" : "var(--gf-text-secondary)",
                        }}>
                          {isDone ? "\u2713" : isCurrent ? "\u2192" : "\u25CB"} {s}
                        </span>
                      );
                    })}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveWfs((p) => p.map((w) => w.id === wf.id ? { ...w, status: wf.status === "Running" ? "Paused" : "Running" } : w));
                        showToast(wf.status === "Running" ? "Workflow paused" : "Workflow resumed \u2713", wf.status === "Running" ? "warning" : "success");
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80"
                      style={{ border: "1px solid var(--gf-border)", color: wf.status === "Running" ? "#f59e0b" : "#22c55e", backgroundColor: "transparent" }}>
                      {wf.status === "Running" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Resume</>}
                    </button>
                    <button onClick={() => setCancelWf(wf)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80"
                      style={{ border: "1px solid var(--gf-border)", color: "#ef4444", backgroundColor: "transparent" }}>
                      <Square className="h-3 w-3" /> Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: History — PART 6 */}
      {activeTab === "history" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Approval History</h2>
            <button onClick={exportHistory} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ border: "1px solid #f97316", color: "#f97316", backgroundColor: "transparent" }}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />
              <input type="text" placeholder="Search..." value={histSearch} onChange={(e) => setHistSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" style={{ backgroundColor: "var(--gf-bg-elevated, var(--gf-bg-base))", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <select value={histActionFilter} onChange={(e) => setHistActionFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...selectStyle, border: "1px solid var(--gf-border)" }}>
              {["All", "Approved", "Rejected"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select value={histSlaFilter} onChange={(e) => setHistSlaFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...selectStyle, border: "1px solid var(--gf-border)" }}>
              {["All", "Yes", "No"].map((o) => <option key={o}>{o === "All" ? "All SLA" : `SLA Met: ${o}`}</option>)}
            </select>
            <select value={histDateFilter} onChange={(e) => setHistDateFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ ...selectStyle, border: "1px solid var(--gf-border)" }}>
              {["Last 7 days", "Last 30 days", "Custom"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Workflow", "Requested By", "Action", "Actioned By", "Date", "SLA Met", "Comment"].map((c) => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{c}</th>
                ))}
              </tr></thead>
              <tbody>{filteredHistory.map((h, i) => (
                <tr key={i} style={{ borderBottom: i < filteredHistory.length - 1 ? "1px solid var(--gf-border)" : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{h.workflow}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{h.requestedBy}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: h.action === "Approved" ? "#22c55e20" : "#ef444420", color: h.action === "Approved" ? "#22c55e" : "#ef4444" }}>{h.action}</span></td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{h.actionedBy}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{h.date}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: h.slaMet ? "#22c55e20" : "#ef444420", color: h.slaMet ? "#22c55e" : "#ef4444" }}>{h.slaMet ? "\u2713 Yes" : "\u2717 No"}</span></td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{h.comment}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLA Settings */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>SLA Settings</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {slaTiers.map((tier) => (
            <div key={tier.tier} className="rounded-xl p-5 relative" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
              <button onClick={() => {
                setEditSla(tier);
                const parseVal = (s: string) => parseInt(s) || 0;
                const parseUnit = (s: string) => s.includes("h") ? "h" : s.includes("min") ? "min" : s.includes("d") ? "d" : "h";
                setSlaForm({ respVal: parseVal(tier.responseTime), respUnit: parseUnit(tier.responseTime), resolVal: parseVal(tier.resolutionTime), resolUnit: parseUnit(tier.resolutionTime), escVal: parseVal(tier.escalationAfter), escUnit: parseUnit(tier.escalationAfter) });
              }} className="absolute top-3 right-3 rounded p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }} title="Edit SLA"><Pencil className="h-3.5 w-3.5" /></button>
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-5 w-5 flex-shrink-0" style={{ color: tier.color }} />
                <h3 className="text-sm font-semibold" style={{ color: tier.color }}>{tier.tier}</h3>
              </div>
              <div className="space-y-2 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                {[["Response Time", tier.responseTime], ["Resolution Time", tier.resolutionTime], ["Escalation After", tier.escalationAfter]].map(([l, v]) => (
                  <div key={l} className="flex justify-between"><span>{l}</span><span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{v}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Escalation Rules — PART 4 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Task Escalation Rules</h2>
          <button onClick={openNewEsc} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#f97316" }}>
            <Plus className="h-4 w-4" /> Add New Rule
          </button>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              {["Rule", "Trigger", "Action", "Notify", "Status", "Actions"].map((c) => (
                <th key={c} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{c}</th>
              ))}
            </tr></thead>
            <tbody>{escRules.map((rule, i) => (
              <tr key={rule.id} style={{ borderBottom: i < escRules.length - 1 ? "1px solid var(--gf-border)" : undefined }}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                  <div className="flex items-center gap-2"><ArrowUpCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--gf-accent)" }} />{rule.rule}</div>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{rule.trigger}</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{rule.action}</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{rule.notifyRole}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEscRules((p) => p.map((r) => r.id === rule.id ? { ...r, status: r.status === "Enabled" ? "Disabled" : "Enabled" } : r)); showToast(`Rule ${rule.status === "Enabled" ? "disabled" : "enabled"} \u2713`); }}>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer" style={{ backgroundColor: rule.status === "Enabled" ? "#22c55e20" : "var(--gf-border)", color: rule.status === "Enabled" ? "#22c55e" : "var(--gf-text-secondary)" }}>{rule.status}</span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditEsc(rule)} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }} title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteEscRule(rule)} className="rounded-lg p-1.5 hover:opacity-80" style={{ backgroundColor: "#ef444420", color: "#ef4444" }} title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Workflow Logs */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Workflow Logs</h2>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
              {["Time", "Workflow", "Event", "Actor", "Result"].map((c) => <th key={c} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{c}</th>)}
            </tr></thead>
            <tbody>{workflowLogs.map((log, i) => (
              <tr key={i} style={{ borderBottom: i < workflowLogs.length - 1 ? "1px solid var(--gf-border)" : undefined }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-secondary)" }}>{log.timestamp}</td>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{log.workflow}</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{log.event}</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{log.actor}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${logResultColor(log.result)}20`, color: logResultColor(log.result) }}>{log.result}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODALS & DRAWERS                                                   */}
      {/* ================================================================= */}

      {/* View Steps Modal */}
      {viewSteps && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setViewSteps(null)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{viewSteps.name} &mdash; Steps</h2>
              <button onClick={() => setViewSteps(null)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5">{viewSteps.steps.map((step, idx) => {
              const isLast = idx === viewSteps.steps.length - 1;
              return (
                <div key={idx} className="flex gap-4 relative" style={{ paddingBottom: isLast ? 0 : 24 }}>
                  {!isLast && <div className="absolute left-[11px] top-[24px] w-0.5" style={{ height: "calc(100% - 16px)", backgroundColor: step.completed ? "#f59e0b" : "var(--gf-border)" }} />}
                  <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5" style={{ borderColor: step.completed ? "#f59e0b" : "var(--gf-border)", backgroundColor: step.completed ? "#f59e0b" : "transparent" }}>
                    {step.completed && <CheckCircle className="h-3.5 w-3.5" style={{ color: "#fff" }} />}
                  </div>
                  <div className="flex-1 flex items-start justify-between gap-3">
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Step {idx + 1} &rarr; {step.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ backgroundColor: step.type === "Automated" ? "#3b82f620" : "#f59e0b20", color: step.type === "Automated" ? "#3b82f6" : "#f59e0b" }}>{step.type}</span>
                  </div>
                </div>
              );
            })}</div>
            <div className="border-t px-6 py-4 flex justify-end" style={{ borderColor: "var(--gf-border)" }}>
              <button onClick={() => setViewSteps(null)} className="px-5 py-2 text-sm font-medium rounded-lg border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Modal */}
      {triggerTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setTriggerTarget(null)}>
          <div className="w-full max-w-md rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Trigger Workflow</h2>
              <button onClick={() => setTriggerTarget(null)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Manually trigger <strong>{triggerTarget.name}</strong> workflow?</p>
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Context / Notes (optional)</label>
                <textarea value={triggerNotes} onChange={(e) => setTriggerNotes(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none" style={fieldStyle} />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3" style={{ borderColor: "var(--gf-border)" }}>
              <button onClick={() => setTriggerTarget(null)} className="px-4 py-2 text-sm font-medium rounded-lg border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
              <button onClick={handleTrigger} className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#22c55e" }}>Yes, Trigger</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {archiveTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setArchiveTarget(null)}>
          <div className="w-full max-w-md rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5"><p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Archive <strong>{archiveTarget.name}</strong> workflow? It will no longer be available for triggering.</p></div>
            <div className="border-t px-6 py-4 flex justify-end gap-3" style={{ borderColor: "var(--gf-border)" }}>
              <button onClick={() => setArchiveTarget(null)} className="px-4 py-2 text-sm font-medium rounded-lg border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
              <button onClick={() => handleArchive(archiveTarget)} className="px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#ef4444" }}>Yes, Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Drawer */}
      {editTarget && (<>
        <div className="fixed inset-0 z-[9999] bg-black/70" onClick={() => setEditTarget(null)} />
        <div className="fixed top-0 right-0 z-[9999] h-full w-full max-w-lg overflow-y-auto border-l shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 z-10" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Edit Workflow</h2>
            <button onClick={() => setEditTarget(null)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Template Name</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle} /></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Trigger Type</label><select value={editTriggerType} onChange={(e) => setEditTriggerType(e.target.value as TriggerType)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}>{(["Event", "Manual", "API", "Schedule"] as TriggerType[]).map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>SLA</label><div className="flex gap-2"><input type="number" min={1} value={editSlaVal} onChange={(e) => setEditSlaVal(Number(e.target.value))} className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle} /><select value={editSlaUnit} onChange={(e) => setEditSlaUnit(e.target.value as "h" | "d")} className="rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}><option value="h">hours</option><option value="d">days</option></select></div></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label><div className="flex gap-2">{(["Active", "Draft", "Archived"] as TemplateStatus[]).map((s) => <button key={s} onClick={() => setEditStatus(s)} className="px-3 py-1.5 text-xs font-medium rounded-lg border" style={{ borderColor: editStatus === s ? templateStatusColor(s) : "var(--gf-border)", backgroundColor: editStatus === s ? `${templateStatusColor(s)}20` : "transparent", color: editStatus === s ? templateStatusColor(s) : "var(--gf-text-secondary)" }}>{s}</button>)}</div></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label><textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none" style={fieldStyle} /></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Steps</label>
              <div className="space-y-2">{editSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => { if (idx === 0) return; const c = [...editSteps]; [c[idx - 1], c[idx]] = [c[idx], c[idx - 1]]; setEditSteps(c); }} disabled={idx === 0} className="text-xs p-0.5 rounded hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>&#9650;</button>
                    <button onClick={() => { if (idx === editSteps.length - 1) return; const c = [...editSteps]; [c[idx], c[idx + 1]] = [c[idx + 1], c[idx]]; setEditSteps(c); }} disabled={idx === editSteps.length - 1} className="text-xs p-0.5 rounded hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>&#9660;</button>
                  </div>
                  <span className="text-xs font-medium flex-shrink-0 w-5 text-center" style={{ color: "var(--gf-text-secondary)" }}>{idx + 1}</span>
                  <input type="text" value={step.name} onChange={(e) => setEditSteps((p) => p.map((s, i) => i === idx ? { ...s, name: e.target.value } : s))} className="flex-1 rounded-md border px-2 py-1 text-xs outline-none" style={fieldStyle} />
                  <select value={step.type} onChange={(e) => setEditSteps((p) => p.map((s, i) => i === idx ? { ...s, type: e.target.value as StepType } : s))} className="rounded-md border px-2 py-1 text-xs outline-none" style={selectStyle}><option>Automated</option><option>Manual</option></select>
                  <button onClick={() => setEditSteps((p) => p.filter((_, i) => i !== idx))} className="rounded p-1 hover:opacity-70 flex-shrink-0" style={{ color: "#ef4444" }}><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}</div>
              <button onClick={() => setEditSteps((p) => [...p, { name: "", type: "Manual", completed: false }])} className="mt-2 flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}><Plus className="h-3.5 w-3.5" /> Add Step</button>
            </div>
          </div>
          <div className="border-t px-6 py-4 flex gap-3 sticky bottom-0" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <button onClick={() => setEditTarget(null)} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
            <button onClick={handleSaveEdit} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#f59e0b" }}>Save Changes</button>
          </div>
        </div>
      </>)}

      {/* View Approval Details Modal */}
      {viewApproval && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setViewApproval(null)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Approval Details</h2>
              <button onClick={() => setViewApproval(null)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2 text-sm">
                {[["Workflow", viewApproval.workflow], ["Requested By", viewApproval.requestedBy], ["Current Step", viewApproval.currentStep], ["SLA Deadline", viewApproval.slaDeadline], ["Status", viewApproval.status], ["Priority", viewApproval.priority], ["Started At", viewApproval.startedAt]].map(([l, v]) => (
                  <div key={l} className="flex gap-3"><span className="font-medium shrink-0 w-28" style={{ color: "var(--gf-text-secondary)" }}>{l}</span><span style={{ color: l === "Status" ? approvalStatusColor(v as ApprovalStatus) : "var(--gf-text-primary)" }}>{v}</span></div>
                ))}
              </div>
              {/* Steps Timeline */}
              <div className="pt-3" style={{ borderTop: "1px solid var(--gf-border)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Steps Timeline</h3>
                {viewApproval.steps.map((s, idx) => {
                  const isLast = idx === viewApproval.steps.length - 1;
                  const icon = s.status === "Completed" ? "\u2713" : s.status === "In Progress" ? "\u2192" : "\u25CB";
                  const color = s.status === "Completed" ? "#22c55e" : s.status === "In Progress" ? "#f59e0b" : "var(--gf-text-secondary)";
                  return (
                    <div key={idx} className="flex gap-3 relative" style={{ paddingBottom: isLast ? 0 : 16 }}>
                      {!isLast && <div className="absolute left-[9px] top-[22px] w-0" style={{ height: "calc(100% - 14px)", borderLeft: `2px ${s.status === "Completed" ? "solid #22c55e" : "dotted var(--gf-border)"}` }} />}
                      <div className="relative z-10 flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold" style={{ color }}>{icon}</div>
                      <div className="flex-1 flex justify-between">
                        <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Step {idx + 1} — {s.name}</span>
                        <span className="text-xs" style={{ color }}>{s.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Comments */}
              <div className="pt-3" style={{ borderTop: "1px solid var(--gf-border)" }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>Comments</h3>
                {viewApproval.comments.length === 0 && <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>No comments yet</p>}
                {viewApproval.comments.map((c, i) => (
                  <div key={i} className="mb-2 p-2 rounded-lg text-xs" style={{ backgroundColor: "var(--gf-bg-base)" }}>
                    <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{c.by}</span>
                    <span style={{ color: "var(--gf-text-secondary)" }}> — {c.date}</span>
                    <p className="mt-1" style={{ color: "var(--gf-text-secondary)" }}>{c.text}</p>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none" style={fieldStyle} />
                  <button onClick={() => {
                    if (!newComment.trim()) return;
                    setApprovals((p) => p.map((a) => a.id === viewApproval.id ? { ...a, comments: [...a.comments, { by: "You", text: newComment, date: "Just now" }] } : a));
                    setViewApproval({ ...viewApproval, comments: [...viewApproval.comments, { by: "You", text: newComment, date: "Just now" }] });
                    setNewComment("");
                  }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "#f97316" }}>Send</button>
                </div>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end" style={{ borderColor: "var(--gf-border)" }}>
              <button onClick={() => setViewApproval(null)} className="px-5 py-2 text-sm font-medium rounded-lg border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation */}
      {approveTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setApproveTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Approve Workflow</h3>
            <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>Approve <strong style={{ color: "var(--gf-text-primary)" }}>{approveTarget.workflow}</strong> request by <strong style={{ color: "var(--gf-text-primary)" }}>{approveTarget.requestedBy}</strong>?</p>
            <input type="text" value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="Comment (optional)..." className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-4" style={fieldStyle} />
            <div className="flex gap-3">
              <button onClick={() => handleApprove(approveTarget)} className="flex-1 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#22c55e" }}>Yes, Approve</button>
              <button onClick={() => setApproveTarget(null)} className="flex-1 py-2 rounded-lg text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setRejectTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Reject Workflow</h3>
            <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>Reject <strong style={{ color: "var(--gf-text-primary)" }}>{rejectTarget.workflow}</strong> request?</p>
            <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter rejection reason (required)..." className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-4" style={{ ...fieldStyle, borderColor: !rejectReason.trim() ? "#ef4444" : "var(--gf-border)" }} />
            <div className="flex gap-3">
              <button onClick={() => handleReject(rejectTarget)} className="flex-1 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#ef4444" }}>Yes, Reject</button>
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-2 rounded-lg text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Confirmation */}
      {escalateTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setEscalateTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Escalate Workflow</h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>Escalate <strong style={{ color: "var(--gf-text-primary)" }}>{escalateTarget.workflow}</strong> to next level immediately?</p>
            <div className="flex gap-3">
              <button onClick={() => handleEscalate(escalateTarget)} className="flex-1 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#f59e0b" }}>Yes, Escalate</button>
              <button onClick={() => setEscalateTarget(null)} className="flex-1 py-2 rounded-lg text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit SLA Modal — PART 3 */}
      {editSla && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setEditSla(null)}>
          <div className="w-full max-w-md rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Edit SLA — {editSla.tier}</h2>
              <button onClick={() => setEditSla(null)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Priority Level</label><div className="px-3 py-2 rounded-lg border text-sm" style={{ ...fieldStyle, color: "var(--gf-text-muted)" }}>{editSla.tier}</div></div>
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Response Time</label><div className="flex gap-2"><input type="number" min={1} value={slaForm.respVal} onChange={(e) => setSlaForm({ ...slaForm, respVal: Number(e.target.value) })} className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle} /><select value={slaForm.respUnit} onChange={(e) => setSlaForm({ ...slaForm, respUnit: e.target.value })} className="rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}><option value="min">minutes</option><option value="h">hours</option></select></div></div>
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Resolution Time</label><div className="flex gap-2"><input type="number" min={1} value={slaForm.resolVal} onChange={(e) => setSlaForm({ ...slaForm, resolVal: Number(e.target.value) })} className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle} /><select value={slaForm.resolUnit} onChange={(e) => setSlaForm({ ...slaForm, resolUnit: e.target.value })} className="rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}><option value="h">hours</option><option value="d">days</option></select></div></div>
              <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Escalation After</label><div className="flex gap-2"><input type="number" min={1} value={slaForm.escVal} onChange={(e) => setSlaForm({ ...slaForm, escVal: Number(e.target.value) })} className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle} /><select value={slaForm.escUnit} onChange={(e) => setSlaForm({ ...slaForm, escUnit: e.target.value })} className="rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}><option value="min">minutes</option><option value="h">hours</option></select></div></div>
            </div>
            <div className="border-t px-6 py-4 flex gap-3" style={{ borderColor: "var(--gf-border)" }}>
              <button onClick={() => setEditSla(null)} className="flex-1 py-2 rounded-lg text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
              <button onClick={() => {
                setSlaTiers((p) => p.map((t) => t.tier === editSla.tier ? { ...t, responseTime: `${slaForm.respVal} ${slaForm.respUnit}`, resolutionTime: `${slaForm.resolVal}${slaForm.resolUnit}`, escalationAfter: `${slaForm.escVal} ${slaForm.escUnit}` } : t));
                setEditSla(null); showToast("SLA settings updated \u2713");
              }} className="flex-1 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#f97316" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Rule Drawer — PART 4 */}
      {escDrawer && (<>
        <div className="fixed inset-0 z-[9999] bg-black/70" onClick={() => setEscDrawer(false)} />
        <div className="fixed top-0 right-0 z-[9999] h-full w-full max-w-md overflow-y-auto border-l shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 z-10" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{editEscRule ? "Edit Rule" : "Add New Rule"}</h2>
            <button onClick={() => setEscDrawer(false)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Rule Name *</label><input type="text" value={escForm.rule} onChange={(e) => setEscForm({ ...escForm, rule: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle} /></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Trigger</label><select value={escForm.triggerType} onChange={(e) => setEscForm({ ...escForm, triggerType: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}>{["SLA Breach", "No Response", "Manual", "Time Based"].map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Trigger Value</label><input type="text" value={escForm.triggerValue} onChange={(e) => setEscForm({ ...escForm, triggerValue: e.target.value })} placeholder="e.g. after 2 hours" className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle} /></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Action</label><select value={escForm.action} onChange={(e) => setEscForm({ ...escForm, action: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}>{["Notify Manager", "Reassign Task", "Send Alert", "Auto Approve"].map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Notify</label><select value={escForm.notifyRole} onChange={(e) => setEscForm({ ...escForm, notifyRole: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={selectStyle}>{["Team Lead", "Manager", "Director", "Super Admin", "Admin"].map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
              <div onClick={() => setEscForm({ ...escForm, status: escForm.status === "Enabled" ? "Disabled" : "Enabled" })} className="flex items-center gap-3 cursor-pointer select-none">
                <div className="w-10 h-5 rounded-full relative transition-colors" style={{ backgroundColor: escForm.status === "Enabled" ? "#22c55e" : "rgba(127,127,127,0.35)" }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow" style={{ left: escForm.status === "Enabled" ? "1.375rem" : "0.125rem" }} />
                </div>
                <span className="text-sm font-medium" style={{ color: escForm.status === "Enabled" ? "#22c55e" : "var(--gf-text-secondary)" }}>{escForm.status}</span>
              </div>
            </div>
          </div>
          <div className="border-t px-6 py-4 flex gap-3 sticky bottom-0" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <button onClick={() => setEscDrawer(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
            <button onClick={saveEscRule} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#f97316" }}>Save Rule</button>
          </div>
        </div>
      </>)}

      {/* Delete Escalation Rule */}
      {deleteEscRule && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setDeleteEscRule(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Delete Rule</h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>Delete <strong style={{ color: "var(--gf-text-primary)" }}>{deleteEscRule.rule}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setEscRules((p) => p.filter((r) => r.id !== deleteEscRule.id)); setDeleteEscRule(null); showToast("Escalation rule deleted \u2713", "error"); }} className="flex-1 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#ef4444" }}>Yes, Delete</button>
              <button onClick={() => setDeleteEscRule(null)} className="flex-1 py-2 rounded-lg text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Active Workflow */}
      {cancelWf && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => setCancelWf(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Cancel Workflow</h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>Cancel <strong style={{ color: "var(--gf-text-primary)" }}>{cancelWf.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setActiveWfs((p) => p.filter((w) => w.id !== cancelWf.id)); setCancelWf(null); showToast("Workflow cancelled \u2713", "error"); }} className="flex-1 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: "#ef4444" }}>Yes, Cancel</button>
              <button onClick={() => setCancelWf(null)} className="flex-1 py-2 rounded-lg text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
