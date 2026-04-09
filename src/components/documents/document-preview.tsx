"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  PenTool,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Mail,
  Globe,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ============================================================================
// SAMPLE DATA
// ============================================================================

interface Signature {
  id: string;
  signerName: string;
  signerEmail: string;
  status: "signed" | "pending" | "declined";
  signedAt: string | null;
  ip: string | null;
}

interface AuditEntry {
  action: string;
  actor: string;
  timestamp: string;
}

interface DocumentDetail {
  id: string;
  name: string;
  templateName: string;
  tenant: string;
  status: string;
  format: string;
  size: string;
  createdBy: string;
  createdAt: string;
  signatures: Signature[];
  auditTrail: AuditEntry[];
}

const SAMPLE_DOCS: Record<string, DocumentDetail> = {
  "doc-001": {
    id: "doc-001", name: "Invoice #INV-2026-0142", templateName: "Invoice Template", tenant: "Acme Corp", status: "signed", format: "pdf", size: "245 KB", createdBy: "Vanshika Keswani", createdAt: "2026-04-07T14:30:00Z",
    signatures: [
      { id: "sig-001", signerName: "John Smith", signerEmail: "john@acme.com", status: "signed", signedAt: "2026-04-07T16:00:00Z", ip: "192.168.1.10" },
    ],
    auditTrail: [
      { action: "Document created", actor: "Vanshika Keswani", timestamp: "2026-04-07T14:30:00Z" },
      { action: "Signature requested", actor: "Vanshika Keswani", timestamp: "2026-04-07T14:35:00Z" },
      { action: "Signed by John Smith", actor: "John Smith", timestamp: "2026-04-07T16:00:00Z" },
    ],
  },
  "doc-002": {
    id: "doc-002", name: "NDA - Project Alpha", templateName: "NDA Agreement", tenant: "TechStart Inc", status: "pending_sign", format: "pdf", size: "180 KB", createdBy: "Pratiksha M.", createdAt: "2026-04-06T10:15:00Z",
    signatures: [
      { id: "sig-002", signerName: "Sarah Chen", signerEmail: "sarah@techstart.com", status: "signed", signedAt: "2026-04-06T14:00:00Z", ip: "10.0.0.5" },
      { id: "sig-003", signerName: "Mike Johnson", signerEmail: "mike@techstart.com", status: "pending", signedAt: null, ip: null },
    ],
    auditTrail: [
      { action: "Document created", actor: "Pratiksha M.", timestamp: "2026-04-06T10:15:00Z" },
      { action: "Signature requested for Sarah Chen", actor: "Pratiksha M.", timestamp: "2026-04-06T10:20:00Z" },
      { action: "Signature requested for Mike Johnson", actor: "Pratiksha M.", timestamp: "2026-04-06T10:20:00Z" },
      { action: "Signed by Sarah Chen", actor: "Sarah Chen", timestamp: "2026-04-06T14:00:00Z" },
    ],
  },
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string; bg: string }> = {
  signed: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", label: "Signed", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  pending: { icon: Clock, color: "text-amber-600 dark:text-amber-400", label: "Pending", bg: "bg-amber-100 dark:bg-amber-900/30" },
  pending_sign: { icon: Clock, color: "text-amber-600 dark:text-amber-400", label: "Pending Signature", bg: "bg-amber-100 dark:bg-amber-900/30" },
  generated: { icon: FileText, color: "text-blue-600 dark:text-blue-400", label: "Generated", bg: "bg-blue-100 dark:bg-blue-900/30" },
  declined: { icon: XCircle, color: "text-red-500 dark:text-red-400", label: "Declined", bg: "bg-red-100 dark:bg-red-900/30" },
  expired: { icon: XCircle, color: "text-gray-500 dark:text-gray-400", label: "Expired", bg: "bg-gray-100 dark:bg-gray-900/30" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function DocumentPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;
  const doc = SAMPLE_DOCS[docId] ?? {
    id: docId, name: "Document", templateName: "Template", tenant: "Tenant", status: "generated", format: "pdf", size: "—", createdBy: "System", createdAt: new Date().toISOString(),
    signatures: [], auditTrail: [{ action: "Document created", actor: "System", timestamp: new Date().toISOString() }],
  };

  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "signatures" | "audit">("preview");

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      const blob = new Blob([`Mock PDF content for ${doc.name}`], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 1000);
  };

  const docStatus = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.generated;
  const DocStatusIcon = docStatus.icon;

  return (
    <AuthGuard allowedRoles={["tenant_member"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/documents")} className="rounded-lg border p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
              <ArrowLeft className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{doc.name}</h1>
              <p className="text-xs flex items-center gap-2" style={{ color: "var(--gf-text-muted)" }}>
                {doc.templateName} &middot; {doc.tenant} &middot;
                <span className={`inline-flex items-center gap-1 ${docStatus.color}`}><DocStatusIcon className="w-3 h-3" /> {docStatus.label}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
            </button>
            {(doc.status === "generated" || doc.status === "pending_sign") && (
              <button onClick={() => router.push(`/documents/${docId}/sign`)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors" style={{ backgroundColor: "var(--gf-accent)" }}>
                <PenTool className="w-4 h-4" /> Request Signature
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg border p-1" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          {([
            { key: "preview" as const, label: "PDF Preview" },
            { key: "signatures" as const, label: `Signatures (${doc.signatures.length})` },
            { key: "audit" as const, label: "Audit Trail" },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="rounded-md px-4 py-1.5 text-xs font-medium transition-colors"
              style={activeTab === t.key ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { color: "var(--gf-text-secondary)" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "preview" && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: "var(--gf-bg-surface)", borderBottom: "1px solid var(--gf-border)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>PDF Preview &middot; {doc.size}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-12" style={{ backgroundColor: "var(--gf-bg-base)", minHeight: "500px" }}>
              <FileText className="w-16 h-16 mb-4" style={{ color: "var(--gf-text-muted)" }} />
              <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>{doc.name}</h3>
              <p className="text-sm mb-4" style={{ color: "var(--gf-text-muted)" }}>{doc.format.toUpperCase()} Document &middot; {doc.size}</p>
              <div className="rounded-xl border p-8 w-full max-w-lg text-center" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>PDF preview would render here using PDF.js</p>
                <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>In production, the document would be fetched from <code>/api/documents/{docId}/download</code> and rendered inline</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "signatures" && (
          <div className="space-y-4">
            {/* Signature Status Tracker */}
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Signature Status Tracker</h3>
              {doc.signatures.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No signatures requested yet.</p>
              ) : (
                <div className="space-y-3">
                  {doc.signatures.map(sig => {
                    const sigStatus = STATUS_CONFIG[sig.status] ?? STATUS_CONFIG.pending;
                    const SigIcon = sigStatus.icon;
                    return (
                      <div key={sig.id} className="flex items-center gap-4 rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${sigStatus.bg}`}>
                          <SigIcon className={`w-5 h-5 ${sigStatus.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{sig.signerName}</span>
                            <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${sigStatus.color} ${sigStatus.bg}`}>
                              {sigStatus.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                            <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {sig.signerEmail}</span>
                            {sig.signedAt && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(sig.signedAt)}</span>}
                            {sig.ip && <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" /> {sig.ip}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress */}
            {doc.signatures.length > 0 && (
              <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Signature Progress</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                    {doc.signatures.filter(s => s.status === "signed").length} / {doc.signatures.length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--gf-border)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ backgroundColor: "var(--gf-accent)", width: `${(doc.signatures.filter(s => s.status === "signed").length / doc.signatures.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Audit Trail</h3>
            <div className="space-y-3">
              {doc.auditTrail.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--gf-accent)" }} />
                    {idx < doc.auditTrail.length - 1 && <div className="w-px flex-1 mt-1 min-h-[24px]" style={{ backgroundColor: "var(--gf-border)" }} />}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{entry.action}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                      <User className="w-3 h-3" /> {entry.actor}
                      <span>&middot;</span>
                      <Clock className="w-3 h-3" /> {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Info */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Document Details</h3>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: "Format", value: doc.format.toUpperCase() },
              { label: "Size", value: doc.size },
              { label: "Created By", value: doc.createdBy },
              { label: "Created At", value: formatDate(doc.createdAt) },
            ].map(d => (
              <div key={d.label}>
                <dt className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{d.label}</dt>
                <dd className="font-medium mt-0.5" style={{ color: "var(--gf-text-primary)" }}>{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </AuthGuard>
  );
}
