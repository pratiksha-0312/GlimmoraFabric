"use client";

import { useState, useMemo } from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  MoreHorizontal,
  Activity,
  Globe,
  Monitor,
  User,
  ChevronDown,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: "Created" | "Updated" | "Deleted" | "Modified" | "Alert" | "Triggered" | "Accessed" | "Exported";
  entity: string;
  details: string;
  isCritical: boolean;
  ip: string;
  before?: string;
  after?: string;
  sessionId: string;
  userAgent: string;
}

interface ComplianceReport {
  id: string;
  name: string;
  type: "SOC2" | "GDPR" | "HIPAA" | "PCI-DSS" | "Security Assessment" | "Banking Audit" | "Custom";
  status: "Generated" | "Pending" | "Failed";
  date: string;
  size: string;
  findings: number;
  score: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: "Failed Login" | "Permission Change" | "MFA Event" | "Suspicious Activity";
  actor: string;
  details: string;
  severity: "high" | "medium" | "low";
  status: "Open" | "Acknowledged" | "Resolved" | "Escalated";
  ip: string;
  location: string;
}

// ============================================================================
// INITIAL DATA
// ============================================================================

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  { id: "ae1", timestamp: "2026-03-30 10:42 AM", actor: "Super Admin", action: "Updated", entity: "User Role", details: "Changed User 1 from Member to Admin", isCritical: false, ip: "192.168.1.10", before: "Role: Member", after: "Role: Admin", sessionId: "sess_a1b2c3", userAgent: "Chrome 124 / Windows 11" },
  { id: "ae2", timestamp: "2026-03-30 10:38 AM", actor: "System", action: "Created", entity: "API Token", details: "Token for VerifAI service", isCritical: false, ip: "—", before: undefined, after: "Token: tk_verifai_***", sessionId: "sys_auto", userAgent: "System Process" },
  { id: "ae3", timestamp: "2026-03-30 10:15 AM", actor: "Super Admin", action: "Deleted", entity: "Team Member", details: "Removed User 7", isCritical: false, ip: "192.168.1.22", before: "User: User 7 (Active)", after: "User: User 7 (Removed)", sessionId: "sess_d4e5f6", userAgent: "Firefox 125 / macOS" },
  { id: "ae4", timestamp: "2026-03-30 09:58 AM", actor: "System", action: "Alert", entity: "Security", details: "Failed login attempt from 45.33.x.x", isCritical: true, ip: "45.33.12.89", before: undefined, after: undefined, sessionId: "sys_alert", userAgent: "Unknown" },
  { id: "ae5", timestamp: "2026-03-30 09:30 AM", actor: "Super Admin", action: "Modified", entity: "Settings", details: "Updated MFA policy", isCritical: false, ip: "192.168.1.10", before: "MFA: Optional", after: "MFA: Required for Admins", sessionId: "sess_g7h8i9", userAgent: "Chrome 124 / Windows 11" },
  { id: "ae6", timestamp: "2026-03-30 09:12 AM", actor: "Super Admin", action: "Created", entity: "Workflow", details: "New approval flow for invoices", isCritical: false, ip: "192.168.1.35", before: undefined, after: "Workflow: invoice-approval-v1", sessionId: "sess_j0k1l2", userAgent: "Chrome 124 / Linux" },
  { id: "ae7", timestamp: "2026-03-29 08:45 AM", actor: "System", action: "Triggered", entity: "Notification", details: "Payment failed alert sent", isCritical: true, ip: "—", before: "Payment: Processing", after: "Payment: Failed", sessionId: "sys_notify", userAgent: "System Process" },
  { id: "ae8", timestamp: "2026-03-29 08:20 AM", actor: "Super Admin", action: "Created", entity: "Tenant", details: "Onboarded Diamond Corp", isCritical: false, ip: "192.168.1.10", before: undefined, after: "Tenant: Diamond Corp (Pro)", sessionId: "sess_m3n4o5", userAgent: "Chrome 124 / Windows 11" },
  { id: "ae9", timestamp: "2026-03-29 07:55 AM", actor: "Super Admin", action: "Exported", entity: "Report", details: "Exported SOC2 compliance report", isCritical: false, ip: "192.168.1.48", before: undefined, after: "File: soc2-2026-03.pdf", sessionId: "sess_p6q7r8", userAgent: "Safari 17 / macOS" },
  { id: "ae10", timestamp: "2026-03-29 06:30 AM", actor: "System", action: "Alert", entity: "Security", details: "Unusual API volume detected on token tk_29x", isCritical: true, ip: "203.0.113.42", before: "Rate: 50 req/min", after: "Rate: 890 req/min", sessionId: "sys_alert", userAgent: "API Client" },
  { id: "ae11", timestamp: "2026-03-28 11:20 PM", actor: "Super Admin", action: "Accessed", entity: "Configuration", details: "Viewed production secrets page", isCritical: false, ip: "192.168.1.22", before: undefined, after: undefined, sessionId: "sess_s9t0u1", userAgent: "Firefox 125 / macOS" },
  { id: "ae12", timestamp: "2026-03-28 10:00 PM", actor: "Super Admin", action: "Updated", entity: "Workflow", details: "Modified payment approval threshold", isCritical: false, ip: "192.168.1.55", before: "Threshold: $500", after: "Threshold: $1000", sessionId: "sess_v2w3x4", userAgent: "Chrome 124 / Windows 11" },
];

