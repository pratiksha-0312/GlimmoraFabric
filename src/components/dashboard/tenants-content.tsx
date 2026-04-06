"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Globe,
  Users,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Ban,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  CreditCard,
  FileText,
  Info,
  Pause,
  Play,
  BarChart3,
  HardDrive,
  Activity,
  Bell,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Tenant {
  id: string;
  code: string;
  name: string;
  username: string;
  plan: "Enterprise" | "Pro" | "Starter";
  users: number;
  status: "Active" | "Provisioning" | "Suspended" | "Trialing";
  apiCalls: string;
  created: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Initial mock data
// ---------------------------------------------------------------------------

const INITIAL_TENANTS: Tenant[] = [
  { id: "t1", code: "TENT001", name: "Acme Corporation", username: "acme_admin", plan: "Enterprise", users: 24, status: "Active", apiCalls: "12.4K", created: "Jan 10, 2026", description: "Enterprise plan • Monthly billing • AI Platform, Workflows" },
  { id: "t2", code: "TENT002", name: "Globex Inc", username: "globex_admin", plan: "Pro", users: 8, status: "Active", apiCalls: "3.2K", created: "Feb 15, 2026", description: "Pro plan • Monthly billing • Workflows, Documents" },
  { id: "t3", code: "TENT003", name: "Initech Systems", username: "initech_admin", plan: "Enterprise", users: 31, status: "Active", apiCalls: "18.7K", created: "Nov 05, 2025", description: "Enterprise plan • Annual billing • AI Platform, Workflows, Payments" },
  { id: "t4", code: "TENT004", name: "Wonka Ltd", username: "wonka_admin", plan: "Starter", users: 3, status: "Trialing", apiCalls: "420", created: "Mar 20, 2026", description: "Starter plan • Monthly billing • Documents" },
  { id: "t5", code: "TENT005", name: "Umbrella Co", username: "umbrella_admin", plan: "Pro", users: 12, status: "Suspended", apiCalls: "—", created: "Jan 05, 2026", description: "Pro plan • Monthly billing • Workflows, Payments" },
  { id: "t6", code: "TENT006", name: "Cyberdyne Inc", username: "cyber_admin", plan: "Starter", users: 1, status: "Active", apiCalls: "89", created: "Mar 28, 2026", description: "Starter plan • Monthly billing • AI Platform" },
];

const PLAN_BADGE_STYLES: Record<Tenant["plan"], { bg: string; color: string }> = {
  Enterprise: { bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6" },
  Pro: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  Starter: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
};

const STATUS_DOT_COLORS: Record<Tenant["status"], string> = {
  Active: "#22c55e",
  Provisioning: "#f59e0b",
  Suspended: "#ef4444",
  Trialing: "#8b5cf6",
};

const PLANS: Tenant["plan"][] = ["Starter", "Pro", "Enterprise"];
const STATUSES: Tenant["status"][] = ["Active", "Provisioning", "Suspended", "Trialing"];

const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Overlay wrapper — centered popup with dark overlay + body scroll lock
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
        className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200`}
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
    <div
      className="flex items-center gap-4 rounded-xl border p-5"
      style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
      >
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
// Delete Confirmation Modal (centered popup, type-to-confirm)
// ---------------------------------------------------------------------------

function DeleteModal({ tenant, onConfirm, onCancel }: { tenant: Tenant; onConfirm: () => void; onCancel: () => void }) {
  const [confirmName, setConfirmName] = useState("");
  const canDelete = confirmName === tenant.name;

  return (
    <ModalOverlay onClose={onCancel}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Delete Tenant</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>
          Permanently delete <strong style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</strong>? All data will be lost. This action cannot be undone.
        </p>
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
            Type <strong style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</strong> to confirm
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={tenant.name}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
            style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!canDelete} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
            Yes, Delete
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Suspend / Activate Confirmation Modal (centered popup)
// ---------------------------------------------------------------------------

function StatusChangeModal({ tenant, action, onConfirm, onCancel }: { tenant: Tenant; action: "suspend" | "activate"; onConfirm: () => void; onCancel: () => void }) {
  const isSuspend = action === "suspend";
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isSuspend ? "bg-amber-500/15" : "bg-green-500/15"}`}>
            {isSuspend ? <Ban className="h-5 w-5 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
            {isSuspend ? "Suspend" : "Activate"} Tenant
          </h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          {isSuspend
            ? <>Suspend <strong style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</strong>? They will lose access immediately.</>
            : <>Reactivate <strong style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</strong>? This will restore access for all users.</>
          }
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${isSuspend ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}>
            {isSuspend ? "Yes, Suspend" : "Yes, Activate"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Plan data
// ---------------------------------------------------------------------------

const PLAN_DATA = [
  { name: "Starter" as const, price: "$29", period: "/mo", maxUsers: 10, description: "For small teams getting started", color: "#f59e0b" },
  { name: "Pro" as const, price: "$99", period: "/mo", maxUsers: 50, description: "For growing businesses", color: "#3b82f6" },
  { name: "Enterprise" as const, price: "$249", period: "/mo", maxUsers: 500, description: "For large-scale operations", color: "#14b8a6" },
] as const;

const FEATURES = ["AI Platform", "Workflows", "Documents", "Payments"] as const;

const WIZARD_STEPS = [
  { num: 1, label: "Basic Info", icon: Info },
  { num: 2, label: "Plan", icon: CreditCard },
  { num: 3, label: "Review", icon: FileText },
] as const;

// ---------------------------------------------------------------------------
// Create Tenant Wizard (centered popup)
// ---------------------------------------------------------------------------

function CreateTenantWizard({
  tenantCode,
  onSave,
  onCancel,
}: {
  tenantCode: string;
  onSave: (data: { name: string; username: string; password: string; plan: Tenant["plan"]; billingCycle: string; users: number; features: string[] }) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 fields
  const [plan, setPlan] = useState<Tenant["plan"]>("Starter");
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Annual">("Monthly");
  const [maxUsers, setMaxUsers] = useState(10);
  const [features, setFeatures] = useState<Set<string>>(new Set(["AI Platform"]));

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };
  const readOnlyStyle = {
    backgroundColor: "var(--gf-bg-elevated)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-muted)",
  };

  const selectedPlanData = PLAN_DATA.find((p) => p.name === plan)!;

  const handlePlanSelect = (p: Tenant["plan"]) => {
    setPlan(p);
    const pd = PLAN_DATA.find((d) => d.name === p)!;
    setMaxUsers(pd.maxUsers);
  };

  const toggleFeature = (f: string) => {
    setFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Tenant full name is required";
    if (!username.trim()) e.username = "Username is required";
    else if (!/^[a-z0-9_]+$/.test(username)) e.username = "Only lowercase letters, numbers, and underscore allowed";
    if (!password.trim()) e.password = "Password is required";
    if (!confirmPassword.trim()) e.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (maxUsers < 1) e.maxUsers = "Must have at least 1 user";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleCreate = () => {
    onSave({ name, username, password, plan, billingCycle, users: maxUsers, features: Array.from(features) });
  };

  return (
    <ModalOverlay onClose={onCancel} wide>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
        <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Create New Tenant</h2>
        <button onClick={onCancel} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--gf-border)" }}>
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: step >= s.num ? "var(--gf-accent)" : "var(--gf-bg-elevated)",
                    color: step >= s.num ? "#fff" : "var(--gf-text-muted)",
                  }}
                >
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className="text-xs font-medium" style={{ color: step >= s.num ? "var(--gf-text-primary)" : "var(--gf-text-muted)" }}>
                  {s.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2" style={{ backgroundColor: step > s.num ? "var(--gf-accent)" : "var(--gf-border)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {/* ── STEP 1: Basic Info ──────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>Basic Information</h3>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Enter the core details for the new tenant</p>
            </div>

            {/* Tenant Code (auto, read-only) */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant Code</label>
              <input
                type="text"
                value={tenantCode}
                readOnly
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none cursor-not-allowed"
                style={readOnlyStyle}
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--gf-text-muted)" }}>Auto-generated, cannot be changed</p>
            </div>

            {/* Tenant Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={{ ...fieldStyle, ...(errors.name ? { borderColor: "#ef4444" } : {}) }}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="e.g. acme_admin"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={{ ...fieldStyle, ...(errors.username ? { borderColor: "#ef4444" } : {}) }}
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role</label>
              <input
                type="text"
                value="Tenant Admin"
                readOnly
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none cursor-not-allowed"
                style={readOnlyStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={{ ...fieldStyle, ...(errors.password ? { borderColor: "#ef4444" } : {}) }}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={{ ...fieldStyle, ...(errors.confirmPassword ? { borderColor: "#ef4444" } : {}) }}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}

        {/* ── STEP 2: Plan & Entitlements ─────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>Plan & Entitlements</h3>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Select a plan and configure entitlements</p>
            </div>

            {/* Plan Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>Plan</label>
              <div className="grid grid-cols-3 gap-3">
                {PLAN_DATA.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePlanSelect(p.name)}
                    className="relative rounded-xl border-2 p-4 text-left transition-all hover:opacity-90"
                    style={{
                      borderColor: plan === p.name ? p.color : "var(--gf-border)",
                      backgroundColor: plan === p.name ? `${p.color}10` : "var(--gf-bg-base)",
                    }}
                  >
                    {plan === p.name && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: p.color }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <p className="text-xs font-medium mb-1" style={{ color: p.color }}>{p.name}</p>
                    <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
                      {p.price}<span className="text-xs font-normal" style={{ color: "var(--gf-text-muted)" }}>{p.period}</span>
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--gf-text-muted)" }}>{p.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Billing Cycle</label>
              <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
                {(["Monthly", "Annual"] as const).map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: billingCycle === cycle ? "var(--gf-accent)" : "var(--gf-bg-base)",
                      color: billingCycle === cycle ? "#fff" : "var(--gf-text-secondary)",
                    }}
                  >
                    {cycle}
                    {cycle === "Annual" && <span className="ml-1 text-[10px] opacity-80">(Save 20%)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Users */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Users</label>
              <input
                type="number"
                min={1}
                value={maxUsers}
                onChange={(e) => setMaxUsers(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              <p className="text-[10px] mt-1" style={{ color: "var(--gf-text-muted)" }}>
                Default for {plan}: {selectedPlanData.maxUsers} users
              </p>
              {errors.maxUsers && <p className="text-xs text-red-500 mt-1">{errors.maxUsers}</p>}
            </div>

            {/* Features */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Features</label>
              <div className="grid grid-cols-2 gap-2">
                {FEATURES.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors hover:opacity-90"
                    style={{
                      borderColor: features.has(f) ? "var(--gf-accent)" : "var(--gf-border)",
                      backgroundColor: features.has(f) ? "rgba(var(--gf-accent-rgb, 249, 115, 22), 0.08)" : "var(--gf-bg-base)",
                    }}
                  >
                    <input type="checkbox" checked={features.has(f)} onChange={() => toggleFeature(f)} className="accent-[var(--gf-accent)] h-3.5 w-3.5" />
                    <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{f}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Confirm ────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>Review & Confirm</h3>
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Verify all details before creating the tenant</p>
            </div>

            {/* Basic Info Summary */}
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>Basic Info</h4>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-medium transition-colors hover:opacity-70" style={{ color: "var(--gf-accent)" }}>Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Tenant Code</p>
                  <p className="text-sm font-medium font-mono" style={{ color: "var(--gf-text-primary)" }}>{tenantCode}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Full Name</p>
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Username</p>
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{username}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Role</p>
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Tenant Admin</p>
                </div>
              </div>
            </div>

            {/* Plan Summary */}
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-secondary)" }}>Plan & Entitlements</h4>
                <button type="button" onClick={() => setStep(2)} className="text-xs font-medium transition-colors hover:opacity-70" style={{ color: "var(--gf-accent)" }}>Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Plan</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5" style={{ backgroundColor: PLAN_BADGE_STYLES[plan].bg, color: PLAN_BADGE_STYLES[plan].color }}>
                    {plan} — {billingCycle}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Max Users</p>
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{maxUsers}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Features</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {Array.from(features).map((f) => (
                      <span key={f} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>{f}</span>
                    ))}
                    {features.size === 0 && <span className="text-sm" style={{ color: "var(--gf-text-muted)" }}>None</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
        <button
          type="button"
          onClick={step === 1 ? onCancel : handleBack}
          className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>
        {step < 3 ? (
          <button type="button" onClick={handleNext} className="rounded-lg px-6 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
            Next
          </button>
        ) : (
          <button type="button" onClick={handleCreate} className="rounded-lg px-6 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
            Create Tenant
          </button>
        )}
      </div>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Tabbed Tenant Detail Popup (Overview / Settings / Usage Dashboard)
// ---------------------------------------------------------------------------

type DetailTab = "overview" | "settings" | "usage";

function TenantDetailPopup({
  tenant,
  initialTab,
  onClose,
  onSave,
}: {
  tenant: Tenant;
  initialTab: DetailTab;
  onClose: () => void;
  onSave: (data: Partial<Tenant>) => void;
}) {
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const planStyle = PLAN_BADGE_STYLES[tenant.plan];
  const statusColor = STATUS_DOT_COLORS[tenant.status];

  // Settings tab state
  const [sName, setSName] = useState(tenant.name);
  const [sUsername, setSUsername] = useState(tenant.username);
  const [sPlan, setSPlan] = useState<Tenant["plan"]>(tenant.plan);
  const [sUsers, setSUsers] = useState(tenant.users);
  const [sAutoRenew, setSAutoRenew] = useState(true);
  const [sErrors, setSErrors] = useState<Record<string, string>>({});

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  const handleSettingsSave = () => {
    const e: Record<string, string> = {};
    if (!sName.trim()) e.name = "Tenant name is required";
    setSErrors(e);
    if (Object.keys(e).length > 0) return;
    onSave({ name: sName, username: sUsername, plan: sPlan, users: sUsers });
    toast.success("Settings saved ✓");
  };

  // Mock usage data
  const apiUsage7d = [1240, 980, 1520, 1100, 1380, 890, 1640];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxApi = Math.max(...apiUsage7d);
  const storagePct = 42;
  const storageColor = storagePct > 80 ? "#ef4444" : storagePct > 60 ? "#f59e0b" : "#22c55e";

  const TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "settings", label: "Settings", icon: <Settings className="h-3.5 w-3.5" /> },
    { key: "usage", label: "Usage", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ];

  return (
    <ModalOverlay onClose={onClose} wide>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-muted)" }}>{tenant.code}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: planStyle.bg, color: planStyle.color }}>{tenant.plan}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                  {tenant.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: tab === t.key ? "var(--gf-accent)" : "transparent",
                color: tab === t.key ? "#fff" : "var(--gf-text-secondary)",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {/* ── Tab 1: Overview ──────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tenant Code", value: tenant.code },
                { label: "Full Name", value: tenant.name },
                { label: "Username", value: tenant.username },
                { label: "Role", value: "Tenant Admin" },
                { label: "Plan", value: tenant.plan },
                { label: "Status", value: tenant.status },
                { label: "Created", value: tenant.created },
                { label: "Total Users", value: tenant.users.toString() },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                  <p className="text-[10px] uppercase tracking-wide font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
                </div>
              ))}
            </div>
            {tenant.description && (
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-[10px] uppercase tracking-wide font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>Description</p>
                <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{tenant.description}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Settings ──────────────────────────────── */}
        {tab === "settings" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant Name</label>
              <input type="text" value={sName} onChange={(e) => setSName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {sErrors.name && <p className="text-xs text-red-500 mt-1">{sErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Username</label>
              <input type="text" value={sUsername} onChange={(e) => setSUsername(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Plan</label>
              <select value={sPlan} onChange={(e) => setSPlan(e.target.value as Tenant["plan"])} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Users</label>
              <input type="number" min={1} value={sUsers} onChange={(e) => setSUsers(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Auto Renew</p>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Automatically renew subscription</p>
              </div>
              <button type="button" onClick={() => setSAutoRenew(!sAutoRenew)} className="transition-colors" style={{ color: sAutoRenew ? "var(--gf-accent)" : "var(--gf-text-muted)" }}>
                {sAutoRenew ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
              </button>
            </div>
            <button type="button" onClick={handleSettingsSave} className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-accent)" }}>
              Save Settings
            </button>
          </div>
        )}

        {/* ── Tab 3: Usage Dashboard ─────────────────────── */}
        {tab === "usage" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Activity className="h-4 w-4" />, label: "API Calls Today", value: "1,240", color: "#3b82f6" },
                { icon: <HardDrive className="h-4 w-4" />, label: "Storage Used", value: "4.2 GB / 10 GB", color: "#14b8a6" },
                { icon: <Users className="h-4 w-4" />, label: "Active Sessions", value: "7", color: "#f59e0b" },
                { icon: <Bell className="h-4 w-4" />, label: "Notifications", value: "89 sent today", color: "#8b5cf6" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
                  </div>
                  <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</p>
                  <p className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <h4 className="text-xs font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>API Usage — Last 7 Days</h4>
              <div className="flex items-end gap-2 h-32">
                {apiUsage7d.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{val.toLocaleString()}</span>
                    <div className="w-full rounded-t-md transition-all" style={{ height: `${(val / maxApi) * 100}%`, backgroundColor: "var(--gf-accent)", opacity: 0.8, minHeight: "8px" }} />
                    <span className="text-[9px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{days[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold" style={{ color: "var(--gf-text-primary)" }}>Storage</h4>
                <span className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>4.2 GB / 10 GB</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${storagePct}%`, backgroundColor: storageColor }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: "var(--gf-text-muted)" }}>{storagePct}% used</p>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

type SortKey = "code" | "name" | "username" | "plan" | "users" | "status" | "created";
type SortDir = "asc" | "desc";

function sortTenants(list: Tenant[], key: SortKey, dir: SortDir): Tenant[] {
  return [...list].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === "number" && typeof vb === "number") return dir === "asc" ? va - vb : vb - va;
    return dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
}

// ---------------------------------------------------------------------------
// Helper: generate next tenant code
// ---------------------------------------------------------------------------

function nextTenantCode(tenants: Tenant[]): string {
  let maxNum = 0;
  for (const t of tenants) {
    const m = (t.code ?? "").match(/^TENT(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  return `TENT${String(maxNum + 1).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TenantsContent() {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const refreshTenants = () =>
    fetch("/api/tenants")
      .then((r) => r.json())
      .then(setTenants);

  useEffect(() => {
    refreshTenants();
  }, []);

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<Tenant["plan"] | "All">("All");
  const [filterStatus, setFilterStatus] = useState<Tenant["status"] | "All">("All");
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Tenant | null>(null);
  const [statusModal, setStatusModal] = useState<{ tenant: Tenant; action: "suspend" | "activate" } | null>(null);
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);
  const [viewTab, setViewTab] = useState<DetailTab>("overview");

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    let list = tenants;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.username.toLowerCase().includes(q));
    }
    if (filterPlan !== "All") list = list.filter((t) => t.plan === filterPlan);
    if (filterStatus !== "All") list = list.filter((t) => t.status === filterStatus);
    return sortTenants(list, sortKey, sortDir);
  }, [tenants, search, filterPlan, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Stats
  const activeTenants = tenants.filter((t) => t.status === "Active").length;
  const totalUsers = tenants.reduce((s, t) => s + t.users, 0);

  // Next code
  const pendingCode = nextTenantCode(tenants);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = async (data: { name: string; username: string; password: string; plan: Tenant["plan"]; billingCycle: string; users: number; features: string[] }) => {
    const code = nextTenantCode(tenants);
    const newTenant = {
      code,
      name: data.name,
      username: data.username,
      password: data.password,
      plan: data.plan,
      users: data.users,
      status: "Provisioning" as const,
      apiCalls: "—",
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      description: `${data.plan} plan • ${data.billingCycle} billing • ${data.features.join(", ")}`,
    };
    await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTenant),
    });
    await refreshTenants();
    setShowCreate(false);
    toast.success(`Tenant ${code} created successfully ✓`);
  };

  const handleDetailSave = async (data: Partial<Tenant>) => {
    if (!viewTenant) return;
    await fetch(`/api/tenants/${viewTenant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await refreshTenants();
    setViewTenant((prev) => (prev ? { ...prev, ...data } : null));
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const name = deleteModal.name;
    await fetch(`/api/tenants/${deleteModal.id}`, { method: "DELETE" });
    await refreshTenants();
    setDeleteModal(null);
    if (viewTenant?.id === deleteModal.id) setViewTenant(null);
    toast.error("Tenant deleted ✓", { description: name });
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    const isSuspend = statusModal.action === "suspend";
    const newStatus: Tenant["status"] = isSuspend ? "Suspended" : "Active";
    await fetch(`/api/tenants/${statusModal.tenant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await refreshTenants();
    if (viewTenant?.id === statusModal.tenant.id) {
      setViewTenant((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setStatusModal(null);
    if (isSuspend) toast.warning("Tenant suspended ✓");
    else toast.success("Tenant activated ✓");
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleExport = () => {
    const header = "Code,Name,Username,Plan,Users,Status,Created\n";
    const rows = tenants.map((t) => `"${t.code}","${t.name}","${t.username}","${t.plan}",${t.users},"${t.status}","${t.created}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenants-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const clearFilters = () => { setSearch(""); setFilterPlan("All"); setFilterStatus("All"); setPage(1); };
  const hasActiveFilters = search || filterPlan !== "All" || filterStatus !== "All";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Tenant Management</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Multi-tenant onboarding, plans, entitlements, and isolation configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
            <Plus className="h-4 w-4" />
            Create Tenant
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Total Tenants" value={tenants.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Active Tenants" value={activeTenants} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={totalUsers} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Plans" value={3} detail="Starter / Pro / Enterprise" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by code, name, or username..."
            className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`}
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
              {[filterPlan !== "All", filterStatus !== "All"].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Plan</label>
            <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value as Tenant["plan"] | "All"); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="All">All Plans</option>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as Tenant["status"] | "All"); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:text-red-400">
              <X className="h-3 w-3" />
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
          Showing {filtered.length} of {tenants.length} tenants
        </p>
      )}

      {/* Tenants Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                {([
                  { key: "code" as SortKey, label: "Tenant Code" },
                  { key: "name" as SortKey, label: "Full Name" },
                  { key: "username" as SortKey, label: "Username" },
                  { key: "plan" as SortKey, label: "Plan" },
                  { key: "users" as SortKey, label: "Users" },
                  { key: "status" as SortKey, label: "Status" },
                  { key: "created" as SortKey, label: "Created" },
                  { key: null, label: "Actions" },
                ] as const).map((col, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-left font-medium whitespace-nowrap ${col.key ? "cursor-pointer select-none hover:opacity-80" : ""}`}
                    onClick={col.key ? () => handleSort(col.key!) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No tenants found</p>
                    <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
                      {hasActiveFilters ? "Try adjusting your filters" : "Create your first tenant to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                paged.map((tenant) => {
                  const pStyle = PLAN_BADGE_STYLES[tenant.plan];
                  const sColor = STATUS_DOT_COLORS[tenant.status];

                  return (
                    <tr key={tenant.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-medium px-2 py-1 rounded" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-primary)" }}>
                          {tenant.code}
                        </span>
                      </td>

                      {/* Full Name */}
                      <td className="px-4 py-3">
                        <button onClick={() => { setViewTab("overview"); setViewTenant(tenant); }} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
                            {tenant.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</span>
                        </button>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{tenant.username}</td>

                      {/* Plan */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: pStyle.bg, color: pStyle.color }}>{tenant.plan}</span>
                      </td>

                      {/* Users */}
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--gf-text-primary)" }}>{tenant.users}</td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sColor }} />
                          <span style={{ color: sColor }}>{tenant.status}</span>
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--gf-text-secondary)" }}>{tenant.created}</td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setViewTab("overview"); setViewTenant(tenant); }} className="rounded-lg p-1.5 transition-colors hover:bg-blue-500/10" style={{ color: "#3b82f6" }} title="View Details">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setViewTab("settings"); setViewTenant(tenant); }} className="rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--gf-text-secondary)" }} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          {tenant.status === "Active" ? (
                            <button onClick={() => setStatusModal({ tenant, action: "suspend" })} className="rounded-lg p-1.5 transition-colors hover:bg-amber-500/10" style={{ color: "#f59e0b" }} title="Suspend">
                              <Pause className="h-4 w-4" />
                            </button>
                          ) : tenant.status === "Suspended" ? (
                            <button onClick={() => setStatusModal({ tenant, action: "activate" })} className="rounded-lg p-1.5 transition-colors hover:bg-green-500/10" style={{ color: "#22c55e" }} title="Activate">
                              <Play className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="w-[30px]" />
                          )}
                          <button onClick={() => setDeleteModal(tenant)} className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Delete">
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

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safePage} of {totalPages} ({filtered.length} tenants)</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${n === safePage ? "text-white" : "hover:opacity-70"}`} style={n === safePage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Modals (all centered popups) ---- */}

      {showCreate && (
        <CreateTenantWizard
          tenantCode={pendingCode}
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {deleteModal && (
        <DeleteModal tenant={deleteModal} onConfirm={handleDelete} onCancel={() => setDeleteModal(null)} />
      )}

      {statusModal && (
        <StatusChangeModal tenant={statusModal.tenant} action={statusModal.action} onConfirm={handleStatusChange} onCancel={() => setStatusModal(null)} />
      )}

      {viewTenant && (
        <TenantDetailPopup tenant={viewTenant} initialTab={viewTab} onClose={() => setViewTenant(null)} onSave={handleDetailSave} />
      )}
    </div>
  );
}
