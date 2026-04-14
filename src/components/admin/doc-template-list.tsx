"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
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
  History,
  BarChart3,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ============================================================================
// TYPES
// ============================================================================

interface DocTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  status: "published" | "draft" | "archived";
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

type SortField = "name" | "type" | "status" | "updatedAt" | "usageCount";
type SortDir = "asc" | "desc";

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_TEMPLATES: DocTemplate[] = [
  { id: "dt-001", name: "Invoice Template", description: "Standard invoice for all tenants", type: "invoice", format: "html", status: "published", version: 3, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-04-07T14:30:00Z", usageCount: 1245 },
  { id: "dt-002", name: "NDA Agreement", description: "Non-disclosure agreement template", type: "legal", format: "html", status: "published", version: 5, createdBy: "Vanshika Keswani", updatedBy: "Pratiksha M.", createdAt: "2026-02-10T09:00:00Z", updatedAt: "2026-04-05T16:45:00Z", usageCount: 890 },
  { id: "dt-003", name: "Certificate of Completion", description: "Training completion certificate", type: "certificate", format: "html", status: "published", version: 2, createdBy: "Pratiksha M.", updatedBy: "Pratiksha M.", createdAt: "2026-03-01T11:00:00Z", updatedAt: "2026-04-03T11:20:00Z", usageCount: 3420 },
  { id: "dt-004", name: "Service Contract", description: "Standard service agreement", type: "contract", format: "html", status: "published", version: 4, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2026-01-20T08:00:00Z", updatedAt: "2026-04-01T08:10:00Z", usageCount: 670 },
  { id: "dt-005", name: "Receipt Template", description: "Payment receipt for transactions", type: "receipt", format: "html", status: "published", version: 1, createdBy: "Pratiksha M.", updatedBy: "Pratiksha M.", createdAt: "2026-03-25T14:00:00Z", updatedAt: "2026-03-25T14:00:00Z", usageCount: 5200 },
  { id: "dt-006", name: "Employment Offer Letter", description: "Job offer letter template", type: "legal", format: "html", status: "draft", version: 1, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-04-05T10:00:00Z", usageCount: 0 },
  { id: "dt-007", name: "Monthly Report", description: "Monthly business report template", type: "report", format: "html", status: "draft", version: 1, createdBy: "Pratiksha M.", updatedBy: "Pratiksha M.", createdAt: "2026-04-08T09:00:00Z", updatedAt: "2026-04-08T09:00:00Z", usageCount: 0 },
  { id: "dt-008", name: "Privacy Policy", description: "Standard privacy policy document", type: "legal", format: "html", status: "archived", version: 2, createdBy: "Vanshika Keswani", updatedBy: "Vanshika Keswani", createdAt: "2025-12-01T08:00:00Z", updatedAt: "2026-02-15T10:00:00Z", usageCount: 150 },
];

const TYPES = ["invoice", "legal", "certificate", "contract", "receipt", "report"] as const;
const STATUSES = ["published", "draft", "archived"] as const;

const TYPE_COLORS: Record<string, string> = {
  invoice: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  legal: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  certificate: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  contract: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  receipt: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  report: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const STATUS_STYLES: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  published: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  draft: { icon: Clock, color: "text-amber-600 dark:text-amber-400" },
  archived: { icon: XCircle, color: "text-gray-500 dark:text-gray-400" },
};

const PAGE_SIZE = 8;

// ============================================================================
// COMPONENT
// ============================================================================

export function DocTemplateListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [templates, setTemplates] = useState(SAMPLE_TEMPLATES);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = [...templates];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") data = data.filter(t => t.type === typeFilter);
    if (statusFilter !== "all") data = data.filter(t => t.status === statusFilter);
    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "usageCount") return mul * (a.usageCount - b.usageCount);
      if (sortField === "updatedAt") return mul * a.updatedAt.localeCompare(b.updatedAt);
      return mul * String(a[sortField]).localeCompare(String(b[sortField]));
    });
    return data;
  }, [templates, search, typeFilter, statusFilter, sortField, sortDir]);

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

  const handleDuplicate = (tpl: DocTemplate) => {
    const dup: DocTemplate = { ...tpl, id: `dt-dup-${Date.now()}`, name: `${tpl.name} (Copy)`, status: "draft", version: 1, usageCount: 0, updatedAt: new Date().toISOString(), updatedBy: "You" };
    setTemplates(prev => [dup, ...prev]);
    setActionMenu(null);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setActionMenu(null);
  };

  const activeFilters = [typeFilter !== "all", statusFilter !== "all"].filter(Boolean).length;
  const previewTemplate = previewId ? templates.find(t => t.id === previewId) : null;

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <AuthGuard allowedRoles={["super_admin", "tenant_admin"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Document Templates</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-muted)" }}>Manage and create document templates for your organization</p>
          </div>
          <button
            onClick={() => router.push("/doc-templates/new")}
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
            { label: "Published", value: templates.filter(t => t.status === "published").length, icon: CheckCircle2 },
            { label: "Drafts", value: templates.filter(t => t.status === "draft").length, icon: Clock },
            { label: "Total Usage", value: templates.reduce((s, t) => s + t.usageCount, 0).toLocaleString(), icon: BarChart3 },
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
              placeholder="Search templates by name or description..."
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
              { label: "Type", value: typeFilter, set: setTypeFilter, options: TYPES },
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
            <button onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }} className="self-end text-xs underline" style={{ color: "var(--gf-accent)" }}>Clear all</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--gf-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--gf-bg-surface)" }}>
                {([["name", "Template Name"], ["type", "Type"], ["status", "Status"], ["updatedAt", "Last Updated"], ["usageCount", "Usage"]] as [SortField, string][]).map(([field, label]) => (
                  <th key={field} className="px-4 py-3 text-left font-medium cursor-pointer select-none" style={{ color: "var(--gf-text-muted)" }} onClick={() => toggleSort(field)}>
                    <span className="inline-flex items-center gap-1">{label} <SortIcon field={field} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--gf-text-muted)" }}>Version</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--gf-text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: "var(--gf-text-muted)" }}>No templates found.</td></tr>
              ) : paginated.map(tpl => {
                const st = STATUS_STYLES[tpl.status];
                const StIcon = st.icon;
                return (
                  <tr key={tpl.id} className="border-t transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{tpl.name}</span>
                        <p className="text-xs mt-0.5 truncate max-w-[280px]" style={{ color: "var(--gf-text-muted)" }}>{tpl.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[tpl.type] ?? "bg-gray-100 text-gray-700"}`}>{tpl.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${st.color}`}><StIcon className="w-3.5 h-3.5" /> {tpl.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{formatDate(tpl.updatedAt)}</span>
                      <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>by {tpl.updatedBy}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{tpl.usageCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-center" style={{ color: "var(--gf-text-secondary)" }}>v{tpl.version}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setActionMenu(actionMenu === tpl.id ? null : tpl.id)} className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <MoreVertical className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
                        </button>
                        {actionMenu === tpl.id && (
                          <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border shadow-lg py-1" style={{ backgroundColor: "var(--gf-bg-elevated)", borderColor: "var(--gf-border)" }}>
                            <button onClick={() => { router.push(`/doc-templates/${tpl.id}/edit`); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Pencil className="w-3.5 h-3.5" /> Edit Template</button>
                            <button onClick={() => { setPreviewId(tpl.id); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Eye className="w-3.5 h-3.5" /> Preview</button>
                            <button onClick={() => { router.push(`/doc-templates/${tpl.id}/versions`); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><History className="w-3.5 h-3.5" /> Version History</button>
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

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewId(null)}>
            <div className="w-full max-w-3xl max-h-[80vh] overflow-auto rounded-2xl border shadow-xl p-6" style={{ backgroundColor: "var(--gf-bg-elevated)", borderColor: "var(--gf-border)" }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{previewTemplate.name}</h2>
                  <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Preview (rendered) &middot; v{previewTemplate.version}</p>
                </div>
                <button onClick={() => setPreviewId(null)} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5"><X className="w-5 h-5" style={{ color: "var(--gf-text-muted)" }} /></button>
              </div>
              <div className="rounded-lg border p-6 prose prose-sm max-w-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                <div dangerouslySetInnerHTML={{ __html: (previewTemplate as DocTemplate & { content?: string }).content ?? `<p>Template preview for <strong>${previewTemplate.name}</strong></p><p>${previewTemplate.description}</p>` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
