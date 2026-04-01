"use client";

import { useState, useMemo } from "react";
import {
  Key,
  Globe,
  Shield,
  Gauge,
  Copy,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Webhook,
  Route,
  Activity,
  Clock,
  Zap,
  Link,
  Play,
  Pause,
} from "lucide-react";

// ===========================================================================
// Types
// ===========================================================================

type KeyStatus = "Active" | "Expired" | "Revoked";
type EnvType = "Production" | "Staging" | "Sandbox";
type WebhookStatus = "Active" | "Inactive";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "ALL";
type RouteStatus = "Active" | "Disabled";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  fullKey: string;
  tenant: string;
  env: EnvType;
  status: KeyStatus;
  calls: string;
  created: string;
  lastUsed: string;
  expiresAt: string;
  scopes: string[];
}

interface GatewayRoute {
  id: string;
  path: string;
  target: string;
  method: HttpMethod;
  rateLimit: string;
  status: RouteStatus;
  authRequired: boolean;
  description: string;
}

interface WebhookEntry {
  id: string;
  endpoint: string;
  events: string;
  status: WebhookStatus;
  lastTriggered: string;
  failures: number;
  secret: string;
  description: string;
}

interface ApiLog {
  id: string;
  time: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  latency: string;
  tenant: string;
  requestHeaders: string;
  responseBody: string;
  ip: string;
}

// ===========================================================================
// Mock Data
// ===========================================================================

const INITIAL_API_KEYS: ApiKey[] = [
  { id: "k1", name: "VerifAI Production", key: "gf_live_a1b2c3...x9z0", fullKey: "gf_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x9z0", tenant: "Acme Corp", env: "Production", status: "Active", calls: "142K", created: "2026-01-15", lastUsed: "2026-03-31 09:14", expiresAt: "2027-01-15", scopes: ["read", "write", "admin"] },
  { id: "k2", name: "Hospitality Dev", key: "gf_test_d4e5f6...w7y8", fullKey: "gf_test_d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w7y8", tenant: "TechVault", env: "Sandbox", status: "Active", calls: "28K", created: "2026-02-20", lastUsed: "2026-03-30 14:22", expiresAt: "2027-02-20", scopes: ["read", "write"] },
  { id: "k3", name: "Finance Staging", key: "gf_stg_g7h8i9...u5v6", fullKey: "gf_stg_g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2u5v6", tenant: "GlobalFinance", env: "Staging", status: "Active", calls: "56K", created: "2026-01-28", lastUsed: "2026-03-31 08:05", expiresAt: "2027-01-28", scopes: ["read", "write", "billing"] },
  { id: "k4", name: "Diamond Legacy", key: "gf_live_j0k1l2...s3t4", fullKey: "gf_live_j0k1l2m3n4o5p6q7r8s9t0u1v2s3t4", tenant: "DataShield", env: "Production", status: "Expired", calls: "0", created: "2025-11-10", lastUsed: "2026-01-05 11:30", expiresAt: "2026-02-10", scopes: ["read"] },
  { id: "k5", name: "Tax Engine CI/CD", key: "gf_test_m3n4o5...q1r2", fullKey: "gf_test_m3n4o5p6q7r8s9t0u1v2q1r2", tenant: "CloudBase", env: "Sandbox", status: "Active", calls: "12K", created: "2026-03-01", lastUsed: "2026-03-31 07:55", expiresAt: "2027-03-01", scopes: ["read", "write"] },
  { id: "k6", name: "Aero Analytics", key: "gf_live_p1q2r3...n4m5", fullKey: "gf_live_p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7n4m5", tenant: "Aero Systems", env: "Production", status: "Active", calls: "89K", created: "2026-02-10", lastUsed: "2026-03-31 09:02", expiresAt: "2027-02-10", scopes: ["read", "write", "analytics"] },
  { id: "k7", name: "Acme Sandbox Test", key: "gf_test_x8y9z0...l2k3", fullKey: "gf_test_x8y9z0a1b2c3d4e5f6g7h8i9j0l2k3", tenant: "Acme Corp", env: "Sandbox", status: "Revoked", calls: "3K", created: "2026-01-05", lastUsed: "2026-02-12 16:44", expiresAt: "2027-01-05", scopes: ["read"] },
  { id: "k8", name: "GlobalFinance Prod", key: "gf_live_c3d4e5...j1k2", fullKey: "gf_live_c3d4e5f6g7h8i9j0k1l2m3n4o5p6j1k2", tenant: "GlobalFinance", env: "Production", status: "Active", calls: "210K", created: "2025-12-01", lastUsed: "2026-03-31 09:15", expiresAt: "2026-12-01", scopes: ["read", "write", "admin", "billing"] },
];

const INITIAL_ROUTES: GatewayRoute[] = [
  { id: "r1", path: "/api/v1/auth/*", target: "identity-service", method: "ALL", rateLimit: "1000/min", status: "Active", authRequired: false, description: "Authentication and session management" },
  { id: "r2", path: "/api/v1/payments/*", target: "payment-service", method: "ALL", rateLimit: "500/min", status: "Active", authRequired: true, description: "Payment processing and invoicing" },
  { id: "r3", path: "/api/v1/notifications/*", target: "notification-service", method: "POST", rateLimit: "200/min", status: "Active", authRequired: true, description: "Push and email notifications" },
  { id: "r4", path: "/api/v1/documents/*", target: "document-service", method: "ALL", rateLimit: "100/min", status: "Active", authRequired: true, description: "Document upload and signing" },
  { id: "r5", path: "/api/v1/ai/*", target: "ai-platform", method: "POST", rateLimit: "50/min", status: "Active", authRequired: true, description: "AI model inference endpoints" },
  { id: "r6", path: "/api/v1/workflows/*", target: "workflow-engine", method: "ALL", rateLimit: "300/min", status: "Active", authRequired: true, description: "Workflow execution and management" },
  { id: "r7", path: "/api/v1/tenants/*", target: "tenant-service", method: "ALL", rateLimit: "100/min", status: "Active", authRequired: true, description: "Tenant provisioning and config" },
  { id: "r8", path: "/api/v1/legacy/*", target: "legacy-proxy", method: "ALL", rateLimit: "50/min", status: "Disabled", authRequired: true, description: "Deprecated legacy API proxy" },
];

