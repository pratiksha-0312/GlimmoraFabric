"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  channel: "email" | "sms" | "push" | "in-app";
  category: "security" | "billing" | "system" | "team" | "onboarding" | "marketing";
  status: "active" | "draft" | "archived";
  lastEdited: string;
  editedBy: string;
  version: number;
  usageCount: number;
}

type SortField = "name" | "channel" | "category" | "lastEdited" | "status";
type SortDir = "asc" | "desc";

// ============================================================================
// SAMPLE DATA
// ============================================================================

const _UNUSED: NotificationTemplate[] = [
  { id: "tpl-001", name: "Welcome Email", subject: "Welcome to {{tenant_name}}!", channel: "email", category: "onboarding", status: "active", lastEdited: "2026-04-07 14:30", editedBy: "Vanshika Keswani", version: 3, usageCount: 1245 },
  { id: "tpl-002", name: "Password Reset", subject: "Reset your password", channel: "email", category: "security", status: "active", lastEdited: "2026-04-06 10:15", editedBy: "Vanshika Keswani", version: 5, usageCount: 890 },
  { id: "tpl-003", name: "Invoice Generated", subject: "Your invoice #{{invoice_id}} is ready", channel: "email", category: "billing", status: "active", lastEdited: "2026-04-05 16:45", editedBy: "Pratiksha M.", version: 2, usageCount: 3420 },
  { id: "tpl-004", name: "Two-Factor Code", subject: "Your verification code: {{code}}", channel: "sms", category: "security", status: "active", lastEdited: "2026-04-04 09:00", editedBy: "Vanshika Keswani", version: 1, usageCount: 5670 },
  { id: "tpl-005", name: "New Login Alert", subject: "New sign-in detected", channel: "push", category: "security", status: "active", lastEdited: "2026-04-03 11:20", editedBy: "Pratiksha M.", version: 2, usageCount: 2100 },
  { id: "tpl-006", name: "Task Assigned", subject: "You have a new task: {{task_name}}", channel: "in-app", category: "team", status: "active", lastEdited: "2026-04-02 15:30", editedBy: "Vanshika Keswani", version: 4, usageCount: 4500 },
  { id: "tpl-007", name: "Payment Failed", subject: "Payment failed for subscription", channel: "email", category: "billing", status: "active", lastEdited: "2026-04-01 08:10", editedBy: "Pratiksha M.", version: 3, usageCount: 320 },
  { id: "tpl-008", name: "Maintenance Window", subject: "Scheduled maintenance on {{date}}", channel: "email", category: "system", status: "draft", lastEdited: "2026-03-30 12:00", editedBy: "Vanshika Keswani", version: 1, usageCount: 0 },
  { id: "tpl-009", name: "Team Invitation", subject: "{{inviter}} invited you to join {{team}}", channel: "email", category: "team", status: "active", lastEdited: "2026-03-28 17:45", editedBy: "Pratiksha M.", version: 2, usageCount: 780 },
  { id: "tpl-010", name: "Usage Limit Warning", subject: "You've reached 80% of your {{resource}} limit", channel: "in-app", category: "system", status: "active", lastEdited: "2026-03-27 14:20", editedBy: "Vanshika Keswani", version: 1, usageCount: 156 },
  { id: "tpl-011", name: "Feature Announcement", subject: "New feature: {{feature_name}}", channel: "email", category: "marketing", status: "draft", lastEdited: "2026-03-25 10:00", editedBy: "Pratiksha M.", version: 1, usageCount: 0 },
  { id: "tpl-012", name: "Account Deactivation", subject: "Your account has been deactivated", channel: "email", category: "security", status: "archived", lastEdited: "2026-03-20 09:30", editedBy: "Vanshika Keswani", version: 2, usageCount: 45 },
  { id: "tpl-013", name: "Subscription Renewed", subject: "Subscription renewed successfully", channel: "email", category: "billing", status: "active", lastEdited: "2026-03-18 16:00", editedBy: "Pratiksha M.", version: 1, usageCount: 2300 },
  { id: "tpl-014", name: "OTP Verification", subject: "Your OTP is {{otp}}", channel: "sms", category: "security", status: "active", lastEdited: "2026-03-15 11:00", editedBy: "Vanshika Keswani", version: 1, usageCount: 8900 },
  { id: "tpl-015", name: "Weekly Digest", subject: "Your weekly activity summary", channel: "email", category: "system", status: "draft", lastEdited: "2026-03-12 13:30", editedBy: "Pratiksha M.", version: 1, usageCount: 0 },
];

const CHANNELS = ["email", "sms", "push", "in-app"] as const;
const CATEGORIES = ["security", "billing", "system", "team", "onboarding", "marketing"] as const;
const STATUSES = ["active", "draft", "archived"] as const;

