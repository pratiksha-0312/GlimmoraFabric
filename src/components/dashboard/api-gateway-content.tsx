"use client";

import {
  Key,
  Globe,
  Shield,
  Gauge,
  Copy,
  MoreVertical,
  Plus,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  { label: "Active API Keys", value: "34", icon: Key },
  { label: "Routes Configured", value: "128", icon: Globe },
  { label: "Rate-Limited (24h)", value: "1,247", icon: Gauge },
  { label: "Auth Failures (24h)", value: "89", icon: Shield },
];

type KeyStatus = "Active" | "Expired" | "Revoked";

const apiKeys: {
  name: string;
  key: string;
  tenant: string;
  env: string;
  status: KeyStatus;
  calls: string;
  created: string;
}[] = [
  { name: "VerifAI Production", key: "gf_live_a1b2c3...x9z0", tenant: "Acme Corp", env: "Production", status: "Active", calls: "142K", created: "2026-01-15" },
  { name: "Hospitality Dev", key: "gf_test_d4e5f6...w7y8", tenant: "TechVault", env: "Sandbox", status: "Active", calls: "28K", created: "2026-02-20" },
  { name: "Finance Staging", key: "gf_stg_g7h8i9...u5v6", tenant: "GlobalFinance", env: "Staging", status: "Active", calls: "56K", created: "2026-01-28" },
  { name: "Diamond Legacy", key: "gf_live_j0k1l2...s3t4", tenant: "DataShield", env: "Production", status: "Expired", calls: "0", created: "2025-11-10" },
  { name: "Tax Engine CI/CD", key: "gf_test_m3n4o5...q1r2", tenant: "CloudBase", env: "Sandbox", status: "Active", calls: "12K", created: "2026-03-01" },
];

const statusColors: Record<KeyStatus, string> = {
  Active: "#22c55e",
  Expired: "#f59e0b",
  Revoked: "#ef4444",
};

const envColors: Record<string, string> = {
  Production: "#ef4444",
  Staging: "#f59e0b",
  Sandbox: "#3b82f6",
};

type WebhookStatus = "Active" | "Inactive";

const webhooks: {
  endpoint: string;
  events: string;
  status: WebhookStatus;
  lastTriggered: string;
  failures: number;
}[] = [
  { endpoint: "https://acme.corp/hooks/payments", events: "payment.success, payment.failed", status: "Active", lastTriggered: "2026-03-30 09:14", failures: 0 },
  { endpoint: "https://techvault.io/api/webhooks/auth", events: "auth.login, auth.logout, auth.mfa", status: "Active", lastTriggered: "2026-03-30 08:52", failures: 2 },
  { endpoint: "https://globalfinance.net/ingest/events", events: "document.created, document.signed", status: "Active", lastTriggered: "2026-03-29 23:41", failures: 0 },
  { endpoint: "https://old-system.internal/legacy/notify", events: "workflow.completed", status: "Inactive", lastTriggered: "2026-02-14 16:30", failures: 17 },
  { endpoint: "https://datashield.dev/staging/hooks", events: "tenant.created, tenant.suspended", status: "Active", lastTriggered: "2026-03-30 07:05", failures: 1 },
];

const webhookStatusColors: Record<WebhookStatus, string> = {
  Active: "#22c55e",
  Inactive: "#6b7280",
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const apiLogs: {
  time: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  latency: string;
  tenant: string;
}[] = [
  { time: "09:14:32", method: "POST", path: "/api/v1/payments/charge", statusCode: 201, latency: "124ms", tenant: "Acme Corp" },
  { time: "09:14:28", method: "GET", path: "/api/v1/auth/session", statusCode: 200, latency: "18ms", tenant: "TechVault" },
  { time: "09:14:15", method: "DELETE", path: "/api/v1/documents/doc_8f2a", statusCode: 401, latency: "9ms", tenant: "DataShield" },
  { time: "09:13:58", method: "PUT", path: "/api/v1/workflows/wf_331/resume", statusCode: 200, latency: "87ms", tenant: "GlobalFinance" },
  { time: "09:13:42", method: "GET", path: "/api/v1/ai/models", statusCode: 200, latency: "34ms", tenant: "CloudBase" },
  { time: "09:13:30", method: "POST", path: "/api/v1/notifications/send", statusCode: 500, latency: "1,204ms", tenant: "Acme Corp" },
  { time: "09:13:11", method: "GET", path: "/api/v1/payments/invoices", statusCode: 404, latency: "22ms", tenant: "TechVault" },
  { time: "09:12:55", method: "POST", path: "/api/v1/auth/token/refresh", statusCode: 200, latency: "41ms", tenant: "GlobalFinance" },
];

const methodColors: Record<HttpMethod, string> = {
  GET: "#3b82f6",
  POST: "#22c55e",
  PUT: "#f59e0b",
  DELETE: "#ef4444",
};

const statusCodeColor = (code: number): string => {
  if (code >= 200 && code < 300) return "#22c55e";
  if (code === 401) return "#f59e0b";
  if (code === 404) return "#8b5cf6";
  return "#ef4444";
};

const routes = [
  { path: "/api/v1/auth/*", target: "identity-service", method: "ALL", rateLimit: "1000/min", status: "Active" },
  { path: "/api/v1/payments/*", target: "payment-service", method: "ALL", rateLimit: "500/min", status: "Active" },
  { path: "/api/v1/notifications/*", target: "notification-service", method: "POST", rateLimit: "200/min", status: "Active" },
  { path: "/api/v1/documents/*", target: "document-service", method: "ALL", rateLimit: "100/min", status: "Active" },
  { path: "/api/v1/ai/*", target: "ai-platform", method: "POST", rateLimit: "50/min", status: "Active" },
  { path: "/api/v1/workflows/*", target: "workflow-engine", method: "ALL", rateLimit: "300/min", status: "Active" },
];

export function APIGatewayContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            API Gateway &amp; Keys
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
            API routing rules, rate limiting, key management, and gateway configuration
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}
        >
          <Plus className="h-4 w-4" />
          Generate Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                {stat.label}
              </span>
              <stat.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--gf-text-primary)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* API Keys Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          API Keys
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Name", "Key", "Tenant", "Environment", "Status", "Calls (MTD)", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((k, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {k.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--gf-bg-page)", color: "var(--gf-text-secondary)" }}>
                      {k.key}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {k.tenant}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${envColors[k.env]}20`, color: envColors[k.env] }}
                    >
                      {k.env}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${statusColors[k.status]}20`, color: statusColors[k.status] }}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {k.calls}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {k.created}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gateway Routes */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Gateway Routes
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Path Pattern", "Target Service", "Method", "Rate Limit", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {r.path}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {r.target}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {r.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {r.rateLimit}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-500">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Webhooks
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Endpoint URL", "Events", "Status", "Last Triggered", "Failures"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {webhooks.map((w, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {w.endpoint}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {w.events}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${webhookStatusColors[w.status]}20`, color: webhookStatusColors[w.status] }}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {w.lastTriggered}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: w.failures > 5 ? "#ef4444" : "var(--gf-text-secondary)" }}>
                    {w.failures}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Logs */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          API Logs
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Time", "Method", "Path", "Status Code", "Latency", "Tenant"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiLogs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {log.time}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono font-medium px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${methodColors[log.method]}20`, color: methodColors[log.method] }}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>
                    {log.path}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${statusCodeColor(log.statusCode)}20`, color: statusCodeColor(log.statusCode) }}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {log.latency}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {log.tenant}
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
