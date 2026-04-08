"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Download,
  FileText,
  AlertTriangle,
  Activity,
  User,
  Globe,
  Monitor,
  ArrowRight,
  Calendar,
  FileJson,
  FileSpreadsheet,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorEmail: string;
  actorRole: string;
  action: "Created" | "Updated" | "Deleted" | "Accessed" | "Exported" | "Login" | "Logout" | "Permission Change" | "Config Change";
  entity: string;
  entityId: string;
  details: string;
  ip: string;
  userAgent: string;
  sessionId: string;
  isCritical: boolean;
  before: Record<string, string> | null;
  after: Record<string, string> | null;
}

type SortField = "timestamp" | "actor" | "action" | "entity";
type SortDir = "asc" | "desc";

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_LOGS: AuditLog[] = [
  { id: "al-001", timestamp: "2026-04-07 09:42:15", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Updated", entity: "User Role", entityId: "usr-012", details: "Changed role from Member to Admin for user Rahul Sharma", ip: "192.168.1.10", userAgent: "Chrome 126 / Windows 11", sessionId: "sess_a1b2c3d4", isCritical: false, before: { role: "Member", permissions: "read, write" }, after: { role: "Admin", permissions: "read, write, delete, manage" } },
  { id: "al-002", timestamp: "2026-04-07 09:38:22", actor: "System", actorEmail: "system@glimmora.com", actorRole: "system", action: "Created", entity: "API Token", entityId: "tok-089", details: "Auto-generated API token for VerifAI integration service", ip: "—", userAgent: "System Process", sessionId: "sys_auto", isCritical: false, before: null, after: { token: "tk_verifai_***", scopes: "read, webhook", expiry: "2026-07-07" } },
  { id: "al-003", timestamp: "2026-04-07 09:15:30", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Deleted", entity: "Team Member", entityId: "usr-007", details: "Removed user Amit Patel from tenant GlimmoraCorp", ip: "192.168.1.22", userAgent: "Firefox 127 / macOS", sessionId: "sess_d4e5f6g7", isCritical: false, before: { name: "Amit Patel", status: "Active", tenant: "GlimmoraCorp" }, after: { name: "Amit Patel", status: "Removed", tenant: "—" } },
  { id: "al-004", timestamp: "2026-04-07 08:58:00", actor: "System", actorEmail: "system@glimmora.com", actorRole: "system", action: "Login", entity: "Security", entityId: "sec-alert-44", details: "Failed login attempt detected from suspicious IP 45.33.12.89 — 5 attempts in 2 minutes", ip: "45.33.12.89", userAgent: "Unknown", sessionId: "sys_alert", isCritical: true, before: null, after: null },
  { id: "al-005", timestamp: "2026-04-07 08:30:11", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Config Change", entity: "MFA Policy", entityId: "cfg-mfa", details: "Updated MFA enforcement policy for all admin accounts", ip: "192.168.1.10", userAgent: "Chrome 126 / Windows 11", sessionId: "sess_g7h8i9j0", isCritical: false, before: { enforcement: "Optional", scope: "All Users" }, after: { enforcement: "Required", scope: "Admin Users" } },
  { id: "al-006", timestamp: "2026-04-07 08:12:45", actor: "Pratiksha M.", actorEmail: "pratiksha@glimmora.com", actorRole: "tenant_admin", action: "Created", entity: "Workflow", entityId: "wf-inv-001", details: "Created new invoice approval workflow with 3-step hierarchy", ip: "192.168.1.35", userAgent: "Chrome 126 / Linux", sessionId: "sess_j0k1l2m3", isCritical: false, before: null, after: { name: "invoice-approval-v1", steps: "3", approvers: "Manager → Finance → CFO" } },
  { id: "al-007", timestamp: "2026-04-06 23:45:20", actor: "System", actorEmail: "system@glimmora.com", actorRole: "system", action: "Config Change", entity: "Notification", entityId: "ntf-pay-fail", details: "Payment failure alert triggered for tenant Diamond Corp — invoice INV-2026-0892", ip: "—", userAgent: "System Process", sessionId: "sys_notify", isCritical: true, before: { paymentStatus: "Processing", amount: "$4,200" }, after: { paymentStatus: "Failed", reason: "Card declined" } },
  { id: "al-008", timestamp: "2026-04-06 22:20:00", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Created", entity: "Tenant", entityId: "tnt-diamond", details: "Onboarded Diamond Corp on Pro plan with 25-user license", ip: "192.168.1.10", userAgent: "Chrome 126 / Windows 11", sessionId: "sess_m3n4o5p6", isCritical: false, before: null, after: { tenant: "Diamond Corp", plan: "Pro", users: "25", region: "US-East" } },
  { id: "al-009", timestamp: "2026-04-06 21:55:33", actor: "Pratiksha M.", actorEmail: "pratiksha@glimmora.com", actorRole: "auditor", action: "Exported", entity: "Report", entityId: "rpt-soc2-q1", details: "Exported SOC2 compliance report for Q1 2026", ip: "192.168.1.48", userAgent: "Safari 18 / macOS", sessionId: "sess_p6q7r8s9", isCritical: false, before: null, after: { file: "soc2-q1-2026.pdf", format: "PDF", size: "2.4 MB" } },
  { id: "al-010", timestamp: "2026-04-06 18:30:00", actor: "System", actorEmail: "system@glimmora.com", actorRole: "system", action: "Accessed", entity: "API Gateway", entityId: "apigw-tk29", details: "Unusual API volume detected — token tk_29x hit 890 req/min (threshold: 100)", ip: "203.0.113.42", userAgent: "API Client v2.1", sessionId: "sys_alert", isCritical: true, before: { rate: "50 req/min", status: "Normal" }, after: { rate: "890 req/min", status: "Rate Limited" } },
  { id: "al-011", timestamp: "2026-04-06 16:20:10", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Accessed", entity: "Configuration", entityId: "cfg-secrets", details: "Viewed production secrets and environment variables page", ip: "192.168.1.22", userAgent: "Firefox 127 / macOS", sessionId: "sess_s9t0u1v2", isCritical: false, before: null, after: null },
  { id: "al-012", timestamp: "2026-04-06 14:00:45", actor: "Pratiksha M.", actorEmail: "pratiksha@glimmora.com", actorRole: "tenant_admin", action: "Updated", entity: "Workflow", entityId: "wf-pay-001", details: "Modified payment approval threshold from $500 to $1,000", ip: "192.168.1.55", userAgent: "Chrome 126 / Windows 11", sessionId: "sess_v2w3x4y5", isCritical: false, before: { threshold: "$500", autoApprove: "false" }, after: { threshold: "$1,000", autoApprove: "false" } },
  { id: "al-013", timestamp: "2026-04-06 11:30:22", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Permission Change", entity: "Role", entityId: "role-dev", details: "Added 'deploy' permission to Developer role across all tenants", ip: "192.168.1.10", userAgent: "Chrome 126 / Windows 11", sessionId: "sess_y5z6a7b8", isCritical: false, before: { permissions: "read, write, debug" }, after: { permissions: "read, write, debug, deploy" } },
  { id: "al-014", timestamp: "2026-04-06 09:15:00", actor: "System", actorEmail: "system@glimmora.com", actorRole: "system", action: "Login", entity: "Authentication", entityId: "auth-brute", details: "Brute-force protection activated — IP 182.73.22.11 blocked for 30 minutes", ip: "182.73.22.11", userAgent: "Unknown / Automated", sessionId: "sys_security", isCritical: true, before: { failedAttempts: "8", accountStatus: "Active" }, after: { failedAttempts: "8", accountStatus: "Locked (30min)" } },
  { id: "al-015", timestamp: "2026-04-05 17:45:00", actor: "Pratiksha M.", actorEmail: "pratiksha@glimmora.com", actorRole: "tenant_admin", action: "Created", entity: "User", entityId: "usr-new-15", details: "Invited new team member dev@glimmora.com as Developer", ip: "192.168.1.35", userAgent: "Chrome 126 / Linux", sessionId: "sess_c8d9e0f1", isCritical: false, before: null, after: { email: "dev@glimmora.com", role: "Developer", status: "Invited" } },
  { id: "al-016", timestamp: "2026-04-05 15:22:00", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Deleted", entity: "API Token", entityId: "tok-old-003", details: "Revoked expired staging API token for legacy integration", ip: "192.168.1.10", userAgent: "Chrome 126 / Windows 11", sessionId: "sess_g2h3i4j5", isCritical: false, before: { token: "tk_staging_***", status: "Expired", lastUsed: "2026-02-10" }, after: { token: "tk_staging_***", status: "Revoked" } },
  { id: "al-017", timestamp: "2026-04-05 12:00:00", actor: "System", actorEmail: "system@glimmora.com", actorRole: "system", action: "Exported", entity: "Data", entityId: "export-50k", details: "Large data export triggered — 50,000 records by non-admin user flagged for review", ip: "192.168.1.55", userAgent: "Chrome 126 / Windows 11", sessionId: "sys_flag", isCritical: true, before: null, after: { records: "50,000", format: "CSV", flagged: "true" } },
  { id: "al-018", timestamp: "2026-04-05 10:30:11", actor: "Vanshika Keswani", actorEmail: "vanshika@glimmora.com", actorRole: "super_admin", action: "Updated", entity: "Tenant", entityId: "tnt-acme", details: "Upgraded Acme Corp from Starter to Business plan", ip: "192.168.1.10", userAgent: "Chrome 126 / Windows 11", sessionId: "sess_k5l6m7n8", isCritical: false, before: { plan: "Starter", users: "10", storage: "5 GB" }, after: { plan: "Business", users: "50", storage: "50 GB" } },
  { id: "al-019", timestamp: "2026-04-05 08:00:00", actor: "Pratiksha M.", actorEmail: "pratiksha@glimmora.com", actorRole: "auditor", action: "Accessed", entity: "Audit Logs", entityId: "audit-access", details: "Accessed full audit log export for compliance review", ip: "192.168.1.48", userAgent: "Safari 18 / macOS", sessionId: "sess_o8p9q0r1", isCritical: false, before: null, after: null },
  { id: "al-020", timestamp: "2026-04-04 22:15:00", actor: "System", actorEmail: "system@glimmora.com", actorRole: "system", action: "Config Change", entity: "SSL Certificate", entityId: "ssl-renewal", details: "Auto-renewed SSL certificate for api.glimmora.com — expires 2027-04-04", ip: "—", userAgent: "System Process", sessionId: "sys_auto", isCritical: false, before: { expiry: "2026-04-10", issuer: "Let's Encrypt" }, after: { expiry: "2027-04-04", issuer: "Let's Encrypt" } },
];

const ALL_ACTIONS: AuditLog["action"][] = ["Created", "Updated", "Deleted", "Accessed", "Exported", "Login", "Logout", "Permission Change", "Config Change"];
const ALL_ENTITIES = [...new Set(SAMPLE_LOGS.map((l) => l.entity))].sort();
const ALL_ACTORS = [...new Set(SAMPLE_LOGS.map((l) => l.actor))].sort();

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  Created: { bg: "rgba(34,197,94,0.15)", text: "#22c55e" },
  Updated: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
  Deleted: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  Accessed: { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  Exported: { bg: "rgba(34,211,238,0.15)", text: "#22d3ee" },
  Login: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  Logout: { bg: "rgba(107,114,128,0.15)", text: "#6b7280" },
  "Permission Change": { bg: "rgba(249,115,22,0.15)", text: "#f97316" },
  "Config Change": { bg: "rgba(139,92,246,0.15)", text: "#8b5cf6" },
};

const PAGE_SIZE = 8;

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
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
        <span className="truncate">{selected?.label ?? value}</span>
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
// DETAIL DRAWER (slides in from right)
// ============================================================================

function AuditDetailDrawer({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const diffKeys = log.before || log.after
    ? [...new Set([...Object.keys(log.before ?? {}), ...Object.keys(log.after ?? {})])]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Drawer */}
      <div
        className="relative w-full max-w-[560px] h-full overflow-y-auto shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
              <FileText className="h-4.5 w-4.5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>Audit Log Detail</h2>
              <p className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{log.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Critical badge */}
          {log.isCritical && (
            <div className="flex items-center gap-2 rounded-lg p-3 bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Critical Event</span>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Clock className="h-3.5 w-3.5" />, label: "Timestamp", value: log.timestamp },
              { icon: <User className="h-3.5 w-3.5" />, label: "Actor", value: log.actor },
              { icon: <Activity className="h-3.5 w-3.5" />, label: "Action", value: log.action },
              { icon: <FileText className="h-3.5 w-3.5" />, label: "Entity", value: log.entity },
              { icon: <Globe className="h-3.5 w-3.5" />, label: "IP Address", value: log.ip },
              { icon: <Monitor className="h-3.5 w-3.5" />, label: "Session ID", value: log.sessionId },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--gf-text-muted)" }}>
                  {item.icon}
                  <p className="text-xs font-medium">{item.label}</p>
                </div>
                <p className="text-sm font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Actor details */}
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Actor Details</p>
            <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{log.actorEmail}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>Role: {log.actorRole}</p>
          </div>

          {/* User Agent */}
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>User Agent</p>
            <p className="text-sm font-mono" style={{ color: "var(--gf-text-secondary)" }}>{log.userAgent}</p>
          </div>

          {/* Details */}
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Description</p>
            <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{log.details}</p>
          </div>

          {/* Entity ID */}
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Entity ID</p>
            <p className="text-sm font-mono" style={{ color: "var(--gf-accent)" }}>{log.entityId}</p>
          </div>

          {/* ---- BEFORE / AFTER DIFF VIEWER ---- */}
          {diffKeys.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Changes (Before → After)</h4>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>Field</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>Before</th>
                      <th className="px-1 py-2.5 w-6"></th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffKeys.map((key) => {
                      const bv = log.before?.[key] ?? "—";
                      const av = log.after?.[key] ?? "—";
                      const changed = bv !== av;
                      return (
                        <tr key={key} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                          <td className="px-4 py-2.5 font-medium capitalize" style={{ color: "var(--gf-text-primary)" }}>{key}</td>
                          <td className="px-4 py-2.5">
                            <span className={`font-mono text-xs px-2 py-1 rounded ${changed ? "bg-red-500/10 text-red-400" : ""}`} style={!changed ? { color: "var(--gf-text-secondary)" } : undefined}>
                              {bv}
                            </span>
                          </td>
                          <td className="px-1 py-2.5 text-center">
                            {changed && <ArrowRight className="h-3.5 w-3.5 mx-auto" style={{ color: "var(--gf-text-muted)" }} />}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`font-mono text-xs px-2 py-1 rounded ${changed ? "bg-green-500/10 text-green-400" : ""}`} style={!changed ? { color: "var(--gf-text-secondary)" } : undefined}>
                              {av}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT DROPDOWN
// ============================================================================

function ExportDropdown({ onExport }: { onExport: (format: "csv" | "json") => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80"
        style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
      >
        <Download className="h-4 w-4" />Export<ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <button
              onClick={() => { onExport("csv"); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--gf-text-primary)" }}
            >
              <FileSpreadsheet className="h-4 w-4" style={{ color: "#22c55e" }} />Export as CSV
            </button>
            <button
              onClick={() => { onExport("json"); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--gf-text-primary)" }}
            >
              <FileJson className="h-4 w-4" style={{ color: "#3b82f6" }} />Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// TIMELINE VISUALIZATION
// ============================================================================

function TimelineView({ logs }: { logs: AuditLog[] }) {
  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, AuditLog[]> = {};
    for (const log of logs) {
      const date = log.timestamp.split(" ")[0];
      if (!map[date]) map[date] = [];
      map[date].push(log);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No events to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, events]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 rounded-full px-3 py-1 border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <Calendar className="h-3.5 w-3.5" style={{ color: "var(--gf-accent)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{date}</span>
            </div>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--gf-border)" }} />
            <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{events.length} event{events.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="relative ml-4 pl-6 border-l-2" style={{ borderColor: "var(--gf-border)" }}>
            {events.map((log, i) => {
              const ac = ACTION_COLORS[log.action] ?? { bg: "var(--gf-bg-elevated)", text: "var(--gf-text-primary)" };
              const time = log.timestamp.split(" ").slice(1).join(" ");
              return (
                <div key={log.id} className={`relative ${i < events.length - 1 ? "pb-5" : ""}`}>
                  {/* Dot on timeline */}
                  <div
                    className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2"
                    style={{
                      backgroundColor: log.isCritical ? "#ef4444" : ac.text,
                      borderColor: "var(--gf-bg-base)",
                    }}
                  />

                  <div className="rounded-xl border p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{time}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: ac.bg, color: ac.text }}>{log.action}</span>
                          {log.isCritical && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">Critical</span>
                          )}
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
                          <span style={{ color: "var(--gf-accent)" }}>{log.actor}</span>
                          {" → "}
                          {log.entity}
                        </p>
                        <p className="text-xs mt-1 truncate" style={{ color: "var(--gf-text-secondary)" }}>{log.details}</p>
                      </div>
                      <span className="text-xs shrink-0 font-mono" style={{ color: "var(--gf-text-muted)" }}>{log.ip}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PAGINATION
// ============================================================================

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
      <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {current} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current <= 1} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => onChange(n)} className={`h-7 w-7 rounded-lg text-xs font-medium ${n === current ? "text-white" : "hover:opacity-70"}`} style={n === current ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>
            {n}
          </button>
        ))}
        <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current >= total} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AuditLogViewer() {
  const { user } = useAuth();
  const userRole = user?.role ?? "tenant_member";
  const [view, setView] = useState<"table" | "timeline">("table");

  // Filters
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Detail drawer
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filtered + sorted data
  const filtered = useMemo(() => {
    let list = SAMPLE_LOGS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.actor.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q) ||
        l.actorEmail.toLowerCase().includes(q)
      );
    }
    if (actorFilter !== "All") list = list.filter((l) => l.actor === actorFilter);
    if (actionFilter !== "All") list = list.filter((l) => l.action === actionFilter);
    if (entityFilter !== "All") list = list.filter((l) => l.entity === entityFilter);
    if (criticalOnly) list = list.filter((l) => l.isCritical);

    // Sort
    list = [...list].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [search, actorFilter, actionFilter, entityFilter, criticalOnly, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Stats
  const totalEvents = SAMPLE_LOGS.length;
  const criticalCount = SAMPLE_LOGS.filter((l) => l.isCritical).length;
  const uniqueActors = new Set(SAMPLE_LOGS.map((l) => l.actor)).size;
  const todayCount = SAMPLE_LOGS.filter((l) => l.timestamp.startsWith("2026-04-07")).length;

  const hasFilters = search || actorFilter !== "All" || actionFilter !== "All" || entityFilter !== "All" || criticalOnly;

  const clearFilters = () => {
    setSearch(""); setActorFilter("All"); setActionFilter("All"); setEntityFilter("All"); setCriticalOnly(false); setPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  // Export handlers
  const handleExport = (format: "csv" | "json") => {
    const data = filtered;
    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === "csv") {
      const headers = "ID,Timestamp,Actor,Email,Role,Action,Entity,Entity ID,Details,IP,Critical";
      const rows = data.map((l) =>
        `"${l.id}","${l.timestamp}","${l.actor}","${l.actorEmail}","${l.actorRole}","${l.action}","${l.entity}","${l.entityId}","${l.details}","${l.ip}","${l.isCritical}"`
      );
      content = [headers, ...rows].join("\n");
      mimeType = "text/csv";
      filename = "audit-logs-export.csv";
    } else {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      filename = "audit-logs-export.json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Audit Log Viewer</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Browse, search, and export the complete audit trail</p>
        </div>
        {userRole === "auditor" && <ExportDropdown onExport={handleExport} />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Events", value: totalEvents.toLocaleString(), icon: <FileText className="h-5 w-5" /> },
          { label: "Critical Alerts", value: criticalCount.toString(), icon: <AlertTriangle className="h-5 w-5" /> },
          { label: "Unique Actors", value: uniqueActors.toString(), icon: <User className="h-5 w-5" /> },
          { label: "Today's Events", value: todayCount.toString(), icon: <Activity className="h-5 w-5" /> },
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

      {/* View Toggle + Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View toggle */}
          <div className="flex gap-1 rounded-lg p-1 shrink-0" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            {(["table", "timeline"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors capitalize ${view === v ? "text-white" : ""}`} style={view === v ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>
                {v}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by actor, entity, details, email..."
              className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shrink-0 ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`}
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}
          >
            <Filter className="h-4 w-4" />Filters{hasFilters && <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white" style={{ backgroundColor: "var(--gf-accent)" }}>!</span>}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Actor</label>
              <CustomSelect value={actorFilter} onChange={(v) => { setActorFilter(v); setPage(1); }} options={[{ label: "All Actors", value: "All" }, ...ALL_ACTORS.map((a) => ({ label: a, value: a }))]} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Action</label>
              <CustomSelect value={actionFilter} onChange={(v) => { setActionFilter(v); setPage(1); }} options={[{ label: "All Actions", value: "All" }, ...ALL_ACTIONS.map((a) => ({ label: a, value: a }))]} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Entity</label>
              <CustomSelect value={entityFilter} onChange={(v) => { setEntityFilter(v); setPage(1); }} options={[{ label: "All Entities", value: "All" }, ...ALL_ENTITIES.map((e) => ({ label: e, value: e }))]} />
            </div>
            <button
              onClick={() => { setCriticalOnly(!criticalOnly); setPage(1); }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${criticalOnly ? "ring-2 ring-red-500/40" : ""}`}
              style={{ borderColor: criticalOnly ? "#ef4444" : "var(--gf-border)", color: criticalOnly ? "#ef4444" : "var(--gf-text-primary)", backgroundColor: criticalOnly ? "rgba(239,68,68,0.1)" : "var(--gf-bg-base)" }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />Critical Only
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-400">
                <X className="h-3 w-3" />Clear All
              </button>
            )}
          </div>
        )}

        {hasFilters && (
          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filtered.length} of {SAMPLE_LOGS.length} events</p>
        )}
      </div>

      {/* ===================== TABLE VIEW ===================== */}
      {view === "table" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  {([
                    { label: "Timestamp", field: "timestamp" as SortField },
                    { label: "Actor", field: "actor" as SortField },
                    { label: "Action", field: "action" as SortField },
                    { label: "Entity", field: "entity" as SortField },
                  ]).map((col) => (
                    <th key={col.label} className="px-5 py-3 text-left font-medium">
                      <button onClick={() => toggleSort(col.field)} className="flex items-center gap-1.5 hover:opacity-70">
                        {col.label}<SortIcon field={col.field} />
                      </button>
                    </th>
                  ))}
                  <th className="px-5 py-3 text-left font-medium">Details</th>
                  <th className="px-5 py-3 text-left font-medium">IP</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                      <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No audit logs found</p>
                      <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : paged.map((log) => {
                  const ac = ACTION_COLORS[log.action] ?? { bg: "var(--gf-bg-elevated)", text: "var(--gf-text-primary)" };
                  return (
                    <tr
                      key={log.id}
                      className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      style={{ borderColor: "var(--gf-border)", borderLeft: log.isCritical ? "3px solid #ef4444" : "3px solid transparent" }}
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--gf-text-secondary)" }} />
                          <span className="text-xs whitespace-nowrap" style={{ color: "var(--gf-text-secondary)" }}>{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="text-sm font-medium" style={{ color: log.actor === "System" ? "var(--gf-text-secondary)" : "var(--gf-text-primary)" }}>{log.actor}</span>
                          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{log.actorRole}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: ac.bg, color: ac.text }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{log.entity}</span>
                          <p className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{log.entityId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm max-w-[220px] truncate" style={{ color: "var(--gf-text-secondary)" }}>{log.details}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{log.ip}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                          className="rounded-lg p-1.5 hover:opacity-70"
                          style={{ color: "var(--gf-accent)" }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination current={safePage} total={totalPages} onChange={setPage} />
        </div>
      )}

      {/* ===================== TIMELINE VIEW ===================== */}
      {view === "timeline" && <TimelineView logs={filtered} />}

      {/* ===================== DETAIL DRAWER ===================== */}
      {selectedLog && <AuditDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
