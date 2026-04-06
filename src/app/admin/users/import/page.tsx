"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, Download, FileText, CheckCircle2, XCircle,
  Loader2, AlertTriangle,
} from "lucide-react";

interface ParsedRow {
  name: string; email: string; role: string; tenant: string;
  valid: boolean; error?: string;
}

const MOCK_ROWS: ParsedRow[] = [
  { name: "Alice Johnson", email: "alice@company.com", role: "developer", tenant: "Glimmora HQ", valid: true },
  { name: "Bob Smith", email: "bob@company.com", role: "tenant_member", tenant: "VerifAI", valid: true },
  { name: "", email: "invalid-email", role: "developer", tenant: "Glimmora HQ", valid: false, error: "Name required, invalid email" },
  { name: "Diana Prince", email: "diana@company.com", role: "qa_engineer", tenant: "Diamond Corp", valid: true },
];

export default function BulkImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    // Mock parse
    setTimeout(() => setParsed(MOCK_ROWS), 500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    const validCount = parsed.filter((r) => r.valid).length;
    for (let i = 0; i <= validCount; i++) {
      setProgress(Math.round((i / validCount) * 100));
      await new Promise((r) => setTimeout(r, 400));
    }
    setImporting(false);
    setDone(true);
  };

  const handleDownloadTemplate = () => {
    const csv = "name,email,role,tenant\nJohn Doe,john@company.com,developer,Glimmora HQ\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "user-import-template.csv";
    a.click();
  };

  const validCount = parsed?.filter((r) => r.valid).length ?? 0;
  const errorCount = parsed ? parsed.length - validCount : 0;
  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => router.push("/admin/users")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Users & Access
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Bulk Import Users</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Import multiple users at once via CSV file</p>
      </div>

      {done ? (
        <div className="flex flex-col items-center py-12 rounded-xl border"
          style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Import Complete!</h2>
          <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
            Successfully imported {validCount} users. {errorCount > 0 && `${errorCount} rows had errors.`}
          </p>
          <button onClick={() => router.push("/admin/users")}
            className="mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--gf-accent)" }}>Back to Users</button>
        </div>
      ) : (
        <>
          {/* Upload & Template */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors hover:border-[var(--gf-accent)]"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
              onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
              onClick={() => document.getElementById("csv-input")?.click()}>
              <Upload className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--gf-text-muted)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
                {file ? file.name : "Drop CSV file here or click to browse"}
              </p>
              {file && <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>{(file.size / 1024).toFixed(1)} KB</p>}
              <input id="csv-input" type="file" accept=".csv" className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>

            <div className="rounded-xl border p-6"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>CSV Template</h3>
              <p className="text-xs mb-3" style={{ color: "var(--gf-text-secondary)" }}>
                Expected columns: <code className="text-xs" style={{ color: "var(--gf-accent)" }}>name, email, role, tenant</code>
              </p>
              <button onClick={handleDownloadTemplate}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                <Download className="h-4 w-4" /> Download Template
              </button>
            </div>
          </div>

          {/* Preview */}
          {parsed && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> {validCount} valid
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-sm text-red-400">
                    <XCircle className="h-4 w-4" /> {errorCount} errors
                  </span>
                )}
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                      {["Status", "Name", "Email", "Role", "Tenant", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--gf-text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                        <td className="px-4 py-3">
                          {row.valid ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{row.name || "—"}</td>
                        <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{row.email}</td>
                        <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{row.role}</td>
                        <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{row.tenant}</td>
                        <td className="px-4 py-3 text-xs text-red-400">{row.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Progress bar */}
              {importing && (
                <div className="space-y-2">
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    <div className="h-full rounded-full transition-all bg-teal-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-center" style={{ color: "var(--gf-text-muted)" }}>Importing... {progress}%</p>
                </div>
              )}

              <div className="flex justify-end">
                <button onClick={handleImport} disabled={importing || validCount === 0}
                  className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--gf-accent)" }}>
                  {importing ? <><Loader2 className="h-4 w-4 animate-spin" />Importing...</> : `Import ${validCount} Users`}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