const INITIAL_WEBHOOKS: WebhookEntry[] = [
  { id: "w1", endpoint: "https://acme.corp/hooks/payments", events: "payment.success, payment.failed", status: "Active", lastTriggered: "2026-03-30 09:14", failures: 0, secret: "whsec_a1b2c3d4e5", description: "Acme payment notifications" },
  { id: "w2", endpoint: "https://techvault.io/api/webhooks/auth", events: "auth.login, auth.logout, auth.mfa", status: "Active", lastTriggered: "2026-03-30 08:52", failures: 2, secret: "whsec_f6g7h8i9j0", description: "TechVault auth events" },
  { id: "w3", endpoint: "https://globalfinance.net/ingest/events", events: "document.created, document.signed", status: "Active", lastTriggered: "2026-03-29 23:41", failures: 0, secret: "whsec_k1l2m3n4o5", description: "GlobalFinance document pipeline" },
  { id: "w4", endpoint: "https://old-system.internal/legacy/notify", events: "workflow.completed", status: "Inactive", lastTriggered: "2026-02-14 16:30", failures: 17, secret: "whsec_p6q7r8s9t0", description: "Deprecated legacy webhook" },
  { id: "w5", endpoint: "https://datashield.dev/staging/hooks", events: "tenant.created, tenant.suspended", status: "Active", lastTriggered: "2026-03-30 07:05", failures: 1, secret: "whsec_u1v2w3x4y5", description: "DataShield tenant events" },
  { id: "w6", endpoint: "https://aero.systems/events/ingest", events: "ai.inference.completed, ai.model.deployed", status: "Active", lastTriggered: "2026-03-31 06:30", failures: 0, secret: "whsec_z6a7b8c9d0", description: "Aero AI event stream" },
];

const INITIAL_LOGS: ApiLog[] = [
  { id: "l1", time: "09:14:32", method: "POST", path: "/api/v1/payments/charge", statusCode: 201, latency: "124ms", tenant: "Acme Corp", requestHeaders: "Authorization: Bearer gf_live_a1b...\nContent-Type: application/json\nX-Request-ID: req_8f2a3b", responseBody: '{"id":"pay_1234","status":"succeeded","amount":4999}', ip: "203.0.113.42" },
  { id: "l2", time: "09:14:28", method: "GET", path: "/api/v1/auth/session", statusCode: 200, latency: "18ms", tenant: "TechVault", requestHeaders: "Authorization: Bearer gf_test_d4e...\nAccept: application/json", responseBody: '{"session_id":"sess_abc","user":"admin@techvault.io","expires":"2026-03-31T10:14:28Z"}', ip: "198.51.100.15" },
  { id: "l3", time: "09:14:15", method: "DELETE", path: "/api/v1/documents/doc_8f2a", statusCode: 401, latency: "9ms", tenant: "DataShield", requestHeaders: "Authorization: Bearer gf_live_expired...\nAccept: application/json", responseBody: '{"error":"unauthorized","message":"Token expired or revoked"}', ip: "192.0.2.88" },
  { id: "l4", time: "09:13:58", method: "PUT", path: "/api/v1/workflows/wf_331/resume", statusCode: 200, latency: "87ms", tenant: "GlobalFinance", requestHeaders: "Authorization: Bearer gf_stg_g7h...\nContent-Type: application/json", responseBody: '{"workflow_id":"wf_331","status":"running","step":4}', ip: "203.0.113.99" },
  { id: "l5", time: "09:13:42", method: "GET", path: "/api/v1/ai/models", statusCode: 200, latency: "34ms", tenant: "CloudBase", requestHeaders: "Authorization: Bearer gf_test_m3n...\nAccept: application/json", responseBody: '{"models":["gpt-4","claude-3","gemini-pro"],"count":3}', ip: "198.51.100.77" },
  { id: "l6", time: "09:13:30", method: "POST", path: "/api/v1/notifications/send", statusCode: 500, latency: "1,204ms", tenant: "Acme Corp", requestHeaders: "Authorization: Bearer gf_live_a1b...\nContent-Type: application/json", responseBody: '{"error":"internal_server_error","message":"Notification service timeout"}', ip: "203.0.113.42" },
  { id: "l7", time: "09:13:11", method: "GET", path: "/api/v1/payments/invoices", statusCode: 404, latency: "22ms", tenant: "TechVault", requestHeaders: "Authorization: Bearer gf_test_d4e...\nAccept: application/json", responseBody: '{"error":"not_found","message":"No invoices found for account"}', ip: "198.51.100.15" },
  { id: "l8", time: "09:12:55", method: "POST", path: "/api/v1/auth/token/refresh", statusCode: 200, latency: "41ms", tenant: "GlobalFinance", requestHeaders: "Authorization: Bearer gf_stg_g7h...\nContent-Type: application/json", responseBody: '{"access_token":"gf_stg_new...","expires_in":3600}', ip: "203.0.113.99" },
  { id: "l9", time: "09:12:40", method: "POST", path: "/api/v1/ai/inference", statusCode: 429, latency: "5ms", tenant: "Aero Systems", requestHeaders: "Authorization: Bearer gf_live_p1q...\nContent-Type: application/json", responseBody: '{"error":"rate_limited","message":"Rate limit exceeded: 50/min","retry_after":12}', ip: "198.51.100.200" },
  { id: "l10", time: "09:12:22", method: "GET", path: "/api/v1/tenants/t1/config", statusCode: 200, latency: "15ms", tenant: "Acme Corp", requestHeaders: "Authorization: Bearer gf_live_a1b...\nAccept: application/json", responseBody: '{"tenant_id":"t1","plan":"Enterprise","features":["sso","audit","custom_domain"]}', ip: "203.0.113.42" },
  { id: "l11", time: "09:11:58", method: "DELETE", path: "/api/v1/workflows/wf_102", statusCode: 204, latency: "33ms", tenant: "CloudBase", requestHeaders: "Authorization: Bearer gf_test_m3n...", responseBody: "", ip: "198.51.100.77" },
  { id: "l12", time: "09:11:30", method: "POST", path: "/api/v1/documents/upload", statusCode: 201, latency: "890ms", tenant: "GlobalFinance", requestHeaders: "Authorization: Bearer gf_stg_g7h...\nContent-Type: multipart/form-data", responseBody: '{"document_id":"doc_9x2f","size":"2.4MB","status":"processing"}', ip: "203.0.113.99" },
];

const TENANTS = ["Acme Corp", "TechVault", "GlobalFinance", "DataShield", "CloudBase", "Aero Systems"];
const ENV_OPTIONS: EnvType[] = ["Production", "Staging", "Sandbox"];
const KEY_STATUSES: KeyStatus[] = ["Active", "Expired", "Revoked"];
const ROUTE_TARGETS = ["identity-service", "payment-service", "notification-service", "document-service", "ai-platform", "workflow-engine", "tenant-service", "legacy-proxy"];
const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "ALL"];
const SCOPE_OPTIONS = ["read", "write", "admin", "billing", "analytics"];

// ===========================================================================
// Style constants
// ===========================================================================

const statusColors: Record<KeyStatus, string> = { Active: "#22c55e", Expired: "#f59e0b", Revoked: "#ef4444" };
const envColors: Record<string, string> = { Production: "#ef4444", Staging: "#f59e0b", Sandbox: "#3b82f6" };
const webhookStatusColors: Record<WebhookStatus, string> = { Active: "#22c55e", Inactive: "#6b7280" };
const routeStatusColors: Record<RouteStatus, string> = { Active: "#22c55e", Disabled: "#6b7280" };
const methodColors: Record<string, string> = { GET: "#3b82f6", POST: "#22c55e", PUT: "#f59e0b", DELETE: "#ef4444", ALL: "#8b5cf6" };

