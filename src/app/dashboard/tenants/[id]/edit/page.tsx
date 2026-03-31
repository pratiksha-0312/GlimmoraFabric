"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Save } from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface Tenant {
  id: string;
  name: string;
  plan: "Enterprise" | "Pro" | "Starter";
  users: number;
  region: string;
  domain: string;
  status: "Active" | "Provisioning" | "Suspended";
  apiCalls: string;
  created: string;
  email: string;
  description: string;
}

const ALL_TENANTS: Tenant[] = [
  { id: "t1", name: "Glimmora HQ", plan: "Enterprise", users: 120, region: "US-East", domain: "app.glimmora.com", status: "Active", apiCalls: "324K", created: "2026-01-10", email: "admin@glimmora.com", description: "Primary headquarters tenant" },
  { id: "t2", name: "VerifAI", plan: "Pro", users: 85, region: "US-West", domain: "verifai.glimmora.io", status: "Active", apiCalls: "218K", created: "2026-01-18", email: "ops@verifai.com", description: "AI verification platform" },
  { id: "t3", name: "Diamond Corp", plan: "Pro", users: 62, region: "EU-West", domain: "diamond.glimmora.io", status: "Active", apiCalls: "156K", created: "2026-02-05", email: "it@diamondcorp.com", description: "European diamond trading" },
  { id: "t4", name: "Hospitality Co", plan: "Starter", users: 34, region: "AP-South", domain: "hospitality.glimmora.io", status: "Active", apiCalls: "89K", created: "2026-02-20", email: "tech@hospitality.co", description: "Hospitality management" },
  { id: "t5", name: "Tax Solutions", plan: "Pro", users: 48, region: "US-East", domain: "tax.glimmora.io", status: "Active", apiCalls: "67K", created: "2026-03-01", email: "dev@taxsolutions.com", description: "Tax filing and compliance" },
  { id: "t6", name: "Aero Systems", plan: "Enterprise", users: 133, region: "EU-Central", domain: "aero.glimmora.io", status: "Provisioning", apiCalls: "—", created: "2026-03-15", email: "platform@aerosys.io", description: "Aerospace systems integration" },
];

const PLANS = ["Starter", "Pro", "Enterprise"] as const;
const REGIONS = ["US-East", "US-West", "EU-West", "EU-Central", "AP-South", "AP-East"];
const STATUSES = ["Active", "Provisioning", "Suspended"] as const;

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function EditTenantPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    plan: "Starter" as (typeof PLANS)[number],
    region: "US-East",
    domain: "",
    users: 0,
    status: "Active" as (typeof STATUSES)[number],
    description: "",
  });

  useEffect(() => {
    const found = ALL_TENANTS.find((t) => t.id === tenantId);
    if (found) {
      setTenant(found);
      setForm({
        name: found.name,
        email: found.email,
        plan: found.plan,
        region: found.region,
        domain: found.domain,
        users: found.users,
        status: found.status,
        description: found.description,
      });
    }
  }, [tenantId]);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push(`/dashboard/tenants/${tenantId}`), 1500);
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 mb-4 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Tenant Not Found</p>
        <button
          onClick={() => router.push("/dashboard/tenants")}
          className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 mb-4">
          <Save className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Changes Saved!</h2>
        <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
          <strong>{form.name}</strong> has been updated. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.push(`/dashboard/tenants/${tenantId}`)}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenant Details
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Edit Tenant</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          Update the configuration for <strong>{tenant.name}</strong>
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border p-6 space-y-6"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Admin Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Plan & Region & Status */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Plan, Region & Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Plan</label>
              <select
                value={form.plan}
                onChange={(e) => update("plan", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Region</label>
              <select
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Technical */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Technical Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Domain *</label>
              <input
                type="text"
                value={form.domain}
                onChange={(e) => update("domain", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Seats</label>
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
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/tenants/${tenantId}`)}
            className="rounded-lg px-5 py-2.5 text-sm font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
