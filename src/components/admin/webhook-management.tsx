"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Copy,
  RefreshCw,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  TestTube,
  ExternalLink,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  secret: string;
  createdAt: string;
  lastTriggered: string | null;
  successRate: number;
  totalDeliveries: number;
  failedDeliveries: number;
  retryPolicy: "none" | "linear" | "exponential";
  timeout: number;
  headers: Record<string, string>;
}

const AVAILABLE_EVENTS = [
  "user.created", "user.updated", "user.deleted",
  "tenant.created", "tenant.updated",
  "payment.completed", "payment.failed",
  "invoice.generated", "invoice.paid",
  "subscription.created", "subscription.cancelled",
  "workflow.completed", "workflow.failed",
  "notification.sent", "notification.failed",
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_WEBHOOKS: Webhook[] = [
  { id: "wh-001", name: "Slack Notifications", url: "https://hooks.slack.com/services/T0123/B4567/abc123xyz", events: ["user.created", "payment.completed", "payment.failed"], status: "active", secret: "whsec_sk_live_abc123def456", createdAt: "2026-03-15", lastTriggered: "2026-04-07 14:30", successRate: 99.2, totalDeliveries: 1245, failedDeliveries: 10, retryPolicy: "exponential", timeout: 30, headers: { "X-Custom-Source": "glimmora" } },
  { id: "wh-002", name: "CRM Sync", url: "https://api.salesforce.com/webhooks/glimmora", events: ["user.created", "user.updated", "tenant.created"], status: "active", secret: "whsec_crm_9876xyz", createdAt: "2026-03-20", lastTriggered: "2026-04-07 13:15", successRate: 97.5, totalDeliveries: 890, failedDeliveries: 22, retryPolicy: "linear", timeout: 15, headers: {} },
  { id: "wh-003", name: "Analytics Pipeline", url: "https://analytics.internal.glimmora.com/ingest", events: ["payment.completed", "invoice.generated", "invoice.paid", "subscription.created", "subscription.cancelled"], status: "active", secret: "whsec_analytics_qwe789", createdAt: "2026-02-28", lastTriggered: "2026-04-07 12:00", successRate: 100, totalDeliveries: 3420, failedDeliveries: 0, retryPolicy: "exponential", timeout: 60, headers: { "Authorization": "Bearer analytics_token_xxx" } },
  { id: "wh-004", name: "PagerDuty Alerts", url: "https://events.pagerduty.com/integration/glimmora/enqueue", events: ["payment.failed", "workflow.failed", "notification.failed"], status: "failing", secret: "whsec_pd_alert_456", createdAt: "2026-03-10", lastTriggered: "2026-04-07 11:45", successRate: 45.0, totalDeliveries: 156, failedDeliveries: 86, retryPolicy: "exponential", timeout: 10, headers: { "X-Routing-Key": "pd_routing_xxx" } },
  { id: "wh-005", name: "Billing Microservice", url: "https://billing.internal.glimmora.com/hooks/events", events: ["payment.completed", "payment.failed", "invoice.generated", "invoice.paid"], status: "active", secret: "whsec_billing_internal_111", createdAt: "2026-01-15", lastTriggered: "2026-04-07 09:30", successRate: 99.8, totalDeliveries: 5670, failedDeliveries: 11, retryPolicy: "exponential", timeout: 30, headers: {} },
  { id: "wh-006", name: "Legacy ERP Connector", url: "https://erp.oldcorp.com/api/v1/webhooks", events: ["invoice.generated", "invoice.paid"], status: "inactive", secret: "whsec_erp_old_222", createdAt: "2025-12-01", lastTriggered: "2026-03-01 10:00", successRate: 82.0, totalDeliveries: 320, failedDeliveries: 58, retryPolicy: "none", timeout: 5, headers: {} },
  { id: "wh-007", name: "Workflow Orchestrator", url: "https://workflows.internal.glimmora.com/trigger", events: ["workflow.completed", "workflow.failed", "user.created", "tenant.created"], status: "active", secret: "whsec_wf_orch_333", createdAt: "2026-02-10", lastTriggered: "2026-04-07 14:00", successRate: 98.1, totalDeliveries: 780, failedDeliveries: 15, retryPolicy: "linear", timeout: 20, headers: {} },
];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  active: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", label: "Active" },
  inactive: { icon: XCircle, color: "text-gray-500 dark:text-gray-400", label: "Inactive" },
  failing: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", label: "Failing" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function WebhookManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [webhooks, setWebhooks] = useState(SAMPLE_WEBHOOKS);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [newRetry, setNewRetry] = useState<"none" | "linear" | "exponential">("exponential");
  const [newTimeout, setNewTimeout] = useState(30);

  const PAGE_SIZE = 6;

  const filtered = useMemo(() => {
    let data = [...webhooks];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(w => w.name.toLowerCase().includes(q) || w.url.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") data = data.filter(w => w.status === statusFilter);
    return data;
  }, [webhooks, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = () => {
    if (!newName || !newUrl || newEvents.length === 0) return;
    const wh: Webhook = {
      id: `wh-new-${Date.now()}`, name: newName, url: newUrl, events: newEvents,
      status: "active", secret: `whsec_${Math.random().toString(36).slice(2, 14)}`,
      createdAt: new Date().toISOString().slice(0, 10), lastTriggered: null,
      successRate: 100, totalDeliveries: 0, failedDeliveries: 0,
      retryPolicy: newRetry, timeout: newTimeout, headers: {},
    };
    setWebhooks(prev => [wh, ...prev]);
    setShowCreate(false);
    setNewName(""); setNewUrl(""); setNewEvents([]); setNewRetry("exponential"); setNewTimeout(30);
  };

  const handleDelete = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    setActionMenu(null);
  };

  const toggleStatus = (id: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "inactive" : "active" } : w));
    setActionMenu(null);
  };

  const toggleEventSelection = (event: string) => {
    setNewEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Webhook Management</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-muted)" }}>Configure and monitor webhook endpoints for event-driven integrations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Webhooks", value: webhooks.length, icon: Globe },
          { label: "Active", value: webhooks.filter(w => w.status === "active").length, icon: Zap },
          { label: "Failing", value: webhooks.filter(w => w.status === "failing").length, icon: AlertTriangle },
          { label: "Total Deliveries", value: webhooks.reduce((s, w) => s + w.totalDeliveries, 0).toLocaleString(), icon: Activity },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" style={{ color: "var(--gf-accent)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</span>
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or URL..." className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} /></button>}
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="failing">Failing</option>
        </select>
      </div>

      {/* Webhook cards */}
      <div className="space-y-4">
        {paginated.length === 0 ? (
          <div className="rounded-xl border p-12 text-center" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
            <p style={{ color: "var(--gf-text-muted)" }}>No webhooks found.</p>
          </div>
        ) : paginated.map(wh => {
          const st = STATUS_CONFIG[wh.status];
          const StIcon = st.icon;
          return (
            <div key={wh.id} className="rounded-xl border p-4" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gf-accent)" }} />
                    <span className="font-semibold text-sm" style={{ color: "var(--gf-text-primary)" }}>{wh.name}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${st.color}`}><StIcon className="w-3 h-3" /> {st.label}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <code className="text-xs truncate max-w-[400px] px-2 py-0.5 rounded" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{wh.url}</code>
                    <button onClick={() => navigator.clipboard.writeText(wh.url)} className="p-0.5"><Copy className="w-3 h-3" style={{ color: "var(--gf-text-muted)" }} /></button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {wh.events.map(e => (
                      <span key={e} className="rounded-md px-1.5 py-0.5 text-xs" style={{ backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>{e}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                    <span>Created {wh.createdAt}</span>
                    <span>Last triggered: {wh.lastTriggered || "Never"}</span>
                    <span>Success rate: <strong className={wh.successRate >= 95 ? "text-emerald-600 dark:text-emerald-400" : wh.successRate >= 80 ? "text-amber-600" : "text-red-600"}>{wh.successRate}%</strong></span>
                    <span>{wh.totalDeliveries.toLocaleString()} deliveries</span>
                  </div>

                  {/* Secret */}
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="w-3 h-3" style={{ color: "var(--gf-text-muted)" }} />
                    <span className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>
                      {showSecrets[wh.id] ? wh.secret : wh.secret.slice(0, 8) + "••••••••••"}
                    </span>
                    <button onClick={() => setShowSecrets(prev => ({ ...prev, [wh.id]: !prev[wh.id] }))} className="p-0.5">
                      {showSecrets[wh.id] ? <EyeOff className="w-3 h-3" style={{ color: "var(--gf-text-muted)" }} /> : <Eye className="w-3 h-3" style={{ color: "var(--gf-text-muted)" }} />}
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(wh.secret)} className="p-0.5"><Copy className="w-3 h-3" style={{ color: "var(--gf-text-muted)" }} /></button>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button onClick={() => setActionMenu(actionMenu === wh.id ? null : wh.id)} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5">
                    <MoreVertical className="w-4 h-4" style={{ color: "var(--gf-text-muted)" }} />
                  </button>
                  {actionMenu === wh.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border shadow-lg py-1" style={{ backgroundColor: "var(--gf-bg-elevated)", borderColor: "var(--gf-border)" }}>
                      <button onClick={() => { setSelectedWebhook(wh); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                      <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><TestTube className="w-3.5 h-3.5" /> Send Test</button>
                      <button onClick={() => toggleStatus(wh.id)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}>
                        {wh.status === "active" ? <><XCircle className="w-3.5 h-3.5" /> Disable</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Enable</>}
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--gf-text-primary)" }}><RotateCcw className="w-3.5 h-3.5" /> Rotate Secret</button>
                      <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                      <button onClick={() => handleDelete(wh.id)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border p-1.5 disabled:opacity-40" style={{ borderColor: "var(--gf-border)" }}><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors" style={page === i + 1 ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { color: "var(--gf-text-secondary)" }}>{i + 1}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border p-1.5 disabled:opacity-40" style={{ borderColor: "var(--gf-border)" }}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border shadow-xl p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Add Webhook</h2>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Slack Notifications" className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Endpoint URL</label>
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com/webhooks" className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Events ({newEvents.length} selected)</label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto rounded-lg border p-3" style={{ borderColor: "var(--gf-border)" }}>
                  {AVAILABLE_EVENTS.map(evt => (
                    <button key={evt} onClick={() => toggleEventSelection(evt)} className={`rounded-md px-2 py-1 text-xs transition-colors ${newEvents.includes(evt) ? "text-white" : ""}`} style={newEvents.includes(evt) ? { backgroundColor: "var(--gf-accent)" } : { backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-secondary)" }}>
                      {evt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Retry Policy</label>
                  <select value={newRetry} onChange={e => setNewRetry(e.target.value as typeof newRetry)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                    <option value="none">None</option>
                    <option value="linear">Linear</option>
                    <option value="exponential">Exponential</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--gf-text-muted)" }}>Timeout (seconds)</label>
                  <input type="number" value={newTimeout} onChange={e => setNewTimeout(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>Cancel</button>
              <button onClick={handleCreate} disabled={!newName || !newUrl || newEvents.length === 0} className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: "var(--gf-accent)" }}>Create Webhook</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
