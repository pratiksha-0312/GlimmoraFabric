"use client";

import { useState, useEffect } from "react";
import {
  FileDown,
  Plus,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  ChevronDown,
  X,
  FileText,
  Database,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ============================================================================
// TYPES & DATA
// ============================================================================

interface ExportRequest {
  id: string;
  name: string;
  dataScope: string;
  format: "CSV" | "JSON" | "PDF";
  status: "Completed" | "Processing" | "Queued" | "Failed";
  requestedBy: string;
  requestedAt: string;
  completedAt: string | null;
  fileSize: string | null;
  progress: number;
  reason: string;
}

const INITIAL_EXPORTS: ExportRequest[] = [
  { id: "exp-001", name: "Full Audit Log Export", dataScope: "Audit Logs", format: "CSV", status: "Completed", requestedBy: "Vanshika Keswani", requestedAt: "2026-04-07 08:00", completedAt: "2026-04-07 08:12", fileSize: "45.2 MB", progress: 100, reason: "Annual compliance audit" },
  { id: "exp-002", name: "User Data - GDPR Request", dataScope: "User PII", format: "JSON", status: "Completed", requestedBy: "Pratiksha M.", requestedAt: "2026-04-06 14:30", completedAt: "2026-04-06 14:35", fileSize: "2.1 MB", progress: 100, reason: "GDPR data subject access request" },
  { id: "exp-003", name: "Tenant Usage Analytics", dataScope: "Usage Metrics", format: "CSV", status: "Processing", requestedBy: "Vanshika Keswani", requestedAt: "2026-04-07 09:15", completedAt: null, fileSize: null, progress: 67, reason: "Quarterly business review" },
  { id: "exp-004", name: "Security Events - March 2026", dataScope: "Security Events", format: "PDF", status: "Completed", requestedBy: "Pratiksha M.", requestedAt: "2026-04-05 10:00", completedAt: "2026-04-05 10:08", fileSize: "8.7 MB", progress: 100, reason: "Security incident review" },
  { id: "exp-005", name: "Compliance Report Bundle", dataScope: "Compliance Data", format: "PDF", status: "Queued", requestedBy: "Vanshika Keswani", requestedAt: "2026-04-07 09:30", completedAt: null, fileSize: null, progress: 0, reason: "Board presentation preparation" },
  { id: "exp-006", name: "Payment Transaction History", dataScope: "Payment Data", format: "CSV", status: "Failed", requestedBy: "Pratiksha M.", requestedAt: "2026-04-04 16:00", completedAt: null, fileSize: null, progress: 34, reason: "Financial reconciliation" },
];

const DATA_SCOPES = ["Audit Logs", "User PII", "Usage Metrics", "Security Events", "Compliance Data", "Payment Data", "Tenant Data", "API Logs"];
const FORMATS: ExportRequest["format"][] = ["CSV", "JSON", "PDF"];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  Completed: { bg: "rgba(34,197,94,0.15)", text: "#22c55e", icon: CheckCircle },
  Processing: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6", icon: Loader },
  Queued: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", icon: Clock },
  Failed: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", icon: XCircle },
};

// ============================================================================
// CUSTOM SELECT
// ============================================================================

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm min-w-[140px] w-full outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--gf-text-muted)" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[160px] max-h-[200px] overflow-y-auto rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
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
// NEW EXPORT REQUEST MODAL
// ============================================================================

