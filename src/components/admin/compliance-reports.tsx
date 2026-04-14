"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader,
} from "lucide-react";

// ============================================================================
// TYPES & DATA
// ============================================================================

interface ComplianceReport {
  id: string;
  name: string;
  type: "SOC2" | "GDPR" | "HIPAA" | "PCI-DSS" | "Security Assessment" | "Banking Audit" | "Custom";
  status: "Generated" | "Pending" | "Failed";
  date: string;
  size: string;
  findings: number;
  score: number;
  generatedBy: string;
  framework: string;
  period: string;
}

const REPORT_TYPES: ComplianceReport["type"][] = ["SOC2", "GDPR", "HIPAA", "PCI-DSS", "Security Assessment", "Banking Audit", "Custom"];
const FRAMEWORKS = ["SOC2 Type II", "GDPR Article 30", "HIPAA Security Rule", "PCI-DSS v4.0", "ISO 27001", "NIST CSF", "Custom Framework"];

const INITIAL_REPORTS: ComplianceReport[] = [
  { id: "cr-001", name: "SOC2 Type II - Q1 2026", type: "SOC2", status: "Generated", date: "2026-03-28", size: "2.4 MB", findings: 0, score: 98, generatedBy: "Vanshika Keswani", framework: "SOC2 Type II", period: "Jan–Mar 2026" },
  { id: "cr-002", name: "GDPR Data Processing Assessment", type: "GDPR", status: "Generated", date: "2026-03-25", size: "1.8 MB", findings: 2, score: 94, generatedBy: "Pratiksha M.", framework: "GDPR Article 30", period: "Q1 2026" },
  { id: "cr-003", name: "Banking Audit Q1 2026", type: "Banking Audit", status: "Pending", date: "2026-03-30", size: "—", findings: 0, score: 0, generatedBy: "System", framework: "Custom Framework", period: "Q1 2026" },
  { id: "cr-004", name: "Security Assessment - Annual", type: "Security Assessment", status: "Generated", date: "2026-03-20", size: "3.1 MB", findings: 1, score: 96, generatedBy: "Vanshika Keswani", framework: "NIST CSF", period: "2025-2026" },
  { id: "cr-005", name: "PCI-DSS Compliance v4.0", type: "PCI-DSS", status: "Generated", date: "2026-03-15", size: "1.5 MB", findings: 0, score: 100, generatedBy: "Pratiksha M.", framework: "PCI-DSS v4.0", period: "Q1 2026" },
  { id: "cr-006", name: "HIPAA Security Review", type: "HIPAA", status: "Failed", date: "2026-03-22", size: "—", findings: 0, score: 0, generatedBy: "System", framework: "HIPAA Security Rule", period: "Q1 2026" },
  { id: "cr-007", name: "ISO 27001 Internal Audit", type: "Custom", status: "Generated", date: "2026-02-28", size: "4.2 MB", findings: 3, score: 91, generatedBy: "Vanshika Keswani", framework: "ISO 27001", period: "Feb 2026" },
  { id: "cr-008", name: "GDPR Right to Erasure Audit", type: "GDPR", status: "Generated", date: "2026-02-15", size: "0.9 MB", findings: 0, score: 100, generatedBy: "Pratiksha M.", framework: "GDPR Article 30", period: "Jan–Feb 2026" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Generated: { bg: "rgba(34,197,94,0.15)", text: "#22c55e" },
  Pending: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  Failed: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  Generated: CheckCircle,
  Pending: Loader,
  Failed: XCircle,
};

const PAGE_SIZE = 6;

// ============================================================================
// CUSTOM SELECT
// ============================================================================

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm min-w-[160px] w-full outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--gf-text-muted)" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[160px] max-h-[240px] overflow-y-auto rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            {options.map((opt) => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`flex w-full items-center px-3 py-2 text-sm hover:bg-white/5 transition-colors ${opt.value === value ? "font-medium" : ""}`} style={{ color: opt.value === value ? "var(--gf-accent)" : "var(--gf-text-primary)" }}>
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
// GENERATE REPORT MODAL
// ============================================================================

