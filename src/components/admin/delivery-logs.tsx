"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  FileJson,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Send,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface DeliveryLog {
  id: string;
  templateName: string;
  templateId: string;
  channel: "email" | "sms" | "push" | "in-app";
  recipient: string;
  subject: string;
  status: "delivered" | "failed" | "pending" | "bounced" | "opened";
  sentAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  errorMessage: string | null;
  attempts: number;
  tenant: string;
  triggeredBy: string;
}

type SortField = "sentAt" | "templateName" | "channel" | "status" | "recipient";
type SortDir = "asc" | "desc";

// ============================================================================
// SAMPLE DATA
// ============================================================================

const _UNUSED_SAMPLE_LOGS: DeliveryLog[] = [
  { id: "dl-001", templateName: "Welcome Email", templateId: "tpl-001", channel: "email", recipient: "rahul.sharma@acme.com", subject: "Welcome to Acme Corp!", status: "delivered", sentAt: "2026-04-07 14:32:10", deliveredAt: "2026-04-07 14:32:12", openedAt: "2026-04-07 14:45:22", errorMessage: null, attempts: 1, tenant: "Acme Corp", triggeredBy: "System" },
  { id: "dl-002", templateName: "Password Reset", templateId: "tpl-002", channel: "email", recipient: "priya@diamondcorp.com", subject: "Reset your password", status: "delivered", sentAt: "2026-04-07 14:28:05", deliveredAt: "2026-04-07 14:28:08", openedAt: "2026-04-07 14:30:11", errorMessage: null, attempts: 1, tenant: "Diamond Corp", triggeredBy: "User Request" },
  { id: "dl-003", templateName: "Two-Factor Code", templateId: "tpl-004", channel: "sms", recipient: "+91 98765 43210", subject: "OTP: 483920", status: "delivered", sentAt: "2026-04-07 14:15:00", deliveredAt: "2026-04-07 14:15:03", openedAt: null, errorMessage: null, attempts: 1, tenant: "Acme Corp", triggeredBy: "Auth System" },
  { id: "dl-004", templateName: "Invoice Generated", templateId: "tpl-003", channel: "email", recipient: "billing@techstart.io", subject: "Your invoice #INV-2026-0892 is ready", status: "failed", sentAt: "2026-04-07 13:55:30", deliveredAt: null, openedAt: null, errorMessage: "SMTP error: 550 Mailbox not found", attempts: 3, tenant: "TechStart", triggeredBy: "Billing System" },
  { id: "dl-005", templateName: "New Login Alert", templateId: "tpl-005", channel: "push", recipient: "vanshika@glimmora.com", subject: "New sign-in detected", status: "delivered", sentAt: "2026-04-07 13:42:15", deliveredAt: "2026-04-07 13:42:16", openedAt: null, errorMessage: null, attempts: 1, tenant: "GlimmoraCorp", triggeredBy: "Security System" },
  { id: "dl-006", templateName: "Task Assigned", templateId: "tpl-006", channel: "in-app", recipient: "dev@glimmora.com", subject: "New task: Review PR #142", status: "delivered", sentAt: "2026-04-07 13:30:00", deliveredAt: "2026-04-07 13:30:01", openedAt: "2026-04-07 13:35:10", errorMessage: null, attempts: 1, tenant: "GlimmoraCorp", triggeredBy: "Vanshika K." },
  { id: "dl-007", templateName: "Payment Failed", templateId: "tpl-007", channel: "email", recipient: "admin@novatech.com", subject: "Payment failed for subscription", status: "bounced", sentAt: "2026-04-07 12:20:00", deliveredAt: null, openedAt: null, errorMessage: "Hard bounce: address does not exist", attempts: 1, tenant: "NovaTech", triggeredBy: "Billing System" },
  { id: "dl-008", templateName: "Team Invitation", templateId: "tpl-009", channel: "email", recipient: "newuser@example.com", subject: "Vanshika invited you to join GlimmoraCorp", status: "pending", sentAt: "2026-04-07 12:10:00", deliveredAt: null, openedAt: null, errorMessage: null, attempts: 0, tenant: "GlimmoraCorp", triggeredBy: "Vanshika K." },
  { id: "dl-009", templateName: "Welcome Email", templateId: "tpl-001", channel: "email", recipient: "amit.p@diamondcorp.com", subject: "Welcome to Diamond Corp!", status: "opened", sentAt: "2026-04-07 11:50:00", deliveredAt: "2026-04-07 11:50:03", openedAt: "2026-04-07 12:15:00", errorMessage: null, attempts: 1, tenant: "Diamond Corp", triggeredBy: "System" },
  { id: "dl-010", templateName: "OTP Verification", templateId: "tpl-014", channel: "sms", recipient: "+91 91234 56789", subject: "OTP: 291847", status: "failed", sentAt: "2026-04-07 11:30:00", deliveredAt: null, openedAt: null, errorMessage: "Carrier rejected: invalid number format", attempts: 2, tenant: "Acme Corp", triggeredBy: "Auth System" },
  { id: "dl-011", templateName: "Usage Limit Warning", templateId: "tpl-010", channel: "in-app", recipient: "admin@acme.com", subject: "You've reached 80% of your API limit", status: "delivered", sentAt: "2026-04-07 10:00:00", deliveredAt: "2026-04-07 10:00:01", openedAt: null, errorMessage: null, attempts: 1, tenant: "Acme Corp", triggeredBy: "Usage Monitor" },
  { id: "dl-012", templateName: "Subscription Renewed", templateId: "tpl-013", channel: "email", recipient: "finance@acme.com", subject: "Subscription renewed successfully", status: "delivered", sentAt: "2026-04-06 09:00:00", deliveredAt: "2026-04-06 09:00:05", openedAt: "2026-04-06 10:22:00", errorMessage: null, attempts: 1, tenant: "Acme Corp", triggeredBy: "Billing System" },
  { id: "dl-013", templateName: "New Login Alert", templateId: "tpl-005", channel: "push", recipient: "pratiksha@glimmora.com", subject: "New sign-in detected", status: "delivered", sentAt: "2026-04-06 08:30:00", deliveredAt: "2026-04-06 08:30:02", openedAt: null, errorMessage: null, attempts: 1, tenant: "GlimmoraCorp", triggeredBy: "Security System" },
  { id: "dl-014", templateName: "Invoice Generated", templateId: "tpl-003", channel: "email", recipient: "billing@diamondcorp.com", subject: "Your invoice #INV-2026-0891 is ready", status: "delivered", sentAt: "2026-04-05 16:00:00", deliveredAt: "2026-04-05 16:00:04", openedAt: "2026-04-05 17:10:00", errorMessage: null, attempts: 1, tenant: "Diamond Corp", triggeredBy: "Billing System" },
  { id: "dl-015", templateName: "Password Reset", templateId: "tpl-002", channel: "email", recipient: "test@invalid-domain.xyz", subject: "Reset your password", status: "bounced", sentAt: "2026-04-05 14:20:00", deliveredAt: null, openedAt: null, errorMessage: "DNS resolution failed for domain", attempts: 1, tenant: "TechStart", triggeredBy: "User Request" },
];

