"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import {
  ApiError,
  ssoApi,
  type ConfigureSSOInput,
  type SSOConfig,
  type SSOProtocol,
} from "@/lib/api";
import type { UserRole } from "@/lib/roles";

interface FormState {
  idp_entity_id: string;
  idp_sso_url: string;
  idp_certificate: string;
  oidc_client_id: string;
  oidc_client_secret: string;
  oidc_discovery_url: string;
}

const EMPTY_FORM: FormState = {
  idp_entity_id: "",
  idp_sso_url: "",
  idp_certificate: "",
  oidc_client_id: "",
  oidc_client_secret: "",
  oidc_discovery_url: "",
};

export default function SsoConfigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";

  const [protocol, setProtocol] = useState<SSOProtocol>("saml");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [config, setConfig] = useState<SSOConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchConfig = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError("");
    try {
      const cfg = await ssoApi.get(tenantId);
      setConfig(cfg);
      if (cfg) {
        setProtocol(cfg.protocol);
        setForm({
          idp_entity_id: cfg.idp_entity_id ?? "",
          idp_sso_url: cfg.idp_sso_url ?? "",
          idp_certificate: "",
          oidc_client_id: cfg.oidc_client_id ?? "",
          oidc_client_secret: "",
          oidc_discovery_url: cfg.oidc_discovery_url ?? "",
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load SSO config");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const update = (key: keyof FormState, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const save = async () => {
    if (!tenantId) {
      toast.error("Missing tenant context");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: ConfigureSSOInput =
        protocol === "saml"
          ? {
              protocol: "saml",
              idp_entity_id: form.idp_entity_id,
              idp_sso_url: form.idp_sso_url,
              idp_certificate: form.idp_certificate || undefined,
            }
          : {
              protocol: "oidc",
              oidc_client_id: form.oidc_client_id,
              oidc_client_secret: form.oidc_client_secret || undefined,
              oidc_discovery_url: form.oidc_discovery_url,
            };
      const saved = await ssoApi.configure(tenantId, payload);
      setConfig(saved);
      toast.success("SSO configuration saved");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save SSO";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const disable = async () => {
    if (!tenantId || !config) return;
    setSaving(true);
    try {
      await ssoApi.disable(tenantId);
      setConfig(null);
      setForm(EMPTY_FORM);
      toast.success("SSO disabled");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to disable SSO");
    } finally {
      setSaving(false);
    }
  };

  const downloadMetadata = async () => {
    if (!tenantId) return;
    try {
      const res = await ssoApi.samlMetadata(tenantId);
      const xml = await res.text();
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sp-metadata-${tenantId}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to download metadata");
    }
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  return (
    <AuthGuard allowedRoles={["tenant_admin", "super_admin"] as UserRole[]}>
      <div className="space-y-6 max-w-3xl">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
          style={{ color: "var(--gf-text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </button>

        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            SSO Configuration
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            Configure Single Sign-On for your organization (SAML 2.0 or OIDC)
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--gf-text-muted)" }}>
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: config?.is_active ? "var(--gf-accent)" : "var(--gf-border)",
              backgroundColor: "var(--gf-bg-surface)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--gf-border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                    Identity Provider
                  </h3>
                  <span
                    className={`text-xs ${config?.is_active ? "text-green-400" : ""}`}
                    style={config?.is_active ? {} : { color: "var(--gf-text-muted)" }}
                  >
                    {config?.is_active ? "Enabled" : "Not configured"}
                  </span>
                </div>
              </div>
              {config?.is_active && (
                <button
                  onClick={disable}
                  disabled={saving}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Disable SSO
                </button>
              )}
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                  Protocol
                </label>
                <div className="flex gap-2">
                  {(["saml", "oidc"] as SSOProtocol[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium uppercase ${
                        protocol === p ? "border-[var(--gf-accent)] text-[var(--gf-accent)]" : ""
                      }`}
                      style={{
                        borderColor: protocol === p ? "var(--gf-accent)" : "var(--gf-border)",
                        color: protocol === p ? "var(--gf-accent)" : "var(--gf-text-primary)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {protocol === "saml" ? (
                <>
                  <Field label="IdP Entity ID" value={form.idp_entity_id} onChange={(v) => update("idp_entity_id", v)} style={fieldStyle} />
                  <Field label="IdP SSO URL" value={form.idp_sso_url} onChange={(v) => update("idp_sso_url", v)} style={fieldStyle} />
                  <Field
                    label="IdP Certificate (PEM)"
                    value={form.idp_certificate}
                    onChange={(v) => update("idp_certificate", v)}
                    style={fieldStyle}
                    multiline
                    placeholder={config?.is_active ? "Leave blank to keep existing certificate" : "-----BEGIN CERTIFICATE-----..."}
                  />
                  <button
                    onClick={downloadMetadata}
                    className="text-xs font-medium hover:underline"
                    style={{ color: "var(--gf-accent)" }}
                  >
                    Download SP metadata XML
                  </button>
                </>
              ) : (
                <>
                  <Field label="Client ID" value={form.oidc_client_id} onChange={(v) => update("oidc_client_id", v)} style={fieldStyle} />
                  <Field
                    label="Client Secret"
                    value={form.oidc_client_secret}
                    onChange={(v) => update("oidc_client_secret", v)}
                    style={fieldStyle}
                    type="password"
                    placeholder={config?.is_active ? "Leave blank to keep existing secret" : ""}
                  />
                  <Field label="Discovery URL" value={form.oidc_discovery_url} onChange={(v) => update("oidc_discovery_url", v)} style={fieldStyle} />
                </>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--gf-accent)" }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

function Field({
  label,
  value,
  onChange,
  style,
  multiline,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  style: React.CSSProperties;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none font-mono"
          style={style}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={style}
        />
      )}
    </div>
  );
}
