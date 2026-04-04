"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, Upload, Shield,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface Provider {
  id: string; name: string; icon: string; enabled: boolean;
  fields: { key: string; label: string; type: string; value: string }[];
}

const INITIAL_PROVIDERS: Provider[] = [
  {
    id: "google", name: "Google Workspace", icon: "G", enabled: false,
    fields: [
      { key: "clientId", label: "Client ID", type: "text", value: "" },
      { key: "clientSecret", label: "Client Secret", type: "password", value: "" },
    ],
  },
  {
    id: "microsoft", name: "Microsoft Entra ID", icon: "M", enabled: false,
    fields: [
      { key: "tenantId", label: "Tenant ID", type: "text", value: "" },
      { key: "clientId", label: "Client ID", type: "text", value: "" },
      { key: "clientSecret", label: "Client Secret", type: "password", value: "" },
    ],
  },
  {
    id: "saml", name: "SAML 2.0", icon: "S", enabled: false,
    fields: [
      { key: "entityId", label: "Entity ID", type: "text", value: "" },
      { key: "ssoUrl", label: "SSO URL", type: "text", value: "" },
      { key: "certificate", label: "Certificate", type: "textarea", value: "" },
    ],
  },
  {
    id: "keycloak", name: "Keycloak", icon: "K", enabled: false,
    fields: [
      { key: "realm", label: "Realm", type: "text", value: "" },
      { key: "serverUrl", label: "Server URL", type: "text", value: "" },
      { key: "clientId", label: "Client ID", type: "text", value: "" },
    ],
  },
];

export default function SsoConfigPage() {
  const router = useRouter();
  const [providers, setProviders] = useState(INITIAL_PROVIDERS);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean } | null>(null);

  const toggle = (id: string) => {
    setProviders((ps) => ps.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const updateField = (providerId: string, fieldKey: string, value: string) => {
    setProviders((ps) => ps.map((p) =>
      p.id === providerId ? { ...p, fields: p.fields.map((f) => f.key === fieldKey ? { ...f, value } : f) } : p
    ));
  };

  const testConnection = async (id: string) => {
    setTesting(id);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 2000));
    setTesting(null);
    setTestResult({ id, ok: Math.random() > 0.3 });
    setTimeout(() => setTestResult(null), 3000);
  };

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <AuthGuard allowedRoles={["tenant_admin", "super_admin"] as UserRole[]}>
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>SSO Configuration</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Configure Single Sign-On providers for your organization</p>
      </div>

      <div className="space-y-4">
        {providers.map((p) => (
          <div key={p.id} className="rounded-xl border overflow-hidden"
            style={{ borderColor: p.enabled ? "var(--gf-accent)" : "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{p.name}</h3>
                  <span className={`text-xs ${p.enabled ? "text-green-400" : ""}`}
                    style={p.enabled ? {} : { color: "var(--gf-text-muted)" }}>
                    {p.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              <button onClick={() => toggle(p.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${p.enabled ? "bg-green-500" : "bg-gray-600"}`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${p.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Config fields */}
            {p.enabled && (
              <div className="border-t px-6 py-4 space-y-3" style={{ borderColor: "var(--gf-border)" }}>
                {p.fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea value={f.value} onChange={(e) => updateField(p.id, f.key, e.target.value)}
                        rows={3} placeholder={`Enter ${f.label.toLowerCase()}...`}
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none font-mono" style={fieldStyle} />
                    ) : (
                      <input type={f.type} value={f.value} onChange={(e) => updateField(p.id, f.key, e.target.value)}
                        placeholder={`Enter ${f.label.toLowerCase()}...`}
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => testConnection(p.id)} disabled={testing === p.id}
                    className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                    style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                    {testing === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {testing === p.id ? "Testing..." : "Test Connection"}
                  </button>
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--gf-accent)" }}>Save</button>
                  {testResult?.id === p.id && (
                    <span className={`flex items-center gap-1 text-sm ${testResult.ok ? "text-green-400" : "text-red-400"}`}>
                      {testResult.ok ? <><CheckCircle2 className="h-4 w-4" /> Connected!</> : <><XCircle className="h-4 w-4" /> Failed</>}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </AuthGuard>
  );
}
