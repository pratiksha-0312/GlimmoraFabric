"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  DollarSign,
  Zap,
  ToggleLeft,
  ToggleRight,
  Grid3x3,
  Settings,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanFeature {
  name: string;
  enabled: boolean;
  limit?: string;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: "Monthly" | "Annual";
  maxUsers: number;
  maxStorage: string;
  maxApiCalls: string;
  status: "Active" | "Draft" | "Archived";
  features: PlanFeature[];
  tenantsCount: number;
  description: string;
  created: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_FEATURES: PlanFeature[] = [
  { name: "AI Platform", enabled: false, limit: "" },
  { name: "Workflows", enabled: false, limit: "" },
  { name: "Documents", enabled: false, limit: "" },
  { name: "Payments", enabled: false, limit: "" },
  { name: "API Access", enabled: false, limit: "" },
  { name: "Custom Branding", enabled: false, limit: "" },
  { name: "Priority Support", enabled: false, limit: "" },
  { name: "SSO / SAML", enabled: false, limit: "" },
  { name: "Audit Logs", enabled: false, limit: "" },
  { name: "Advanced Analytics", enabled: false, limit: "" },
];

const INITIAL_PLANS: Plan[] = [];

const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  Starter: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
  Pro: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  Enterprise: { bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6" },
};

const STATUS_COLORS: Record<Plan["status"], string> = {
  Active: "#22c55e",
  Draft: "#f59e0b",
  Archived: "#6b7280",
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
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200`}
        style={{ backgroundColor: "var(--gf-bg-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
        {detail && <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{detail}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------

function DeletePlanModal({ plan, onConfirm, onCancel }: { plan: Plan; onConfirm: () => void; onCancel: () => void }) {
  const [confirmName, setConfirmName] = useState("");
  const canDelete = confirmName === plan.name;

  return (
    <ModalOverlay onClose={onCancel}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Delete Plan</h2>
        </div>
        <p className="text-sm mb-2" style={{ color: "var(--gf-text-secondary)" }}>
          Permanently delete the <strong style={{ color: "var(--gf-text-primary)" }}>{plan.name}</strong> plan?
        </p>
        {plan.tenantsCount > 0 && (
          <p className="text-xs mb-4 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400">
            Warning: {plan.tenantsCount} tenant(s) are currently on this plan. They will need to be migrated.
          </p>
        )}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
            Type <strong style={{ color: "var(--gf-text-primary)" }}>{plan.name}</strong> to confirm
          </label>
          <input
            type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={plan.name}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
            style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button onClick={onConfirm} disabled={!canDelete} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">Yes, Delete</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit Plan Modal
// ---------------------------------------------------------------------------

function PlanFormModal({
  plan,
  onSave,
  onCancel,
}: {
  plan?: Plan | null;
  onSave: (data: Omit<Plan, "id" | "created" | "tenantsCount">) => void;
  onCancel: () => void;
}) {
  const isEdit = !!plan;
  const [name, setName] = useState(plan?.name ?? "");
  const [slug, setSlug] = useState(plan?.slug ?? "");
  const [price, setPrice] = useState(plan?.price ?? 0);
  const [billingCycle, setBillingCycle] = useState<Plan["billingCycle"]>(plan?.billingCycle ?? "Monthly");
  const [maxUsers, setMaxUsers] = useState(plan?.maxUsers ?? 10);
  const [maxStorage, setMaxStorage] = useState(plan?.maxStorage ?? "5 GB");
  const [maxApiCalls, setMaxApiCalls] = useState(plan?.maxApiCalls ?? "10K/mo");
  const [status, setStatus] = useState<Plan["status"]>(plan?.status ?? "Draft");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Plan name is required";
    if (!slug.trim()) e.slug = "Slug is required";
    if (price < 0) e.price = "Price cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      name, slug, price, billingCycle, maxUsers, maxStorage, maxApiCalls, status, description,
      features: plan?.features ?? DEFAULT_FEATURES.map((f) => ({ ...f })),
    });
  };

  return (
    <ModalOverlay onClose={onCancel} wide>
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
        <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{isEdit ? "Edit Plan" : "Create New Plan"}</h2>
        <button onClick={onCancel} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Plan Name *</label>
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Business" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ ...fieldStyle, ...(errors.name ? { borderColor: "#ef4444" } : {}) }} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Slug *</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. business" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono text-xs" style={{ ...fieldStyle, ...(errors.slug ? { borderColor: "#ef4444" } : {}) }} />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Price ($/mo) *</label>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Billing Cycle</label>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as Plan["billingCycle"])} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
              <option value="Monthly">Monthly</option>
              <option value="Annual">Annual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Plan["status"])} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wide pt-1" style={{ color: "var(--gf-text-secondary)" }}>Limits</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Users</label>
            <input type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Storage</label>
            <input type="text" value={maxStorage} onChange={(e) => setMaxStorage(e.target.value)} placeholder="e.g. 50 GB" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max API Calls</label>
            <input type="text" value={maxApiCalls} onChange={(e) => setMaxApiCalls(e.target.value)} placeholder="e.g. 100K/mo" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Brief description of this plan" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 resize-none" style={fieldStyle} />
        </div>

        <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--gf-border)" }}>
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
          <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
            {isEdit ? "Save Changes" : "Create Plan"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Plan Detail / Editor Popup (tabs: Details, Features, Limits)
// ---------------------------------------------------------------------------

type PlanTab = "details" | "features" | "limits";

function PlanDetailPopup({
  plan,
  initialTab,
  onClose,
  onSave,
}: {
  plan: Plan;
  initialTab: PlanTab;
  onClose: () => void;
  onSave: (data: Partial<Plan>) => void;
}) {
  const [tab, setTab] = useState<PlanTab>(initialTab);
  const planColor = PLAN_COLORS[plan.name] ?? { bg: "rgba(107,114,128,0.15)", color: "#6b7280" };
  const statusColor = STATUS_COLORS[plan.status];

  // Feature matrix state
  const [features, setFeatures] = useState<PlanFeature[]>(plan.features.map((f) => ({ ...f })));

  // Detail edit state
  const [dName, setDName] = useState(plan.name);
  const [dPrice, setDPrice] = useState(plan.price);
  const [dBilling, setDBilling] = useState(plan.billingCycle);
  const [dDesc, setDDesc] = useState(plan.description);
  const [dStatus, setDStatus] = useState(plan.status);

  // Limits state
  const [lUsers, setLUsers] = useState(plan.maxUsers);
  const [lStorage, setLStorage] = useState(plan.maxStorage);
  const [lApi, setLApi] = useState(plan.maxApiCalls);

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  const toggleFeature = (idx: number) => {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, enabled: !f.enabled } : f));
  };
  const setFeatureLimit = (idx: number, limit: string) => {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, limit } : f));
  };

  const handleDetailsSave = () => {
    onSave({ name: dName, price: dPrice, billingCycle: dBilling, description: dDesc, status: dStatus });
    toast.success("Plan details saved ✓");
  };

  const handleFeaturesSave = () => {
    onSave({ features });
    toast.success("Features updated ✓");
  };

  const handleLimitsSave = () => {
    onSave({ maxUsers: lUsers, maxStorage: lStorage, maxApiCalls: lApi });
    toast.success("Limits updated ✓");
  };

  const TABS: { key: PlanTab; label: string; icon: React.ReactNode }[] = [
    { key: "details", label: "Details", icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "features", label: "Features", icon: <Grid3x3 className="h-3.5 w-3.5" /> },
    { key: "limits", label: "Limits", icon: <Settings className="h-3.5 w-3.5" /> },
  ];

  return (
    <ModalOverlay onClose={onClose} wide>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" style={{ backgroundColor: planColor.bg, color: planColor.color }}>
              {plan.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{plan.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-muted)" }}>{plan.slug}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                  {plan.status}
                </span>
                <span className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>${plan.price}/mo</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: tab === t.key ? "var(--gf-accent)" : "transparent", color: tab === t.key ? "#fff" : "var(--gf-text-secondary)" }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">

        {/* ── Details Tab ─────────────────────────────────── */}
        {tab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Plan Name</label>
                <input type="text" value={dName} onChange={(e) => setDName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Price ($/mo)</label>
                <input type="number" min={0} value={dPrice} onChange={(e) => setDPrice(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Billing Cycle</label>
                <select value={dBilling} onChange={(e) => setDBilling(e.target.value as Plan["billingCycle"])} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <select value={dStatus} onChange={(e) => setDStatus(e.target.value as Plan["status"])} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
              <textarea value={dDesc} onChange={(e) => setDDesc(e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 resize-none" style={fieldStyle} />
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--gf-text-muted)" }}>Tenants on plan</p>
                <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{plan.tenantsCount}</p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--gf-text-muted)" }}>Features enabled</p>
                <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{plan.features.filter((f) => f.enabled).length}/{plan.features.length}</p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--gf-text-muted)" }}>Created</p>
                <p className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>{plan.created}</p>
              </div>
            </div>

            <button type="button" onClick={handleDetailsSave} className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
              Save Details
            </button>
          </div>
        )}

        {/* ── Features Tab (Feature Matrix Editor) ────────── */}
        {tab === "features" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Toggle features on/off and set limits for the <strong style={{ color: "var(--gf-text-primary)" }}>{plan.name}</strong> plan.</p>

            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                    <th className="px-4 py-2.5 text-left font-medium">Feature</th>
                    <th className="px-4 py-2.5 text-center font-medium w-20">Enabled</th>
                    <th className="px-4 py-2.5 text-left font-medium">Limit / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, i) => (
                    <tr key={f.name} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-4 py-2.5 text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{f.name}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button type="button" onClick={() => toggleFeature(i)} style={{ color: f.enabled ? "var(--gf-accent)" : "var(--gf-text-muted)" }}>
                          {f.enabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={f.limit ?? ""}
                          onChange={(e) => setFeatureLimit(i, e.target.value)}
                          disabled={!f.enabled}
                          placeholder={f.enabled ? "e.g. Unlimited" : "—"}
                          className="w-full rounded border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[var(--gf-accent)]/40 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={fieldStyle}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={handleFeaturesSave} className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
              Save Features
            </button>
          </div>
        )}

        {/* ── Limits Tab ──────────────────────────────────── */}
        {tab === "limits" && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Configure resource limits for the <strong style={{ color: "var(--gf-text-primary)" }}>{plan.name}</strong> plan.</p>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Users</label>
              <input type="number" min={1} value={lUsers} onChange={(e) => setLUsers(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Storage</label>
              <input type="text" value={lStorage} onChange={(e) => setLStorage(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max API Calls</label>
              <input type="text" value={lApi} onChange={(e) => setLApi(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>

            {/* Visual comparison */}
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>Current vs New</h4>
              {[
                { label: "Users", old: plan.maxUsers.toString(), cur: lUsers.toString() },
                { label: "Storage", old: plan.maxStorage, cur: lStorage },
                { label: "API Calls", old: plan.maxApiCalls, cur: lApi },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{r.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{r.old}</span>
                    <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>→</span>
                    <span className="text-xs font-medium" style={{ color: r.old !== r.cur ? "var(--gf-accent)" : "var(--gf-text-primary)" }}>{r.cur}</span>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleLimitsSave} className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
              Save Limits
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

type SortKey = "name" | "price" | "maxUsers" | "status" | "tenantsCount" | "created";
type SortDir = "asc" | "desc";

function sortPlans(list: Plan[], key: SortKey, dir: SortDir): Plan[] {
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

export function PlansContent() {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Plan["status"] | "All">("All");
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<Plan | null>(null);
  const [deleteModal, setDeleteModal] = useState<Plan | null>(null);
  const [viewPlan, setViewPlan] = useState<Plan | null>(null);
  const [viewTab, setViewTab] = useState<PlanTab>("details");

  // Derived
  const filtered = useMemo(() => {
    let list = plans;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    if (filterStatus !== "All") list = list.filter((p) => p.status === filterStatus);
    return sortPlans(list, sortKey, sortDir);
  }, [plans, search, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activePlans = plans.filter((p) => p.status === "Active").length;
  const totalTenants = plans.reduce((s, p) => s + p.tenantsCount, 0);
  const avgPrice = plans.length ? Math.round(plans.reduce((s, p) => s + p.price, 0) / plans.length) : 0;

  // Handlers
  const handleCreate = (data: Omit<Plan, "id" | "created" | "tenantsCount">) => {
    const newPlan: Plan = {
      ...data,
      id: `p${Date.now()}`,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      tenantsCount: 0,
    };
    setPlans((prev) => [newPlan, ...prev]);
    setShowCreateModal(false);
    toast.success(`Plan "${data.name}" created successfully ✓`);
  };

  const handleEdit = (data: Omit<Plan, "id" | "created" | "tenantsCount">) => {
    if (!editModal) return;
    setPlans((prev) => prev.map((p) => (p.id === editModal.id ? { ...p, ...data } : p)));
    setEditModal(null);
    toast.success("Plan updated ✓");
  };

  const handleDetailSave = (data: Partial<Plan>) => {
    if (!viewPlan) return;
    setPlans((prev) => prev.map((p) => (p.id === viewPlan.id ? { ...p, ...data } : p)));
    setViewPlan((prev) => (prev ? { ...prev, ...data } : null));
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    const name = deleteModal.name;
    setPlans((prev) => prev.filter((p) => p.id !== deleteModal.id));
    setDeleteModal(null);
    toast.error("Plan deleted ✓", { description: name });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const clearFilters = () => { setSearch(""); setFilterStatus("All"); setPage(1); };
  const hasActiveFilters = search || filterStatus !== "All";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Plan Management</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage subscription plans, features, limits, and pricing</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-4 w-4" />
          Create Plan
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Layers className="h-5 w-5" />} label="Total Plans" value={plans.length} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Active Plans" value={activePlans} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Tenants" value={totalTenants} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Avg Price" value={`$${avgPrice}/mo`} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search plans by name or slug..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`} style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}>
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>1</span>}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as Plan["status"] | "All"); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:text-red-400">
              <X className="h-3 w-3" />Clear All
            </button>
          )}
        </div>
      )}

      {hasActiveFilters && <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filtered.length} of {plans.length} plans</p>}

      {/* Plans Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                {([
                  { key: "name" as SortKey, label: "Plan Name" },
                  { key: "price" as SortKey, label: "Price" },
                  { key: "maxUsers" as SortKey, label: "Max Users" },
                  { key: "status" as SortKey, label: "Status" },
                  { key: "tenantsCount" as SortKey, label: "Tenants" },
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
                    <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No plans found</p>
                    <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
                      {hasActiveFilters ? "Try adjusting your filters" : "Create your first plan to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                paged.map((plan) => {
                  const pColor = PLAN_COLORS[plan.name] ?? { bg: "rgba(107,114,128,0.15)", color: "#6b7280" };
                  const sColor = STATUS_COLORS[plan.status];
                  return (
                    <tr key={plan.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-4 py-3">
                        <button onClick={() => { setViewTab("details"); setViewPlan(plan); }} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: pColor.bg, color: pColor.color }}>{plan.name.charAt(0)}</div>
                          <div>
                            <span className="text-sm font-medium block underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>{plan.name}</span>
                            <span className="text-[10px] font-mono" style={{ color: "var(--gf-text-muted)" }}>{plan.slug}</span>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>${plan.price}<span className="text-xs font-normal" style={{ color: "var(--gf-text-muted)" }}>/mo</span></td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gf-text-primary)" }}>{plan.maxUsers}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sColor }} />
                          <span style={{ color: sColor }}>{plan.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gf-text-primary)" }}>{plan.tenantsCount}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--gf-text-secondary)" }}>{plan.created}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setViewTab("details"); setViewPlan(plan); }} className="rounded-lg p-1.5 transition-colors hover:bg-blue-500/10" style={{ color: "#3b82f6" }} title="View / Edit">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setViewTab("features"); setViewPlan(plan); }} className="rounded-lg p-1.5 transition-colors hover:bg-purple-500/10" style={{ color: "#8b5cf6" }} title="Features">
                            <Grid3x3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditModal(plan)} className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--gf-text-secondary)" }} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteModal(plan)} className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
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
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safePage} of {totalPages} ({filtered.length} plans)</p>
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

      {/* ---- Modals ---- */}

      {showCreateModal && <PlanFormModal onSave={handleCreate} onCancel={() => setShowCreateModal(false)} />}

      {editModal && <PlanFormModal plan={editModal} onSave={handleEdit} onCancel={() => setEditModal(null)} />}

      {deleteModal && <DeletePlanModal plan={deleteModal} onConfirm={handleDelete} onCancel={() => setDeleteModal(null)} />}

      {viewPlan && <PlanDetailPopup plan={viewPlan} initialTab={viewTab} onClose={() => setViewPlan(null)} onSave={handleDetailSave} />}
    </div>
  );
}
