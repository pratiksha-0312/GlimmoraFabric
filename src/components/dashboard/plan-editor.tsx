"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, Grid3x3, Package } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  currency: string;
  features: string[];
  isActive: boolean;
}

export function PlanEditor({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { plansApi } = await import("@/lib/api");
        // Backend has no GET-by-id; pull from the list and filter.
        const list = await plansApi.list({ limit: 100 });
        const found = list.items.find((p) => p.id === planId);
        if (!found) return;
        const featureList = Object.entries(found.features)
          .filter(([, v]) => v !== false && v !== null && v !== undefined)
          .map(([k, v]) => (typeof v === "boolean" ? k : `${k}: ${v}`));
        const mapped: Plan = {
          id: found.id,
          name: found.name,
          slug: found.code,
          price: found.price,
          billingCycle: String(found.billing_cycle).charAt(0).toUpperCase() +
            String(found.billing_cycle).slice(1).toLowerCase(),
          currency: found.currency,
          features: featureList,
          isActive: found.is_active,
        };
        setPlan(mapped);
        setForm(mapped);
      } catch {
        /* handled below */
      } finally {
        setLoading(false);
      }
    })();
  }, [planId]);

  const update = <K extends keyof Plan>(key: K, value: Plan[K]) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      const { plansApi } = await import("@/lib/api");
      // Map the editor's billingCycle ("Monthly"/"Yearly") to the backend's
      // pattern (^(monthly|yearly|MONTHLY|YEARLY)$). The backend's update
      // doesn't accept feature lists here — those go through the matrix.
      const updated = await plansApi.update(planId, {
        name: form.name,
        code: form.slug,
        price: form.price,
        currency: form.currency,
        billing_cycle: form.billingCycle.toLowerCase() as "monthly" | "yearly",
        is_active: form.isActive,
      });
      const next: Plan = {
        ...form,
        name: updated.name,
        slug: updated.code,
        price: updated.price,
        billingCycle: form.billingCycle,
        currency: updated.currency,
        isActive: updated.is_active,
      };
      setPlan(next);
      setForm(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* swallow — saved indicator stays off */
    }
  };

  if (loading) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading plan…</div>;
  if (!plan || !form) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Plan not found.</p>
        <Link href="/plans" className="mt-3 inline-block text-sm font-medium" style={{ color: "var(--gf-accent)" }}>Back to plans</Link>
      </div>
    );
  }

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/plans" className="flex items-center justify-center rounded-lg border h-9 w-9 hover:opacity-70" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{plan.name}</h1>
            </div>
            <p className="mt-0.5 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Edit pricing, limits, and availability</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/plans/${planId}/features`} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            <Grid3x3 className="h-4 w-4" />Feature Matrix
          </Link>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: saved ? "#22c55e" : "var(--gf-accent)" }}>
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border p-6 space-y-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Plan Name</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Slug</label>
            <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none font-mono focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Price</label>
            <input type="number" min={0} value={form.price} onChange={(e) => update("price", parseInt(e.target.value) || 0)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Currency</label>
            <input type="text" value={form.currency} onChange={(e) => update("currency", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Billing Cycle</label>
            <select value={form.billingCycle} onChange={(e) => update("billingCycle", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Active</label>
          <button onClick={() => update("isActive", !form.isActive)} className="flex items-center gap-3 rounded-lg border px-4 py-2 text-sm" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <div className={`relative h-5 w-9 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-600"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span style={{ color: "var(--gf-text-primary)" }}>{form.isActive ? "Plan is Active" : "Plan is Hidden"}</span>
          </button>
        </div>
      </div>

      {/* Features preview */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Current Features ({form.features.length})</h3>
          <Link href={`/plans/${planId}/features`} className="text-xs font-medium" style={{ color: "var(--gf-accent)" }}>Edit in Matrix →</Link>
        </div>
        <ul className="space-y-1.5 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          {form.features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "#22c55e" }} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
