"use client";

import { useState, useMemo } from "react";
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Globe,
  Database,
  Cloud,
  Download,
  Plus,
  Search,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  Zap,
  MapPin,
  Key,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FeatureFlag {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  scope: "Global" | "Per-Tenant";
  lastModified: string;
}

interface Integration {
  id: number;
  name: string;
  category: string;
  status: "Connected" | "Not Connected";
  version: string;
  environment: string;
  webhookUrl: string;
}

interface ConfigItem {
  id: number;
  key: string;
  value: string;
  category: string;
}

interface Region {
  id: number;
  name: string;
  status: "Active" | "Inactive";
  tenants: number;
  provider: string;
  dataResidency: string;
}

interface Provider {
  id: number;
  channel: string;
  primary: string;
  fallback: string;
  status: string;
  region: string;
}

/* ------------------------------------------------------------------ */
/*  Initial Data                                                       */
/* ------------------------------------------------------------------ */

const initFlags: FeatureFlag[] = [
  { id: 1, name: "ai_agent_orchestration", description: "Enable multi-step AI agent workflows", enabled: true, scope: "Global", lastModified: "2 days ago" },
  { id: 2, name: "payment_auto_retry", description: "Auto-retry failed payments with fallback gateway", enabled: true, scope: "Global", lastModified: "5 days ago" },
  { id: 3, name: "e_signature_v2", description: "New e-signature flow with DocuSign integration", enabled: false, scope: "Global", lastModified: "1 week ago" },
  { id: 4, name: "workflow_visual_builder", description: "Drag-and-drop workflow builder UI", enabled: true, scope: "Global", lastModified: "3 days ago" },
  { id: 5, name: "tenant_custom_domain", description: "Allow tenants to configure custom domains", enabled: false, scope: "Per-Tenant", lastModified: "2 weeks ago" },
  { id: 6, name: "realtime_notifications", description: "WebSocket-based real-time notification delivery", enabled: true, scope: "Global", lastModified: "1 day ago" },
  { id: 7, name: "audit_log_export_csv", description: "Export audit logs as CSV files", enabled: true, scope: "Global", lastModified: "4 days ago" },
  { id: 8, name: "dark_mode_tenant_portal", description: "Dark mode support for tenant-facing portal", enabled: false, scope: "Per-Tenant", lastModified: "1 week ago" },
];

const initIntegrations: Integration[] = [
  { id: 1, name: "Stripe", category: "Payment", status: "Connected", version: "v2024-03", environment: "Production", webhookUrl: "https://api.glimmora.io/hooks/stripe" },
  { id: 2, name: "Razorpay", category: "Payment", status: "Connected", version: "v2", environment: "Production", webhookUrl: "https://api.glimmora.io/hooks/razorpay" },
  { id: 3, name: "SendGrid", category: "Email", status: "Connected", version: "v3", environment: "Production", webhookUrl: "https://api.glimmora.io/hooks/sendgrid" },
  { id: 4, name: "Twilio", category: "SMS", status: "Connected", version: "2010-04-01", environment: "Production", webhookUrl: "https://api.glimmora.io/hooks/twilio" },
  { id: 5, name: "Firebase FCM", category: "Push", status: "Connected", version: "v1", environment: "Production", webhookUrl: "https://api.glimmora.io/hooks/fcm" },
  { id: 6, name: "DocuSign", category: "E-Sign", status: "Not Connected", version: "-", environment: "-", webhookUrl: "" },
  { id: 7, name: "Keycloak", category: "SSO/IdP", status: "Connected", version: "v22", environment: "Production", webhookUrl: "https://api.glimmora.io/hooks/keycloak" },
  { id: 8, name: "AWS S3", category: "Storage", status: "Connected", version: "2006-03-01", environment: "Production", webhookUrl: "https://api.glimmora.io/hooks/s3" },
];

const initConfigs: ConfigItem[] = [
  { id: 1, key: "MAX_TENANTS", value: "500", category: "Limits" },
  { id: 2, key: "SESSION_TTL_SECONDS", value: "3600", category: "Auth" },
  { id: 3, key: "MFA_ENFORCEMENT", value: "optional", category: "Auth" },
  { id: 4, key: "RATE_LIMIT_DEFAULT", value: "1000/min", category: "Gateway" },
  { id: 5, key: "AUDIT_RETENTION_DAYS", value: "365", category: "Compliance" },
  { id: 6, key: "AI_MAX_TOKENS_PER_REQUEST", value: "4096", category: "AI" },
  { id: 7, key: "WEBHOOK_TIMEOUT_MS", value: "5000", category: "Gateway" },
  { id: 8, key: "FILE_UPLOAD_MAX_MB", value: "50", category: "Storage" },
];

