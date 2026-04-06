"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Flag,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  ToggleLeft,
  ToggleRight,
  Users,
  Zap,
  Settings,
  Building2,
  Copy,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TenantOverride {
  tenantCode: string;
  tenantName: string;
  enabled: boolean;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: "Production" | "Staging" | "Development";
  category: "Feature" | "Experiment" | "Ops" | "Release";
  tenantOverrides: TenantOverride[];
  created: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENVIRONMENTS: FeatureFlag["environment"][] = ["Production", "Staging", "Development"];
const CATEGORIES: FeatureFlag["category"][] = ["Feature", "Experiment", "Ops", "Release"];

const SAMPLE_TENANTS = [
  { code: "TENT001", name: "Acme Corporation" },
  { code: "TENT002", name: "Globex Inc" },
  { code: "TENT003", name: "Initech Systems" },
  { code: "TENT004", name: "Wonka Ltd" },
  { code: "TENT005", name: "Umbrella Co" },
  { code: "TENT006", name: "Cyberdyne Inc" },
];

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: "ff1", key: "ai_copilot_v2", name: "AI Copilot V2", description: "Next-gen AI copilot with multi-modal support",
    enabled: true, rolloutPercentage: 75, environment: "Production", category: "Feature",
    tenantOverrides: [
      { tenantCode: "TENT001", tenantName: "Acme Corporation", enabled: true },
      { tenantCode: "TENT004", tenantName: "Wonka Ltd", enabled: false },
    ],
    created: "Feb 10, 2026", updatedAt: "Mar 28, 2026",
  },
  {
    id: "ff2", key: "new_billing_flow", name: "New Billing Flow", description: "Redesigned billing checkout with Stripe integration",
    enabled: true, rolloutPercentage: 100, environment: "Production", category: "Release",
    tenantOverrides: [],
    created: "Jan 15, 2026", updatedAt: "Mar 01, 2026",
  },
  {
    id: "ff3", key: "dark_mode_v3", name: "Dark Mode V3", description: "Updated dark theme with improved contrast ratios",
    enabled: true, rolloutPercentage: 50, environment: "Staging", category: "Experiment",
    tenantOverrides: [
      { tenantCode: "TENT002", tenantName: "Globex Inc", enabled: true },
    ],
    created: "Mar 05, 2026", updatedAt: "Mar 30, 2026",
  },
  {
    id: "ff4", key: "maintenance_banner", name: "Maintenance Banner", description: "Show scheduled maintenance notification to all users",
    enabled: false, rolloutPercentage: 0, environment: "Production", category: "Ops",
    tenantOverrides: [],
    created: "Mar 20, 2026", updatedAt: "Mar 20, 2026",
  },
  {
    id: "ff5", key: "workflow_automation", name: "Workflow Automation", description: "Automated workflow triggers based on events",
    enabled: true, rolloutPercentage: 30, environment: "Development", category: "Feature",
    tenantOverrides: [
      { tenantCode: "TENT003", tenantName: "Initech Systems", enabled: true },
      { tenantCode: "TENT006", tenantName: "Cyberdyne Inc", enabled: true },
    ],
    created: "Mar 12, 2026", updatedAt: "Apr 01, 2026",
  },
  {
    id: "ff6", key: "advanced_analytics", name: "Advanced Analytics", description: "Enhanced analytics dashboard with real-time metrics",
    enabled: false, rolloutPercentage: 0, environment: "Staging", category: "Feature",
    tenantOverrides: [],
    created: "Mar 25, 2026", updatedAt: "Mar 25, 2026",
  },
];

