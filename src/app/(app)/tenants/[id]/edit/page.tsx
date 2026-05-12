"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, CreditCard, FileText, Info, X } from "lucide-react";
import { tenantsApi } from "@/lib/api";

type Plan = "Starter" | "Pro" | "Enterprise";

const PLAN_DATA = [
  { name: "Starter" as const, price: "$29", period: "/mo", maxUsers: 10, description: "For small teams getting started", color: "#f59e0b" },
  { name: "Pro" as const, price: "$99", period: "/mo", maxUsers: 50, description: "For growing businesses", color: "#3b82f6" },
  { name: "Enterprise" as const, price: "$249", period: "/mo", maxUsers: 500, description: "For large-scale operations", color: "#14b8a6" },
] as const;

const PLAN_BADGE_STYLES: Record<Plan, { bg: string; color: string }> = {
  Enterprise: { bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6" },
  Pro: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  Starter: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
};

const FEATURES = ["AI Platform", "Workflows", "Documents", "Payments"] as const;

const WIZARD_STEPS = [
  { num: 1, label: "Basic Info", icon: Info },
  { num: 2, label: "Plan", icon: CreditCard },
  { num: 3, label: "Review", icon: FileText },
] as const;

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [tenantCode, setTenantCode] = useState("");
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2
  const [plan, setPlan] = useState<Plan>("Starter");
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Annual">("Monthly");
  const [maxUsers, setMaxUsers] = useState(10);
  const [features, setFeatures] = useState<Set<string>>(new Set(["AI Platform"]));

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    (async () => {
      try {
        const t = await tenantsApi.get(tenantId);
        if (cancelled) return;
        setTenantCode(t.code ?? "");
        setName(t.name ?? "");
        setUsername(t.contact_email ?? "");

        let cfg: Record<string, unknown> = {};
        try { cfg = JSON.parse(t.config || "{}"); } catch { /* ignore */ }
        const cfgPlan = cfg.plan as Plan | undefined;
        if (cfgPlan && (cfgPlan === "Starter" || cfgPlan === "Pro" || cfgPlan === "Enterprise")) setPlan(cfgPlan);
        const cfgCycle = cfg.billing_cycle as "Monthly" | "Annual" | undefined;
        if (cfgCycle === "Monthly" || cfgCycle === "Annual") setBillingCycle(cfgCycle);
        if (typeof cfg.max_users === "number") setMaxUsers(cfg.max_users);

        try {
          const feats = JSON.parse(t.features || "[]");
          if (Array.isArray(feats)) setFeatures(new Set(feats));
        } catch { /* ignore */ }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tenantId]);

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

  const handlePlanSelect = (p: Plan) => {
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
    if (!username.trim()) e.username = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) e.username = "Enter a valid email address";
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

  const onCancel = () => router.push("/tenants");
  const handleCreate = () => router.push("/tenants");

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-xl"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Edit Tenant</h2>
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
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>Basic Information</h3>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Enter the core details for the new tenant</p>
              </div>

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

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Contact Email *</label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
                  placeholder="e.g. admin@acme.com"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                  style={{ ...fieldStyle, ...(errors.username ? { borderColor: "#ef4444" } : {}) }}
                />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
              </div>

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

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>Plan & Entitlements</h3>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Select a plan and configure entitlements</p>
              </div>

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

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>Review & Confirm</h3>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Verify all details before creating the tenant</p>
              </div>

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
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Contact Email</p>
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{username}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Role</p>
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>Tenant Admin</p>
                  </div>
                </div>
              </div>

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
      </div>
    </div>
  );
}
