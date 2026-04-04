"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Bell,
  CreditCard,
  FileText,
  GitBranch,
  File,
  Cpu,
  Globe,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  Activity,
  Server,
  Zap,
  Clock,
  Settings,
  ExternalLink,
  Heart,
  Ban,
  LayoutGrid,
  List,
} from "lucide-react";

// ===========================================================================
// Types
// ===========================================================================

type ServiceStatus = "Running" | "Degraded" | "Down" | "Maintenance";
type ServiceCategory = "Core" | "Integration" | "Platform" | "Infrastructure";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: ServiceStatus;
  version: string;
  endpoints: number;
  uptime: string;
  latency: string;
  href: string;
  category: ServiceCategory;
  lastDeployed: string;
  healthCheckUrl: string;
  healthCheckInterval: string;
  autoRestart: boolean;
  cpu: number;
  memory: number;
  dependencies: string[];
}

// ===========================================================================
// Icon mapping
// ===========================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Shield, Bell, CreditCard, FileText, GitBranch, File, Cpu, Globe, Server, Activity, Zap, Settings,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

function ServiceIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[iconName] || Server;
  return <Icon className={className} style={style} />;
}

// ===========================================================================
// Constants
// ===========================================================================

const STATUS_COLORS: Record<ServiceStatus, string> = {
  Running: "#22c55e",
  Degraded: "#eab308",
  Down: "#ef4444",
  Maintenance: "#6b7280",
};

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  Core: "#3b82f6",
  Integration: "#8b5cf6",
  Platform: "#14b8a6",
  Infrastructure: "#f59e0b",
};

const CATEGORIES: ServiceCategory[] = ["Core", "Integration", "Platform", "Infrastructure"];
const STATUSES: ServiceStatus[] = ["Running", "Degraded", "Down", "Maintenance"];

const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

// ===========================================================================
// Initial Data
// ===========================================================================

const INITIAL_SERVICES: Service[] = [
  {
    id: "s2", name: "Notification Hub", description: "Email, SMS, Push, In-app and webhook notifications",
    icon: "Bell", status: "Running", version: "1.7.0", endpoints: 12, uptime: "99.95%", latency: "120ms",
    href: "/dashboard/notifications", category: "Core", lastDeployed: "2026-03-25 09:15",
    healthCheckUrl: "https://notifications.glimmora.internal/health", healthCheckInterval: "30s", autoRestart: true,
    cpu: 22, memory: 38, dependencies: ["Kafka"],
  },
  {
    id: "s3", name: "Payment Service", description: "Multi-gateway payments via Stripe, Razorpay and Adyen",
    icon: "CreditCard", status: "Running", version: "3.1.2", endpoints: 14, uptime: "99.99%", latency: "230ms",
    href: "/dashboard/payments", category: "Core", lastDeployed: "2026-03-30 11:00",
    healthCheckUrl: "https://payments.glimmora.internal/health", healthCheckInterval: "15s", autoRestart: true,
    cpu: 41, memory: 60, dependencies: ["Database", "Audit Service"],
  },
  {
    id: "s4", name: "Audit Service", description: "Immutable audit trail, compliance reports and change tracking",
    icon: "FileText", status: "Running", version: "1.3.0", endpoints: 8, uptime: "100%", latency: "32ms",
    href: "/dashboard/audit", category: "Platform", lastDeployed: "2026-03-20 16:45",
    healthCheckUrl: "https://audit.glimmora.internal/health", healthCheckInterval: "60s", autoRestart: false,
    cpu: 12, memory: 28, dependencies: ["Database", "Kafka"],
  },
  {
    id: "s5", name: "Workflow Engine", description: "Approvals, onboarding flows and SLA management",
    icon: "GitBranch", status: "Degraded", version: "2.0.4", endpoints: 11, uptime: "98.70%", latency: "310ms",
    href: "/dashboard/workflows", category: "Platform", lastDeployed: "2026-03-22 08:30",
    healthCheckUrl: "https://workflows.glimmora.internal/health", healthCheckInterval: "30s", autoRestart: true,
    cpu: 78, memory: 85, dependencies: ["Notification Hub", "Database"],
  },
  {
    id: "s6", name: "Document Service", description: "PDF generation, contract templates and e-signatures",
    icon: "File", status: "Running", version: "1.1.0", endpoints: 9, uptime: "99.90%", latency: "180ms",
    href: "/dashboard/documents", category: "Integration", lastDeployed: "2026-03-18 13:20",
    healthCheckUrl: "https://documents.glimmora.internal/health", healthCheckInterval: "30s", autoRestart: true,
    cpu: 28, memory: 45, dependencies: ["Storage"],
  },
  {
    id: "s7", name: "AI Platform", description: "Model hosting, prompt management and inference APIs",
    icon: "Cpu", status: "Running", version: "0.9.3", endpoints: 15, uptime: "99.85%", latency: "290ms",
    href: "/dashboard/ai-platform", category: "Platform", lastDeployed: "2026-03-29 10:00",
    healthCheckUrl: "https://ai.glimmora.internal/health", healthCheckInterval: "15s", autoRestart: true,
    cpu: 65, memory: 72, dependencies: ["GPU Cluster", "Redis Cache"],
  },
  {
    id: "s8", name: "API Gateway", description: "Rate limiting, request routing, auth proxy and analytics",
    icon: "Globe", status: "Down", version: "2.2.0", endpoints: 6, uptime: "95.40%", latency: "—",
    href: "/dashboard/api-gateway", category: "Infrastructure", lastDeployed: "2026-03-27 17:00",
    healthCheckUrl: "https://gateway.glimmora.internal/health", healthCheckInterval: "10s", autoRestart: true,
    cpu: 0, memory: 0, dependencies: ["Redis Cache", "Load Balancer"],
  },
];