const CATEGORY_COLORS: Record<FeatureFlag["category"], { bg: string; color: string }> = {
  Feature: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  Experiment: { bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7" },
  Ops: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
  Release: { bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6" },
};

const ENV_COLORS: Record<FeatureFlag["environment"], string> = {
  Production: "#22c55e",
  Staging: "#f59e0b",
  Development: "#3b82f6",
};

const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Modal Overlay
// ---------------------------------------------------------------------------

function ModalOverlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200`} style={{ backgroundColor: "var(--gf-bg-surface)" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string | number; detail?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{icon}</div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
        {detail && <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{detail}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Modal
// ---------------------------------------------------------------------------

function DeleteFlagModal({ flag, onConfirm, onCancel }: { flag: FeatureFlag; onConfirm: () => void; onCancel: () => void }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Delete Feature Flag</h2>
        </div>
        <p className="text-sm mb-2" style={{ color: "var(--gf-text-secondary)" }}>
          Delete <strong style={{ color: "var(--gf-text-primary)" }}>{flag.name}</strong> (<code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-muted)" }}>{flag.key}</code>)?
        </p>
        {flag.enabled && (
          <p className="text-xs mb-4 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400">Warning: This flag is currently enabled and may affect live traffic.</p>
        )}
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 transition-colors hover:bg-red-700">Yes, Delete</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit Flag Modal
// ---------------------------------------------------------------------------

function FlagFormModal({
  flag,
  onSave,
  onCancel,
}: {
  flag?: FeatureFlag | null;
  onSave: (data: Omit<FeatureFlag, "id" | "created" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const isEdit = !!flag;
  const [key, setKey] = useState(flag?.key ?? "");
  const [name, setName] = useState(flag?.name ?? "");
  const [description, setDescription] = useState(flag?.description ?? "");
  const [enabled, setEnabled] = useState(flag?.enabled ?? false);
  const [rollout, setRollout] = useState(flag?.rolloutPercentage ?? 0);
  const [env, setEnv] = useState<FeatureFlag["environment"]>(flag?.environment ?? "Development");
  const [category, setCategory] = useState<FeatureFlag["category"]>(flag?.category ?? "Feature");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setKey(v.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!key.trim()) e.key = "Key is required";
    else if (!/^[a-z0-9_]+$/.test(key)) e.key = "Only lowercase, numbers, underscores";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({ key, name, description, enabled, rolloutPercentage: rollout, environment: env, category, tenantOverrides: flag?.tenantOverrides ?? [] });
  };

  return (
    <ModalOverlay onClose={onCancel} wide>
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
        <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit Feature Flag" : "Create Feature Flag"}</h2>
        <button onClick={onCancel} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Flag Name *</label>
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. AI Copilot V2" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ ...fieldStyle, ...(errors.name ? { borderColor: "#ef4444" } : {}) }} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Flag Key *</label>
            <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. ai_copilot_v2" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono text-xs" style={{ ...fieldStyle, ...(errors.key ? { borderColor: "#ef4444" } : {}) }} />
            {errors.key && <p className="text-xs text-red-500 mt-1">{errors.key}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this flag control?" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 resize-none" style={fieldStyle} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Environment</label>
            <select value={env} onChange={(e) => setEnv(e.target.value as FeatureFlag["environment"])} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
              {ENVIRONMENTS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as FeatureFlag["category"])} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Enabled</p>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Toggle this flag on/off globally</p>
          </div>
          <button type="button" onClick={() => setEnabled(!enabled)} style={{ color: enabled ? "var(--gf-accent)" : "var(--gf-text-muted)" }}>
            {enabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
          </button>
        </div>

        {/* Rollout slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>Rollout Percentage</label>
            <span className="text-xs font-bold" style={{ color: "var(--gf-accent)" }}>{rollout}%</span>
          </div>
          <input type="range" min={0} max={100} value={rollout} onChange={(e) => setRollout(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--gf-accent)]" style={{ backgroundColor: "var(--gf-bg-elevated)" }} />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--gf-text-muted)" }}>
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--gf-border)" }}>
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
            {isEdit ? "Save Changes" : "Create Flag"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Flag Detail Popup — Per-tenant overrides + rollout config
// ---------------------------------------------------------------------------

function FlagDetailPopup({
  flag,
  onClose,
  onSave,
}: {
  flag: FeatureFlag;
  onClose: () => void;
  onSave: (data: Partial<FeatureFlag>) => void;
}) {
  const [tab, setTab] = useState<"overview" | "overrides">("overview");
  const catColor = CATEGORY_COLORS[flag.category];
  const envColor = ENV_COLORS[flag.environment];

  // Rollout
  const [rollout, setRollout] = useState(flag.rolloutPercentage);
  const [enabled, setEnabled] = useState(flag.enabled);

  // Per-tenant overrides
  const [overrides, setOverrides] = useState<TenantOverride[]>(flag.tenantOverrides.map((o) => ({ ...o })));
  const [addTenant, setAddTenant] = useState("");

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  const availableTenants = SAMPLE_TENANTS.filter((t) => !overrides.some((o) => o.tenantCode === t.code));

  const handleAddOverride = () => {
    const tenant = SAMPLE_TENANTS.find((t) => t.code === addTenant);
    if (!tenant) return;
    setOverrides((prev) => [...prev, { tenantCode: tenant.code, tenantName: tenant.name, enabled: true }]);
    setAddTenant("");
  };

  const toggleOverride = (code: string) => {
    setOverrides((prev) => prev.map((o) => o.tenantCode === code ? { ...o, enabled: !o.enabled } : o));
  };

  const removeOverride = (code: string) => {
    setOverrides((prev) => prev.filter((o) => o.tenantCode !== code));
  };

  const handleSaveOverview = () => {
    onSave({ enabled, rolloutPercentage: rollout });
    toast.success("Flag updated ✓");
  };

  const handleSaveOverrides = () => {
    onSave({ tenantOverrides: overrides });
    toast.success("Tenant overrides saved ✓");
  };

  const copyKey = () => {
    navigator.clipboard.writeText(flag.key);
    toast.success("Key copied to clipboard");
  };

  const TABS = [
    { key: "overview" as const, label: "Overview", icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "overrides" as const, label: "Tenant Overrides", icon: <Building2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <ModalOverlay onClose={onClose} wide>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: catColor.bg, color: catColor.color }}>
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{flag.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <button onClick={copyKey} className="flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded hover:opacity-70 transition-opacity" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-muted)" }}>
                  {flag.key}<Copy className="h-2.5 w-2.5" />
                </button>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: catColor.bg, color: catColor.color }}>{flag.category}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${envColor}20`, color: envColor }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: envColor }} />{flag.environment}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: tab === t.key ? "var(--gf-accent)" : "transparent", color: tab === t.key ? "#fff" : "var(--gf-text-secondary)" }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {/* ── Overview ────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-5">
            {flag.description && (
              <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{flag.description}</p>
            )}

            {/* Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Global Toggle</p>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{enabled ? "Flag is ON for eligible users" : "Flag is OFF for all users"}</p>
              </div>
              <button type="button" onClick={() => setEnabled(!enabled)} style={{ color: enabled ? "#22c55e" : "var(--gf-text-muted)" }}>
                {enabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            {/* Rollout slider */}
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Rollout Percentage</p>
                <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{rollout}%</span>
              </div>
              <input type="range" min={0} max={100} value={rollout} onChange={(e) => setRollout(Number(e.target.value))} className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-[var(--gf-accent)]" style={{ backgroundColor: "var(--gf-bg-elevated)" }} />
              <div className="flex justify-between text-[10px] mt-1.5" style={{ color: "var(--gf-text-muted)" }}>
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
              {/* Visual bar */}
              <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${rollout}%`, backgroundColor: rollout >= 75 ? "#22c55e" : rollout >= 25 ? "#f59e0b" : "#ef4444" }} />
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--gf-text-muted)" }}>Overrides</p>
                <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{flag.tenantOverrides.length}</p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--gf-text-muted)" }}>Created</p>
                <p className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>{flag.created}</p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--gf-text-muted)" }}>Last Updated</p>
                <p className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>{flag.updatedAt}</p>
              </div>
            </div>

            <button type="button" onClick={handleSaveOverview} className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
              Save Changes
            </button>
          </div>
        )}

        {/* ── Per-Tenant Overrides ────────────────────────── */}
        {tab === "overrides" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
              Override the global flag state for specific tenants. Overrides take priority over the rollout percentage.
            </p>

            {/* Add override */}
            <div className="flex gap-2">
              <select value={addTenant} onChange={(e) => setAddTenant(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                <option value="">Select tenant to add...</option>
                {availableTenants.map((t) => <option key={t.code} value={t.code}>{t.code} — {t.name}</option>)}
              </select>
              <button type="button" onClick={handleAddOverride} disabled={!addTenant} className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ backgroundColor: "var(--gf-accent)" }}>
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Overrides list */}
            {overrides.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>No tenant overrides configured</p>
                <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>All tenants follow the global rollout setting</p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
                <table className="w-full">
                  <thead>
                    <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                      <th className="px-4 py-2.5 text-left font-medium">Tenant</th>
                      <th className="px-4 py-2.5 text-center font-medium w-24">State</th>
                      <th className="px-4 py-2.5 text-center font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {overrides.map((o) => (
                      <tr key={o.tenantCode} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{o.tenantName}</span>
                          <span className="text-[10px] font-mono ml-2" style={{ color: "var(--gf-text-muted)" }}>{o.tenantCode}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button type="button" onClick={() => toggleOverride(o.tenantCode)} style={{ color: o.enabled ? "#22c55e" : "#ef4444" }}>
                            {o.enabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button type="button" onClick={() => removeOverride(o.tenantCode)} className="rounded p-1 hover:bg-red-500/10 transition-colors" style={{ color: "#ef4444" }}>
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button type="button" onClick={handleSaveOverrides} className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
              Save Overrides
            </button>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

type SortKey = "name" | "key" | "environment" | "category" | "rolloutPercentage" | "created";
type SortDir = "asc" | "desc";

function sortFlags(list: FeatureFlag[], key: SortKey, dir: SortDir): FeatureFlag[] {
  return [...list].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === "number" && typeof vb === "number") return dir === "asc" ? va - vb : vb - va;
    return dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function FeatureFlagsContent() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);

  const [search, setSearch] = useState("");
  const [filterEnv, setFilterEnv] = useState<FeatureFlag["environment"] | "All">("All");
  const [filterCategory, setFilterCategory] = useState<FeatureFlag["category"] | "All">("All");
  const [showFilters, setShowFilters] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editModal, setEditModal] = useState<FeatureFlag | null>(null);
  const [deleteModal, setDeleteModal] = useState<FeatureFlag | null>(null);
  const [viewFlag, setViewFlag] = useState<FeatureFlag | null>(null);

  // Derived
  const filtered = useMemo(() => {
    let list = flags;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q));
    }
    if (filterEnv !== "All") list = list.filter((f) => f.environment === filterEnv);
    if (filterCategory !== "All") list = list.filter((f) => f.category === filterCategory);
    return sortFlags(list, sortKey, sortDir);
  }, [flags, search, filterEnv, filterCategory, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const enabledCount = flags.filter((f) => f.enabled).length;
  const prodCount = flags.filter((f) => f.environment === "Production").length;

  // Handlers
  const handleCreate = (data: Omit<FeatureFlag, "id" | "created" | "updatedAt">) => {
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    setFlags((prev) => [{ ...data, id: `ff${Date.now()}`, created: now, updatedAt: now }, ...prev]);
    setShowCreate(false);
    toast.success(`Flag "${data.name}" created ✓`);
  };

  const handleEdit = (data: Omit<FeatureFlag, "id" | "created" | "updatedAt">) => {
    if (!editModal) return;
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    setFlags((prev) => prev.map((f) => f.id === editModal.id ? { ...f, ...data, updatedAt: now } : f));
    setEditModal(null);
    toast.success("Flag updated ✓");
  };

  const handleToggle = (id: string) => {
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled, updatedAt: now } : f));
    const flag = flags.find((f) => f.id === id);
    if (flag) toast.success(flag.enabled ? `"${flag.name}" disabled` : `"${flag.name}" enabled`);
  };

  const handleDetailSave = (data: Partial<FeatureFlag>) => {
    if (!viewFlag) return;
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    setFlags((prev) => prev.map((f) => f.id === viewFlag.id ? { ...f, ...data, updatedAt: now } : f));
    setViewFlag((prev) => prev ? { ...prev, ...data, updatedAt: now } : null);
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setFlags((prev) => prev.filter((f) => f.id !== deleteModal.id));
    setDeleteModal(null);
    toast.error("Flag deleted ✓", { description: deleteModal.name });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const clearFilters = () => { setSearch(""); setFilterEnv("All"); setFilterCategory("All"); setPage(1); };
  const hasActiveFilters = search || filterEnv !== "All" || filterCategory !== "All";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Feature Flags</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage feature flags, rollout percentages, and per-tenant overrides</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-4 w-4" />Create Flag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Flag className="h-5 w-5" />} label="Total Flags" value={flags.length} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Enabled" value={enabledCount} />
        <StatCard icon={<Settings className="h-5 w-5" />} label="In Production" value={prodCount} />
        <StatCard icon={<Users className="h-5 w-5" />} label="With Overrides" value={flags.filter((f) => f.tenantOverrides.length > 0).length} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or key..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`} style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}>
          <Filter className="h-4 w-4" />Filters
          {hasActiveFilters && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>{[filterEnv !== "All", filterCategory !== "All"].filter(Boolean).length}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Environment</label>
            <select value={filterEnv} onChange={(e) => { setFilterEnv(e.target.value as FeatureFlag["environment"] | "All"); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="All">All</option>
              {ENVIRONMENTS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Category</label>
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value as FeatureFlag["category"] | "All"); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="All">All</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {hasActiveFilters && <button onClick={clearFilters} className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-400"><X className="h-3 w-3" />Clear All</button>}
        </div>
      )}

      {hasActiveFilters && <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filtered.length} of {flags.length} flags</p>}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                {([
                  { key: "name" as SortKey, label: "Flag" },
                  { key: "environment" as SortKey, label: "Env" },
                  { key: "category" as SortKey, label: "Category" },
                  { key: null, label: "Status" },
                  { key: "rolloutPercentage" as SortKey, label: "Rollout" },
                  { key: "created" as SortKey, label: "Created" },
                  { key: null, label: "Actions" },
                ] as const).map((col, i) => (
                  <th key={i} className={`px-4 py-3 text-left font-medium whitespace-nowrap ${col.key ? "cursor-pointer select-none hover:opacity-80" : ""}`} onClick={col.key ? () => handleSort(col.key!) : undefined}>
                    <span className="inline-flex items-center gap-1">{col.label}{col.key && <SortIcon col={col.key} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Flag className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No flags found</p>
                  </td>
                </tr>
              ) : (
                paged.map((flag) => {
                  const catCol = CATEGORY_COLORS[flag.category];
                  const envCol = ENV_COLORS[flag.environment];
                  return (
                    <tr key={flag.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      {/* Flag */}
                      <td className="px-4 py-3">
                        <button onClick={() => setViewFlag(flag)} className="text-left hover:opacity-80 transition-opacity">
                          <span className="text-sm font-medium block underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>{flag.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: "var(--gf-text-muted)" }}>{flag.key}</span>
                        </button>
                      </td>
                      {/* Env */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: envCol }} />
                          <span style={{ color: envCol }}>{flag.environment}</span>
                        </span>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: catCol.bg, color: catCol.color }}>{flag.category}</span>
                      </td>
                      {/* Toggle */}
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(flag.id)} style={{ color: flag.enabled ? "#22c55e" : "var(--gf-text-muted)" }}>
                          {flag.enabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                        </button>
                      </td>
                      {/* Rollout */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                            <div className="h-full rounded-full" style={{ width: `${flag.rolloutPercentage}%`, backgroundColor: flag.rolloutPercentage >= 75 ? "#22c55e" : flag.rolloutPercentage >= 25 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: "var(--gf-text-primary)" }}>{flag.rolloutPercentage}%</span>
                        </div>
                      </td>
                      {/* Created */}
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--gf-text-secondary)" }}>{flag.created}</td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewFlag(flag)} className="rounded-lg p-1.5 transition-colors hover:bg-blue-500/10" style={{ color: "#3b82f6" }} title="View"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => setEditModal(flag)} className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--gf-text-secondary)" }} title="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteModal(flag)} className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safePage} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${n === safePage ? "text-white" : "hover:opacity-70"}`} style={n === safePage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <FlagFormModal onSave={handleCreate} onCancel={() => setShowCreate(false)} />}
      {editModal && <FlagFormModal flag={editModal} onSave={handleEdit} onCancel={() => setEditModal(null)} />}
      {deleteModal && <DeleteFlagModal flag={deleteModal} onConfirm={handleDelete} onCancel={() => setDeleteModal(null)} />}
      {viewFlag && <FlagDetailPopup flag={viewFlag} onClose={() => setViewFlag(null)} onSave={handleDetailSave} />}
    </div>
  );
}
