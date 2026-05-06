"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Key,
  Plus,
  Trash2,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ApiError, apiClient } from "@/lib/api";
import type { UserRole } from "@/lib/roles";

// Backend shape for /api/v1/auth/api-tokens. The dedicated `apiTokensApi`
// module covers /api/v1/tokens/{id}/scopes etc., but basic CRUD lives on the
// auth router so we hit it directly.
interface BackendToken {
  id: string;
  name: string;
  scopes: string;
  is_active: boolean;
  token_prefix: string;
  expires_at: string | null;
  created_at: string;
}

interface CreatedTokenResponse extends BackendToken {
  raw_token: string;
}

interface UiToken {
  id: string;
  name: string;
  created: string;
  expires: string;
  lastUsed: string;
  scopes: string[];
}

function toUi(t: BackendToken): UiToken {
  return {
    id: t.id,
    name: t.name,
    created: new Date(t.created_at).toLocaleDateString(),
    expires: t.expires_at ? new Date(t.expires_at).toLocaleDateString() : "Never",
    lastUsed: "—",
    scopes: t.scopes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export default function ApiTokensPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<UiToken[]>([]);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const [tokenName, setTokenName] = useState("");
  const [scopes, setScopes] = useState<Record<string, boolean>>({
    read: true,
    write: false,
    admin: false,
  });

  const toggleScope = (s: string) => setScopes((p) => ({ ...p, [s]: !p[s] }));

  const fetchTokens = useCallback(async () => {
    setError("");
    try {
      const data = await apiClient.get<BackendToken[]>("/api/v1/auth/api-tokens");
      setTokens(data.map(toUi));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tokens");
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleGenerate = async () => {
    setError("");
    try {
      const selected = (["read", "write", "admin"] as const).filter((k) => scopes[k]);
      const data = await apiClient.post<CreatedTokenResponse>("/api/v1/auth/api-tokens", {
        name: tokenName || "Untitled Token",
        scopes: selected.length ? selected.join(",") : "*",
      });
      setNewToken(data.raw_token);
      await fetchTokens();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate token");
    }
  };

  const handleCopy = () => {
    if (newToken) navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    setError("");
    try {
      await apiClient.delete<void>(`/api/v1/auth/api-tokens/${id}`);
      await fetchTokens();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to revoke token");
    } finally {
      setRevokeTarget(null);
    }
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  return (
    <AuthGuard allowedRoles={["developer", "tenant_admin", "super_admin"] as UserRole[]}>
      <div className="space-y-6 max-w-3xl">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
          style={{ color: "var(--gf-text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
              API Tokens
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
              Manage your personal API tokens for programmatic access
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreate(true);
              setNewToken(null);
              setTokenName("");
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            <Plus className="h-4 w-4" /> Generate Token
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {showCreate && (
          <div
            className="rounded-xl border p-6 space-y-4"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
          >
            {newToken ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                  <AlertTriangle className="h-4 w-4" /> Copy this token now — it won&apos;t be shown again
                </div>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 rounded-lg border px-3 py-2.5 text-xs font-mono break-all"
                    style={{
                      backgroundColor: "var(--gf-bg-base)",
                      borderColor: "var(--gf-accent)",
                      color: "var(--gf-accent)",
                    }}
                  >
                    {newToken}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="rounded-lg border px-3 py-2.5"
                    style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewToken(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium border"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                  Generate New Token
                </h3>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    Token Name
                  </label>
                  <input
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="e.g. CI/CD Pipeline"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-2"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    Scopes
                  </label>
                  <div className="flex gap-4">
                    {["read", "write", "admin"].map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scopes[s]}
                          onChange={() => toggleScope(s)}
                          className="h-4 w-4 rounded accent-teal-500"
                        />
                        <span className="text-sm capitalize" style={{ color: "var(--gf-text-primary)" }}>
                          {s}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div
                  className="flex justify-end gap-3 pt-2 border-t"
                  style={{ borderColor: "var(--gf-border)" }}
                >
                  <button
                    onClick={() => setShowCreate(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium border"
                    style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!tokenName}
                    className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: "var(--gf-accent)" }}
                  >
                    <Key className="h-4 w-4" /> Generate
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                {["Name", "Created", "Expires", "Last Used", "Scopes", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase"
                    style={{ color: "var(--gf-text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: "var(--gf-text-muted)" }}
                  >
                    No API tokens yet. Generate one to get started.
                  </td>
                </tr>
              ) : (
                tokens.map((t) => (
                  <tr key={t.id} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                        {t.name}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                      {t.created}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                      {t.expires}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-muted)" }}>
                      {t.lastUsed}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {t.scopes.map((s) => (
                          <span
                            key={s}
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 capitalize"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setRevokeTarget(t.id)}
                        title="Revoke"
                        className="rounded-lg p-1.5 hover:bg-red-500/10 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {revokeTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setRevokeTarget(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
              style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
                  Revoke Token
                </h2>
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>
                This token will be permanently revoked. Any applications using it will lose access.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRevokeTarget(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium border"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevoke(revokeTarget)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
