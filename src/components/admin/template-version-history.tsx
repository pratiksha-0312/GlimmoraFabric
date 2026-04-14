"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  History,
  Clock,
  CheckCircle2,
  Eye,
  RotateCcw,
  ChevronRight,
  User,
  GitBranch,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ============================================================================
// SAMPLE DATA
// ============================================================================

interface VersionEntry {
  version: number;
  changedBy: string;
  changeDescription: string;
  date: string;
  status: "current" | "previous";
  diff: string;
}

const TEMPLATE_NAMES: Record<string, string> = {
  "dt-001": "Invoice Template",
  "dt-002": "NDA Agreement",
  "dt-003": "Certificate of Completion",
  "dt-004": "Service Contract",
};

const SAMPLE_VERSIONS: Record<string, VersionEntry[]> = {
  "dt-001": [
    { version: 3, changedBy: "Vanshika Keswani", changeDescription: "Updated table layout and added payment terms section", date: "2026-04-07T14:30:00Z", status: "current", diff: "+ Added payment terms paragraph\n+ Updated table styling\n- Removed old footer" },
    { version: 2, changedBy: "Pratiksha M.", changeDescription: "Added itemized line variables and totals", date: "2026-03-20T10:15:00Z", status: "previous", diff: "+ Added {{#items}} loop block\n+ Added {{total}} variable\n- Removed static amount field" },
    { version: 1, changedBy: "Vanshika Keswani", changeDescription: "Initial template creation", date: "2026-03-15T10:00:00Z", status: "previous", diff: "+ Created invoice template\n+ Added basic structure" },
  ],
  "dt-002": [
    { version: 5, changedBy: "Pratiksha M.", changeDescription: "Updated legal language for compliance", date: "2026-04-05T16:45:00Z", status: "current", diff: "+ Updated Section 2 legal language\n+ Added governing law clause" },
    { version: 4, changedBy: "Vanshika Keswani", changeDescription: "Added signature blocks", date: "2026-03-28T09:00:00Z", status: "previous", diff: "+ Added dual signature section\n+ Added date fields" },
    { version: 3, changedBy: "Pratiksha M.", changeDescription: "Restructured confidentiality clause", date: "2026-03-10T14:00:00Z", status: "previous", diff: "~ Modified Section 1 definition\n+ Added exceptions list" },
    { version: 2, changedBy: "Vanshika Keswani", changeDescription: "Added term duration variable", date: "2026-02-25T11:00:00Z", status: "previous", diff: "+ Added {{term_duration}} variable\n+ Added Section 3" },
    { version: 1, changedBy: "Vanshika Keswani", changeDescription: "Initial NDA template", date: "2026-02-10T09:00:00Z", status: "previous", diff: "+ Created NDA template\n+ Basic structure with parties" },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export function TemplateVersionHistory() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const templateName = TEMPLATE_NAMES[templateId] ?? "Document Template";
  const versions = SAMPLE_VERSIONS[templateId] ?? [
    { version: 1, changedBy: "System", changeDescription: "Initial creation", date: "2026-04-01T10:00:00Z", status: "current" as const, diff: "+ Template created" },
  ];
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const selected = selectedVersion !== null ? versions.find(v => v.version === selectedVersion) : null;

  return (
    <AuthGuard allowedRoles={["super_admin"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/doc-templates")} className="rounded-lg border p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--gf-text-secondary)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Version History</h1>
            <p className="text-sm flex items-center gap-1" style={{ color: "var(--gf-text-muted)" }}>
              <GitBranch className="w-3.5 h-3.5" /> {templateName} &middot; {versions.length} versions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Version Timeline */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-sm font-semibold px-1 mb-3" style={{ color: "var(--gf-text-secondary)" }}>Timeline</h2>
            {versions.map((v, idx) => (
              <button
                key={v.version}
                onClick={() => setSelectedVersion(v.version)}
                className="w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all"
                style={selectedVersion === v.version
                  ? { borderColor: "var(--gf-accent)", backgroundColor: "var(--gf-accent-bg)" }
                  : { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
              >
                {/* Timeline dot */}
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.status === "current" ? "var(--gf-accent)" : "var(--gf-border)" }} />
                  {idx < versions.length - 1 && <div className="w-px flex-1 mt-1 min-h-[20px]" style={{ backgroundColor: "var(--gf-border)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>v{v.version}</span>
                    {v.status === "current" && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{v.changeDescription}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: "var(--gf-text-muted)" }}>
                    <User className="w-3 h-3" /> {v.changedBy}
                    <span>&middot;</span>
                    <Clock className="w-3 h-3" /> {formatDate(v.date)}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 mt-1 shrink-0" style={{ color: "var(--gf-text-muted)" }} />
              </button>
            ))}
          </div>

          {/* Version Details */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-4">
                <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Version {selected.version}</h3>
                      <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{formatDate(selected.date)} by {selected.changedBy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected.status !== "current" && (
                        <button className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )}
                      <button className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Change Description</h4>
                    <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{selected.changeDescription}</p>
                  </div>
                </div>

                {/* Diff View */}
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
                  <div className="px-4 py-2 text-xs font-medium" style={{ backgroundColor: "var(--gf-bg-surface)", borderBottom: "1px solid var(--gf-border)", color: "var(--gf-text-muted)" }}>Changes</div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>
                    {selected.diff.split("\n").map((line, i) => (
                      <div key={i} style={{ color: line.startsWith("+") ? "#22c55e" : line.startsWith("-") ? "#ef4444" : line.startsWith("~") ? "#f59e0b" : "inherit" }}>
                        {line}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                <History className="w-10 h-10 mb-3" style={{ color: "var(--gf-text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Select a version to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