const initRegions: Region[] = [
  { id: 1, name: "US-East", status: "Active", tenants: 142, provider: "AWS", dataResidency: "Compliant" },
  { id: 2, name: "US-West", status: "Active", tenants: 98, provider: "AWS", dataResidency: "Compliant" },
  { id: 3, name: "EU-West", status: "Active", tenants: 76, provider: "AWS", dataResidency: "GDPR Compliant" },
  { id: 4, name: "AP-South", status: "Inactive", tenants: 31, provider: "Azure", dataResidency: "Pending Review" },
  { id: 5, name: "EU-Central", status: "Active", tenants: 53, provider: "Azure", dataResidency: "GDPR Compliant" },
];

const initProviders: Provider[] = [
  { id: 1, channel: "SMS", primary: "Twilio", fallback: "Vonage", status: "Active", region: "US-East" },
  { id: 2, channel: "Email", primary: "SendGrid", fallback: "AWS SES", status: "Active", region: "US-East" },
  { id: 3, channel: "Payment", primary: "Stripe", fallback: "Razorpay", status: "Active", region: "US-West" },
  { id: 4, channel: "Push", primary: "Firebase FCM", fallback: "OneSignal", status: "Active", region: "EU-West" },
  { id: 5, channel: "Storage", primary: "AWS S3", fallback: "Azure Blob", status: "Active", region: "EU-Central" },
];