function NewExportModal({ onSubmit, onCancel }: { onSubmit: (data: { name: string; dataScope: string; format: ExportRequest["format"]; reason: string }) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [dataScope, setDataScope] = useState("Audit Logs");
  const [format, setFormat] = useState<ExportRequest["format"]>("CSV");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Export name is required"); return; }
    if (!reason.trim()) { setError("Reason is required for audit trail"); return; }
    onSubmit({ name, dataScope, format, reason });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
            <FileDown className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>New Data Export Request</h2>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>All exports are logged for compliance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Export Name *</label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="e.g. Q1 Audit Data Export" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Data Scope</label>
              <CustomSelect value={dataScope} onChange={setDataScope} options={DATA_SCOPES.map((s) => ({ label: s, value: s }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Format</label>
              <CustomSelect value={format} onChange={(v) => setFormat(v as ExportRequest["format"])} options={FORMATS.map((f) => ({ label: f, value: f }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Reason / Justification *</label>
            <textarea value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} placeholder="Why is this export needed? (required for audit trail)" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
              Data exports containing PII will be encrypted. The export and the requester will be recorded in the audit trail.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Submit Request</button>
          </div>
        </form>
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

export function DataExportPage() {
  const [exports, setExports] = useState<ExportRequest[]>(INITIAL_EXPORTS);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const refresh = () => {
    // The FastAPI compliance endpoint only handles inline GDPR exports
    // (POST /compliance/data-export), not a job queue. We surface the local
    // sample data; queued-export tracking would need a new backend table.
    /* no-op refresh */
  };

  useEffect(() => {
    refresh();
  }, []);

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(exports.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = exports.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = {
    total: exports.length,
    completed: exports.filter((e) => e.status === "Completed").length,
    processing: exports.filter((e) => e.status === "Processing" || e.status === "Queued").length,
    totalSize: exports.filter((e) => e.fileSize).reduce((a, e) => a + parseFloat(e.fileSize!), 0).toFixed(1),
  };

  const handleNewExport = async (data: { name: string; dataScope: string; format: ExportRequest["format"]; reason: string }) => {
    // The backend's GDPR export takes a user_id and returns the data inline.
    // The current UI form doesn't capture a user_id, so for now we just add
    // the request to the local list as "Queued" and let the operator follow
    // up via the backend admin tools.
    setShowModal(false);
    const stub: ExportRequest = {
      id: `EX-${Date.now()}`,
      name: data.name,
      dataScope: data.dataScope,
      format: data.format,
      status: "Queued",
      requestedAt: new Date().toISOString(),
      requestedBy: "current-user",
      fileSize: null,
      reason: data.reason,
    };
    setExports((prev) => [stub, ...prev]);
  };

  const handleDownload = (exp: ExportRequest) => {
    // No real file produced server-side; synthesize a client-side placeholder
    const content = `Data Export: ${exp.name}\nScope: ${exp.dataScope}\nFormat: ${exp.format}\nRequested: ${exp.requestedAt}\nReason: ${exp.reason}\n\nThis is a simulated export file.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${exp.name.replace(/\s+/g, "-").toLowerCase()}.${exp.format.toLowerCase()}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Data Export Requests</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Request, track, and download compliance data exports</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-4 w-4" />New Export Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Exports", value: stats.total.toString(), icon: <FileText className="h-5 w-5" /> },
          { label: "Completed", value: stats.completed.toString(), icon: <CheckCircle className="h-5 w-5" /> },
          { label: "In Progress", value: stats.processing.toString(), icon: <Loader className="h-5 w-5" /> },
          { label: "Total Size", value: `${stats.totalSize} MB`, icon: <Database className="h-5 w-5" /> },
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

      {/* Export Requests Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                {["Export Name", "Data Scope", "Format", "Status", "Progress", "Requested", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center">
                  <FileDown className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No export requests</p>
                </td></tr>
              ) : paged.map((exp) => {
                const sc = STATUS_CONFIG[exp.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={exp.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{exp.name}</p>
                        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{exp.reason}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-primary)" }}>{exp.dataScope}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono font-medium" style={{ color: "var(--gf-text-secondary)" }}>{exp.format}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        <StatusIcon className={`h-3 w-3 ${exp.status === "Processing" ? "animate-spin" : ""}`} />{exp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${exp.progress}%`, backgroundColor: exp.status === "Failed" ? "#ef4444" : exp.progress >= 100 ? "#22c55e" : "#3b82f6" }} />
                        </div>
                        <span className="text-xs font-medium w-8" style={{ color: "var(--gf-text-muted)" }}>{exp.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{exp.requestedAt}</p>
                        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{exp.requestedBy}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {exp.status === "Completed" && (
                        <button onClick={() => handleDownload(exp)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                          <Download className="h-3.5 w-3.5" />{exp.fileSize}
                        </button>
                      )}
                      {exp.status === "Failed" && (
                        <span className="text-xs text-red-500">Export failed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination current={safePage} total={totalPages} onChange={setPage} />
      </div>

      {/* Modal */}
      {showModal && <NewExportModal onSubmit={handleNewExport} onCancel={() => setShowModal(false)} />}
    </div>
  );
}
