"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLANS = ["Starter", "Pro", "Enterprise"] as const;
const REGIONS = ["US-East", "US-West", "EU-West", "EU-Central", "AP-South", "AP-East"];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CreateTenantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    plan: "Starter" as (typeof PLANS)[number],
    region: "US-East",
    domain: "",
    users: 0,
    description: "",
  });

  const update = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Tenant name is required";
    if (!form.email.trim()) e.email = "Admin email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.domain.trim()) e.domain = "Domain is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSuccess(true);

    // Redirect after showing success
    setTimeout(() => router.push("/dashboard/tenants"), 1500);
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 mb-4">
          <Building2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Tenant Created!</h2>
        <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
          <strong>{form.name}</strong> has been created and is now provisioning. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/tenants")}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenants
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Create New Tenant</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          Set up a new tenant with their plan, region, and configuration
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border p-6 space-y-6"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        {/* Section: Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Tenant Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Admin Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="admin@company.com"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Section: Plan & Region */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Plan & Region</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update("plan", p)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${form.plan === p ? "ring-2 ring-[var(--gf-accent)]" : "hover:opacity-80"}`}
                    style={{
                      borderColor: form.plan === p ? "var(--gf-accent)" : "var(--gf-border)",
                      backgroundColor: form.plan === p ? "var(--gf-accent-bg)" : "var(--gf-bg-base)",
                      color: "var(--gf-text-primary)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>
                {form.plan === "Starter" && "Up to 50 users, basic features"}
                {form.plan === "Pro" && "Up to 200 users, advanced features"}
                {form.plan === "Enterprise" && "Up to 500 users, full platform access"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Region
              </label>
              <select
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>
                Data will be stored in the selected region for compliance
              </p>
            </div>
          </div>
        </div>

        {/* Section: Technical */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Technical Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Domain *
              </label>
              <input
                type="text"
                value={form.domain}
                onChange={(e) => update("domain", e.target.value)}
                placeholder="company.glimmora.io"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                Initial User Seats
              </label>
              <input
                type="number"
                min={0}
                value={form.users}
                onChange={(e) => update("users", Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            placeholder="Brief description of the tenant and their use case..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button
            type="button"
            onClick={() => router.push("/dashboard/tenants")}
            className="rounded-lg px-5 py-2.5 text-sm font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            {isSubmitting ? "Creating..." : "Create Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}