function GenerateReportModal({ onGenerate, onCancel }: { onGenerate: (data: { name: string; type: ComplianceReport["type"]; framework: string; period: string }) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ComplianceReport["type"]>("SOC2");
  const [framework, setFramework] = useState("SOC2 Type II");
  const [period, setPeriod] = useState("Q1 2026");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Report name is required"); return; }
    onGenerate({ name, type, framework, period });
  };

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
            <Shield className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Generate Compliance Report</h2>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Create a new compliance report from available data</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Report Name *</label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="e.g. SOC2 Type II Q2 2026" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Report Type</label>
              <CustomSelect value={type} onChange={(v) => setType(v as ComplianceReport["type"])} options={REPORT_TYPES.map((t) => ({ label: t, value: t }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Framework</label>
              <CustomSelect value={framework} onChange={setFramework} options={FRAMEWORKS.map((f) => ({ label: f, value: f }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Reporting Period</label>
            <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. Q2 2026, Jan-Jun 2026" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Generate Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// DELETE CONFIRMATION
// ============================================================================

function DeleteModal({ report, onConfirm, onCancel }: { report: ComplianceReport; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Delete Report</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>Delete <strong style={{ color: "var(--gf-text-primary)" }}>{report.name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Delete</button>
        </div>
      </div>
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
// MAIN COMPONENT
// ============================================================================

export function ComplianceReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [generateModal, setGenerateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ComplianceReport | null>(null);

  const filtered = useMemo(() => {
    let list = reports;
    if (search) { const q = search.toLowerCase(); list = list.filter((r) => r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.framework.toLowerCase().includes(q)); }
    if (typeFilter !== "All") list = list.filter((r) => r.type === typeFilter);
    if (statusFilter !== "All") list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [reports, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = {
    total: reports.length,
    generated: reports.filter((r) => r.status === "Generated").length,
    pending: reports.filter((r) => r.status === "Pending").length,
    avgScore: Math.round(reports.filter((r) => r.score > 0).reduce((a, r) => a + r.score, 0) / Math.max(1, reports.filter((r) => r.score > 0).length)),
  };

  const handleGenerate = (data: { name: string; type: ComplianceReport["type"]; framework: string; period: string }) => {
    const nr: ComplianceReport = {
      id: `cr-${Date.now()}`,
      name: data.name,
      type: data.type,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
      size: "—",
      findings: 0,
      score: 0,
      generatedBy: "Current User",
      framework: data.framework,
      period: data.period,
    };
    setReports((prev) => [nr, ...prev]);
    setGenerateModal(false);
    setTimeout(() => {
      setReports((prev) => prev.map((r) => r.id === nr.id ? { ...r, status: "Generated" as const, size: `${(1 + Math.random() * 3).toFixed(1)} MB`, score: 90 + Math.floor(Math.random() * 10), findings: Math.floor(Math.random() * 3) } : r));
    }, 3000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setReports((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleDownload = (report: ComplianceReport) => {
    const content = `Compliance Report: ${report.name}\nType: ${report.type}\nFramework: ${report.framework}\nPeriod: ${report.period}\nDate: ${report.date}\nScore: ${report.score}%\nFindings: ${report.findings}\n\nThis is a simulated report download.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${report.name.replace(/\s+/g, "-").toLowerCase()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Compliance Reports</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Generate, view, and manage compliance reports across all frameworks</p>
        </div>
        <button onClick={() => setGenerateModal(true)} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-4 w-4" />Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reports", value: stats.total.toString(), icon: <FileText className="h-5 w-5" /> },
          { label: "Generated", value: stats.generated.toString(), icon: <CheckCircle className="h-5 w-5" /> },
          { label: "Pending", value: stats.pending.toString(), icon: <Clock className="h-5 w-5" /> },
          { label: "Avg. Score", value: `${stats.avgScore}%`, icon: <Shield className="h-5 w-5" /> },
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search reports by name, type, or framework..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <CustomSelect value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }} options={[{ label: "All Types", value: "All" }, ...REPORT_TYPES.map((t) => ({ label: t, value: t }))]} />
        <CustomSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={[{ label: "All Status", value: "All" }, { label: "Generated", value: "Generated" }, { label: "Pending", value: "Pending" }, { label: "Failed", value: "Failed" }]} />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                {["Report Name", "Type", "Framework", "Date", "Status", "Score", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No reports found</p>
                </td></tr>
              ) : paged.map((report) => {
                const sc = STATUS_COLORS[report.status];
                const StatusIcon = STATUS_ICONS[report.status];
                return (
                  <tr key={report.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{report.name}</p>
                        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{report.period} &middot; {report.generatedBy}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-primary)" }}>{report.type}</span>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{report.framework}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{report.date}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        <StatusIcon className="h-3 w-3" />{report.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {report.score > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                            <div className="h-full rounded-full" style={{ width: `${report.score}%`, backgroundColor: report.score >= 95 ? "#22c55e" : report.score >= 80 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: report.score >= 95 ? "#22c55e" : report.score >= 80 ? "#f59e0b" : "#ef4444" }}>{report.score}%</span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {report.status === "Generated" && (
                          <>
                            <Link href={`/compliance/reports/${report.id}`} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-accent)" }} title="View Report"><Eye className="h-4 w-4" /></Link>
                            <button onClick={() => handleDownload(report)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }} title="Download"><Download className="h-4 w-4" /></button>
                          </>
                        )}
                        <button onClick={() => setDeleteTarget(report)} className="rounded-lg p-1.5 hover:opacity-70 text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination current={safePage} total={totalPages} onChange={setPage} />
      </div>

      {/* Modals */}
      {generateModal && <GenerateReportModal onGenerate={handleGenerate} onCancel={() => setGenerateModal(false)} />}
      {deleteTarget && <DeleteModal report={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