const INITIAL_REPORTS: ComplianceReport[] = [
  { id: "cr1", name: "SOC2 Type II", type: "SOC2", status: "Generated", date: "2026-03-28", size: "2.4 MB", findings: 0, score: 98 },
  { id: "cr2", name: "GDPR Assessment", type: "GDPR", status: "Generated", date: "2026-03-25", size: "1.8 MB", findings: 2, score: 94 },
  { id: "cr3", name: "Banking Audit Q1", type: "Banking Audit", status: "Pending", date: "2026-03-30", size: "—", findings: 0, score: 0 },
  { id: "cr4", name: "Security Assessment", type: "Security Assessment", status: "Generated", date: "2026-03-20", size: "3.1 MB", findings: 1, score: 96 },
  { id: "cr5", name: "PCI-DSS Compliance", type: "PCI-DSS", status: "Generated", date: "2026-03-15", size: "1.5 MB", findings: 0, score: 100 },
  { id: "cr6", name: "HIPAA Review", type: "HIPAA", status: "Failed", date: "2026-03-22", size: "—", findings: 0, score: 0 },
];

const INITIAL_SECURITY: SecurityEvent[] = [
  { id: "se1", timestamp: "2026-03-30 10:58 AM", type: "Failed Login", actor: "unknown@external.io", details: "3 failed attempts from IP 45.33.x.x", severity: "high", status: "Open", ip: "45.33.12.89", location: "Mumbai, IN" },
  { id: "se2", timestamp: "2026-03-30 10:42 AM", type: "Permission Change", actor: "Super Admin", details: "Elevated User 1 to Admin role", severity: "medium", status: "Acknowledged", ip: "192.168.1.10", location: "Office LAN" },
  { id: "se3", timestamp: "2026-03-30 09:30 AM", type: "MFA Event", actor: "Super Admin", details: "MFA policy updated - enforced for all users", severity: "low", status: "Resolved", ip: "192.168.1.10", location: "Office LAN" },
  { id: "se4", timestamp: "2026-03-30 08:15 AM", type: "Suspicious Activity", actor: "System", details: "Unusual API call volume from token tk_29x", severity: "high", status: "Escalated", ip: "203.0.113.42", location: "Unknown VPN" },
  { id: "se5", timestamp: "2026-03-29 11:45 PM", type: "Failed Login", actor: "user7@glimmora.com", details: "Account locked after 5 failed attempts", severity: "high", status: "Open", ip: "182.73.22.11", location: "Pune, IN" },
  { id: "se6", timestamp: "2026-03-29 06:10 PM", type: "Permission Change", actor: "Super Admin", details: "Revoked API access for staging environment", severity: "medium", status: "Resolved", ip: "192.168.1.22", location: "Office LAN" },
  { id: "se7", timestamp: "2026-03-29 02:30 PM", type: "Suspicious Activity", actor: "System", details: "Data export of 50K records by non-admin user", severity: "high", status: "Open", ip: "192.168.1.55", location: "Office LAN" },
  { id: "se8", timestamp: "2026-03-28 09:00 PM", type: "MFA Event", actor: "Super Admin", details: "MFA disabled by user", severity: "medium", status: "Open", ip: "192.168.1.40", location: "Office LAN" },
];