const CHANNELS = ["email", "sms", "push", "in-app"] as const;
const STATUSES = ["delivered", "failed", "pending", "bounced", "opened"] as const;
const CHANNEL_ICONS: Record<string, typeof Mail> = { email: Mail, sms: Smartphone, push: Bell, "in-app": MessageSquare };
const CHANNEL_COLORS: Record<string, string> = { email: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", sms: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", push: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", "in-app": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  delivered: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  failed: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
  pending: { icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  bounced: { icon: AlertTriangle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
  opened: { icon: Eye, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
};

const PAGE_SIZE = 8;

// ============================================================================
// COMPONENT
// ============================================================================

export function DeliveryLogsPage() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("sentAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedLog, setSelectedLog] = useState<DeliveryLog | null>(null);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/notifications/delivery-logs");
      if (!res.ok) return;
      const data = (await res.json()) as DeliveryLog[];
      setLogs(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = useMemo(() => {
    let data = [...logs];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(l => l.templateName.toLowerCase().includes(q) || l.recipient.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q));
    }
    if (channelFilter !== "all") data = data.filter(l => l.channel === channelFilter);
    if (statusFilter !== "all") data = data.filter(l => l.status === statusFilter);
    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      return mul * String(a[sortField]).localeCompare(String(b[sortField]));
    });
    return data;
  }, [logs, search, channelFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  const stats = useMemo(() => ({
    total: logs.length,
    delivered: logs.filter(l => l.status === "delivered" || l.status === "opened").length,
    failed: logs.filter(l => l.status === "failed" || l.status === "bounced").length,
    pending: logs.filter(l => l.status === "pending").length,
    openRate: Math.round((logs.filter(l => l.status === "opened").length / Math.max(1, logs.filter(l => l.status === "delivered" || l.status === "opened").length)) * 100),
  }), [logs]);

  const activeFilters = [channelFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Delivery Logs</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-muted)" }}>Track notification delivery status across all channels</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadLogs} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Sent", value: stats.total, icon: Send, color: "var(--gf-accent)" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle2, color: "#059669" },
          { label: "Failed", value: stats.failed, icon: XCircle, color: "#dc2626" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "#d97706" },
          { label: "Open Rate", value: `${stats.openRate}%`, icon: Eye, color: "#2563eb" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</span>
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by template, recipient, or subject..." className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)", backgroundColor: "var(--gf-bg-surface)" }}>
          <Filter className="w-4 h-4" /> Filters {activeFilters > 0 && <span className="rounded-full px-1.5 text-xs text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{activeFilters}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Channel</label>
            <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="all">All</option>
              {CHANNELS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="all">All</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <button onClick={() => { setChannelFilter("all"); setStatusFilter("all"); }} className="self-end text-xs underline" style={{ color: "var(--gf-accent)" }}>Clear all</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--gf-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--gf-bg-surface)" }}>
              {([["sentAt", "Sent At"], ["templateName", "Template"], ["channel", "Channel"], ["recipient", "Recipient"], ["status", "Status"]] as [SortField, string][]).map(([field, label]) => (
                <th key={field} className="px-4 py-3 text-left font-medium cursor-pointer select-none" style={{ color: "var(--gf-text-muted)" }} onClick={() => toggleSort(field)}>
                  <span className="inline-flex items-center gap-1">{label} <SortIcon field={field} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--gf-text-muted)" }}>Attempts</th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--gf-text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: "var(--gf-text-muted)" }}>No delivery logs found.</td></tr>
            ) : paginated.map(log => {
              const ChIcon = CHANNEL_ICONS[log.channel];
              const st = STATUS_CONFIG[log.status];
              const StIcon = st.icon;
              return (
                <tr key={log.id} className="border-t transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" style={{ borderColor: "var(--gf-border)" }}>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{log.sentAt}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-xs" style={{ color: "var(--gf-text-primary)" }}>{log.templateName}</span>
                    <p className="text-xs truncate max-w-[200px]" style={{ color: "var(--gf-text-muted)" }}>{log.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_COLORS[log.channel]}`}>
                      <ChIcon className="w-3 h-3" /> {log.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: "var(--gf-text-primary)" }}>{log.recipient}</span>
                    <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{log.tenant}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.color} ${st.bg}`}>
                      <StIcon className="w-3 h-3" /> {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{log.attempts}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedLog(log)} className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5" title="View details">
                        <Eye className="w-3.5 h-3.5" style={{ color: "var(--gf-text-muted)" }} />
                      </button>
                      {(log.status === "failed" || log.status === "bounced") && (
                        <button className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5" title="Retry">
                          <RotateCcw className="w-3.5 h-3.5" style={{ color: "var(--gf-text-muted)" }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
        <div className="flex items-center gap-1">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border p-1.5 disabled:opacity-40" style={{ borderColor: "var(--gf-border)" }}><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors" style={page === i + 1 ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { color: "var(--gf-text-secondary)" }}>{i + 1}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border p-1.5 disabled:opacity-40" style={{ borderColor: "var(--gf-border)" }}><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-md shadow-xl overflow-y-auto" style={{ backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="sticky top-0 p-4 border-b flex items-center justify-between" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Delivery Details</h2>
              <button onClick={() => setSelectedLog(null)} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5"><X className="w-5 h-5" style={{ color: "var(--gf-text-muted)" }} /></button>
            </div>
            <div className="p-4 space-y-4">
              {([
                ["Template", selectedLog.templateName],
                ["Subject", selectedLog.subject],
                ["Channel", selectedLog.channel],
                ["Recipient", selectedLog.recipient],
                ["Tenant", selectedLog.tenant],
                ["Triggered By", selectedLog.triggeredBy],
                ["Sent At", selectedLog.sentAt],
                ["Delivered At", selectedLog.deliveredAt || "—"],
                ["Opened At", selectedLog.openedAt || "—"],
                ["Attempts", String(selectedLog.attempts)],
                ["Status", selectedLog.status],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <span className="text-xs font-medium block mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{label}</span>
                  <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{val}</span>
                </div>
              ))}
              {selectedLog.errorMessage && (
                <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "rgba(220,38,38,0.05)" }}>
                  <span className="text-xs font-medium block mb-1 text-red-600">Error</span>
                  <span className="text-sm text-red-700 dark:text-red-400">{selectedLog.errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