const statusCodeColor = (code: number): string => {
  if (code >= 200 && code < 300) return "#22c55e";
  if (code === 401 || code === 403) return "#f59e0b";
  if (code === 404) return "#8b5cf6";
  if (code === 429) return "#f97316";
  return "#ef4444";
};

const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

const PAGE_SIZE_KEYS = 5;
const PAGE_SIZE_LOGS = 6;

// ===========================================================================
// Stat Card
// ===========================================================================

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}

// ===========================================================================
// Clipboard helper
// ===========================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="rounded p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }} title="Copy">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ===========================================================================
// Tab Button
// ===========================================================================

function TabButton({ active, label, icon, count, onClick }: { active: boolean; label: string; icon: React.ReactNode; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active ? "border-[var(--gf-accent)]" : "border-transparent hover:opacity-70"}`}
      style={{ color: active ? "var(--gf-accent)" : "var(--gf-text-secondary)" }}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white" style={{ backgroundColor: active ? "var(--gf-accent)" : "var(--gf-text-muted)" }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ===========================================================================
// Delete Confirmation Modal
// ===========================================================================

function DeleteConfirmModal({ title, message, onConfirm, onCancel }: { title: string; message: React.ReactNode; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{title}</h2>
        </div>
        <div className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 transition-colors hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Toast Notification
// ===========================================================================

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{message}</span>
      <button onClick={onClose} className="ml-2 rounded p-0.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ===========================================================================
// API Key Form Modal
// ===========================================================================

function ApiKeyFormModal({ apiKey, onSave, onCancel }: { apiKey?: ApiKey | null; onSave: (data: { name: string; tenant: string; env: EnvType; expiresAt: string; scopes: string[] }) => void; onCancel: () => void }) {
  const isEdit = !!apiKey;
  const [name, setName] = useState(apiKey?.name ?? "");
  const [tenant, setTenant] = useState(apiKey?.tenant ?? TENANTS[0]);
  const [env, setEnv] = useState<EnvType>(apiKey?.env ?? "Sandbox");
  const [expiresAt, setExpiresAt] = useState(apiKey?.expiresAt ?? "2027-04-01");
  const [scopes, setScopes] = useState<string[]>(apiKey?.scopes ?? ["read"]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleScope = (s: string) => setScopes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Key name is required";
    if (scopes.length === 0) e.scopes = "Select at least one scope";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({ name, tenant, env, expiresAt, scopes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit API Key" : "Generate New API Key"}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Key Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production API Key" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant</label>
              <select value={tenant} onChange={(e) => setTenant(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {TENANTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Environment</label>
              <select value={env} onChange={(e) => setEnv(e.target.value as EnvType)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {ENV_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Expires At</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Scopes *</label>
            <div className="flex flex-wrap gap-2">
              {SCOPE_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => toggleScope(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${scopes.includes(s) ? "text-white" : ""}`}
                  style={scopes.includes(s) ? { backgroundColor: "var(--gf-accent)", borderColor: "var(--gf-accent)" } : { borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
                >{s}</button>
              ))}
            </div>
            {errors.scopes && <p className="text-xs text-red-500 mt-1">{errors.scopes}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{isEdit ? "Save Changes" : "Generate Key"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// API Key Detail Modal
// ===========================================================================

function ApiKeyDetailModal({ apiKey, onClose, onEdit, onRevoke }: { apiKey: ApiKey; onClose: () => void; onEdit: () => void; onRevoke: () => void }) {
  const sc = statusColors[apiKey.status];
  const ec = envColors[apiKey.env];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>API Key Details</h2>
          <div className="flex items-center gap-2">
            {apiKey.status === "Active" && (
              <button onClick={onEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                <Pencil className="h-3 w-3 inline mr-1" />Edit
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
              <Key className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{apiKey.name}</h3>
              <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{apiKey.tenant}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${sc}20`, color: sc }}>{apiKey.status}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${ec}20`, color: ec }}>{apiKey.env}</span>
          </div>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-muted)" }}>API Key</p>
            <div className="flex items-center gap-2 rounded-lg border p-3 font-mono text-xs" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>
              <span className="flex-1 break-all">{apiKey.fullKey}</span>
              <CopyButton text={apiKey.fullKey} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Calls (MTD)", value: apiKey.calls },
              { label: "Last Used", value: apiKey.lastUsed },
              { label: "Created", value: apiKey.created },
              { label: "Expires", value: apiKey.expiresAt },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--gf-text-muted)" }}>Scopes</p>
            <div className="flex flex-wrap gap-2">
              {apiKey.scopes.map((s) => (
                <span key={s} className="rounded-full px-3 py-1 text-xs font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>{s}</span>
              ))}
            </div>
          </div>
          {apiKey.status === "Active" && (
            <div className="pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
              <button onClick={onRevoke} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors">
                <Ban className="h-4 w-4" />Revoke Key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// New Key Generated Modal (shows key once)
// ===========================================================================

function NewKeyModal({ name, fullKey, onClose }: { name: string; fullKey: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Key Generated</h2>
        </div>
        <p className="text-sm mb-2" style={{ color: "var(--gf-text-secondary)" }}>
          Your new API key <strong style={{ color: "var(--gf-text-primary)" }}>{name}</strong> has been created. Copy it now — you won&apos;t be able to see the full key again.
        </p>
        <div className="flex items-center gap-2 rounded-lg border p-3 my-4 font-mono text-xs break-all" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>
          <span className="flex-1">{fullKey}</span>
          <CopyButton text={fullKey} />
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Route Form Modal
// ===========================================================================

function RouteFormModal({ route, onSave, onCancel }: { route?: GatewayRoute | null; onSave: (data: Omit<GatewayRoute, "id">) => void; onCancel: () => void }) {
  const isEdit = !!route;
  const [path, setPath] = useState(route?.path ?? "/api/v1/");
  const [target, setTarget] = useState(route?.target ?? ROUTE_TARGETS[0]);
  const [method, setMethod] = useState<HttpMethod>(route?.method ?? "ALL");
  const [rateLimit, setRateLimit] = useState(route?.rateLimit ?? "100/min");
  const [status, setStatus] = useState<RouteStatus>(route?.status ?? "Active");
  const [authRequired, setAuthRequired] = useState(route?.authRequired ?? true);
  const [description, setDescription] = useState(route?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!path.trim()) e.path = "Path pattern is required";
    if (!rateLimit.trim()) e.rateLimit = "Rate limit is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({ path, target, method, rateLimit, status, authRequired, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit Route" : "Add Route"}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Path Pattern *</label>
            <input type="text" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/api/v1/resource/*" className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.path && <p className="text-xs text-red-500 mt-1">{errors.path}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Target Service</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {ROUTE_TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>HTTP Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as HttpMethod)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Rate Limit *</label>
              <input type="text" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} placeholder="e.g. 500/min" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.rateLimit && <p className="text-xs text-red-500 mt-1">{errors.rateLimit}</p>}
            </div>
            {isEdit && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as RouteStatus)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setAuthRequired(!authRequired)}
              className={`relative h-6 w-11 rounded-full transition-colors ${authRequired ? "bg-[var(--gf-accent)]" : ""}`}
              style={!authRequired ? { backgroundColor: "var(--gf-bg-elevated)" } : {}}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${authRequired ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Require Authentication</span>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{isEdit ? "Save Changes" : "Add Route"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// Webhook Form Modal
// ===========================================================================

function WebhookFormModal({ webhook, onSave, onCancel }: { webhook?: WebhookEntry | null; onSave: (data: Omit<WebhookEntry, "id" | "lastTriggered" | "failures" | "secret">) => void; onCancel: () => void }) {
  const isEdit = !!webhook;
  const [endpoint, setEndpoint] = useState(webhook?.endpoint ?? "https://");
  const [events, setEvents] = useState(webhook?.events ?? "");
  const [status, setStatus] = useState<WebhookStatus>(webhook?.status ?? "Active");
  const [description, setDescription] = useState(webhook?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!endpoint.trim() || endpoint === "https://") e.endpoint = "Endpoint URL is required";
    if (!events.trim()) e.events = "At least one event is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({ endpoint, events, status, description });
  };

  const EVENT_SUGGESTIONS = ["payment.success", "payment.failed", "auth.login", "auth.logout", "auth.mfa", "document.created", "document.signed", "tenant.created", "tenant.suspended", "workflow.completed", "ai.inference.completed"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit Webhook" : "Add Webhook"}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Endpoint URL *</label>
            <input type="url" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://your-app.com/webhooks" className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.endpoint && <p className="text-xs text-red-500 mt-1">{errors.endpoint}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Events * <span className="font-normal">(comma-separated)</span></label>
            <input type="text" value={events} onChange={(e) => setEvents(e.target.value)} placeholder="payment.success, auth.login" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.events && <p className="text-xs text-red-500 mt-1">{errors.events}</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {EVENT_SUGGESTIONS.filter((s) => !events.includes(s)).slice(0, 6).map((s) => (
                <button key={s} type="button" onClick={() => setEvents((prev) => prev ? `${prev}, ${s}` : s)}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium border hover:opacity-80 transition-colors"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-muted)" }}
                >+ {s}</button>
              ))}
            </div>
          </div>
          {isEdit && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as WebhookStatus)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{isEdit ? "Save Changes" : "Add Webhook"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// Webhook Detail Modal
// ===========================================================================

function WebhookDetailModal({ webhook, onClose, onEdit, onTest }: { webhook: WebhookEntry; onClose: () => void; onEdit: () => void; onTest: () => void }) {
  const sc = webhookStatusColors[webhook.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Webhook Details</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
              <Pencil className="h-3 w-3 inline mr-1" />Edit
            </button>
            <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
              <Webhook className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--gf-text-primary)" }}>{webhook.description || "Webhook"}</h3>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{webhook.endpoint}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${sc}20`, color: sc }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sc }} />{webhook.status}
            </span>
            {webhook.failures > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                {webhook.failures} failure{webhook.failures > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>Events</p>
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{webhook.events}</p>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>Last Triggered</p>
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{webhook.lastTriggered}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-muted)" }}>Signing Secret</p>
            <div className="flex items-center gap-2 rounded-lg border p-3 font-mono text-xs" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>
              <span className="flex-1">{webhook.secret}</span>
              <CopyButton text={webhook.secret} />
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            <button onClick={onTest} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80 transition-colors" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Send className="h-4 w-4" />Test Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Log Detail Modal
// ===========================================================================

function LogDetailModal({ log, onClose }: { log: ApiLog; onClose: () => void }) {
  const mc = methodColors[log.method];
  const sc = statusCodeColor(log.statusCode);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold" style={{ backgroundColor: `${mc}20`, color: mc }}>{log.method}</span>
            <h2 className="text-base font-bold font-mono" style={{ color: "var(--gf-text-primary)" }}>{log.path}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Status", value: log.statusCode.toString(), color: sc },
              { label: "Latency", value: log.latency },
              { label: "Tenant", value: log.tenant },
              { label: "Time", value: log.time },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                <p className="text-sm font-bold" style={{ color: item.color || "var(--gf-text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>IP Address</p>
            <p className="text-sm font-mono" style={{ color: "var(--gf-text-primary)" }}>{log.ip}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-muted)" }}>Request Headers</p>
            <pre className="rounded-lg border p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>{log.requestHeaders}</pre>
          </div>
          {log.responseBody && (
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-muted)" }}>Response Body</p>
              <pre className="rounded-lg border p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>
                {(() => { try { return JSON.stringify(JSON.parse(log.responseBody), null, 2); } catch { return log.responseBody; } })()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Sort helpers
// ===========================================================================

type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

// ===========================================================================
// Main Component
// ===========================================================================

export function APIGatewayContent() {
  // --- Tab state ---
  const [activeTab, setActiveTab] = useState<"keys" | "routes" | "webhooks" | "logs">("keys");

  // --- Data state ---
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [routes, setRoutes] = useState<GatewayRoute[]>(INITIAL_ROUTES);
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>(INITIAL_WEBHOOKS);
  const [logs] = useState<ApiLog[]>(INITIAL_LOGS);

  // --- Search & Filter ---
  const [search, setSearch] = useState("");
  const [filterEnv, setFilterEnv] = useState<EnvType | "All">("All");
  const [filterKeyStatus, setFilterKeyStatus] = useState<KeyStatus | "All">("All");
  const [filterRouteStatus, setFilterRouteStatus] = useState<RouteStatus | "All">("All");
  const [filterMethod, setFilterMethod] = useState<HttpMethod | "All">("All");
  const [filterLogMethod, setFilterLogMethod] = useState<HttpMethod | "All">("All");
  const [filterLogStatus, setFilterLogStatus] = useState<string>("All");
  const [filterWebhookStatus, setFilterWebhookStatus] = useState<WebhookStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);

  // --- Sort ---
  const [keySortKey, setKeySortKey] = useState<"name" | "tenant" | "calls" | "created">("name");
  const [keySortDir, setKeySortDir] = useState<SortDir>("asc");

  // --- Pagination ---
  const [keyPage, setKeyPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  // --- Modals ---
  const [keyFormModal, setKeyFormModal] = useState<{ open: boolean; key: ApiKey | null }>({ open: false, key: null });
  const [viewKey, setViewKey] = useState<ApiKey | null>(null);
  const [deleteKeyModal, setDeleteKeyModal] = useState<ApiKey | null>(null);
  const [revokeKeyModal, setRevokeKeyModal] = useState<ApiKey | null>(null);
  const [newKeyModal, setNewKeyModal] = useState<{ name: string; fullKey: string } | null>(null);

  const [routeFormModal, setRouteFormModal] = useState<{ open: boolean; route: GatewayRoute | null }>({ open: false, route: null });
  const [deleteRouteModal, setDeleteRouteModal] = useState<GatewayRoute | null>(null);

  const [webhookFormModal, setWebhookFormModal] = useState<{ open: boolean; webhook: WebhookEntry | null }>({ open: false, webhook: null });
  const [viewWebhook, setViewWebhook] = useState<WebhookEntry | null>(null);
  const [deleteWebhookModal, setDeleteWebhookModal] = useState<WebhookEntry | null>(null);

  const [viewLog, setViewLog] = useState<ApiLog | null>(null);

  // --- Action dropdowns ---
  const [openKeyAction, setOpenKeyAction] = useState<string | null>(null);
  const [openRouteAction, setOpenRouteAction] = useState<string | null>(null);
  const [openWebhookAction, setOpenWebhookAction] = useState<string | null>(null);

  // --- Toast ---
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ===========================================================================
  // Filtered & sorted data
  // ===========================================================================

  const filteredKeys = useMemo(() => {
    let list = apiKeys;
    if (search) { const q = search.toLowerCase(); list = list.filter((k) => k.name.toLowerCase().includes(q) || k.tenant.toLowerCase().includes(q) || k.key.toLowerCase().includes(q)); }
    if (filterEnv !== "All") list = list.filter((k) => k.env === filterEnv);
    if (filterKeyStatus !== "All") list = list.filter((k) => k.status === filterKeyStatus);
    return [...list].sort((a, b) => {
      const va = a[keySortKey]; const vb = b[keySortKey];
      if (typeof va === "number" && typeof vb === "number") return keySortDir === "asc" ? va - vb : vb - va;
      return keySortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [apiKeys, search, filterEnv, filterKeyStatus, keySortKey, keySortDir]);

  const keyTotalPages = Math.max(1, Math.ceil(filteredKeys.length / PAGE_SIZE_KEYS));
  const safeKeyPage = Math.min(keyPage, keyTotalPages);
  const pagedKeys = filteredKeys.slice((safeKeyPage - 1) * PAGE_SIZE_KEYS, safeKeyPage * PAGE_SIZE_KEYS);

  const filteredRoutes = useMemo(() => {
    let list = routes;
    if (search) { const q = search.toLowerCase(); list = list.filter((r) => r.path.toLowerCase().includes(q) || r.target.toLowerCase().includes(q)); }
    if (filterRouteStatus !== "All") list = list.filter((r) => r.status === filterRouteStatus);
    if (filterMethod !== "All") list = list.filter((r) => r.method === filterMethod);
    return list;
  }, [routes, search, filterRouteStatus, filterMethod]);

  const filteredWebhooks = useMemo(() => {
    let list = webhooks;
    if (search) { const q = search.toLowerCase(); list = list.filter((w) => w.endpoint.toLowerCase().includes(q) || w.events.toLowerCase().includes(q)); }
    if (filterWebhookStatus !== "All") list = list.filter((w) => w.status === filterWebhookStatus);
    return list;
  }, [webhooks, search, filterWebhookStatus]);

  const filteredLogs = useMemo(() => {
    let list = logs;
    if (search) { const q = search.toLowerCase(); list = list.filter((l) => l.path.toLowerCase().includes(q) || l.tenant.toLowerCase().includes(q)); }
    if (filterLogMethod !== "All") list = list.filter((l) => l.method === filterLogMethod);
    if (filterLogStatus !== "All") {
      if (filterLogStatus === "2xx") list = list.filter((l) => l.statusCode >= 200 && l.statusCode < 300);
      else if (filterLogStatus === "4xx") list = list.filter((l) => l.statusCode >= 400 && l.statusCode < 500);
      else if (filterLogStatus === "5xx") list = list.filter((l) => l.statusCode >= 500);
    }
    return list;
  }, [logs, search, filterLogMethod, filterLogStatus]);

  const logTotalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE_LOGS));
  const safeLogPage = Math.min(logPage, logTotalPages);
  const pagedLogs = filteredLogs.slice((safeLogPage - 1) * PAGE_SIZE_LOGS, safeLogPage * PAGE_SIZE_LOGS);

  // Stats
  const activeKeysCount = apiKeys.filter((k) => k.status === "Active").length;
  const activeRoutesCount = routes.filter((r) => r.status === "Active").length;
  const rateLimitedLogs = logs.filter((l) => l.statusCode === 429).length;
  const authFailures = logs.filter((l) => l.statusCode === 401 || l.statusCode === 403).length;

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const generateKeyString = (env: EnvType) => {
    const prefix = env === "Production" ? "gf_live_" : env === "Staging" ? "gf_stg_" : "gf_test_";
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = prefix;
    for (let i = 0; i < 40; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleCreateKey = (data: { name: string; tenant: string; env: EnvType; expiresAt: string; scopes: string[] }) => {
    const fullKey = generateKeyString(data.env);
    const masked = fullKey.slice(0, 14) + "..." + fullKey.slice(-4);
    const newKey: ApiKey = { id: `k${Date.now()}`, name: data.name, key: masked, fullKey, tenant: data.tenant, env: data.env, status: "Active", calls: "0", created: new Date().toISOString().slice(0, 10), lastUsed: "—", expiresAt: data.expiresAt, scopes: data.scopes };
    setApiKeys((prev) => [newKey, ...prev]);
    setKeyFormModal({ open: false, key: null });
    setNewKeyModal({ name: data.name, fullKey });
  };

  const handleEditKey = (data: { name: string; tenant: string; env: EnvType; expiresAt: string; scopes: string[] }) => {
    if (!keyFormModal.key) return;
    setApiKeys((prev) => prev.map((k) => k.id === keyFormModal.key!.id ? { ...k, ...data } : k));
    setKeyFormModal({ open: false, key: null });
    if (viewKey?.id === keyFormModal.key.id) setViewKey((prev) => prev ? { ...prev, ...data } : null);
    showToast("API key updated successfully");
  };

  const handleDeleteKey = () => {
    if (!deleteKeyModal) return;
    setApiKeys((prev) => prev.filter((k) => k.id !== deleteKeyModal.id));
    setDeleteKeyModal(null);
    if (viewKey?.id === deleteKeyModal.id) setViewKey(null);
    showToast("API key deleted");
  };

  const handleRevokeKey = () => {
    if (!revokeKeyModal) return;
    setApiKeys((prev) => prev.map((k) => k.id === revokeKeyModal.id ? { ...k, status: "Revoked" as KeyStatus } : k));
    setRevokeKeyModal(null);
    if (viewKey?.id === revokeKeyModal.id) setViewKey((prev) => prev ? { ...prev, status: "Revoked" } : null);
    showToast("API key revoked");
  };

  const handleCreateRoute = (data: Omit<GatewayRoute, "id">) => {
    setRoutes((prev) => [...prev, { ...data, id: `r${Date.now()}` }]);
    setRouteFormModal({ open: false, route: null });
    showToast("Route added successfully");
  };

  const handleEditRoute = (data: Omit<GatewayRoute, "id">) => {
    if (!routeFormModal.route) return;
    setRoutes((prev) => prev.map((r) => r.id === routeFormModal.route!.id ? { ...r, ...data } : r));
    setRouteFormModal({ open: false, route: null });
    showToast("Route updated successfully");
  };

  const handleDeleteRoute = () => {
    if (!deleteRouteModal) return;
    setRoutes((prev) => prev.filter((r) => r.id !== deleteRouteModal.id));
    setDeleteRouteModal(null);
    showToast("Route deleted");
  };

  const handleToggleRoute = (route: GatewayRoute) => {
    const newStatus: RouteStatus = route.status === "Active" ? "Disabled" : "Active";
    setRoutes((prev) => prev.map((r) => r.id === route.id ? { ...r, status: newStatus } : r));
    showToast(`Route ${newStatus === "Active" ? "enabled" : "disabled"}`);
  };

  const handleCreateWebhook = (data: Omit<WebhookEntry, "id" | "lastTriggered" | "failures" | "secret">) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let secret = "whsec_";
    for (let i = 0; i < 10; i++) secret += chars.charAt(Math.floor(Math.random() * chars.length));
    setWebhooks((prev) => [...prev, { ...data, id: `w${Date.now()}`, lastTriggered: "—", failures: 0, secret }]);
    setWebhookFormModal({ open: false, webhook: null });
    showToast("Webhook added successfully");
  };

  const handleEditWebhook = (data: Omit<WebhookEntry, "id" | "lastTriggered" | "failures" | "secret">) => {
    if (!webhookFormModal.webhook) return;
    setWebhooks((prev) => prev.map((w) => w.id === webhookFormModal.webhook!.id ? { ...w, ...data } : w));
    setWebhookFormModal({ open: false, webhook: null });
    if (viewWebhook?.id === webhookFormModal.webhook.id) setViewWebhook((prev) => prev ? { ...prev, ...data } : null);
    showToast("Webhook updated successfully");
  };

  const handleDeleteWebhook = () => {
    if (!deleteWebhookModal) return;
    setWebhooks((prev) => prev.filter((w) => w.id !== deleteWebhookModal.id));
    setDeleteWebhookModal(null);
    if (viewWebhook?.id === deleteWebhookModal.id) setViewWebhook(null);
    showToast("Webhook deleted");
  };

  const handleToggleWebhook = (webhook: WebhookEntry) => {
    const newStatus: WebhookStatus = webhook.status === "Active" ? "Inactive" : "Active";
    setWebhooks((prev) => prev.map((w) => w.id === webhook.id ? { ...w, status: newStatus } : w));
    showToast(`Webhook ${newStatus === "Active" ? "activated" : "deactivated"}`);
  };

  const handleTestWebhook = (webhook: WebhookEntry) => {
    showToast(`Test ping sent to ${webhook.endpoint}`);
    setViewWebhook(null);
  };

  const handleExportLogs = () => {
    const header = "Time,Method,Path,Status,Latency,Tenant,IP\n";
    const rows = filteredLogs.map((l) => `"${l.time}","${l.method}","${l.path}",${l.statusCode},"${l.latency}","${l.tenant}","${l.ip}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "api-logs-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeySort = (key: "name" | "tenant" | "calls" | "created") => {
    if (keySortKey === key) setKeySortDir((d) => d === "asc" ? "desc" : "asc");
    else { setKeySortKey(key); setKeySortDir("asc"); }
  };

  const clearFilters = () => {
    setSearch(""); setFilterEnv("All"); setFilterKeyStatus("All"); setFilterRouteStatus("All");
    setFilterMethod("All"); setFilterLogMethod("All"); setFilterLogStatus("All"); setFilterWebhookStatus("All");
    setKeyPage(1); setLogPage(1);
  };

  const hasActiveFilters = search || filterEnv !== "All" || filterKeyStatus !== "All" || filterRouteStatus !== "All" || filterMethod !== "All" || filterLogMethod !== "All" || filterLogStatus !== "All" || filterWebhookStatus !== "All";

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>API Gateway &amp; Keys</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>API routing rules, rate limiting, key management, and gateway configuration</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "keys" && (
            <button onClick={() => setKeyFormModal({ open: true, key: null })} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              <Plus className="h-4 w-4" />Generate Key
            </button>
          )}
          {activeTab === "routes" && (
            <button onClick={() => setRouteFormModal({ open: true, route: null })} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              <Plus className="h-4 w-4" />Add Route
            </button>
          )}
          {activeTab === "webhooks" && (
            <button onClick={() => setWebhookFormModal({ open: true, webhook: null })} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              <Plus className="h-4 w-4" />Add Webhook
            </button>
          )}
          {activeTab === "logs" && (
            <button onClick={handleExportLogs} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Download className="h-4 w-4" />Export
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Key className="h-5 w-5" />} label="Active API Keys" value={activeKeysCount} />
        <StatCard icon={<Route className="h-5 w-5" />} label="Active Routes" value={activeRoutesCount} />
        <StatCard icon={<Gauge className="h-5 w-5" />} label="Rate-Limited (24h)" value={rateLimitedLogs} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Auth Failures (24h)" value={authFailures} />
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: "var(--gf-border)" }}>
        <div className="flex overflow-x-auto -mb-px">
          <TabButton active={activeTab === "keys"} label="API Keys" icon={<Key className="h-4 w-4" />} count={apiKeys.length} onClick={() => { setActiveTab("keys"); setSearch(""); setShowFilters(false); }} />
          <TabButton active={activeTab === "routes"} label="Gateway Routes" icon={<Route className="h-4 w-4" />} count={routes.length} onClick={() => { setActiveTab("routes"); setSearch(""); setShowFilters(false); }} />
          <TabButton active={activeTab === "webhooks"} label="Webhooks" icon={<Webhook className="h-4 w-4" />} count={webhooks.length} onClick={() => { setActiveTab("webhooks"); setSearch(""); setShowFilters(false); }} />
          <TabButton active={activeTab === "logs"} label="API Logs" icon={<Activity className="h-4 w-4" />} onClick={() => { setActiveTab("logs"); setSearch(""); setShowFilters(false); }} />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setKeyPage(1); setLogPage(1); }}
            placeholder={activeTab === "keys" ? "Search keys by name, tenant..." : activeTab === "routes" ? "Search by path or target..." : activeTab === "webhooks" ? "Search by endpoint or events..." : "Search by path or tenant..."}
            className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`}
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <Filter className="h-4 w-4" />Filters
        </button>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          {activeTab === "keys" && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Environment</label>
                <select value={filterEnv} onChange={(e) => { setFilterEnv(e.target.value as EnvType | "All"); setKeyPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
                  <option value="All">All</option>
                  {ENV_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
                <select value={filterKeyStatus} onChange={(e) => { setFilterKeyStatus(e.target.value as KeyStatus | "All"); setKeyPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
                  <option value="All">All</option>
                  {KEY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}
          {activeTab === "routes" && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
                <select value={filterRouteStatus} onChange={(e) => setFilterRouteStatus(e.target.value as RouteStatus | "All")} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Method</label>
                <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value as HttpMethod | "All")} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
                  <option value="All">All</option>
                  {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </>
          )}
          {activeTab === "webhooks" && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
              <select value={filterWebhookStatus} onChange={(e) => setFilterWebhookStatus(e.target.value as WebhookStatus | "All")} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
          {activeTab === "logs" && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Method</label>
                <select value={filterLogMethod} onChange={(e) => { setFilterLogMethod(e.target.value as HttpMethod | "All"); setLogPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
                  <option value="All">All</option>
                  {(["GET", "POST", "PUT", "DELETE"] as HttpMethod[]).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status Code</label>
                <select value={filterLogStatus} onChange={(e) => { setFilterLogStatus(e.target.value); setLogPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
                  <option value="All">All</option>
                  <option value="2xx">2xx Success</option>
                  <option value="4xx">4xx Client Error</option>
                  <option value="5xx">5xx Server Error</option>
                </select>
              </div>
            </>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-400">
              <X className="h-3 w-3" />Clear All
            </button>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB: API Keys                                                     */}
      {/* ================================================================= */}
      {activeTab === "keys" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  {([
                    { key: "name" as const, label: "Name" },
                    { key: null, label: "Key" },
                    { key: "tenant" as const, label: "Tenant" },
                    { key: null, label: "Env" },
                    { key: null, label: "Status" },
                    { key: "calls" as const, label: "Calls (MTD)" },
                    { key: "created" as const, label: "Created" },
                    { key: null, label: "Actions" },
                  ] as const).map((col, i) => (
                    <th key={i} className={`px-5 py-3 text-left font-medium ${col.key ? "cursor-pointer select-none hover:opacity-80" : ""}`}
                      onClick={col.key ? () => handleKeySort(col.key!) : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.key && <SortIcon active={keySortKey === col.key} dir={keySortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedKeys.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center">
                    <Key className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No API keys found</p>
                  </td></tr>
                ) : pagedKeys.map((k) => {
                  const sc = statusColors[k.status]; const ec = envColors[k.env];
                  return (
                    <tr key={k.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-5 py-3">
                        <button onClick={() => setViewKey(k)} className="text-sm font-medium underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>{k.name}</button>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>
                          {k.key}<CopyButton text={k.fullKey} />
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{k.tenant}</td>
                      <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${ec}20`, color: ec }}>{k.env}</span></td>
                      <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{k.status}</span></td>
                      <td className="px-5 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{k.calls}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{k.created}</td>
                      <td className="px-5 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenKeyAction(openKeyAction === k.id ? null : k.id)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openKeyAction === k.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenKeyAction(null)} />
                              <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                                <button onClick={() => { setViewKey(k); setOpenKeyAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Details
                                </button>
                                {k.status === "Active" && (
                                  <button onClick={() => { setKeyFormModal({ open: true, key: k }); setOpenKeyAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                    <Pencil className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Edit
                                  </button>
                                )}
                                {k.status === "Active" && (
                                  <button onClick={() => { setRevokeKeyModal(k); setOpenKeyAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#f59e0b" }}>
                                    <Ban className="h-4 w-4" />Revoke
                                  </button>
                                )}
                                <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                                <button onClick={() => { setDeleteKeyModal(k); setOpenKeyAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">
                                  <Trash2 className="h-4 w-4" />Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredKeys.length > PAGE_SIZE_KEYS && (
            <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safeKeyPage} of {keyTotalPages} ({filteredKeys.length} keys)</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setKeyPage((p) => Math.max(1, p - 1))} disabled={safeKeyPage <= 1} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: keyTotalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setKeyPage(n)} className={`h-7 w-7 rounded-lg text-xs font-medium ${n === safeKeyPage ? "text-white" : "hover:opacity-70"}`}
                    style={n === safeKeyPage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>{n}</button>
                ))}
                <button onClick={() => setKeyPage((p) => Math.min(keyTotalPages, p + 1))} disabled={safeKeyPage >= keyTotalPages} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB: Gateway Routes                                               */}
      {/* ================================================================= */}
      {activeTab === "routes" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  {["Path Pattern", "Target Service", "Method", "Rate Limit", "Auth", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center">
                    <Route className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No routes found</p>
                  </td></tr>
                ) : filteredRoutes.map((r) => {
                  const mc = methodColors[r.method]; const rsc = routeStatusColors[r.status];
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>{r.path}</span>
                        {r.description && <p className="text-[11px] mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{r.description}</p>}
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{r.target}</td>
                      <td className="px-5 py-3"><span className="text-xs font-mono font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${mc}20`, color: mc }}>{r.method}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{r.rateLimit}</td>
                      <td className="px-5 py-3">
                        {r.authRequired
                          ? <Shield className="h-4 w-4 text-green-500" />
                          : <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>No</span>
                        }
                      </td>
                      <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rsc}20`, color: rsc }}>{r.status}</span></td>
                      <td className="px-5 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenRouteAction(openRouteAction === r.id ? null : r.id)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openRouteAction === r.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenRouteAction(null)} />
                              <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                                <button onClick={() => { setRouteFormModal({ open: true, route: r }); setOpenRouteAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Pencil className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Edit
                                </button>
                                <button onClick={() => { handleToggleRoute(r); setOpenRouteAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                                  style={{ color: r.status === "Active" ? "#f59e0b" : "#22c55e" }}
                                >
                                  {r.status === "Active" ? <><Pause className="h-4 w-4" />Disable</> : <><Play className="h-4 w-4" />Enable</>}
                                </button>
                                <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                                <button onClick={() => { setDeleteRouteModal(r); setOpenRouteAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">
                                  <Trash2 className="h-4 w-4" />Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB: Webhooks                                                     */}
      {/* ================================================================= */}
      {activeTab === "webhooks" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  {["Endpoint URL", "Events", "Status", "Last Triggered", "Failures", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWebhooks.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center">
                    <Webhook className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No webhooks found</p>
                  </td></tr>
                ) : filteredWebhooks.map((w) => {
                  const wsc = webhookStatusColors[w.status];
                  return (
                    <tr key={w.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-5 py-3">
                        <button onClick={() => setViewWebhook(w)} className="font-mono text-xs underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>{w.endpoint}</button>
                        {w.description && <p className="text-[11px] mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{w.description}</p>}
                      </td>
                      <td className="px-5 py-3 text-xs max-w-[200px] truncate" style={{ color: "var(--gf-text-secondary)" }}>{w.events}</td>
                      <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${wsc}20`, color: wsc }}>{w.status}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{w.lastTriggered}</td>
                      <td className="px-5 py-3 text-xs font-medium" style={{ color: w.failures > 5 ? "#ef4444" : "var(--gf-text-secondary)" }}>{w.failures}</td>
                      <td className="px-5 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenWebhookAction(openWebhookAction === w.id ? null : w.id)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openWebhookAction === w.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenWebhookAction(null)} />
                              <div className="absolute right-0 top-8 z-50 w-48 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                                <button onClick={() => { setViewWebhook(w); setOpenWebhookAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Details
                                </button>
                                <button onClick={() => { setWebhookFormModal({ open: true, webhook: w }); setOpenWebhookAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Pencil className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Edit
                                </button>
                                <button onClick={() => { handleTestWebhook(w); setOpenWebhookAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Send className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Test Webhook
                                </button>
                                <button onClick={() => { handleToggleWebhook(w); setOpenWebhookAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                                  style={{ color: w.status === "Active" ? "#f59e0b" : "#22c55e" }}
                                >
                                  {w.status === "Active" ? <><Pause className="h-4 w-4" />Deactivate</> : <><Play className="h-4 w-4" />Activate</>}
                                </button>
                                <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                                <button onClick={() => { setDeleteWebhookModal(w); setOpenWebhookAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">
                                  <Trash2 className="h-4 w-4" />Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB: API Logs                                                     */}
      {/* ================================================================= */}
      {activeTab === "logs" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  {["Time", "Method", "Path", "Status", "Latency", "Tenant", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedLogs.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No logs found</p>
                  </td></tr>
                ) : pagedLogs.map((log) => {
                  const mc = methodColors[log.method]; const sc = statusCodeColor(log.statusCode);
                  return (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" style={{ borderColor: "var(--gf-border)" }}
                      onClick={() => setViewLog(log)}
                    >
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-secondary)" }}>{log.time}</td>
                      <td className="px-5 py-3"><span className="text-xs font-mono font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${mc}20`, color: mc }}>{log.method}</span></td>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>{log.path}</td>
                      <td className="px-5 py-3"><span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}20`, color: sc }}>{log.statusCode}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{log.latency}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{log.tenant}</td>
                      <td className="px-5 py-3">
                        <Eye className="h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredLogs.length > PAGE_SIZE_LOGS && (
            <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safeLogPage} of {logTotalPages} ({filteredLogs.length} logs)</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={safeLogPage <= 1} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: logTotalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setLogPage(n)} className={`h-7 w-7 rounded-lg text-xs font-medium ${n === safeLogPage ? "text-white" : "hover:opacity-70"}`}
                    style={n === safeLogPage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>{n}</button>
                ))}
                <button onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))} disabled={safeLogPage >= logTotalPages} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* Modals                                                            */}
      {/* ================================================================= */}

      {/* API Key Form */}
      {keyFormModal.open && (
        <ApiKeyFormModal
          apiKey={keyFormModal.key}
          onSave={keyFormModal.key ? handleEditKey : handleCreateKey}
          onCancel={() => setKeyFormModal({ open: false, key: null })}
        />
      )}

      {/* New Key Generated */}
      {newKeyModal && <NewKeyModal name={newKeyModal.name} fullKey={newKeyModal.fullKey} onClose={() => setNewKeyModal(null)} />}

      {/* View Key Detail */}
      {viewKey && (
        <ApiKeyDetailModal
          apiKey={viewKey}
          onClose={() => setViewKey(null)}
          onEdit={() => { setKeyFormModal({ open: true, key: viewKey }); setViewKey(null); }}
          onRevoke={() => { setRevokeKeyModal(viewKey); setViewKey(null); }}
        />
      )}

      {/* Delete Key */}
      {deleteKeyModal && (
        <DeleteConfirmModal
          title="Delete API Key"
          message={<>Are you sure you want to delete <strong style={{ color: "var(--gf-text-primary)" }}>{deleteKeyModal.name}</strong>? This action cannot be undone.</>}
          onConfirm={handleDeleteKey}
          onCancel={() => setDeleteKeyModal(null)}
        />
      )}

      {/* Revoke Key */}
      {revokeKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setRevokeKeyModal(null)}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15"><Ban className="h-5 w-5 text-amber-500" /></div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Revoke API Key</h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
              Revoke <strong style={{ color: "var(--gf-text-primary)" }}>{revokeKeyModal.name}</strong>? Any applications using this key will immediately lose access.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRevokeKeyModal(null)} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button onClick={handleRevokeKey} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700">Revoke</button>
            </div>
          </div>
        </div>
      )}

      {/* Route Form */}
      {routeFormModal.open && (
        <RouteFormModal
          route={routeFormModal.route}
          onSave={routeFormModal.route ? handleEditRoute : handleCreateRoute}
          onCancel={() => setRouteFormModal({ open: false, route: null })}
        />
      )}

      {/* Delete Route */}
      {deleteRouteModal && (
        <DeleteConfirmModal
          title="Delete Route"
          message={<>Are you sure you want to delete route <strong className="font-mono" style={{ color: "var(--gf-text-primary)" }}>{deleteRouteModal.path}</strong>? Traffic to this path will no longer be routed.</>}
          onConfirm={handleDeleteRoute}
          onCancel={() => setDeleteRouteModal(null)}
        />
      )}

      {/* Webhook Form */}
      {webhookFormModal.open && (
        <WebhookFormModal
          webhook={webhookFormModal.webhook}
          onSave={webhookFormModal.webhook ? handleEditWebhook : handleCreateWebhook}
          onCancel={() => setWebhookFormModal({ open: false, webhook: null })}
        />
      )}

      {/* View Webhook Detail */}
      {viewWebhook && (
        <WebhookDetailModal
          webhook={viewWebhook}
          onClose={() => setViewWebhook(null)}
          onEdit={() => { setWebhookFormModal({ open: true, webhook: viewWebhook }); setViewWebhook(null); }}
          onTest={() => handleTestWebhook(viewWebhook)}
        />
      )}

      {/* Delete Webhook */}
      {deleteWebhookModal && (
        <DeleteConfirmModal
          title="Delete Webhook"
          message={<>Are you sure you want to delete webhook <strong className="font-mono" style={{ color: "var(--gf-text-primary)" }}>{deleteWebhookModal.endpoint}</strong>? Events will no longer be delivered.</>}
          onConfirm={handleDeleteWebhook}
          onCancel={() => setDeleteWebhookModal(null)}
        />
      )}

      {/* View Log Detail */}
      {viewLog && <LogDetailModal log={viewLog} onClose={() => setViewLog(null)} />}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
