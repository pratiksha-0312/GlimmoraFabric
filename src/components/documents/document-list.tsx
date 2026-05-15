"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  PenTool,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  File,
  Loader2,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ============================================================================
// TYPES
// ============================================================================

interface Document {
  id: string;
  name: string;
  templateName: string;
  tenant: string;
  status: "generated" | "pending_sign" | "signed" | "expired";
  format: string;
  size: string;
  createdBy: string;
  createdAt: string;
  signedAt: string | null;
  signedBy: string | null;
}

type SortField = "name" | "templateName" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const STATUSES = ["generated", "pending_sign", "signed", "expired"] as const;

const STATUS_STYLES: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  generated: { icon: FileText, color: "text-blue-600 dark:text-blue-400", label: "Generated" },
  pending_sign: { icon: Clock, color: "text-amber-600 dark:text-amber-400", label: "Pending Sign" },
  signed: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", label: "Signed" },
  expired: { icon: XCircle, color: "text-red-500 dark:text-red-400", label: "Expired" },
};

const PAGE_SIZE = 8;

// ============================================================================
// COMPONENT
// ============================================================================

export function DocumentListPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/documents");
      if (!resp.ok) throw new Error("Failed to load");
      const data = (await resp.json()) as Document[];
      setDocuments(data);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => {
    let data = [...documents];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(d => d.name.toLowerCase().includes(q) || d.templateName.toLowerCase().includes(q) || d.tenant.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") data = data.filter(d => d.status === statusFilter);
    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "createdAt") return mul * a.createdAt.localeCompare(b.createdAt);
      return mul * String(a[sortField]).localeCompare(String(b[sortField]));
    });
    return data;
  }, [documents, search, statusFilter, sortField, sortDir]);

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

  const handleDownload = async (doc: Document) => {
    setDownloading(doc.id);
    setActionMenu(null);
    try {
      const resp = await fetch(`/api/documents/${doc.id}/download`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const disp = resp.headers.get("content-disposition") || "";
      const filenameMatch = disp.match(/filename="?([^";]+)"?/i);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameMatch?.[1] ?? `${doc.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("download failed", err);
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <AuthGuard allowedRoles={["tenant_member"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Document Library</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-muted)" }}>Browse, download, and manage your documents</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Documents", value: documents.length, icon: File },
            { label: "Pending Signature", value: documents.filter(d => d.status === "pending_sign").length, icon: AlertCircle },
            { label: "Signed", value: documents.filter(d => d.status === "signed").length, icon: CheckCircle2 },
            { label: "Expired", value: documents.filter(d => d.status === "expired").length, icon: XCircle },
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search documents by name, template, or tenant..."
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
            <Filter className="w-4 h-4" /> Filters {statusFilter !== "all" && <span className="rounded-full px-1.5 text-xs text-white" style={{ backgroundColor: "var(--gf-accent)" }}>1</span>}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Status</label>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
              >
                <option value="all">All</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
              </select>
            </div>
            <button onClick={() => setStatusFilter("all")} className="self-end text-xs underline" style={{ color: "var(--gf-accent)" }}>Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--gf-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--gf-bg-surface)" }}>
                {([["name", "Document"], ["templateName", "Template"], ["status", "Status"], ["createdAt", "Created"]] as [SortField, string][]).map(([field, label]) => (
                  <th key={field} className="px-4 py-3 text-left font-medium cursor-pointer select-none" style={{ color: "var(--gf-text-muted)" }} onClick={() => toggleSort(field)}>
                    <span className="inline-flex items-center gap-1">{label} <SortIcon field={field} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--gf-text-muted)" }}>Size</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--gf-text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--gf-text-muted)" }}><Loader2 className="inline w-4 h-4 animate-spin mr-2" />Loading documents...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--gf-text-muted)" }}>No documents found.</td></tr>
              ) : paginated.map(doc => {
                const st = STATUS_STYLES[doc.status];
                const StIcon = st.icon;
                return (
                  <tr key={doc.id} className="border-t transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{doc.name}</span>
                        <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{doc.tenant}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{doc.templateName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${st.color}`}><StIcon className="w-3.5 h-3.5" /> {st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{formatDate(doc.createdAt)}</span>
                      <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>by {doc.createdBy}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{doc.size}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setActionMenu(actionMenu === doc.id ? null : doc.id)} className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <MoreVertical className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
                        </button>
                        {actionMenu === doc.id && (
                          <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border shadow-lg py-1" style={{ backgroundColor: "var(--gf-bg-elevated)", borderColor: "var(--gf-border)" }}>
                            <button onClick={() => { router.push(`/documents/${doc.id}`); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Eye className="w-3.5 h-3.5" /> Preview</button>
                            <button onClick={() => handleDownload(doc)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                              {downloading === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Download PDF
                            </button>
                            {(doc.status === "generated" || doc.status === "pending_sign") && (
                              <button onClick={() => { router.push(`/documents/${doc.id}/sign`); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><PenTool className="w-3.5 h-3.5" /> Request Signature</button>
                            )}
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
    </AuthGuard>
  );
}