const TABS = ["Feature Flags", "Integrations", "Platform Config", "Regions & Providers"] as const;
type Tab = (typeof TABS)[number];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: "var(--gf-text-primary)" }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:opacity-70"><X className="h-4 w-4" style={{ color: "var(--gf-text-muted)" }} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>{label}</label>
      <input
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>{label}</label>
      <select
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small, className = "" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger"; small?: boolean; className?: string }) {
  const base = small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const styles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: "var(--gf-accent)", color: "#fff" },
    secondary: { backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" },
    danger: { backgroundColor: "#ef4444", color: "#fff" },
  };
  return (
    <button onClick={onClick} className={`rounded-lg font-medium ${base} ${className}`} style={styles[variant]}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ConfigurationContent() {
  const [activeTab, setActiveTab] = useState<Tab>("Feature Flags");

  /* ---------- Feature Flags state ---------- */
  const [flags, setFlags] = useState<FeatureFlag[]>(initFlags);
  const [flagSearch, setFlagSearch] = useState("");
  const [flagScopeFilter, setFlagScopeFilter] = useState<"All" | "Global" | "Per-Tenant">("All");
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [deletingFlag, setDeletingFlag] = useState<FeatureFlag | null>(null);
  const [flagForm, setFlagForm] = useState({ name: "", description: "", scope: "Global" as "Global" | "Per-Tenant" });
  const [flagMenuOpen, setFlagMenuOpen] = useState<number | null>(null);

  const filteredFlags = useMemo(() => {
    let f = flags;
    if (flagScopeFilter !== "All") f = f.filter((x) => x.scope === flagScopeFilter);
    if (flagSearch) {
      const q = flagSearch.toLowerCase();
      f = f.filter((x) => x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q));
    }
    return f;
  }, [flags, flagSearch, flagScopeFilter]);

  /* ---------- Integrations state ---------- */
  const [integrations, setIntegrations] = useState<Integration[]>(initIntegrations);
  const [intStatusFilter, setIntStatusFilter] = useState<"All" | "Connected" | "Not Connected">("All");
  const [intModalOpen, setIntModalOpen] = useState(false);
  const [editingInt, setEditingInt] = useState<Integration | null>(null);
  const [intForm, setIntForm] = useState({ name: "", category: "", webhookUrl: "", environment: "Production" });
  const [testingInt, setTestingInt] = useState<number | null>(null);
  const [testSuccess, setTestSuccess] = useState<number | null>(null);

  const filteredInts = useMemo(() => {
    if (intStatusFilter === "All") return integrations;
    return integrations.filter((x) => x.status === intStatusFilter);
  }, [integrations, intStatusFilter]);

  /* ---------- Platform Config state ---------- */
  const [configs, setConfigs] = useState<ConfigItem[]>(initConfigs);
  const [cfgCategoryFilter, setCfgCategoryFilter] = useState("All");
  const [cfgModalOpen, setCfgModalOpen] = useState(false);
  const [cfgForm, setCfgForm] = useState({ key: "", value: "", category: "" });
  const [editingCfgId, setEditingCfgId] = useState<number | null>(null);
  const [editingCfgValue, setEditingCfgValue] = useState("");

  const cfgCategories = useMemo(() => ["All", ...Array.from(new Set(configs.map((c) => c.category)))], [configs]);
  const filteredConfigs = useMemo(() => {
    if (cfgCategoryFilter === "All") return configs;
    return configs.filter((c) => c.category === cfgCategoryFilter);
  }, [configs, cfgCategoryFilter]);

  /* ---------- Regions & Providers state ---------- */
  const [regions, setRegions] = useState<Region[]>(initRegions);
  const [providers, setProviders] = useState<Provider[]>(initProviders);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [provForm, setProvForm] = useState({ primary: "", fallback: "" });

  /* ---------- Dynamic stats ---------- */
  const stats = [
    { label: "Feature Flags", value: flags.length, icon: ToggleRight },
    { label: "Integrations", value: integrations.length, icon: Cloud },
    { label: "Config Keys", value: configs.length, icon: Key },
    { label: "Active Regions", value: regions.filter((r) => r.status === "Active").length, icon: MapPin },
  ];

  /* ---------- Handlers ---------- */

  const openCreateFlag = () => { setEditingFlag(null); setFlagForm({ name: "", description: "", scope: "Global" }); setFlagModalOpen(true); };
  const openEditFlag = (f: FeatureFlag) => { setEditingFlag(f); setFlagForm({ name: f.name, description: f.description, scope: f.scope }); setFlagModalOpen(true); setFlagMenuOpen(null); };
  const saveFlag = () => {
    if (!flagForm.name.trim()) return;
    if (editingFlag) {
      setFlags((prev) => prev.map((f) => f.id === editingFlag.id ? { ...f, name: flagForm.name, description: flagForm.description, scope: flagForm.scope, lastModified: "Just now" } : f));
    } else {
      setFlags((prev) => [...prev, { id: Date.now(), name: flagForm.name, description: flagForm.description, enabled: false, scope: flagForm.scope, lastModified: "Just now" }]);
    }
    setFlagModalOpen(false);
  };
  const deleteFlag = () => { if (deletingFlag) setFlags((prev) => prev.filter((f) => f.id !== deletingFlag.id)); setDeletingFlag(null); };
  const toggleFlag = (id: number) => setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled, lastModified: "Just now" } : f));

  const openCreateInt = () => { setEditingInt(null); setIntForm({ name: "", category: "", webhookUrl: "", environment: "Production" }); setIntModalOpen(true); };
  const openEditInt = (i: Integration) => { setEditingInt(i); setIntForm({ name: i.name, category: i.category, webhookUrl: i.webhookUrl, environment: i.environment }); setIntModalOpen(true); };
  const saveInt = () => {
    if (!intForm.name.trim()) return;
    if (editingInt) {
      setIntegrations((prev) => prev.map((i) => i.id === editingInt.id ? { ...i, name: intForm.name, category: intForm.category, webhookUrl: intForm.webhookUrl, environment: intForm.environment } : i));
    } else {
      setIntegrations((prev) => [...prev, { id: Date.now(), name: intForm.name, category: intForm.category, status: "Not Connected", version: "-", environment: intForm.environment, webhookUrl: intForm.webhookUrl }]);
    }
    setIntModalOpen(false);
  };
  const toggleIntStatus = (id: number) => setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: i.status === "Connected" ? "Not Connected" : "Connected" } : i));
  const testConnection = (id: number) => {
    setTestingInt(id);
    setTestSuccess(null);
    setTimeout(() => { setTestingInt(null); setTestSuccess(id); setTimeout(() => setTestSuccess(null), 2000); }, 1500);
  };

  const openCreateCfg = () => { setCfgForm({ key: "", value: "", category: "" }); setCfgModalOpen(true); };
  const saveCfg = () => {
    if (!cfgForm.key.trim()) return;
    setConfigs((prev) => [...prev, { id: Date.now(), key: cfgForm.key, value: cfgForm.value, category: cfgForm.category }]);
    setCfgModalOpen(false);
  };
  const saveInlineEdit = (id: number) => {
    setConfigs((prev) => prev.map((c) => c.id === id ? { ...c, value: editingCfgValue } : c));
    setEditingCfgId(null);
  };
  const deleteCfg = (id: number) => setConfigs((prev) => prev.filter((c) => c.id !== id));

  const toggleRegion = (id: number) => setRegions((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r));

  const openEditProvider = (p: Provider) => { setEditingProvider(p); setProvForm({ primary: p.primary, fallback: p.fallback }); setProviderModalOpen(true); };
  const saveProvider = () => {
    if (editingProvider) {
      setProviders((prev) => prev.map((p) => p.id === editingProvider.id ? { ...p, primary: provForm.primary, fallback: provForm.fallback } : p));
    }
    setProviderModalOpen(false);
  };

  const createBtnLabel: Record<Tab, string> = { "Feature Flags": "Create Flag", "Integrations": "Add Integration", "Platform Config": "Add Config", "Regions & Providers": "Add Region" };

  const handleCreate = () => {
    if (activeTab === "Feature Flags") openCreateFlag();
    else if (activeTab === "Integrations") openCreateInt();
    else if (activeTab === "Platform Config") openCreateCfg();
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Configuration</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>Platform settings, feature flags, integrations, and environment configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" small onClick={() => {}}>
            <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Export</span>
          </Btn>
          <Btn small onClick={handleCreate}>
            <span className="flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> {createBtnLabel[activeTab]}</span>
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</span>
              <s.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            style={activeTab === tab ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { color: "var(--gf-text-secondary)" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  TAB 1: Feature Flags                                        */}
      {/* ============================================================ */}
      {activeTab === "Feature Flags" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input
                className="w-full rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
                placeholder="Search flags..."
                value={flagSearch}
                onChange={(e) => setFlagSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 rounded-lg p-0.5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
              {(["All", "Global", "Per-Tenant"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFlagScopeFilter(s)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={flagScopeFilter === s ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { color: "var(--gf-text-secondary)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filteredFlags.length} of {flags.length} flags</p>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  {["Flag", "Description", "Scope", "Status", "Modified", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFlags.map((ff) => (
                  <tr key={ff.id} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>{ff.name}</td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: "var(--gf-text-secondary)" }}>{ff.description}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{ff.scope}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFlag(ff.id)} className="flex items-center gap-1.5 text-xs font-medium">
                        {ff.enabled ? (
                          <span className="inline-flex items-center gap-1 text-green-500"><ToggleRight className="h-5 w-5" /> Enabled</span>
                        ) : (
                          <span className="inline-flex items-center gap-1" style={{ color: "var(--gf-text-muted)" }}><ToggleLeft className="h-5 w-5" /> Disabled</span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>{ff.lastModified}</td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setFlagMenuOpen(flagMenuOpen === ff.id ? null : ff.id)} className="p-1 rounded hover:opacity-70">
                        <MoreHorizontal className="h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
                      </button>
                      {flagMenuOpen === ff.id && (
                        <div className="absolute right-4 top-10 z-30 rounded-lg py-1 shadow-lg min-w-[120px]" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)" }}>
                          <button onClick={() => openEditFlag(ff)} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:opacity-70" style={{ color: "var(--gf-text-primary)" }}>
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button onClick={() => { setDeletingFlag(ff); setFlagMenuOpen(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:opacity-70">
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB 2: Integrations                                         */}
      {/* ============================================================ */}
      {activeTab === "Integrations" && (
        <div className="space-y-4">
          <div className="flex gap-1 rounded-lg p-0.5 w-fit" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            {(["All", "Connected", "Not Connected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setIntStatusFilter(s)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={intStatusFilter === s ? { backgroundColor: "var(--gf-accent)", color: "#fff" } : { color: "var(--gf-text-secondary)" }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredInts.map((intg) => (
              <div key={intg.id} className="rounded-xl p-5 flex flex-col gap-3" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{intg.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${intg.status === "Connected" ? "bg-green-500/15 text-green-500" : "bg-gray-500/15 text-gray-400"}`}>
                    {intg.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                  <div className="flex justify-between"><span>Category</span><span style={{ color: "var(--gf-text-primary)" }}>{intg.category}</span></div>
                  <div className="flex justify-between"><span>Version</span><span className="font-mono" style={{ color: "var(--gf-text-muted)" }}>{intg.version}</span></div>
                  <div className="flex justify-between"><span>Environment</span><span style={{ color: "var(--gf-text-primary)" }}>{intg.environment}</span></div>
                </div>
                <div className="flex gap-2 mt-auto pt-2" style={{ borderTop: "1px solid var(--gf-border)" }}>
                  <button
                    onClick={() => toggleIntStatus(intg.id)}
                    className="flex-1 rounded-lg py-1.5 text-xs font-medium"
                    style={intg.status === "Connected" ? { backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" } : { backgroundColor: "var(--gf-accent)", color: "#fff" }}
                  >
                    {intg.status === "Connected" ? "Disconnect" : "Connect"}
                  </button>
                  <button onClick={() => openEditInt(intg)} className="rounded-lg px-2 py-1.5" style={{ backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)" }}>
                    <Pencil className="h-3 w-3" style={{ color: "var(--gf-text-muted)" }} />
                  </button>
                  <button
                    onClick={() => testConnection(intg.id)}
                    className="rounded-lg px-2 py-1.5"
                    style={{ backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)" }}
                    disabled={testingInt === intg.id}
                  >
                    {testingInt === intg.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" style={{ color: "var(--gf-accent)" }} />
                    ) : testSuccess === intg.id ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Zap className="h-3 w-3" style={{ color: "var(--gf-text-muted)" }} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB 3: Platform Config                                      */}
      {/* ============================================================ */}
      {activeTab === "Platform Config" && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <select
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
              value={cfgCategoryFilter}
              onChange={(e) => setCfgCategoryFilter(e.target.value)}
            >
              {cfgCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  {["Key", "Value", "Category", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredConfigs.map((cfg) => (
                  <tr key={cfg.id} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>{cfg.key}</td>
                    <td className="px-4 py-3">
                      {editingCfgId === cfg.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            className="rounded px-2 py-1 text-xs font-mono outline-none w-32"
                            style={{ backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-accent)", color: "var(--gf-text-primary)" }}
                            value={editingCfgValue}
                            onChange={(e) => setEditingCfgValue(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => saveInlineEdit(cfg.id)} className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: "var(--gf-accent)", color: "#fff" }}>Save</button>
                          <button onClick={() => setEditingCfgId(null)} className="text-xs px-2 py-1 rounded" style={{ color: "var(--gf-text-muted)" }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingCfgId(cfg.id); setEditingCfgValue(cfg.value); }} className="font-mono text-xs cursor-pointer hover:underline" style={{ color: "var(--gf-accent)" }}>
                          {cfg.value}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{cfg.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteCfg(cfg.id)} className="p-1 rounded hover:opacity-70">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB 4: Regions & Providers                                  */}
      {/* ============================================================ */}
      {activeTab === "Regions & Providers" && (
        <div className="space-y-6">
          {/* Regions */}
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Regions</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {regions.map((r) => (
                <div key={r.id} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{r.name}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === "Active" ? "bg-green-500/15 text-green-500" : "bg-gray-500/15 text-gray-400"}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span style={{ color: "var(--gf-text-secondary)" }}>Tenants</span><span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{r.tenants}</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--gf-text-secondary)" }}>Provider</span><span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{r.provider}</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--gf-text-secondary)" }}>Data Residency</span><span className="font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{r.dataResidency}</span></div>
                  </div>
                  <button
                    onClick={() => toggleRegion(r.id)}
                    className="w-full mt-3 rounded-lg py-1.5 text-xs font-medium"
                    style={r.status === "Active" ? { backgroundColor: "var(--gf-bg-base)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" } : { backgroundColor: "var(--gf-accent)", color: "#fff" }}
                  >
                    {r.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Config */}
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Provider Configuration</h2>
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                    {["Channel", "Primary Provider", "Fallback Provider", "Status", "Region", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers.map((pc) => (
                    <tr key={pc.id} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{pc.channel}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-primary)" }}>{pc.primary}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{pc.fallback}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pc.status === "Active" ? "bg-green-500/15 text-green-500" : "bg-gray-500/15 text-gray-400"}`}>
                          {pc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{pc.region}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEditProvider(pc)} className="p-1 rounded hover:opacity-70">
                          <Pencil className="h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Modals                                                      */}
      {/* ============================================================ */}

      {/* Create/Edit Flag Modal */}
      <Modal open={flagModalOpen} onClose={() => setFlagModalOpen(false)} title={editingFlag ? "Edit Flag" : "Create Flag"}>
        <InputField label="Name" value={flagForm.name} onChange={(v) => setFlagForm((p) => ({ ...p, name: v }))} placeholder="feature_name" />
        <InputField label="Description" value={flagForm.description} onChange={(v) => setFlagForm((p) => ({ ...p, description: v }))} placeholder="What this flag controls" />
        <SelectField label="Scope" value={flagForm.scope} onChange={(v) => setFlagForm((p) => ({ ...p, scope: v as "Global" | "Per-Tenant" }))} options={["Global", "Per-Tenant"]} />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" small onClick={() => setFlagModalOpen(false)}>Cancel</Btn>
          <Btn small onClick={saveFlag}>{editingFlag ? "Save Changes" : "Create"}</Btn>
        </div>
      </Modal>

      {/* Delete Flag Confirmation */}
      <Modal open={!!deletingFlag} onClose={() => setDeletingFlag(null)} title="Delete Flag">
        <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>
          Are you sure you want to delete <span className="font-mono font-medium" style={{ color: "var(--gf-text-primary)" }}>{deletingFlag?.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" small onClick={() => setDeletingFlag(null)}>Cancel</Btn>
          <Btn variant="danger" small onClick={deleteFlag}>Delete</Btn>
        </div>
      </Modal>

      {/* Create/Edit Integration Modal */}
      <Modal open={intModalOpen} onClose={() => setIntModalOpen(false)} title={editingInt ? "Edit Integration" : "Add Integration"}>
        <InputField label="Name" value={intForm.name} onChange={(v) => setIntForm((p) => ({ ...p, name: v }))} placeholder="Service name" />
        <InputField label="Category" value={intForm.category} onChange={(v) => setIntForm((p) => ({ ...p, category: v }))} placeholder="Payment, Email, SMS..." />
        <InputField label="Webhook URL" value={intForm.webhookUrl} onChange={(v) => setIntForm((p) => ({ ...p, webhookUrl: v }))} placeholder="https://..." />
        <SelectField label="Environment" value={intForm.environment} onChange={(v) => setIntForm((p) => ({ ...p, environment: v }))} options={["Production", "Staging", "Development"]} />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" small onClick={() => setIntModalOpen(false)}>Cancel</Btn>
          <Btn small onClick={saveInt}>{editingInt ? "Save Changes" : "Add"}</Btn>
        </div>
      </Modal>

      {/* Add Config Modal */}
      <Modal open={cfgModalOpen} onClose={() => setCfgModalOpen(false)} title="Add Config">
        <InputField label="Key" value={cfgForm.key} onChange={(v) => setCfgForm((p) => ({ ...p, key: v }))} placeholder="CONFIG_KEY" />
        <InputField label="Value" value={cfgForm.value} onChange={(v) => setCfgForm((p) => ({ ...p, value: v }))} placeholder="value" />
        <InputField label="Category" value={cfgForm.category} onChange={(v) => setCfgForm((p) => ({ ...p, category: v }))} placeholder="Auth, Gateway, Limits..." />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" small onClick={() => setCfgModalOpen(false)}>Cancel</Btn>
          <Btn small onClick={saveCfg}>Add</Btn>
        </div>
      </Modal>

      {/* Edit Provider Modal */}
      <Modal open={providerModalOpen} onClose={() => setProviderModalOpen(false)} title={`Edit ${editingProvider?.channel ?? ""} Provider`}>
        <InputField label="Primary Provider" value={provForm.primary} onChange={(v) => setProvForm((p) => ({ ...p, primary: v }))} />
        <InputField label="Fallback Provider" value={provForm.fallback} onChange={(v) => setProvForm((p) => ({ ...p, fallback: v }))} />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" small onClick={() => setProviderModalOpen(false)}>Cancel</Btn>
          <Btn small onClick={saveProvider}>Save Changes</Btn>
        </div>
      </Modal>
    </div>
  );
}