const CHANNEL_ICONS: Record<string, typeof Mail> = { email: Mail, sms: Smartphone, push: Bell, "in-app": MessageSquare };
const CHANNEL_COLORS: Record<string, string> = { email: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", sms: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", push: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", "in-app": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
const STATUS_STYLES: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  active: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  draft: { icon: Clock, color: "text-amber-600 dark:text-amber-400" },
  archived: { icon: XCircle, color: "text-gray-500 dark:text-gray-400" },
};
const CATEGORY_COLORS: Record<string, string> = { security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", billing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", system: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", team: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", onboarding: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" };

const PAGE_SIZE = 8;

// ============================================================================
// COMPONENT
// ============================================================================

export function NotificationTemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("lastEdited");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/notification-templates");
        if (!res.ok) return;
        const data = (await res.json()) as NotificationTemplate[];
        setTemplates(data);
      } catch {
        // ignore
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let data = [...templates];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(t => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
    }
    if (channelFilter !== "all") data = data.filter(t => t.channel === channelFilter);
    if (categoryFilter !== "all") data = data.filter(t => t.category === categoryFilter);
    if (statusFilter !== "all") data = data.filter(t => t.status === statusFilter);
    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "lastEdited") return mul * a.lastEdited.localeCompare(b.lastEdited);
      return mul * String(a[sortField]).localeCompare(String(b[sortField]));
    });
    return data;
  }, [templates, search, channelFilter, categoryFilter, statusFilter, sortField, sortDir]);

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

  const handleDuplicate = (tpl: NotificationTemplate) => {
    const dup: NotificationTemplate = { ...tpl, id: `tpl-dup-${Date.now()}`, name: `${tpl.name} (Copy)`, status: "draft", version: 1, usageCount: 0, lastEdited: new Date().toISOString().slice(0, 16).replace("T", " "), editedBy: "You" };
    setTemplates(prev => [dup, ...prev]);
    setActionMenu(null);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setActionMenu(null);
  };

  const activeFilters = [channelFilter !== "all", categoryFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Notification Templates</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-muted)" }}>Manage and customize notification templates across all channels</p>
        </div>
        <button
          onClick={() => router.push("/notification-templates/new")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--gf-accent)" }}
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Templates", value: templates.length, icon: FileText },
          { label: "Active", value: templates.filter(t => t.status === "active").length, icon: CheckCircle2 },
          { label: "Drafts", value: templates.filter(t => t.status === "draft").length, icon: Clock },
          { label: "Total Sent", value: templates.reduce((s, t) => s + t.usageCount, 0).toLocaleString(), icon: Mail },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" style={{ color: "var(--gf-accent)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</span>
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search templates by name or subject..."
            className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none transition-colors"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} /></button>}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <Filter className="w-4 h-4" /> Filters {activeFilters > 0 && <span className="rounded-full px-1.5 text-xs text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{activeFilters}</span>}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          {[
            { label: "Channel", value: channelFilter, set: setChannelFilter, options: CHANNELS },
            { label: "Category", value: categoryFilter, set: setCategoryFilter, options: CATEGORIES },
            { label: "Status", value: statusFilter, set: setStatusFilter, options: STATUSES },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{f.label}</label>
              <select
                value={f.value}
                onChange={e => { f.set(e.target.value); setPage(1); }}
                className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
              >
                <option value="all">All</option>
                {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => { setChannelFilter("all"); setCategoryFilter("all"); setStatusFilter("all"); }} className="self-end text-xs underline" style={{ color: "var(--gf-accent)" }}>Clear all</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--gf-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--gf-bg-surface)" }}>
              {([["name", "Template Name"], ["channel", "Channel"], ["category", "Category"], ["status", "Status"], ["lastEdited", "Last Edited"]] as [SortField, string][]).map(([field, label]) => (
                <th key={field} className="px-4 py-3 text-left font-medium cursor-pointer select-none" style={{ color: "var(--gf-text-muted)" }} onClick={() => toggleSort(field)}>
                  <span className="inline-flex items-center gap-1">{label} <SortIcon field={field} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--gf-text-muted)" }}>Sent</th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--gf-text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: "var(--gf-text-muted)" }}>No templates found.</td></tr>
            ) : paginated.map(tpl => {
              const ChIcon = CHANNEL_ICONS[tpl.channel];
              const st = STATUS_STYLES[tpl.status];
              const StIcon = st.icon;
              return (
                <tr key={tpl.id} className="border-t transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" style={{ borderColor: "var(--gf-border)" }}>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{tpl.name}</span>
                      <p className="text-xs mt-0.5 truncate max-w-[280px]" style={{ color: "var(--gf-text-muted)" }}>{tpl.subject}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_COLORS[tpl.channel]}`}>
                      <ChIcon className="w-3 h-3" /> {tpl.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[tpl.category]}`}>{tpl.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${st.color}`}><StIcon className="w-3.5 h-3.5" /> {tpl.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{tpl.lastEdited}</span>
                    <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>by {tpl.editedBy}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{tpl.usageCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setActionMenu(actionMenu === tpl.id ? null : tpl.id)} className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                        <MoreVertical className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
                      </button>
                      {actionMenu === tpl.id && (
                        <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border shadow-lg py-1" style={{ backgroundColor: "var(--gf-bg-elevated)", borderColor: "var(--gf-border)" }}>
                          <button onClick={() => { router.push(`/notification-templates/${tpl.id}`); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                          <button onClick={() => { router.push(`/notification-templates/${tpl.id}?preview=true`); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Eye className="w-3.5 h-3.5" /> Preview</button>
                          <button onClick={() => handleDuplicate(tpl)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Copy className="w-3.5 h-3.5" /> Duplicate</button>
                          <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                          <button onClick={() => handleDelete(tpl.id)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
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
    </div>
  );
}
