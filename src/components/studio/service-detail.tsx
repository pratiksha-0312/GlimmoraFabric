"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Copy, CheckCircle2, Lock } from "lucide-react";

interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  endpoint: string;
  method: string;
  version: string;
  status: string;
  auth: string;
  docsMarkdown: string;
  sampleRequest: string;
  sampleResponse: string;
  updatedAt: string;
}

const METHOD_COLOR: Record<string, string> = {
  GET: "#22c55e", POST: "#3b82f6", PUT: "#f59e0b", PATCH: "#a855f7", DELETE: "#ef4444",
};

export function StudioServiceDetail({ serviceId }: { serviceId: string }) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/studio/services/${serviceId}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Service) => setService(data))
      .catch(() => { /* 404 handled below */ })
      .finally(() => setLoading(false));
  }, [serviceId]);

  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(null), 1500); } catch { /* noop */ }
  };

  if (loading) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading…</div>;
  if (!service) return (
    <div className="p-10 text-center">
      <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Service not found.</p>
      <Link href="/studio/services" className="mt-3 inline-block text-sm font-medium" style={{ color: "var(--gf-accent)" }}>Back to catalog</Link>
    </div>
  );

  const methodColor = METHOD_COLOR[service.method] ?? "#9ca3af";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/studio/services" className="flex items-center justify-center rounded-lg border h-9 w-9 hover:opacity-70" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ color: methodColor, backgroundColor: `${methodColor}20` }}>{service.method}</span>
              <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{service.category} · {service.version} · {service.status}</span>
            </div>
            <h1 className="text-2xl font-bold mt-1" style={{ color: "var(--gf-text-primary)" }}>{service.name}</h1>
            <p className="text-sm font-mono mt-0.5" style={{ color: "var(--gf-accent)" }}>{service.endpoint}</p>
          </div>
        </div>
        <Link href={`/studio/playground?service=${service.slug}`} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Play className="h-4 w-4" />Try in Playground
        </Link>
      </div>

      <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Auth: <span className="font-medium" style={{ color: "var(--gf-text-secondary)" }}>{service.auth}</span></p>
        </div>
        <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{service.description}</p>
      </div>

      {service.docsMarkdown && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Documentation</h3>
          <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: "var(--gf-text-secondary)" }}>{service.docsMarkdown}</pre>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {service.sampleRequest && (
          <CodeBlock label="Sample Request" copied={copied === "req"} onCopy={() => copy("req", service.sampleRequest)} content={service.sampleRequest} />
        )}
        {service.sampleResponse && (
          <CodeBlock label="Sample Response" copied={copied === "res"} onCopy={() => copy("res", service.sampleResponse)} content={service.sampleResponse} />
        )}
      </div>
    </div>
  );
}

function CodeBlock({ label, content, copied, onCopy }: { label: string; content: string; copied: boolean; onCopy: () => void }) {
  let pretty = content;
  try { pretty = JSON.stringify(JSON.parse(content), null, 2); } catch { /* leave raw */ }
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--gf-border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>{label}</p>
        <button onClick={onCopy} className="flex items-center gap-1 text-xs hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          {copied ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#22c55e" }} /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-xs overflow-x-auto p-4 font-mono" style={{ color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>{pretty}</pre>
    </div>
  );
}