const ACTIONS: AuditEvent["action"][] = ["Created", "Updated", "Deleted", "Modified", "Alert", "Triggered", "Accessed", "Exported"];
const ACTORS = ["Super Admin", "User 1", "User 2", "User 3", "User 4", "System"];
const SEC_TYPES: SecurityEvent["type"][] = ["Failed Login", "Permission Change", "MFA Event", "Suspicious Activity"];
const SEVERITIES: SecurityEvent["severity"][] = ["high", "medium", "low"];
const SEC_STATUSES: SecurityEvent["status"][] = ["Open", "Acknowledged", "Resolved", "Escalated"];
const REPORT_TYPES: ComplianceReport["type"][] = ["SOC2", "GDPR", "HIPAA", "PCI-DSS", "Security Assessment", "Banking Audit", "Custom"];

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  low: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
};

const STATUS_COLORS: Record<string, string> = {
  Open: "#ef4444", Acknowledged: "#f59e0b", Resolved: "#22c55e", Escalated: "#a855f7",
  Generated: "#22c55e", Pending: "#f59e0b", Failed: "#ef4444",
};

const SEC_ICONS: Record<SecurityEvent["type"], typeof LogIn> = {
  "Failed Login": LogIn, "Permission Change": Key, "MFA Event": Smartphone, "Suspicious Activity": Eye,
};

const PAGE_SIZE = 6;
const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

function CustomSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm min-w-[140px] outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
        style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
      >
        <span className="truncate">{selected?.label ?? placeholder ?? value}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--gf-text-muted)" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[160px] max-h-[240px] overflow-y-auto rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center px-3 py-2 text-sm hover:bg-white/5 transition-colors ${opt.value === value ? "font-medium" : ""}`}
                style={{ color: opt.value === value ? "var(--gf-accent)" : "var(--gf-text-primary)" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// AUDIT EVENT DETAIL SLIDE-OVER
// ============================================================================

function AuditDetailPanel({ event, onClose }: { event: AuditEvent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Event Details</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          {event.isCritical && (
            <div className="flex items-center gap-2 rounded-lg p-3 bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Critical Event</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {[
              { l: "Timestamp", v: event.timestamp },
              { l: "Actor", v: event.actor },
              { l: "Action", v: event.action },
              { l: "Entity", v: event.entity },
              { l: "IP Address", v: event.ip },
              { l: "Session ID", v: event.sessionId },
            ].map((i) => (
              <div key={i.l} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{i.l}</p>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{i.v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>User Agent</p>
            <p className="text-sm font-mono" style={{ color: "var(--gf-text-secondary)" }}>{event.userAgent}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>Details</p>
            <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{event.details}</p>
          </div>
          {(event.before || event.after) && (
            <div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>Change Diff</h4>
              <div className="space-y-2">
                {event.before && (
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
                    <p className="text-xs font-medium text-red-500 mb-0.5">Before</p>
                    <p className="text-sm font-mono" style={{ color: "var(--gf-text-secondary)" }}>{event.before}</p>
                  </div>
                )}
                {event.after && (
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "rgba(34, 197, 94, 0.05)" }}>
                    <p className="text-xs font-medium text-green-500 mb-0.5">After</p>
                    <p className="text-sm font-mono" style={{ color: "var(--gf-text-secondary)" }}>{event.after}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECURITY EVENT DETAIL SLIDE-OVER
// ============================================================================

function SecurityDetailPanel({ event, onClose, onStatusChange }: { event: SecurityEvent; onClose: () => void; onStatusChange: (id: string, status: SecurityEvent["status"]) => void }) {
  const sevColor = SEVERITY_COLORS[event.severity];
  const sc = STATUS_COLORS[event.status];
  const Icon = SEC_ICONS[event.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Security Event</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: sevColor.bg }}>
              <Icon className="h-6 w-6" style={{ color: sevColor.text }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{event.type}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: sevColor.bg, color: sevColor.text }}>{event.severity}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{event.status}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { l: "Timestamp", v: event.timestamp }, { l: "Actor", v: event.actor },
              { l: "IP Address", v: event.ip }, { l: "Location", v: event.location },
            ].map((i) => (
              <div key={i.l} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{i.l}</p>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{i.v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>Details</p>
            <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{event.details}</p>
          </div>
          {/* Actions */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Actions</h4>
            <div className="flex flex-wrap gap-2">
              {event.status !== "Acknowledged" && event.status !== "Resolved" && (
                <button onClick={() => { onStatusChange(event.id, "Acknowledged"); onClose(); }} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-amber-600 text-white hover:bg-amber-700">
                  <CheckCircle2 className="h-4 w-4" />Acknowledge
                </button>
              )}
              {event.status !== "Resolved" && (
                <button onClick={() => { onStatusChange(event.id, "Resolved"); onClose(); }} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700">
                  <CheckCircle className="h-4 w-4" />Resolve
                </button>
              )}
              {event.status !== "Escalated" && event.status !== "Resolved" && (
                <button onClick={() => { onStatusChange(event.id, "Escalated"); onClose(); }} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700">
                  <ArrowUpRight className="h-4 w-4" />Escalate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GENERATE REPORT MODAL
// ============================================================================

function GenerateReportModal({ onGenerate, onCancel }: { onGenerate: (type: ComplianceReport["type"], name: string) => void; onCancel: () => void }) {
  const [type, setType] = useState<ComplianceReport["type"]>("SOC2");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Report name is required"); return; }
    onGenerate(type, name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)" }}><Shield className="h-5 w-5" style={{ color: "var(--gf-accent)" }} /></div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Generate Report</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Report Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SOC2 Type II Q1 2026" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Report Type</label>
            <CustomSelect value={type} onChange={(v) => setType(v as ComplianceReport["type"])} options={REPORT_TYPES.map((t) => ({ label: t, value: t }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Generate</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// REPORT DETAIL MODAL
// ============================================================================

function ReportDetailModal({ report, onClose }: { report: ComplianceReport; onClose: () => void }) {
  const sc = STATUS_COLORS[report.status];
  const checks = [
    { name: "Access Control", passed: true }, { name: "Data Encryption", passed: true },
    { name: "Audit Logging", passed: true }, { name: "Incident Response", passed: report.findings === 0 },
    { name: "Change Management", passed: true }, { name: "Backup & Recovery", passed: report.findings < 2 },
    { name: "Network Security", passed: true }, { name: "Vendor Management", passed: report.findings === 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{report.name}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{report.status}</span>
            <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{report.type}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ l: "Date", v: report.date }, { l: "Size", v: report.size }, { l: "Findings", v: report.findings.toString() }].map((i) => (
              <div key={i.l} className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--gf-border)" }}>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{i.l}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: "var(--gf-text-primary)" }}>{i.v}</p>
              </div>
            ))}
          </div>
          {report.score > 0 && (
            <div className="text-center py-3">
              <p className="text-4xl font-bold" style={{ color: report.score >= 95 ? "#22c55e" : report.score >= 80 ? "#f59e0b" : "#ef4444" }}>{report.score}%</p>
              <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Compliance Score</p>
            </div>
          )}
          {report.status === "Generated" && (
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Compliance Checklist</h4>
              <div className="space-y-2">
                {checks.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 py-1.5">
                    {c.passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AuditContent() {
  const [auditEvents, setAuditEvents] = useState(INITIAL_AUDIT_EVENTS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [secEvents, setSecEvents] = useState(INITIAL_SECURITY);

  const [activeTab, setActiveTab] = useState<"audit" | "security" | "compliance">("audit");

  // Audit filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActor, setAuditActor] = useState("All");
  const [auditAction, setAuditAction] = useState("All");
  const [auditCriticalOnly, setAuditCriticalOnly] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [showAuditFilters, setShowAuditFilters] = useState(false);

  // Security filters
  const [secSearch, setSecSearch] = useState("");
  const [secType, setSecType] = useState("All");
  const [secSeverity, setSecSeverity] = useState("All");
  const [secStatus, setSecStatus] = useState("All");
  const [secPage, setSecPage] = useState(1);

  // Modals
  const [viewAuditEvent, setViewAuditEvent] = useState<AuditEvent | null>(null);
  const [viewSecEvent, setViewSecEvent] = useState<SecurityEvent | null>(null);
  const [viewReport, setViewReport] = useState<ComplianceReport | null>(null);
  const [generateModal, setGenerateModal] = useState(false);
  const [deleteReport, setDeleteReport] = useState<ComplianceReport | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // ---- Derived ----
  const filteredAudit = useMemo(() => {
    let list = auditEvents;
    if (auditSearch) { const q = auditSearch.toLowerCase(); list = list.filter((e) => e.actor.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)); }
    if (auditActor !== "All") list = list.filter((e) => e.actor === auditActor);
    if (auditAction !== "All") list = list.filter((e) => e.action === auditAction);
    if (auditCriticalOnly) list = list.filter((e) => e.isCritical);
    return list;
  }, [auditEvents, auditSearch, auditActor, auditAction, auditCriticalOnly]);

  const auditTotalPages = Math.max(1, Math.ceil(filteredAudit.length / PAGE_SIZE));
  const auditSafePage = Math.min(auditPage, auditTotalPages);
  const pagedAudit = filteredAudit.slice((auditSafePage - 1) * PAGE_SIZE, auditSafePage * PAGE_SIZE);

  const filteredSec = useMemo(() => {
    let list = secEvents;
    if (secSearch) { const q = secSearch.toLowerCase(); list = list.filter((e) => e.actor.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)); }
    if (secType !== "All") list = list.filter((e) => e.type === secType);
    if (secSeverity !== "All") list = list.filter((e) => e.severity === secSeverity);
    if (secStatus !== "All") list = list.filter((e) => e.status === secStatus);
    return list;
  }, [secEvents, secSearch, secType, secSeverity, secStatus]);

  const secTotalPages = Math.max(1, Math.ceil(filteredSec.length / PAGE_SIZE));
  const secSafePage = Math.min(secPage, secTotalPages);
  const pagedSec = filteredSec.slice((secSafePage - 1) * PAGE_SIZE, secSafePage * PAGE_SIZE);

  // Stats
  const totalEvents = auditEvents.length;
  const criticalAlerts = auditEvents.filter((e) => e.isCritical).length;
  const openIncidents = secEvents.filter((e) => e.status === "Open").length;
  const complianceScore = reports.filter((r) => r.status === "Generated" && r.score > 0).reduce((a, r) => a + r.score, 0) / Math.max(1, reports.filter((r) => r.score > 0).length);

  // ---- Handlers ----
  const handleSecStatusChange = (id: string, status: SecurityEvent["status"]) => {
    setSecEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const handleGenerateReport = (type: ComplianceReport["type"], name: string) => {
    const nr: ComplianceReport = { id: `cr${Date.now()}`, name, type, status: "Pending", date: new Date().toISOString().slice(0, 10), size: "—", findings: 0, score: 0 };
    setReports((prev) => [nr, ...prev]);
    setGenerateModal(false);
    // Simulate generation completing
    setTimeout(() => {
      setReports((prev) => prev.map((r) => (r.id === nr.id ? { ...r, status: "Generated", size: "1.9 MB", score: 95 + Math.floor(Math.random() * 5) } : r)));
    }, 3000);
  };

  const handleDeleteReport = () => {
    if (!deleteReport) return;
    setReports((prev) => prev.filter((r) => r.id !== deleteReport.id));
    setDeleteReport(null);
  };

  const handleDownloadReport = (report: ComplianceReport) => {
    const content = `Compliance Report: ${report.name}\nType: ${report.type}\nDate: ${report.date}\nScore: ${report.score}%\nFindings: ${report.findings}\n\nThis is a simulated report download.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${report.name.replace(/\s+/g, "-").toLowerCase()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAudit = () => {
    const csv = "Timestamp,Actor,Action,Entity,Details,Critical,IP\n" + filteredAudit.map((e) => `"${e.timestamp}","${e.actor}","${e.action}","${e.entity}","${e.details}","${e.isCritical}","${e.ip}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-logs-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSecurity = () => {
    const csv = "Timestamp,Type,Actor,Details,Severity,Status,IP,Location\n" + filteredSec.map((e) => `"${e.timestamp}","${e.type}","${e.actor}","${e.details}","${e.severity}","${e.status}","${e.ip}","${e.location}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "security-events-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const hasAuditFilters = auditSearch || auditActor !== "All" || auditAction !== "All" || auditCriticalOnly;
  const hasSecFilters = secSearch || secType !== "All" || secSeverity !== "All" || secStatus !== "All";

  // Pagination helper
  function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {current} of {total}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current <= 1} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => onChange(n)} className={`h-7 w-7 rounded-lg text-xs font-medium ${n === current ? "text-white" : "hover:opacity-70"}`} style={n === current ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>{n}</button>
          ))}
          <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current >= total} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Audit &amp; Compliance</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Immutable audit trail, security monitoring, and compliance reporting</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "audit" && (
            <button onClick={handleExportAudit} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}><Download className="h-4 w-4" />Export</button>
          )}
          {activeTab === "security" && (
            <button onClick={handleExportSecurity} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}><Download className="h-4 w-4" />Export</button>
          )}
          {activeTab === "compliance" && (
            <button onClick={() => setGenerateModal(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}><Plus className="h-4 w-4" />Generate Report</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Events", value: totalEvents.toLocaleString(), icon: <FileText className="h-5 w-5" /> },
          { label: "Critical Alerts", value: criticalAlerts.toString(), icon: <AlertTriangle className="h-5 w-5" /> },
          { label: "Open Incidents", value: openIncidents.toString(), icon: <Activity className="h-5 w-5" /> },
          { label: "Compliance Score", value: `${Math.round(complianceScore)}%`, icon: <Shield className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{s.icon}</div>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
        {(["audit", "security", "compliance"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "text-white" : ""}`} style={activeTab === tab ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>
            {tab === "audit" ? "Audit Logs" : tab === "security" ? "Security Events" : "Compliance"}
          </button>
        ))}
      </div>

      {/* ===================== AUDIT LOGS TAB ===================== */}
      {activeTab === "audit" && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input type="text" value={auditSearch} onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }} placeholder="Search by actor, entity, or details..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <button onClick={() => setShowAuditFilters(!showAuditFilters)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${showAuditFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`} style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}>
              <Filter className="h-4 w-4" />Filters
            </button>
          </div>

          {showAuditFilters && (
            <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Actor</label>
                <CustomSelect value={auditActor} onChange={(v) => { setAuditActor(v); setAuditPage(1); }} options={[{ label: "All Actors", value: "All" }, ...ACTORS.map((a) => ({ label: a, value: a }))]} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Action</label>
                <CustomSelect value={auditAction} onChange={(v) => { setAuditAction(v); setAuditPage(1); }} options={[{ label: "All Actions", value: "All" }, ...ACTIONS.map((a) => ({ label: a, value: a }))]} />
              </div>
              <button onClick={() => { setAuditCriticalOnly(!auditCriticalOnly); setAuditPage(1); }} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${auditCriticalOnly ? "ring-2 ring-red-500/40" : ""}`} style={{ borderColor: auditCriticalOnly ? "#ef4444" : "var(--gf-border)", color: auditCriticalOnly ? "#ef4444" : "var(--gf-text-primary)", backgroundColor: auditCriticalOnly ? "rgba(239,68,68,0.1)" : "var(--gf-bg-base)" }}>
                <AlertTriangle className="h-3.5 w-3.5" />Critical Only
              </button>
              {hasAuditFilters && (
                <button onClick={() => { setAuditSearch(""); setAuditActor("All"); setAuditAction("All"); setAuditCriticalOnly(false); setAuditPage(1); }} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-400"><X className="h-3 w-3" />Clear All</button>
              )}
            </div>
          )}

          {hasAuditFilters && <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filteredAudit.length} of {auditEvents.length} events</p>}

          {/* Table */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                    {["Timestamp", "Actor", "Action", "Entity", "Details", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedAudit.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                      <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No events found</p>
                    </td></tr>
                  ) : pagedAudit.map((event) => (
                    <tr key={event.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)", borderLeft: event.isCritical ? "3px solid #ef4444" : "3px solid transparent" }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" style={{ color: "var(--gf-text-secondary)" }} /><span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{event.timestamp}</span></div>
                      </td>
                      <td className="px-5 py-3"><span className="text-sm font-medium" style={{ color: event.actor === "System" ? "var(--gf-text-secondary)" : "var(--gf-text-primary)" }}>{event.actor}</span></td>
                      <td className="px-5 py-3">
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: event.isCritical ? "rgba(239,68,68,0.15)" : "var(--gf-bg-elevated)", color: event.isCritical ? "#ef4444" : "var(--gf-text-primary)" }}>{event.action}</span>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: "var(--gf-text-primary)" }}>{event.entity}</td>
                      <td className="px-5 py-3 text-sm max-w-[200px] truncate" style={{ color: "var(--gf-text-secondary)" }}>{event.details}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => setViewAuditEvent(event)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-accent)" }}><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination current={auditSafePage} total={auditTotalPages} onChange={setAuditPage} />
          </div>
        </>
      )}

      {/* ===================== SECURITY EVENTS TAB ===================== */}
      {activeTab === "security" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input type="text" value={secSearch} onChange={(e) => { setSecSearch(e.target.value); setSecPage(1); }} placeholder="Search by actor or details..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <CustomSelect value={secType} onChange={(v) => { setSecType(v); setSecPage(1); }} options={[{ label: "All Types", value: "All" }, ...SEC_TYPES.map((t) => ({ label: t, value: t }))]} />
            <CustomSelect value={secSeverity} onChange={(v) => { setSecSeverity(v); setSecPage(1); }} options={[{ label: "All Severity", value: "All" }, ...SEVERITIES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))]} />
            <CustomSelect value={secStatus} onChange={(v) => { setSecStatus(v); setSecPage(1); }} options={[{ label: "All Status", value: "All" }, ...SEC_STATUSES.map((s) => ({ label: s, value: s }))]} />
          </div>

          {hasSecFilters && <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filteredSec.length} of {secEvents.length} events</p>}

          {/* Table */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                    {["Timestamp", "Type", "Actor", "Details", "Severity", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedSec.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center">
                      <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                      <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No security events found</p>
                    </td></tr>
                  ) : pagedSec.map((event) => {
                    const sevColor = SEVERITY_COLORS[event.severity];
                    const sc = STATUS_COLORS[event.status];
                    const Icon = SEC_ICONS[event.type];
                    return (
                      <tr key={event.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)", borderLeft: event.severity === "high" ? "3px solid #ef4444" : "3px solid transparent" }}>
                        <td className="px-5 py-3"><div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" style={{ color: "var(--gf-text-secondary)" }} /><span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{event.timestamp}</span></div></td>
                        <td className="px-5 py-3"><div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" style={{ color: sevColor.text }} /><span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{event.type}</span></div></td>
                        <td className="px-5 py-3 text-sm" style={{ color: "var(--gf-text-primary)" }}>{event.actor}</td>
                        <td className="px-5 py-3 text-sm max-w-[180px] truncate" style={{ color: "var(--gf-text-secondary)" }}>{event.details}</td>
                        <td className="px-5 py-3"><span className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize" style={{ backgroundColor: sevColor.bg, color: sevColor.text }}>{event.severity}</span></td>
                        <td className="px-5 py-3"><span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{event.status}</span></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewSecEvent(event)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-accent)" }} title="View Details"><Eye className="h-4 w-4" /></button>
                            {event.status === "Open" && (
                              <button onClick={() => handleSecStatusChange(event.id, "Acknowledged")} className="rounded-lg p-1.5 hover:opacity-70 text-amber-500" title="Acknowledge"><CheckCircle2 className="h-4 w-4" /></button>
                            )}
                            {event.status !== "Resolved" && (
                              <button onClick={() => handleSecStatusChange(event.id, "Resolved")} className="rounded-lg p-1.5 hover:opacity-70 text-green-500" title="Resolve"><CheckCircle className="h-4 w-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination current={secSafePage} total={secTotalPages} onChange={setSecPage} />
          </div>
        </>
      )}

      {/* ===================== COMPLIANCE TAB ===================== */}
      {activeTab === "compliance" && (
        <>
          {/* Risk Assessment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Data Protection", score: 96, status: "Compliant" },
              { name: "Access Control", score: 98, status: "Compliant" },
              { name: "Incident Response", score: 88, status: "Needs Review" },
            ].map((r) => (
              <div key={r.name} className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{r.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: r.score >= 95 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: r.score >= 95 ? "#22c55e" : "#f59e0b" }}>{r.status}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{r.score}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <div className="h-full rounded-full" style={{ width: `${r.score}%`, backgroundColor: r.score >= 95 ? "#22c55e" : r.score >= 80 ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Reports Grid */}
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Compliance Reports</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => {
              const sc = STATUS_COLORS[report.status];
              const isGenerated = report.status === "Generated";
              return (
                <div key={report.id} className="flex flex-col rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                        <Shield className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{report.name}</p>
                        <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{report.date}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button onClick={() => setOpenActionId(openActionId === report.id ? null : report.id)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><MoreHorizontal className="h-4 w-4" /></button>
                      {openActionId === report.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                          <div className="absolute right-0 top-7 z-50 w-40 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                            <button onClick={() => { setViewReport(report); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Details</button>
                            {isGenerated && (
                              <button onClick={() => { handleDownloadReport(report); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Download className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Download</button>
                            )}
                            <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                            <button onClick={() => { setDeleteReport(report); setOpenActionId(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" />Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{report.status}</span>
                    <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{report.type}</span>
                    {isGenerated && <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{report.size}</span>}
                  </div>
                  {isGenerated && report.score > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "var(--gf-text-secondary)" }}>Score</span>
                        <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{report.score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                        <div className="h-full rounded-full" style={{ width: `${report.score}%`, backgroundColor: report.score >= 95 ? "#22c55e" : "#f59e0b" }} />
                      </div>
                    </div>
                  )}
                  <button onClick={() => isGenerated ? handleDownloadReport(report) : undefined} disabled={!isGenerated} className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                    <Download className="h-3.5 w-3.5" />
                    {report.status === "Pending" ? "Generating..." : report.status === "Failed" ? "Generation Failed" : "Download Report"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===================== MODALS ===================== */}
      {viewAuditEvent && <AuditDetailPanel event={viewAuditEvent} onClose={() => setViewAuditEvent(null)} />}
      {viewSecEvent && <SecurityDetailPanel event={viewSecEvent} onClose={() => setViewSecEvent(null)} onStatusChange={handleSecStatusChange} />}
      {viewReport && <ReportDetailModal report={viewReport} onClose={() => setViewReport(null)} />}
      {generateModal && <GenerateReportModal onGenerate={handleGenerateReport} onCancel={() => setGenerateModal(false)} />}
      {deleteReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleteReport(null)}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Delete Report</h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>Delete <strong style={{ color: "var(--gf-text-primary)" }}>{deleteReport.name}</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteReport(null)} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button onClick={handleDeleteReport} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