// ===========================================================================
// Toast
// ===========================================================================

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
      <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{message}</span>
      <button onClick={onClose} className="ml-2 rounded p-0.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-4 w-4" /></button>
    </div>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{title}</h2>
        </div>
        <div className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Confirm Action Modal (Restart / Maintenance)
// ===========================================================================

function ConfirmActionModal({ title, message, confirmLabel, confirmColor, icon, onConfirm, onCancel }: {
  title: string; message: React.ReactNode; confirmLabel: string; confirmColor: string;
  icon: React.ReactNode; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">{icon}<h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{title}</h2></div>
        <div className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors" style={{ backgroundColor: confirmColor }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Resource Usage Bar
// ===========================================================================

function UsageBar({ label, value, unit }: { label: string; value: number; unit: string }) {
  const color = value > 85 ? "#ef4444" : value > 60 ? "#f59e0b" : "var(--gf-accent)";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: "var(--gf-text-secondary)" }}>{label}</span>
        <span style={{ color: "var(--gf-text-primary)" }}>{value}{unit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ===========================================================================
// Service Detail Modal
// ===========================================================================

function ServiceDetailModal({ service, onClose, onEdit, onRestart, onToggleMaintenance, onHealthCheck }: {
  service: Service; onClose: () => void; onEdit: () => void; onRestart: () => void; onToggleMaintenance: () => void; onHealthCheck: () => void;
}) {
  const sc = STATUS_COLORS[service.status];
  const cc = CATEGORY_COLORS[service.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Service Details</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
              <Pencil className="h-3 w-3 inline mr-1" />Configure
            </button>
            <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Service info */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
              <ServiceIcon iconName={service.icon} className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{service.name}</h3>
              <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{service.description}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${sc}20`, color: sc }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sc }} />{service.status}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${cc}20`, color: cc }}>{service.category}</span>
            <span className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)", border: "1px solid var(--gf-border)" }}>v{service.version}</span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Endpoints", value: service.endpoints.toString() },
              { label: "Uptime", value: service.uptime },
              { label: "Avg Latency", value: service.latency },
              { label: "Last Deployed", value: service.lastDeployed },
              { label: "Health Check", value: service.healthCheckInterval },
              { label: "Auto Restart", value: service.autoRestart ? "Enabled" : "Disabled" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Health Check URL */}
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-muted)" }}>Health Check URL</p>
            <div className="flex items-center gap-2 rounded-lg border p-3 font-mono text-xs" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}>
              <span className="flex-1 break-all">{service.healthCheckUrl}</span>
            </div>
          </div>

          {/* Resource Usage */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Resource Usage</h4>
            <div className="space-y-3">
              <UsageBar label="CPU" value={service.cpu} unit="%" />
              <UsageBar label="Memory" value={service.memory} unit="%" />
            </div>
          </div>

          {/* Dependencies */}
          {service.dependencies.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--gf-text-muted)" }}>Dependencies</p>
              <div className="flex flex-wrap gap-2">
                {service.dependencies.map((d) => (
                  <span key={d} className="rounded-full px-3 py-1 text-xs font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
            {service.status !== "Running" && (
              <button onClick={onRestart} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 hover:bg-green-700">
                <RefreshCw className="h-4 w-4" />Restart
              </button>
            )}
            <button onClick={onHealthCheck} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80 transition-colors" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Heart className="h-4 w-4" />Check Health
            </button>
            <button onClick={onToggleMaintenance} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80 transition-colors"
              style={{ borderColor: "var(--gf-border)", color: service.status === "Maintenance" ? "#22c55e" : "#f59e0b" }}
            >
              {service.status === "Maintenance" ? <><Play className="h-4 w-4" />Bring Online</> : <><Pause className="h-4 w-4" />Maintenance Mode</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Service Form Modal (Create / Configure)
// ===========================================================================

function ServiceFormModal({ service, onSave, onCancel }: {
  service?: Service | null;
  onSave: (data: Omit<Service, "id">) => void;
  onCancel: () => void;
}) {
  const isEdit = !!service;
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [icon, setIcon] = useState(service?.icon ?? "Server");
  const [version, setVersion] = useState(service?.version ?? "1.0.0");
  const [endpoints, setEndpoints] = useState(service?.endpoints ?? 0);
  const [category, setCategory] = useState<ServiceCategory>(service?.category ?? "Core");
  const [status, setStatus] = useState<ServiceStatus>(service?.status ?? "Running");
  const [href, setHref] = useState(service?.href ?? "/dashboard/");
  const [healthCheckUrl, setHealthCheckUrl] = useState(service?.healthCheckUrl ?? "https://");
  const [healthCheckInterval, setHealthCheckInterval] = useState(service?.healthCheckInterval ?? "30s");
  const [autoRestart, setAutoRestart] = useState(service?.autoRestart ?? true);
  const [uptime] = useState(service?.uptime ?? "—");
  const [latency] = useState(service?.latency ?? "—");
  const [lastDeployed] = useState(service?.lastDeployed ?? new Date().toISOString().slice(0, 16).replace("T", " "));
  const [cpu] = useState(service?.cpu ?? 0);
  const [memory] = useState(service?.memory ?? 0);
  const [dependencies] = useState(service?.dependencies ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Service name is required";
    if (!description.trim()) e.description = "Description is required";
    if (!version.trim()) e.version = "Version is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({ name, description, icon, version, endpoints, category, status, href, healthCheckUrl, healthCheckInterval, autoRestart, uptime, latency, lastDeployed, cpu, memory, dependencies });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Configure Service" : "Add New Service"}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Service Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Email Service" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Brief description of the service..." className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Row 2: Icon + Version + Endpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Icon</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Version *</label>
              <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.version && <p className="text-xs text-red-500 mt-1">{errors.version}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Endpoints</label>
              <input type="number" min={0} value={endpoints} onChange={(e) => setEndpoints(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
          </div>

          {/* Row 3: Status (edit only) + Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isEdit && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ServiceStatus)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Dashboard Route</label>
              <input type="text" value={href} onChange={(e) => setHref(e.target.value)} placeholder="/dashboard/service-name" className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
          </div>

          {/* Health check settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Health Check URL</label>
              <input type="url" value={healthCheckUrl} onChange={(e) => setHealthCheckUrl(e.target.value)} placeholder="https://service.internal/health" className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Check Interval</label>
              <select value={healthCheckInterval} onChange={(e) => setHealthCheckInterval(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {["10s", "15s", "30s", "60s", "5m"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Auto restart toggle */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setAutoRestart(!autoRestart)}
              className={`relative h-6 w-11 rounded-full transition-colors ${autoRestart ? "bg-[var(--gf-accent)]" : ""}`}
              style={!autoRestart ? { backgroundColor: "var(--gf-bg-elevated)" } : {}}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoRestart ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Enable Auto Restart</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{isEdit ? "Save Changes" : "Add Service"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// Main Component
// ===========================================================================

export function ServicesContent() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | "All">("All");
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | "All">("All");
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [formModal, setFormModal] = useState<{ open: boolean; service: Service | null }>({ open: false, service: null });
  const [viewDetail, setViewDetail] = useState<Service | null>(null);
  const [deleteModal, setDeleteModal] = useState<Service | null>(null);
  const [restartModal, setRestartModal] = useState<Service | null>(null);
  const [maintenanceModal, setMaintenanceModal] = useState<Service | null>(null);

  // Action dropdown
  const [openAction, setOpenAction] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Last checked
  const [lastChecked, setLastChecked] = useState<string>("just now");

  // ===========================================================================
  // Filtered data
  // ===========================================================================

  const filtered = useMemo(() => {
    let list = services;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    if (filterStatus !== "All") list = list.filter((s) => s.status === filterStatus);
    if (filterCategory !== "All") list = list.filter((s) => s.category === filterCategory);
    return list;
  }, [services, search, filterStatus, filterCategory]);

  // Stats
  const runningCount = services.filter((s) => s.status === "Running").length;
  const degradedCount = services.filter((s) => s.status === "Degraded").length;
  const downCount = services.filter((s) => s.status === "Down").length;
  const maintenanceCount = services.filter((s) => s.status === "Maintenance").length;

  const hasActiveFilters = search || filterStatus !== "All" || filterCategory !== "All";

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const handleCreate = (data: Omit<Service, "id">) => {
    setServices((prev) => [...prev, { ...data, id: `s${Date.now()}` }]);
    setFormModal({ open: false, service: null });
    showToast("Service added successfully");
  };

  const handleEdit = (data: Omit<Service, "id">) => {
    if (!formModal.service) return;
    setServices((prev) => prev.map((s) => s.id === formModal.service!.id ? { ...s, ...data } : s));
    setFormModal({ open: false, service: null });
    if (viewDetail?.id === formModal.service.id) setViewDetail((prev) => prev ? { ...prev, ...data } : null);
    showToast("Service configuration updated");
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setServices((prev) => prev.filter((s) => s.id !== deleteModal.id));
    setDeleteModal(null);
    if (viewDetail?.id === deleteModal.id) setViewDetail(null);
    showToast("Service removed");
  };

  const handleRestart = () => {
    if (!restartModal) return;
    setServices((prev) => prev.map((s) => s.id === restartModal.id ? { ...s, status: "Running" as ServiceStatus, latency: s.latency === "—" ? "50ms" : s.latency, cpu: Math.floor(Math.random() * 30) + 10, memory: Math.floor(Math.random() * 30) + 20 } : s));
    if (viewDetail?.id === restartModal.id) setViewDetail((prev) => prev ? { ...prev, status: "Running" } : null);
    setRestartModal(null);
    showToast("Service restarted successfully");
  };

  const handleToggleMaintenance = () => {
    if (!maintenanceModal) return;
    const newStatus: ServiceStatus = maintenanceModal.status === "Maintenance" ? "Running" : "Maintenance";
    const updates = newStatus === "Maintenance"
      ? { status: newStatus, cpu: 0, memory: 0, latency: "—" }
      : { status: newStatus, cpu: Math.floor(Math.random() * 30) + 10, memory: Math.floor(Math.random() * 30) + 20, latency: "50ms" };
    setServices((prev) => prev.map((s) => s.id === maintenanceModal.id ? { ...s, ...updates } : s));
    if (viewDetail?.id === maintenanceModal.id) setViewDetail((prev) => prev ? { ...prev, ...updates } : null);
    setMaintenanceModal(null);
    showToast(newStatus === "Maintenance" ? "Service put into maintenance mode" : "Service brought online");
  };

  const handleHealthCheck = (service: Service) => {
    showToast(`Health check passed for ${service.name}`);
    setViewDetail(null);
  };

  const handleRefresh = () => {
    const now = new Date();
    setLastChecked(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`);
    showToast("Service statuses refreshed");
  };

  const handleExport = () => {
    const header = "Name,Category,Status,Version,Endpoints,Uptime,Latency,CPU,Memory,Last Deployed\n";
    const rows = services.map((s) => `"${s.name}","${s.category}","${s.status}","${s.version}",${s.endpoints},"${s.uptime}","${s.latency}",${s.cpu}%,${s.memory}%,"${s.lastDeployed}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "services-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => { setSearch(""); setFilterStatus("All"); setFilterCategory("All"); };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Service Health</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Real-time status of all Glimmora Fabric platform services</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <Download className="h-4 w-4" />Export
          </button>
          <button onClick={() => setFormModal({ open: true, service: null })} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
            <Plus className="h-4 w-4" />Add Service
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-xl px-5 py-3" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
        {[
          { color: STATUS_COLORS.Running, label: `${runningCount} Running` },
          { color: STATUS_COLORS.Degraded, label: `${degradedCount} Degraded` },
          { color: STATUS_COLORS.Down, label: `${downCount} Down` },
          { color: STATUS_COLORS.Maintenance, label: `${maintenanceCount} Maintenance` },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Last checked: {lastChecked}</span>
          <button onClick={handleRefresh} className="rounded-lg p-1.5 hover:opacity-70 transition-colors" style={{ color: "var(--gf-text-secondary)" }} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search, Filter, View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services by name, description, or category..."
            className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`}
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <Filter className="h-4 w-4" />Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              {[filterStatus !== "All", filterCategory !== "All"].filter(Boolean).length}
            </span>
          )}
        </button>
        {/* View toggle */}
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
          <button onClick={() => setViewMode("grid")}
            className="px-3 py-2 transition-colors" style={{ backgroundColor: viewMode === "grid" ? "var(--gf-bg-elevated)" : "var(--gf-bg-surface)", color: viewMode === "grid" ? "var(--gf-accent)" : "var(--gf-text-muted)" }}
          ><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("list")}
            className="px-3 py-2 transition-colors" style={{ backgroundColor: viewMode === "list" ? "var(--gf-bg-elevated)" : "var(--gf-bg-surface)", color: viewMode === "list" ? "var(--gf-accent)" : "var(--gf-text-muted)" }}
          ><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ServiceStatus | "All")} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ServiceCategory | "All")} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={fieldStyle}>
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-400">
              <X className="h-3 w-3" />Clear All
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filtered.length} of {services.length} services</p>
      )}

      {/* ================================================================ */}
      {/* GRID VIEW                                                        */}
      {/* ================================================================ */}
      {viewMode === "grid" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Server className="h-12 w-12 mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No services found</p>
              <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>{hasActiveFilters ? "Try adjusting your filters" : "Add your first service"}</p>
            </div>
          ) : filtered.map((service) => {
            const sc = STATUS_COLORS[service.status];
            const cc = CATEGORY_COLORS[service.category];
            return (
              <div key={service.id} className="rounded-xl p-5 transition-all relative group" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", opacity: service.status === "Down" || service.status === "Maintenance" ? 0.75 : 1 }}>
                {/* Top row: icon + status + actions */}
                <div className="flex items-start justify-between">
                  <ServiceIcon iconName={service.icon} className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sc }} />
                    <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{service.status}</span>

                    {/* Actions dropdown */}
                    <div className="relative ml-1">
                      <button onClick={(e) => { e.stopPropagation(); setOpenAction(openAction === service.id ? null : service.id); }}
                        className="rounded-lg p-1 hover:opacity-70 transition-colors" style={{ color: "var(--gf-text-muted)" }}
                      ><MoreHorizontal className="h-4 w-4" /></button>

                      {openAction === service.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenAction(null)} />
                          <div className="absolute right-0 top-7 z-50 w-52 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                            <button onClick={() => { setViewDetail(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                              <Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Details
                            </button>
                            <button onClick={() => { setFormModal({ open: true, service }); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                              <Settings className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Configure
                            </button>
                            {service.status !== "Running" && (
                              <button onClick={() => { setRestartModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#22c55e" }}>
                                <RefreshCw className="h-4 w-4" />Restart
                              </button>
                            )}
                            <button onClick={() => { handleHealthCheck(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                              <Heart className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Check Health
                            </button>
                            {service.status === "Maintenance" ? (
                              <button onClick={() => { setMaintenanceModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#22c55e" }}>
                                <Play className="h-4 w-4" />Bring Online
                              </button>
                            ) : (
                              <button onClick={() => { setMaintenanceModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#f59e0b" }}>
                                <Pause className="h-4 w-4" />Maintenance Mode
                              </button>
                            )}
                            <button onClick={() => { router.push("/dashboard/monitoring"); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                              <Activity className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Logs
                            </button>
                            <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                            <button onClick={() => { setDeleteModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" />Remove Service
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name + description (clickable) */}
                <button onClick={() => setViewDetail(service)} className="text-left mt-4 w-full">
                  <h3 className="text-sm font-semibold hover:underline underline-offset-2" style={{ color: "var(--gf-text-primary)" }}>{service.name}</h3>
                  <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--gf-text-secondary)" }}>{service.description}</p>
                </button>

                {/* Version, Endpoints, Category */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)", border: "1px solid var(--gf-border)" }}>v{service.version}</span>
                  <span className="text-[11px]" style={{ color: "var(--gf-text-muted)" }}>{service.endpoints} endpoints</span>
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${cc}15`, color: cc }}>{service.category}</span>
                </div>

                {/* Metrics */}
                <div className="mt-4 flex gap-4 border-t pt-3" style={{ borderColor: "var(--gf-border)" }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Uptime</p>
                    <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{service.uptime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Latency</p>
                    <p className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>{service.latency}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>CPU</p>
                    <p className="text-xs font-semibold" style={{ color: service.cpu > 75 ? "#ef4444" : "var(--gf-text-primary)" }}>{service.cpu}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>MEM</p>
                    <p className="text-xs font-semibold" style={{ color: service.memory > 75 ? "#ef4444" : "var(--gf-text-primary)" }}>{service.memory}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================ */}
      {/* LIST VIEW                                                        */}
      {/* ================================================================ */}
      {viewMode === "list" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                  {["Service", "Category", "Status", "Version", "Endpoints", "Uptime", "Latency", "CPU", "MEM", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-12 text-center">
                    <Server className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No services found</p>
                  </td></tr>
                ) : filtered.map((service) => {
                  const sc = STATUS_COLORS[service.status];
                  const cc = CATEGORY_COLORS[service.category];
                  return (
                    <tr key={service.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewDetail(service)} className="flex items-center gap-3 hover:opacity-80">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
                            <ServiceIcon iconName={service.icon} className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>{service.name}</p>
                            <p className="text-[11px] max-w-[200px] truncate" style={{ color: "var(--gf-text-muted)" }}>{service.description}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${cc}20`, color: cc }}>{service.category}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sc }} />
                          <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{service.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)", border: "1px solid var(--gf-border)" }}>v{service.version}</span></td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{service.endpoints}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>{service.uptime}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{service.latency}</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: service.cpu > 75 ? "#ef4444" : "var(--gf-text-primary)" }}>{service.cpu}%</td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: service.memory > 75 ? "#ef4444" : "var(--gf-text-primary)" }}>{service.memory}%</td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button onClick={() => setOpenAction(openAction === service.id ? null : service.id)} className="rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openAction === service.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenAction(null)} />
                              <div className="absolute right-0 top-8 z-50 w-52 rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
                                <button onClick={() => { setViewDetail(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Details
                                </button>
                                <button onClick={() => { setFormModal({ open: true, service }); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Settings className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Configure
                                </button>
                                {service.status !== "Running" && (
                                  <button onClick={() => { setRestartModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#22c55e" }}>
                                    <RefreshCw className="h-4 w-4" />Restart
                                  </button>
                                )}
                                <button onClick={() => { handleHealthCheck(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Heart className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Check Health
                                </button>
                                {service.status === "Maintenance" ? (
                                  <button onClick={() => { setMaintenanceModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#22c55e" }}>
                                    <Play className="h-4 w-4" />Bring Online
                                  </button>
                                ) : (
                                  <button onClick={() => { setMaintenanceModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "#f59e0b" }}>
                                    <Pause className="h-4 w-4" />Maintenance Mode
                                  </button>
                                )}
                                <button onClick={() => { router.push("/dashboard/monitoring"); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                                  <Activity className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Logs
                                </button>
                                <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                                <button onClick={() => { setDeleteModal(service); setOpenAction(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">
                                  <Trash2 className="h-4 w-4" />Remove Service
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

      {/* ================================================================ */}
      {/* Modals                                                           */}
      {/* ================================================================ */}

      {/* Create / Configure Modal */}
      {formModal.open && (
        <ServiceFormModal
          service={formModal.service}
          onSave={formModal.service ? handleEdit : handleCreate}
          onCancel={() => setFormModal({ open: false, service: null })}
        />
      )}

      {/* View Detail */}
      {viewDetail && (
        <ServiceDetailModal
          service={viewDetail}
          onClose={() => setViewDetail(null)}
          onEdit={() => { setFormModal({ open: true, service: viewDetail }); setViewDetail(null); }}
          onRestart={() => { setRestartModal(viewDetail); setViewDetail(null); }}
          onToggleMaintenance={() => { setMaintenanceModal(viewDetail); setViewDetail(null); }}
          onHealthCheck={() => handleHealthCheck(viewDetail)}
        />
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <DeleteConfirmModal
          title="Remove Service"
          message={<>Are you sure you want to remove <strong style={{ color: "var(--gf-text-primary)" }}>{deleteModal.name}</strong>? This will deregister the service from the platform.</>}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Restart Modal */}
      {restartModal && (
        <ConfirmActionModal
          title="Restart Service"
          message={<>Restart <strong style={{ color: "var(--gf-text-primary)" }}>{restartModal.name}</strong>? The service will be briefly unavailable during restart.</>}
          confirmLabel="Restart"
          confirmColor="#22c55e"
          icon={<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15"><RefreshCw className="h-5 w-5 text-green-500" /></div>}
          onConfirm={handleRestart}
          onCancel={() => setRestartModal(null)}
        />
      )}

      {/* Maintenance Mode Modal */}
      {maintenanceModal && (
        <ConfirmActionModal
          title={maintenanceModal.status === "Maintenance" ? "Bring Service Online" : "Enable Maintenance Mode"}
          message={maintenanceModal.status === "Maintenance"
            ? <>Bring <strong style={{ color: "var(--gf-text-primary)" }}>{maintenanceModal.name}</strong> back online? The service will start accepting requests.</>
            : <>Put <strong style={{ color: "var(--gf-text-primary)" }}>{maintenanceModal.name}</strong> into maintenance mode? All traffic will be paused.</>
          }
          confirmLabel={maintenanceModal.status === "Maintenance" ? "Bring Online" : "Enable Maintenance"}
          confirmColor={maintenanceModal.status === "Maintenance" ? "#22c55e" : "#f59e0b"}
          icon={<div className={`flex h-10 w-10 items-center justify-center rounded-full ${maintenanceModal.status === "Maintenance" ? "bg-green-500/15" : "bg-amber-500/15"}`}>
            {maintenanceModal.status === "Maintenance" ? <Play className="h-5 w-5 text-green-500" /> : <Pause className="h-5 w-5 text-amber-500" />}
          </div>}
          onConfirm={handleToggleMaintenance}
          onCancel={() => setMaintenanceModal(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
