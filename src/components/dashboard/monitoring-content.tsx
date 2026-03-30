"use client";

import {
  MonitorDot,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";

const stats = [
  { label: "Services Online", value: "8/8", icon: CheckCircle2 },
  { label: "Uptime (30d)", value: "99.97%", icon: Activity },
  { label: "Active Alerts", value: "2", icon: AlertTriangle },
  { label: "Log Events (24h)", value: "1.2M", icon: MonitorDot },
];

type ServiceStatus = "Healthy" | "Degraded" | "Down";

const services: {
  name: string;
  status: ServiceStatus;
  uptime: string;
  responseTime: string;
  cpu: string;
  memory: string;
  lastIncident: string;
}[] = [
  { name: "Identity Service", status: "Healthy", uptime: "99.99%", responseTime: "45ms", cpu: "12%", memory: "340MB", lastIncident: "28 days ago" },
  { name: "Payment Service", status: "Healthy", uptime: "99.99%", responseTime: "230ms", cpu: "18%", memory: "512MB", lastIncident: "14 days ago" },
  { name: "Notification Hub", status: "Healthy", uptime: "99.95%", responseTime: "120ms", cpu: "8%", memory: "256MB", lastIncident: "7 days ago" },
  { name: "Workflow Engine", status: "Healthy", uptime: "99.92%", responseTime: "85ms", cpu: "22%", memory: "480MB", lastIncident: "3 days ago" },
  { name: "Document Service", status: "Healthy", uptime: "99.96%", responseTime: "340ms", cpu: "15%", memory: "384MB", lastIncident: "21 days ago" },
  { name: "AI Platform", status: "Degraded", uptime: "99.90%", responseTime: "1.2s", cpu: "68%", memory: "2.1GB", lastIncident: "2 hrs ago" },
  { name: "Audit Service", status: "Healthy", uptime: "99.98%", responseTime: "32ms", cpu: "5%", memory: "180MB", lastIncident: "45 days ago" },
  { name: "API Gateway", status: "Healthy", uptime: "99.99%", responseTime: "12ms", cpu: "10%", memory: "220MB", lastIncident: "60 days ago" },
];

const statusConfig: Record<ServiceStatus, { color: string; icon: typeof CheckCircle2 }> = {
  Healthy: { color: "#22c55e", icon: CheckCircle2 },
  Degraded: { color: "#f59e0b", icon: AlertTriangle },
  Down: { color: "#ef4444", icon: XCircle },
};

const recentLogs = [
  { time: "14:32:01", service: "AI Platform", level: "WARN", message: "High latency detected on Claude API route - avg 2.4s (threshold: 2s)" },
  { time: "14:28:45", service: "Payment Service", level: "INFO", message: "Stripe webhook processed successfully - event: invoice.paid" },
  { time: "14:25:12", service: "Identity Service", level: "INFO", message: "MFA enrollment completed for user admin@acmecorp.com" },
  { time: "14:22:33", service: "AI Platform", level: "WARN", message: "Token rate limit approaching for tenant GlobalFinance (92% of quota)" },
  { time: "14:18:07", service: "Notification Hub", level: "INFO", message: "Batch email campaign dispatched - 1,240 recipients" },
  { time: "14:15:44", service: "Workflow Engine", level: "INFO", message: "Workflow 'onboarding-v3' completed for tenant TechVault" },
  { time: "14:12:19", service: "Document Service", level: "INFO", message: "PDF generated: Invoice #INV-2024-0848 for Acme Corp" },
  { time: "14:09:51", service: "API Gateway", level: "INFO", message: "Rate limit reset for key gf_live_a1b2c3 - 0/1000 requests" },
];

const levelColors: Record<string, string> = {
  INFO: "#3b82f6",
  WARN: "#f59e0b",
  ERROR: "#ef4444",
  DEBUG: "#8b5cf6",
};

type KafkaEventStatus = "Processed" | "Pending" | "Failed";

const kafkaEvents: {
  timestamp: string;
  topic: string;
  eventType: string;
  partition: number;
  offset: number;
  tenant: string;
  status: KafkaEventStatus;
}[] = [
  { timestamp: "2026-03-30 14:31:58", topic: "tenant.onboarding", eventType: "TenantProvisioned", partition: 2, offset: 108432, tenant: "Acme Corp", status: "Processed" },
  { timestamp: "2026-03-30 14:30:11", topic: "billing.invoices", eventType: "InvoiceGenerated", partition: 0, offset: 94201, tenant: "GlobalFinance", status: "Processed" },
  { timestamp: "2026-03-30 14:28:45", topic: "payments.webhooks", eventType: "PaymentReceived", partition: 1, offset: 77614, tenant: "TechVault", status: "Processed" },
  { timestamp: "2026-03-30 14:25:02", topic: "ai.inference", eventType: "ModelRoutingFailed", partition: 3, offset: 65239, tenant: "GlobalFinance", status: "Failed" },
  { timestamp: "2026-03-30 14:22:17", topic: "notifications.email", eventType: "BatchDispatched", partition: 0, offset: 53180, tenant: "Acme Corp", status: "Processed" },
  { timestamp: "2026-03-30 14:18:44", topic: "audit.trail", eventType: "PermissionChanged", partition: 1, offset: 42877, tenant: "TechVault", status: "Pending" },
  { timestamp: "2026-03-30 14:15:30", topic: "workflow.events", eventType: "StepCompleted", partition: 2, offset: 31504, tenant: "NovaBuild", status: "Processed" },
  { timestamp: "2026-03-30 14:12:09", topic: "ai.inference", eventType: "TokenQuotaExceeded", partition: 3, offset: 20891, tenant: "GlobalFinance", status: "Failed" },
];

const kafkaStatusColors: Record<KafkaEventStatus, string> = {
  Processed: "#22c55e",
  Pending: "#f59e0b",
  Failed: "#ef4444",
};

const alerts = [
  {
    severity: "Warning",
    service: "AI Platform",
    message: "High latency on model routing - Claude API responses averaging 2.4s",
    time: "2 hrs ago",
    acknowledged: false,
  },
  {
    severity: "Warning",
    service: "AI Platform",
    message: "Token usage at 92% of monthly quota for tenant GlobalFinance",
    time: "4 hrs ago",
    acknowledged: true,
  },
];

export function MonitoringContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Monitoring &amp; Logs
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Service health, infrastructure metrics, alerts, and centralized log viewer
        </p>
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

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
            Active Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-xl p-4"
                style={{
                  backgroundColor: "var(--gf-bg-surface)",
                  border: `1px solid ${alert.acknowledged ? "var(--gf-border)" : "#f59e0b40"}`,
                }}
              >
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                      {alert.service}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                      {alert.severity}
                    </span>
                    {alert.acknowledged && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
                    {alert.message}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Health */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Service Health
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Service", "Status", "Uptime", "Response", "CPU", "Memory", "Last Incident"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => {
                const cfg = statusConfig[svc.status];
                return (
                  <tr key={svc.name} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                      {svc.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                        {svc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-green-500">{svc.uptime}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{svc.responseTime}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{svc.cpu}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{svc.memory}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>{svc.lastIncident}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Logs */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Recent Logs
        </h2>
        <div
          className="rounded-xl overflow-hidden font-mono text-xs"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          {recentLogs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 px-4 py-2.5"
              style={{ borderBottom: "1px solid var(--gf-border)" }}
            >
              <span style={{ color: "var(--gf-text-muted)" }}>{log.time}</span>
              <span
                className="font-semibold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${levelColors[log.level]}20`, color: levelColors[log.level] }}
              >
                {log.level}
              </span>
              <span className="font-semibold shrink-0" style={{ color: "var(--gf-accent)", minWidth: "140px" }}>
                {log.service}
              </span>
              <span style={{ color: "var(--gf-text-secondary)" }}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Logs (Kafka) */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Event Logs (Kafka)
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Timestamp", "Topic", "Event Type", "Partition", "Offset", "Tenant", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kafkaEvents.map((evt, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>
                    {evt.timestamp}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono font-medium" style={{ color: "var(--gf-accent)" }}>
                    {evt.topic}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {evt.eventType}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {evt.partition}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--gf-text-secondary)" }}>
                    {evt.offset.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {evt.tenant}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${kafkaStatusColors[evt.status]}20`, color: kafkaStatusColors[evt.status] }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: kafkaStatusColors[evt.status] }} />
                      {evt.status}
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
