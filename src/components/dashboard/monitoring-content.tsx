"use client";

import React, { useState, useMemo } from "react";
import {
  Activity, Server, AlertTriangle, FileText, RefreshCw, Search,
  ChevronLeft, ChevronRight, X, Plus, CheckCircle, XCircle,
  Clock, Globe, Hash, Terminal, Eye, Bell,
  Download, ExternalLink, RotateCcw, Zap,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ServiceInfo {
  id: string; name: string; status: "Healthy" | "Degraded" | "Down";
  uptime: string; responseTime: number; cpu: number; memory: number;
  lastIncident: string; region: string; version: string; port: number;
  healthEndpoint: string;
}
interface AlertItem {
  id: string; severity: "Critical" | "Warning" | "Info"; service: string;
  message: string; time: string; acknowledged: boolean; resolved: boolean;
}
interface LogEntry {
  id: string; time: string; service: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"; message: string;
}
interface KafkaEvent {
  id: string; timestamp: string; topic: string; eventType: string;
  partition: number; offset: number; tenant: string;
  status: "Processed" | "Pending" | "Failed"; payload: string;
}

// ============================================================================
// INITIAL DATA
// ============================================================================

const INITIAL_SERVICES: ServiceInfo[] = [
  { id: "svc-1", name: "API Gateway", status: "Healthy", uptime: "99.98%", responseTime: 42, cpu: 28, memory: 45, lastIncident: "14 days ago", region: "us-east-1", version: "3.2.1", port: 8080, healthEndpoint: "/health" },
  { id: "svc-2", name: "Auth Service", status: "Healthy", uptime: "99.95%", responseTime: 38, cpu: 22, memory: 39, lastIncident: "21 days ago", region: "us-east-1", version: "2.8.0", port: 8081, healthEndpoint: "/api/health" },
  { id: "svc-3", name: "Tenant Manager", status: "Degraded", uptime: "98.72%", responseTime: 185, cpu: 71, memory: 78, lastIncident: "2 hours ago", region: "us-west-2", version: "1.5.4", port: 8082, healthEndpoint: "/status" },
  { id: "svc-4", name: "Billing Engine", status: "Healthy", uptime: "99.99%", responseTime: 55, cpu: 35, memory: 52, lastIncident: "30 days ago", region: "eu-west-1", version: "4.1.0", port: 8083, healthEndpoint: "/health" },
  { id: "svc-5", name: "Notification Hub", status: "Down", uptime: "94.30%", responseTime: 0, cpu: 0, memory: 0, lastIncident: "Just now", region: "us-east-1", version: "2.3.7", port: 8084, healthEndpoint: "/ping" },
  { id: "svc-6", name: "Analytics Pipeline", status: "Healthy", uptime: "99.91%", responseTime: 120, cpu: 58, memory: 64, lastIncident: "7 days ago", region: "us-west-2", version: "3.0.2", port: 8085, healthEndpoint: "/health" },
  { id: "svc-7", name: "File Storage", status: "Healthy", uptime: "99.97%", responseTime: 67, cpu: 31, memory: 48, lastIncident: "18 days ago", region: "eu-west-1", version: "1.9.3", port: 8086, healthEndpoint: "/api/status" },
  { id: "svc-8", name: "Search Indexer", status: "Degraded", uptime: "97.85%", responseTime: 340, cpu: 82, memory: 88, lastIncident: "45 min ago", region: "us-east-1", version: "2.1.1", port: 8087, healthEndpoint: "/health" },
];

const INITIAL_ALERTS: AlertItem[] = [
  { id: "alt-1", severity: "Critical", service: "Notification Hub", message: "Service unreachable — health check failed after 3 retries", time: "2026-03-31 09:14:02", acknowledged: false, resolved: false },
  { id: "alt-2", severity: "Warning", service: "Tenant Manager", message: "Response time exceeded 150ms threshold (current: 185ms)", time: "2026-03-31 07:52:18", acknowledged: true, resolved: false },
  { id: "alt-3", severity: "Warning", service: "Search Indexer", message: "CPU usage above 80% for over 10 minutes", time: "2026-03-31 08:45:33", acknowledged: false, resolved: false },
  { id: "alt-4", severity: "Info", service: "Billing Engine", message: "Scheduled maintenance window begins in 24 hours", time: "2026-03-30 18:00:00", acknowledged: true, resolved: false },
  { id: "alt-5", severity: "Critical", service: "Search Indexer", message: "Memory usage at 88% — risk of OOM", time: "2026-03-31 08:50:11", acknowledged: false, resolved: false },
];

const INITIAL_LOGS: LogEntry[] = [
  { id: "log-1", time: "09:14:02", service: "Notification Hub", level: "ERROR", message: "Connection refused on port 8084 — ECONNREFUSED" },
  { id: "log-2", time: "09:13:58", service: "API Gateway", level: "INFO", message: "Health check passed for all upstream services" },
  { id: "log-3", time: "09:12:44", service: "Tenant Manager", level: "WARN", message: "Slow query detected: getTenantConfig took 182ms" },
  { id: "log-4", time: "09:11:30", service: "Auth Service", level: "INFO", message: "Token refresh completed for 342 active sessions" },
  { id: "log-5", time: "09:10:15", service: "Search Indexer", level: "ERROR", message: "Index rebuild failed — insufficient memory" },
  { id: "log-6", time: "09:09:02", service: "Billing Engine", level: "DEBUG", message: "Invoice batch #4821 queued for processing" },
  { id: "log-7", time: "09:08:47", service: "Analytics Pipeline", level: "INFO", message: "Daily aggregation job completed in 34s" },
  { id: "log-8", time: "09:07:33", service: "File Storage", level: "INFO", message: "Garbage collection freed 2.4GB of orphaned blobs" },
  { id: "log-9", time: "09:06:19", service: "API Gateway", level: "WARN", message: "Rate limit approaching for tenant acme-corp (85%)" },
  { id: "log-10", time: "09:05:05", service: "Tenant Manager", level: "ERROR", message: "Failed to sync tenant metadata — retrying in 30s" },
  { id: "log-11", time: "09:04:50", service: "Auth Service", level: "DEBUG", message: "RBAC policy cache refreshed — 28 roles loaded" },
  { id: "log-12", time: "09:03:38", service: "Notification Hub", level: "WARN", message: "Email queue depth exceeds 500 — throttling sends" },
  { id: "log-13", time: "09:02:20", service: "Search Indexer", level: "WARN", message: "Shard rebalancing in progress — reads may be slow" },
];

const INITIAL_KAFKA: KafkaEvent[] = [
  { id: "kf-1", timestamp: "09:14:01", topic: "tenant.events", eventType: "TenantCreated", partition: 0, offset: 84210, tenant: "acme-corp", status: "Processed", payload: '{"tenantId":"t-291","plan":"enterprise"}' },
  { id: "kf-2", timestamp: "09:13:45", topic: "billing.invoices", eventType: "InvoiceGenerated", partition: 2, offset: 33102, tenant: "globex-inc", status: "Processed", payload: '{"invoiceId":"inv-8830","amount":2499}' },
  { id: "kf-3", timestamp: "09:12:30", topic: "auth.sessions", eventType: "SessionExpired", partition: 1, offset: 120455, tenant: "initech", status: "Processed", payload: '{"sessionId":"s-44821","userId":"u-1029"}' },
  { id: "kf-4", timestamp: "09:11:18", topic: "notifications.outbound", eventType: "EmailQueued", partition: 0, offset: 67891, tenant: "acme-corp", status: "Failed", payload: '{"to":"admin@acme.co","template":"welcome"}' },
  { id: "kf-5", timestamp: "09:10:05", topic: "tenant.events", eventType: "TenantSuspended", partition: 0, offset: 84209, tenant: "waystar-rco", status: "Processed", payload: '{"tenantId":"t-187","reason":"payment_overdue"}' },
  { id: "kf-6", timestamp: "09:09:50", topic: "analytics.clicks", eventType: "PageView", partition: 3, offset: 551023, tenant: "globex-inc", status: "Pending", payload: '{"page":"/dashboard","duration":4200}' },
  { id: "kf-7", timestamp: "09:08:32", topic: "billing.invoices", eventType: "PaymentReceived", partition: 2, offset: 33101, tenant: "initech", status: "Processed", payload: '{"invoiceId":"inv-8815","method":"stripe"}' },
  { id: "kf-8", timestamp: "09:07:19", topic: "auth.sessions", eventType: "LoginFailed", partition: 1, offset: 120454, tenant: "acme-corp", status: "Processed", payload: '{"userId":"u-482","reason":"invalid_mfa"}' },
  { id: "kf-9", timestamp: "09:06:01", topic: "notifications.outbound", eventType: "SlackSent", partition: 0, offset: 67890, tenant: "waystar-rco", status: "Processed", payload: '{"channel":"#ops","message":"deploy complete"}' },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  Healthy: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  Degraded: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Down: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};
const LEVEL_COLORS: Record<string, string> = { INFO: "#3b82f6", WARN: "#f59e0b", ERROR: "#ef4444", DEBUG: "#8b5cf6" };
const KAFKA_STATUS_COLORS: Record<string, string> = { Processed: "#22c55e", Pending: "#f59e0b", Failed: "#ef4444" };
const SEVERITY_COLORS: Record<string, string> = { Critical: "#ef4444", Warning: "#f59e0b", Info: "#3b82f6" };
const LOG_LEVELS: LogEntry["level"][] = ["INFO", "WARN", "ERROR", "DEBUG"];
const SERVICE_NAMES = INITIAL_SERVICES.map((s) => s.name);
const KAFKA_TOPICS = ["tenant.events", "billing.invoices", "auth.sessions", "notifications.outbound", "analytics.clicks"];
const PAGE_SIZE = 6;
const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

// ============================================================================
// SERVICE DETAIL SLIDE-OVER
// ============================================================================

function ServiceDetailPanel({ service, onClose, onRestart }: { service: ServiceInfo; onClose: () => void; onRestart: () => void }) {
  const cfg = STATUS_CONFIG[service.status];
  const bar = (label: string, value: number, max: number, unit: string) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: "var(--gf-text-secondary)" }}>{label}</span>
        <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{value}{unit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-base)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: value / max > 0.8 ? "#ef4444" : value / max > 0.6 ? "#f59e0b" : "#22c55e" }} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto border-l shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{service.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />{service.status}
            </span>
            <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Uptime: {service.uptime}</span>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
            {bar("CPU", service.cpu, 100, "%")}
            {bar("Memory", service.memory, 100, "%")}
            {bar("Response Time", service.responseTime, 500, "ms")}
          </div>
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
            {[
              { icon: <Globe className="h-3.5 w-3.5" />, label: "Region", val: service.region },
              { icon: <Hash className="h-3.5 w-3.5" />, label: "Version", val: `v${service.version}` },
              { icon: <Terminal className="h-3.5 w-3.5" />, label: "Port", val: String(service.port) },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span style={{ color: "var(--gf-text-muted)" }}>{r.icon}</span>
                <span className="text-xs w-16" style={{ color: "var(--gf-text-muted)" }}>{r.label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{r.val}</span>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <ExternalLink className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
              <span className="text-xs w-16" style={{ color: "var(--gf-text-muted)" }}>Health</span>
              <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{service.healthEndpoint}</code>
            </div>
          </div>
          {service.status !== "Healthy" && (
            <button onClick={onRestart} className="w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <RotateCcw className="h-4 w-4" />Restart Service
            </button>
          )}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Recent Incidents</h4>
            <div className="space-y-2">
              {[{ date: "2026-03-17", desc: "High latency spike — auto-scaled" }, { date: "2026-03-10", desc: `Deployment rollback v${service.version}` }, { date: "2026-02-28", desc: "Certificate renewal completed" }].map((inc, i) => (
                <div key={i} className="flex gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                  <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "var(--gf-text-muted)" }} />
                  <div>
                    <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{inc.date}</p>
                    <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{inc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOG DETAIL SLIDE-OVER
// ============================================================================

function LogDetailPanel({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const lc = LEVEL_COLORS[log.level];
  const meta = { requestId: `req-${log.id}-a8f3e`, traceId: `trace-${log.id}-7bc4d92e1f`, spanId: `span-${log.id}-3e9a`, duration: `${Math.floor(Math.random() * 450 + 12)}ms` };
  const stack = log.level === "ERROR" ? `Error: ${log.message}\n    at processRequest (src/services/${log.service.toLowerCase().replace(/\s/g, "-")}.ts:142:11)\n    at async handler (src/routes/api.ts:87:5)\n    at async Connection.onMessage (src/core/connection.ts:56:9)` : log.level === "WARN" ? `Warning: ${log.message}\n    at validate (src/middleware/validator.ts:63:14)\n    at async checkPayload (src/services/${log.service.toLowerCase().replace(/\s/g, "-")}.ts:98:7)` : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`[${log.time}] [${log.level}] [${log.service}] ${log.message}${stack ? `\n${stack}` : ""}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto border-l shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${lc}20`, color: lc }}>{log.level}</span>
            <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Log Detail</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>{copied ? "Copied!" : "Copy Log"}</button>
            <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
            {[["Time", log.time], ["Service", log.service]].map(([l, v]) => (
              <div key={l} className="flex justify-between"><span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{l}</span><span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{v}</span></div>
            ))}
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--gf-text-muted)" }}>Message</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--gf-text-primary)" }}>{log.message}</p>
          </div>
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Metadata</p>
            {Object.entries(meta).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-xs capitalize" style={{ color: "var(--gf-text-muted)" }}>{k.replace(/([A-Z])/g, " $1")}</span><span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{v}</span></div>
            ))}
          </div>
          {stack && (
            <div className="rounded-xl border p-4" style={{ borderColor: `${lc}40`, backgroundColor: "var(--gf-bg-elevated)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: lc }}>Stack Trace</p>
              <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap rounded-lg p-3 overflow-x-auto" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{stack}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KAFKA EVENT DETAIL SLIDE-OVER
// ============================================================================

function KafkaEventDetailPanel({ event, onClose, onRetry }: { event: KafkaEvent; onClose: () => void; onRetry?: () => void }) {
  const kc = KAFKA_STATUS_COLORS[event.status];
  const fullPayload = JSON.stringify({ eventId: event.id, type: event.eventType, tenant: event.tenant, data: JSON.parse(event.payload), meta: { partition: event.partition, offset: event.offset, retries: event.status === "Failed" ? 3 : 0 } }, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto border-l shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Kafka Event</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${kc}20`, color: kc }}>{event.status}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
            {[["Timestamp", event.timestamp], ["Topic", event.topic], ["Event Type", event.eventType], ["Partition", String(event.partition)], ["Offset", String(event.offset)], ["Tenant", event.tenant]].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{l}</span>
                <span className={`text-sm font-medium ${l === "Topic" ? "font-mono" : ""}`} style={{ color: l === "Topic" ? "var(--gf-accent)" : "var(--gf-text-primary)" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--gf-text-muted)" }}>Payload</p>
            <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap rounded-lg p-3 overflow-x-auto" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{fullPayload}</pre>
          </div>
          {event.status === "Failed" && onRetry && (
            <button onClick={onRetry} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Retry Event</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ALERT FORM MODAL
// ============================================================================

function AlertFormModal({ onClose, onSave }: { onClose: () => void; onSave: (data: { service: string; severity: AlertItem["severity"]; message: string }) => void }) {
  const [service, setService] = useState(SERVICE_NAMES[0]);
  const [severity, setSeverity] = useState<AlertItem["severity"]>("Warning");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { setError("Message is required"); return; }
    onSave({ service, severity, message });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Bell className="h-5 w-5" style={{ color: "var(--gf-accent)" }} /><h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Create Alert</h2></div>
          <button onClick={onClose} className="p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Service</label>
            <select value={service} onChange={(e) => setService(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle}>
              {SERVICE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as AlertItem["severity"])} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle}>
              {(["Critical", "Warning", "Info"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Message *</label>
            <textarea value={message} onChange={(e) => { setMessage(e.target.value); setError(""); }} rows={3} placeholder="Describe the alert condition..." className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none" style={fieldStyle} />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>Create Alert</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// PAGINATION
// ============================================================================

function PaginationBar({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const safe = Math.min(current, pages);
  return (
    <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: "var(--gf-border)" }}>
      <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safe} of {pages} ({total} items)</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, safe - 1))} disabled={safe <= 1} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => onChange(n)} className={`h-7 w-7 rounded-lg text-xs font-medium ${n === safe ? "text-white" : "hover:opacity-70"}`} style={n === safe ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>{n}</button>
        ))}
        <button onClick={() => onChange(Math.min(pages, safe + 1))} disabled={safe >= pages} className="rounded-lg p-1.5 hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MonitoringContent() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [logs] = useState(INITIAL_LOGS);
  const [kafkaEvents, setKafkaEvents] = useState(INITIAL_KAFKA);
  const [activeTab, setActiveTab] = useState<"services" | "alerts" | "logs" | "events">("services");

  // Filters
  const [serviceFilter, setServiceFilter] = useState("All");
  const [alertFilter, setAlertFilter] = useState("All");
  const [logSearch, setLogSearch] = useState("");
  const [logLevel, setLogLevel] = useState("All");
  const [logService, setLogService] = useState("All");
  const [logPage, setLogPage] = useState(1);
  const [kafkaSearch, setKafkaSearch] = useState("");
  const [kafkaStatus, setKafkaStatus] = useState("All");
  const [kafkaTopic, setKafkaTopic] = useState("All");
  const [kafkaPage, setKafkaPage] = useState(1);

  // Modals
  const [viewService, setViewService] = useState<ServiceInfo | null>(null);
  const [viewLog, setViewLog] = useState<LogEntry | null>(null);
  const [viewKafka, setViewKafka] = useState<KafkaEvent | null>(null);
  const [alertForm, setAlertForm] = useState(false);
  const [restartConfirm, setRestartConfirm] = useState<ServiceInfo | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Derived
  const filteredServices = useMemo(() => serviceFilter === "All" ? services : services.filter((s) => s.status === serviceFilter), [services, serviceFilter]);
  const filteredAlerts = useMemo(() => {
    let list = alerts.filter((a) => !a.resolved);
    if (alertFilter !== "All") list = list.filter((a) => a.severity === alertFilter);
    return list;
  }, [alerts, alertFilter]);
  const filteredLogs = useMemo(() => {
    let list = logs;
    if (logSearch) { const q = logSearch.toLowerCase(); list = list.filter((l) => l.message.toLowerCase().includes(q) || l.service.toLowerCase().includes(q)); }
    if (logLevel !== "All") list = list.filter((l) => l.level === logLevel);
    if (logService !== "All") list = list.filter((l) => l.service === logService);
    return list;
  }, [logs, logSearch, logLevel, logService]);
  const filteredKafka = useMemo(() => {
    let list = kafkaEvents;
    if (kafkaSearch) { const q = kafkaSearch.toLowerCase(); list = list.filter((e) => e.topic.toLowerCase().includes(q) || e.eventType.toLowerCase().includes(q) || e.tenant.toLowerCase().includes(q)); }
    if (kafkaStatus !== "All") list = list.filter((e) => e.status === kafkaStatus);
    if (kafkaTopic !== "All") list = list.filter((e) => e.topic === kafkaTopic);
    return list;
  }, [kafkaEvents, kafkaSearch, kafkaStatus, kafkaTopic]);

  const logSafePage = Math.min(logPage, Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE)));
  const pagedLogs = filteredLogs.slice((logSafePage - 1) * PAGE_SIZE, logSafePage * PAGE_SIZE);
  const kafkaSafePage = Math.min(kafkaPage, Math.max(1, Math.ceil(filteredKafka.length / PAGE_SIZE)));
  const pagedKafka = filteredKafka.slice((kafkaSafePage - 1) * PAGE_SIZE, kafkaSafePage * PAGE_SIZE);

  const servicesOnline = services.filter((s) => s.status === "Healthy").length;
  const avgUptime = (services.reduce((sum, s) => sum + parseFloat(s.uptime), 0) / services.length).toFixed(2) + "%";
  const activeAlertCount = alerts.filter((a) => !a.resolved).length;

  // Handlers
  const handleAcknowledge = (id: string) => { setAlerts((p) => p.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))); setOpenActionId(null); };
  const handleResolve = (id: string) => { setAlerts((p) => p.map((a) => (a.id === id ? { ...a, resolved: true } : a))); setOpenActionId(null); };
  const handleEscalate = (id: string) => { setAlerts((p) => p.map((a) => (a.id === id ? { ...a, severity: "Critical" as const } : a))); setOpenActionId(null); };
  const handleCreateAlert = (data: { service: string; severity: AlertItem["severity"]; message: string }) => {
    setAlerts((p) => [{ id: `alt-${Date.now()}`, ...data, time: new Date().toISOString().replace("T", " ").slice(0, 19), acknowledged: false, resolved: false }, ...p]);
  };
  const handleRestart = () => {
    if (!restartConfirm) return;
    setServices((p) => p.map((s) => (s.id === restartConfirm.id ? { ...s, status: "Healthy" as const, cpu: 15, memory: 35, responseTime: 50 } : s)));
    setRestartConfirm(null);
  };
  const handleRetryKafka = (id: string) => {
    setKafkaEvents((p) => p.map((e) => (e.id === id ? { ...e, status: "Pending" as const } : e)));
    setTimeout(() => { setKafkaEvents((p) => p.map((e) => (e.id === id ? { ...e, status: "Processed" as const } : e))); }, 2000);
  };
  const handleExport = () => {
    let csv = "", fn = "";
    if (activeTab === "services") { csv = "Name,Status,Uptime,ResponseTime,CPU,Memory\n" + services.map((s) => `"${s.name}","${s.status}","${s.uptime}",${s.responseTime},${s.cpu},${s.memory}`).join("\n"); fn = "services.csv"; }
    else if (activeTab === "alerts") { csv = "ID,Severity,Service,Message,Time\n" + alerts.map((a) => `"${a.id}","${a.severity}","${a.service}","${a.message}","${a.time}"`).join("\n"); fn = "alerts.csv"; }
    else if (activeTab === "logs") { csv = "Time,Level,Service,Message\n" + filteredLogs.map((l) => `"${l.time}","${l.level}","${l.service}","${l.message}"`).join("\n"); fn = "logs.csv"; }
    else { csv = "Timestamp,Topic,EventType,Status,Partition,Offset,Tenant\n" + filteredKafka.map((e) => `"${e.timestamp}","${e.topic}","${e.eventType}","${e.status}",${e.partition},${e.offset},"${e.tenant}"`).join("\n"); fn = "kafka-events.csv"; }
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = fn; a.click(); URL.revokeObjectURL(url);
  };

  const statusCounts = useMemo(() => ({ All: services.length, Healthy: services.filter((s) => s.status === "Healthy").length, Degraded: services.filter((s) => s.status === "Degraded").length, Down: services.filter((s) => s.status === "Down").length }), [services]);
  const sevCounts = useMemo(() => ({ All: alerts.filter((a) => !a.resolved).length, Critical: alerts.filter((a) => !a.resolved && a.severity === "Critical").length, Warning: alerts.filter((a) => !a.resolved && a.severity === "Warning").length, Info: alerts.filter((a) => !a.resolved && a.severity === "Info").length }), [alerts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Monitoring &amp; Logs</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Service health, infrastructure metrics, alerts, and centralized log viewer</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}><Download className="h-4 w-4" />Export</button>
          {activeTab === "alerts" && (
            <button onClick={() => setAlertForm(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}><Plus className="h-4 w-4" />Create Alert</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <CheckCircle className="h-5 w-5" />, label: "Services Online", value: `${servicesOnline}/${services.length}` },
          { icon: <Activity className="h-5 w-5" />, label: "Avg Uptime (30d)", value: avgUptime },
          { icon: <AlertTriangle className="h-5 w-5" />, label: "Active Alerts", value: activeAlertCount },
          { icon: <FileText className="h-5 w-5" />, label: "Log Events", value: logs.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{s.icon}</div>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
        {(["services", "alerts", "logs", "events"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "text-white" : ""}`} style={activeTab === tab ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>
            {tab === "services" ? "Services" : tab === "alerts" ? "Alerts" : tab === "logs" ? "App Logs" : "Event Logs"}
          </button>
        ))}
      </div>

      {/* ===== SERVICES TAB ===== */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(["All", "Healthy", "Degraded", "Down"] as const).map((s) => (
              <button key={s} onClick={() => setServiceFilter(s)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: serviceFilter === s ? "var(--gf-accent)" : "var(--gf-bg-surface)", color: serviceFilter === s ? "#fff" : "var(--gf-text-secondary)", border: "1px solid var(--gf-border)" }}>
                {s} ({statusCounts[s]})
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredServices.map((svc) => {
              const cfg = STATUS_CONFIG[svc.status];
              return (
                <div key={svc.id} onClick={() => setViewService(svc)} className="rounded-xl border p-5 cursor-pointer hover:opacity-90 transition-opacity" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{svc.name}</h3>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />{svc.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div><span style={{ color: "var(--gf-text-muted)" }}>Uptime</span><p className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{svc.uptime}</p></div>
                    <div><span style={{ color: "var(--gf-text-muted)" }}>Response</span><p className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{svc.responseTime}ms</p></div>
                  </div>
                  <div className="space-y-2">
                    {[{ l: "CPU", v: svc.cpu }, { l: "Memory", v: svc.memory }].map((m) => (
                      <div key={m.l}>
                        <div className="flex justify-between text-xs mb-1"><span style={{ color: "var(--gf-text-muted)" }}>{m.l}</span><span style={{ color: "var(--gf-text-secondary)" }}>{m.v}%</span></div>
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--gf-bg-base)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${m.v}%`, backgroundColor: m.v > 80 ? "#ef4444" : m.v > 60 ? "#f59e0b" : "#22c55e" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {svc.status !== "Healthy" && (
                    <button onClick={(e) => { e.stopPropagation(); setRestartConfirm(svc); }} className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "var(--gf-accent)", color: "var(--gf-accent)", backgroundColor: "var(--gf-accent-bg)" }}>
                      Restart Service
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== ALERTS TAB ===== */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(["All", "Critical", "Warning", "Info"] as const).map((s) => (
              <button key={s} onClick={() => setAlertFilter(s)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: alertFilter === s ? "var(--gf-accent)" : "var(--gf-bg-surface)", color: alertFilter === s ? "#fff" : "var(--gf-text-secondary)", border: "1px solid var(--gf-border)" }}>
                {s} ({sevCounts[s]})
              </button>
            ))}
          </div>
          {filteredAlerts.length === 0 ? (
            <div className="rounded-xl border py-12 text-center" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "#22c55e" }} />
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No active alerts</p>
              <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>All systems operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const sc = SEVERITY_COLORS[alert.severity];
                return (
                  <div key={alert.id} className="rounded-xl border p-4" style={{ borderColor: alert.acknowledged ? "var(--gf-border)" : `${sc}40`, backgroundColor: "var(--gf-bg-surface)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${sc}20`, color: sc }}>{alert.severity}</span>
                          <span className="text-xs font-medium" style={{ color: "var(--gf-accent)" }}>{alert.service}</span>
                          {alert.acknowledged && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">Acknowledged</span>}
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{alert.message}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>{alert.time}</p>
                      </div>
                      <div className="relative">
                        <button onClick={() => setOpenActionId(openActionId === alert.id ? null : alert.id)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>...</button>
                        {openActionId === alert.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                            <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                              {!alert.acknowledged && <button onClick={() => handleAcknowledge(alert.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#f59e0b" }}>Acknowledge</button>}
                              <button onClick={() => handleResolve(alert.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#22c55e" }}>Resolve</button>
                              <button onClick={() => handleEscalate(alert.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#ef4444" }}>Escalate</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== APP LOGS TAB ===== */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input type="text" value={logSearch} onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }} placeholder="Search logs..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <select value={logLevel} onChange={(e) => { setLogLevel(e.target.value); setLogPage(1); }} className="rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle}>
              <option value="All">All Levels</option>
              {LOG_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={logService} onChange={(e) => { setLogService(e.target.value); setLogPage(1); }} className="rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle}>
              <option value="All">All Services</option>
              {SERVICE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="font-mono text-xs">
              {pagedLogs.length === 0 ? (
                <div className="py-12 text-center"><p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No log entries found</p></div>
              ) : pagedLogs.map((log) => {
                const lc = LEVEL_COLORS[log.level];
                return (
                  <div key={log.id} onClick={() => setViewLog(log)} className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid var(--gf-border)" }}>
                    <span className="shrink-0 mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{log.time}</span>
                    <span className="shrink-0 px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: `${lc}20`, color: lc }}>{log.level.padEnd(5)}</span>
                    <span className="shrink-0 font-semibold" style={{ color: "var(--gf-accent)", minWidth: 140 }}>{log.service}</span>
                    <span className="truncate" style={{ color: "var(--gf-text-secondary)" }}>{log.message}</span>
                  </div>
                );
              })}
            </div>
            <PaginationBar current={logSafePage} total={filteredLogs.length} onChange={setLogPage} />
          </div>
        </div>
      )}

      {/* ===== EVENT LOGS TAB ===== */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input type="text" value={kafkaSearch} onChange={(e) => { setKafkaSearch(e.target.value); setKafkaPage(1); }} placeholder="Search events..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <select value={kafkaStatus} onChange={(e) => { setKafkaStatus(e.target.value); setKafkaPage(1); }} className="rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle}>
              <option value="All">All Statuses</option>
              <option value="Processed">Processed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <select value={kafkaTopic} onChange={(e) => { setKafkaTopic(e.target.value); setKafkaPage(1); }} className="rounded-lg border px-3 py-2 text-sm outline-none" style={fieldStyle}>
              <option value="All">All Topics</option>
              {KAFKA_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    {["Timestamp", "Topic", "Event Type", "Partition", "Offset", "Tenant", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedKafka.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center"><p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>No events found</p></td></tr>
                  ) : pagedKafka.map((evt) => {
                    const kc = KAFKA_STATUS_COLORS[evt.status];
                    return (
                      <tr key={evt.id} onClick={() => setViewKafka(evt)} className="border-b last:border-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{evt.timestamp}</td>
                        <td className="px-4 py-3 text-xs font-mono font-medium" style={{ color: "var(--gf-accent)" }}>{evt.topic}</td>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>{evt.eventType}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{evt.partition}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--gf-text-secondary)" }}>{evt.offset.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>{evt.tenant}</td>
                        <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${kc}20`, color: kc }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: kc }} />{evt.status}</span></td>
                        <td className="px-4 py-3">
                          {evt.status === "Failed" && (
                            <button onClick={(e) => { e.stopPropagation(); handleRetryKafka(evt.id); }} className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>Retry</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationBar current={kafkaSafePage} total={filteredKafka.length} onChange={setKafkaPage} />
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      {viewService && <ServiceDetailPanel service={viewService} onClose={() => setViewService(null)} onRestart={() => { setRestartConfirm(viewService); setViewService(null); }} />}
      {viewLog && <LogDetailPanel log={viewLog} onClose={() => setViewLog(null)} />}
      {viewKafka && <KafkaEventDetailPanel event={viewKafka} onClose={() => setViewKafka(null)} onRetry={viewKafka.status === "Failed" ? () => { handleRetryKafka(viewKafka.id); setViewKafka(null); } : undefined} />}
      {alertForm && <AlertFormModal onClose={() => setAlertForm(false)} onSave={handleCreateAlert} />}
      {restartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setRestartConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15"><RefreshCw className="h-5 w-5 text-amber-500" /></div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Restart Service</h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
              Restart <strong style={{ color: "var(--gf-text-primary)" }}>{restartConfirm.name}</strong>? This will attempt to restore the service to a healthy state.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRestartConfirm(null)} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button onClick={handleRestart} className="rounded-lg px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700">Restart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
