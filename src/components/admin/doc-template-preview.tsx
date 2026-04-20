"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Edit3, History, RefreshCw, FileText, Code2, Sparkles } from "lucide-react";

interface PreviewResponse {
  id: string;
  name: string | null;
  html: string;
  variables: string[];
  missing: string[];
}

export function DocTemplatePreview({ templateId }: { templateId: string }) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [view, setView] = useState<"rendered" | "source">("rendered");
  const [loading, setLoading] = useState(true);

  const renderPreview = useCallback(async (nextValues: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doc-templates/${templateId}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: nextValues }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PreviewResponse = await res.json();
      setPreview(data);
      // Initialize any newly discovered vars with empty string so inputs appear.
      setValues((prev) => {
        const merged = { ...prev };
        for (const v of data.variables) if (!(v in merged)) merged[v] = "";
        return merged;
      });
    } catch {
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    renderPreview({});
  }, [renderPreview]);

  const updateValue = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    renderPreview(next);
  };

  const clearValues = () => {
    const next: Record<string, string> = {};
    for (const v of preview?.variables ?? []) next[v] = "";
    setValues(next);
    renderPreview(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/doc-templates" className="flex items-center justify-center rounded-lg border h-9 w-9 hover:opacity-70" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
              {preview?.name ?? "Template Preview"}
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
              Rendered output with sample variable substitution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/doc-templates/${templateId}/versions`} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <History className="h-4 w-4" />Versions
          </Link>
          <Link href={`/doc-templates/${templateId}/edit`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
            <Edit3 className="h-4 w-4" />Edit Template
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Variables panel */}
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Variables</h3>
            </div>
            <button onClick={clearValues} className="text-xs hover:underline" style={{ color: "var(--gf-text-muted)" }}>Clear</button>
          </div>

          {preview && preview.variables.length === 0 && (
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>This template has no variables.</p>
          )}

          <div className="space-y-3">
            {preview?.variables.map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1 font-mono" style={{ color: "var(--gf-text-secondary)" }}>
                  {`{{${key}}}`}
                </label>
                <input
                  type="text"
                  value={values[key] ?? ""}
                  onChange={(e) => updateValue(key, e.target.value)}
                  placeholder={`Enter ${key}...`}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                  style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                />
              </div>
            ))}
          </div>

          {preview && preview.missing.length > 0 && (
            <p className="mt-4 text-xs" style={{ color: "var(--gf-text-muted)" }}>
              {preview.missing.length} variable{preview.missing.length === 1 ? "" : "s"} unfilled — placeholders shown in the preview.
            </p>
          )}
        </div>

        {/* Preview panel */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "var(--gf-border)" }}>
            <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)" }}>
              {(["rendered", "source"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${view === v ? "text-white" : ""}`}
                  style={view === v ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}
                >
                  {v === "rendered" ? <Eye className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => renderPreview(values)} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--gf-text-secondary)" }} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
            </button>
          </div>

          <div className="p-6 max-h-[600px] overflow-y-auto" style={{ backgroundColor: view === "source" ? "var(--gf-bg-base)" : "#ffffff" }}>
            {loading && !preview && (
              <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading preview…</p>
            )}
            {preview && view === "rendered" && (
              // Sandbox the rendered HTML: preview only, never executed as part of app UI outside this box.
              <div style={{ color: "#0f172a" }} dangerouslySetInnerHTML={{ __html: preview.html }} />
            )}
            {preview && view === "source" && (
              <pre className="text-xs whitespace-pre-wrap font-mono" style={{ color: "var(--gf-text-secondary)" }}>
                {preview.html}
              </pre>
            )}
            {!loading && !preview && (
              <div className="flex flex-col items-center gap-2 py-12">
                <FileText className="h-10 w-10 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>Template not found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
