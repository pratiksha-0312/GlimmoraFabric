"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, Copy, CheckCircle2, Trash2, X, ShieldAlert } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyMasked: string;
  scopes: string[];
  status: "active" | "revoked";
  lastUsed: string | null;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
}

interface NewKeyResponse extends ApiKey {
  key: string;
}

const SCOPES = [
  "read:services", "read:events", "read:components",
  "write:workflow", "write:document", "write:notification",
  "admin:tenants", "admin:billing",
];

export function StudioApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMode, setNewMode] = useState<"test" | "live">("test");
  const [newScopes, setNewScopes] = useState<string[]>(["read:services"]);
  const [created, setCreated] = useState<NewKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const refresh = () => {
    fetch("/api/studio/api-keys")
      .then((r) => r.json())
      .then((d: ApiKey[]) => setKeys(d))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const toggleScope = (s: string) => {
    setNewScopes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const create = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/studio/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), mode: newMode, scopes: newScopes }),
    });
    if (!res.ok) return;
    const data: NewKeyResponse = await res.json();
    setCreated(data);
    setNewName("");
    setNewScopes(["read:services"]);
    refresh();
  };

  const revoke = async () => {
    if (!revokeTarget) return;
    const id = revokeTarget;
    setRevokeTarget(null);
    await fetch(`/api/studio/api-keys/${id}`, { method: "DELETE" });
    refresh();
  };

  const copyKey = async () => {
    if (!created) return;
    try { await navigator.clipboard.writeText(created.key); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>API Keys</h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage credentials for accessing the Glimmora Fabric API.</p>
        </div>
        <button onClick={() => { setShowNew(true); setCreated(null); }} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-4 w-4" />New API Key
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
              {["Name", "Key", "Scopes", "Status", "Last Used", "Created By", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading…</td></tr>
            ) : keys.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No API keys yet. Create one to get started.</td></tr>
            ) : keys.map((k) => (
              <tr key={k.id} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                <td className="px-5 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{k.name}</td>
                <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-secondary)" }}>{k.keyMasked}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.map((s) => (
                      <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                    color: k.status === "active" ? "#22c55e" : "#ef4444",
                    backgroundColor: k.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  }}>{k.status}</span>
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>{k.lastUsed ? new Date(k.lastUsed).toLocaleString() : "—"}</td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{k.createdBy}</td>
                <td className="px-5 py-3 text-right">
                  {k.status === "active" && (
                    <button onClick={() => setRevokeTarget(k.id)} className="rounded-lg p-1.5 hover:opacity-70 text-red-500" title="Revoke">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setShowNew(false); setCreated(null); }}>
          <div className="w-full max-w-lg mx-4 rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{created ? "API Key Created" : "New API Key"}</h2>
              </div>
              <button onClick={() => { setShowNew(false); setCreated(null); }} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {created ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                  <p className="text-xs text-amber-500">Copy this key now — you won&apos;t be able to see it again.</p>
                </div>
                <div className="rounded-lg border px-3 py-2 font-mono text-xs break-all flex items-center gap-2" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>
                  <span className="flex-1">{created.key}</span>
                  <button onClick={copyKey} className="shrink-0 rounded p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                    {copied ? <CheckCircle2 className="h-4 w-4" style={{ color: "#22c55e" }} /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button onClick={() => { setShowNew(false); setCreated(null); }} className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Done</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Production Worker" className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Mode</label>
                  <div className="flex gap-2">
                    {(["test", "live"] as const).map((m) => (
                      <button key={m} onClick={() => setNewMode(m)} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${newMode === m ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`} style={{
                        backgroundColor: newMode === m ? "var(--gf-accent-bg)" : "var(--gf-bg-base)",
                        borderColor: newMode === m ? "var(--gf-accent)" : "var(--gf-border)",
                        color: "var(--gf-text-primary)",
                      }}>{m.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Scopes</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SCOPES.map((s) => {
                      const on = newScopes.includes(s);
                      return (
                        <button key={s} onClick={() => toggleScope(s)} className="text-xs px-2.5 py-1 rounded-full transition-colors" style={{
                          backgroundColor: on ? "var(--gf-accent)" : "var(--gf-bg-base)",
                          color: on ? "#ffffff" : "var(--gf-text-secondary)",
                          border: `1px solid ${on ? "var(--gf-accent)" : "var(--gf-border)"}`,
                        }}>{s}</button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={create} disabled={!newName.trim()} className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--gf-accent)" }}>Create Key</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revoke confirm */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setRevokeTarget(null)}>
          <div className="w-full max-w-sm mx-4 rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--gf-text-primary)" }}>Revoke API key?</h3>
            <p className="text-sm mb-4" style={{ color: "var(--gf-text-muted)" }}>This key will immediately stop working. Integrations using it will fail until you create a new key.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRevokeTarget(null)} className="rounded-lg border px-4 py-2 text-sm" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>Cancel</button>
              <button onClick={revoke} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
