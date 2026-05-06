"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Play, Copy, CheckCircle2, Loader2, Terminal } from "lucide-react";

interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  endpoint: string;
  method: string;
  status: string;
}

interface PlaygroundResponse {
  request: { method: string; endpoint: string; body: unknown };
  response: { status: number; statusText: string; body: unknown };
  latencyMs: number;
  executedAt: string;
}

function PlaygroundInner() {
  const searchParams = useSearchParams();
  const deepSlug = searchParams.get("service");

  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [bodyText, setBodyText] = useState("{}");
  const [result, setResult] = useState<PlaygroundResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { serviceCatalogApi } = await import("@/lib/api");
        const list = await serviceCatalogApi.list();
        // Backend catalog only carries {id, name, description, version,
        // status}. The legacy UI's `slug`, `category`, `endpoint`, `method`
        // aren't tracked yet — derive a slug from id/name and default the
        // method to GET so the picker still works.
        const mapped: Service[] = list.map((s) => ({
          id: s.id,
          slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: s.name,
          category: "General",
          endpoint: "/",
          method: "GET",
          status: s.status,
        }));
        setServices(mapped);
        if (!selected && mapped.length > 0) {
          const initial = deepSlug ? mapped.find((s) => s.slug === deepSlug) : undefined;
          setSelected((initial ?? mapped[0]).slug);
        }
      } catch {
        setError("Failed to load services");
      }
    })();
  }, [deepSlug, selected]);

  const active = useMemo(() => services.find((s) => s.slug === selected), [services, selected]);
  const hasBody = !!active && (active.method === "POST" || active.method === "PUT" || active.method === "PATCH");

  // Backend has no per-service detail with a `sampleRequest` body — reset
  // the editor to an empty JSON object whenever the user picks a service.
  useEffect(() => {
    if (!selected) return;
    setBodyText("{}");
  }, [selected]);

  const run = async () => {
    if (!active) return;
    setRunning(true);
    setError(null);
    let parsed: unknown = null;
    if (hasBody && bodyText.trim()) {
      try { parsed = JSON.parse(bodyText); } catch { setError("Request body is not valid JSON"); setRunning(false); return; }
    }
    try {
      const startedAt = performance.now();
      const { sandboxApi } = await import("@/lib/api");
      const out = await sandboxApi.execute({
        method: active.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        endpoint: active.endpoint,
        body: (parsed as Record<string, unknown> | null) ?? undefined,
      });
      // Adapt sandbox result into the legacy PlaygroundResponse shape so
      // the renderer doesn't need any changes.
      setResult({
        request: { method: active.method, endpoint: active.endpoint, body: parsed },
        response: {
          status: out.status_code,
          statusText: out.status_code >= 200 && out.status_code < 300 ? "OK" : "Error",
          body: out.response,
        },
        latencyMs: Math.round(performance.now() - startedAt),
        executedAt: new Date().toISOString(),
      });
    } catch {
      setError("Sandbox request failed");
    } finally {
      setRunning(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(JSON.stringify(result.response.body, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>API Playground</h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Send requests against the Glimmora sandbox — no production data touched.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--gf-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>Request</p>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-muted)" }}>Service</label>
              <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                {services.map((s) => <option key={s.slug} value={s.slug}>{s.method} · {s.name}</option>)}
              </select>
            </div>
            {active && (
              <div className="rounded-lg px-3 py-2 text-xs font-mono flex items-center gap-2" style={{ backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)", color: "var(--gf-text-secondary)" }}>
                <span className="font-bold" style={{ color: "var(--gf-accent)" }}>{active.method}</span>
                {active.endpoint}
              </div>
            )}
            {hasBody && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-muted)" }}>Body (JSON)</label>
                <textarea rows={10} value={bodyText} onChange={(e) => setBodyText(e.target.value)} spellCheck={false} className="w-full rounded-lg border px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={run} disabled={!active || running} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--gf-accent)" }}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running…" : "Send Request"}
            </button>
          </div>
        </div>

        {/* Response */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--gf-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>Response</p>
            {result && (
              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                <span className={`font-medium ${result.response.status < 300 ? "text-green-500" : "text-red-500"}`}>{result.response.status} {result.response.statusText}</span>
                <span>· {result.latencyMs}ms</span>
                <button onClick={copy} className="flex items-center gap-1 hover:opacity-70">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#22c55e" }} /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <pre className="text-xs overflow-auto p-4 font-mono min-h-[260px] max-h-[520px]" style={{ color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-base)" }}>
{result ? JSON.stringify(result.response.body, null, 2) : "// Press Send Request to see the response."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function StudioPlayground() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading playground…</div>}>
      <PlaygroundInner />
    </Suspense>
  );
}
