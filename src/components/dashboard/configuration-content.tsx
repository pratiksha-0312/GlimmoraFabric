"use client";

import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Lock,
  Globe,
  Database,
  Cloud,
  Paintbrush,
} from "lucide-react";

const sections = [
  { label: "Feature Flags", count: 12, icon: ToggleRight },
  { label: "Secrets Vault", count: 24, icon: Lock },
  { label: "Environment Vars", count: 38, icon: Database },
  { label: "Integrations", count: 8, icon: Cloud },
];

const featureFlags = [
  { name: "ai_agent_orchestration", description: "Enable multi-step AI agent workflows", enabled: true, scope: "Global", lastModified: "2 days ago" },
  { name: "payment_auto_retry", description: "Auto-retry failed payments with fallback gateway", enabled: true, scope: "Global", lastModified: "5 days ago" },
  { name: "e_signature_v2", description: "New e-signature flow with DocuSign integration", enabled: false, scope: "Global", lastModified: "1 week ago" },
  { name: "workflow_visual_builder", description: "Drag-and-drop workflow builder UI", enabled: true, scope: "Global", lastModified: "3 days ago" },
  { name: "tenant_custom_domain", description: "Allow tenants to configure custom domains", enabled: false, scope: "Per-Tenant", lastModified: "2 weeks ago" },
  { name: "realtime_notifications", description: "WebSocket-based real-time notification delivery", enabled: true, scope: "Global", lastModified: "1 day ago" },
  { name: "audit_log_export_csv", description: "Export audit logs as CSV files", enabled: true, scope: "Global", lastModified: "4 days ago" },
  { name: "dark_mode_tenant_portal", description: "Dark mode support for tenant-facing portal", enabled: false, scope: "Per-Tenant", lastModified: "1 week ago" },
];

const integrations = [
  { name: "Stripe", category: "Payment", status: "Connected", version: "v2024-03", environment: "Production" },
  { name: "Razorpay", category: "Payment", status: "Connected", version: "v2", environment: "Production" },
  { name: "SendGrid", category: "Email", status: "Connected", version: "v3", environment: "Production" },
  { name: "Twilio", category: "SMS", status: "Connected", version: "2010-04-01", environment: "Production" },
  { name: "Firebase FCM", category: "Push", status: "Connected", version: "v1", environment: "Production" },
  { name: "DocuSign", category: "E-Sign", status: "Not Connected", version: "-", environment: "-" },
  { name: "Keycloak", category: "SSO/IdP", status: "Connected", version: "v22", environment: "Production" },
  { name: "AWS S3", category: "Storage", status: "Connected", version: "2006-03-01", environment: "Production" },
];

const platformConfig = [
  { key: "MAX_TENANTS", value: "500", category: "Limits" },
  { key: "SESSION_TTL_SECONDS", value: "3600", category: "Auth" },
  { key: "MFA_ENFORCEMENT", value: "optional", category: "Auth" },
  { key: "RATE_LIMIT_DEFAULT", value: "1000/min", category: "Gateway" },
  { key: "AUDIT_RETENTION_DAYS", value: "365", category: "Compliance" },
  { key: "AI_MAX_TOKENS_PER_REQUEST", value: "4096", category: "AI" },
  { key: "WEBHOOK_TIMEOUT_MS", value: "5000", category: "Gateway" },
  { key: "FILE_UPLOAD_MAX_MB", value: "50", category: "Storage" },
];

const regionSettings = [
  { name: "US-East", status: "Active", tenants: 142, primaryProvider: "AWS", dataResidency: "Compliant" },
  { name: "US-West", status: "Active", tenants: 98, primaryProvider: "AWS", dataResidency: "Compliant" },
  { name: "EU-West", status: "Active", tenants: 76, primaryProvider: "AWS", dataResidency: "GDPR Compliant" },
  { name: "AP-South", status: "Inactive", tenants: 31, primaryProvider: "Azure", dataResidency: "Pending Review" },
  { name: "EU-Central", status: "Active", tenants: 53, primaryProvider: "Azure", dataResidency: "GDPR Compliant" },
];

const providerConfigs = [
  { channel: "SMS", primary: "Twilio", fallback: "Vonage", status: "Active", region: "US-East" },
  { channel: "Email", primary: "SendGrid", fallback: "AWS SES", status: "Active", region: "US-East" },
  { channel: "Payment", primary: "Stripe", fallback: "Razorpay", status: "Active", region: "US-West" },
  { channel: "Push", primary: "Firebase FCM", fallback: "OneSignal", status: "Active", region: "EU-West" },
  { channel: "Storage", primary: "AWS S3", fallback: "Azure Blob", status: "Active", region: "EU-Central" },
];

export function ConfigurationContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Configuration
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Platform settings, feature flags, secrets vault, integrations, and environment configuration
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((sec) => (
          <div
            key={sec.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                {sec.label}
              </span>
              <sec.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--gf-text-primary)" }}>
              {sec.count}
            </p>
          </div>
        ))}
      </div>

      {/* Feature Flags */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Feature Flags
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Flag", "Description", "Scope", "Status", "Modified"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureFlags.map((ff) => (
                <tr key={ff.name} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {ff.name}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {ff.description}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {ff.scope}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {ff.enabled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500">
                        <ToggleRight className="h-4 w-4" /> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>
                        <ToggleLeft className="h-4 w-4" /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                    {ff.lastModified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Integrations */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Integrations
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Service", "Category", "Status", "Version"].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {integrations.map((int) => (
                <tr key={int.name} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {int.name}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {int.category}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        int.status === "Connected"
                          ? "bg-green-500/15 text-green-500"
                          : "bg-gray-500/15 text-gray-500"
                      }`}
                    >
                      {int.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>
                    {int.version}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Platform Config */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Platform Config
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Key", "Value", "Category"].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platformConfig.map((cfg) => (
                <tr key={cfg.key} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {cfg.key}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-accent)" }}>
                    {cfg.value}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {cfg.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Region Settings */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Region Settings
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {regionSettings.map((region) => (
            <div
              key={region.name}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                    {region.name}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    region.status === "Active"
                      ? "bg-green-500/15 text-green-500"
                      : "bg-gray-500/15 text-gray-500"
                  }`}
                >
                  {region.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--gf-text-secondary)" }}>Tenants</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{region.tenants}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--gf-text-secondary)" }}>Primary Provider</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{region.primaryProvider}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--gf-text-secondary)" }}>Data Residency</span>
                  <span
                    className="font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                  >
                    {region.dataResidency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Configs */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Provider Configs
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Channel", "Primary Provider", "Fallback Provider", "Status", "Region"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providerConfigs.map((pc) => (
                <tr key={pc.channel} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {pc.channel}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {pc.primary}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {pc.fallback}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        pc.status === "Active"
                          ? "bg-green-500/15 text-green-500"
                          : "bg-gray-500/15 text-gray-500"
                      }`}
                    >
                      {pc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {pc.region}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
