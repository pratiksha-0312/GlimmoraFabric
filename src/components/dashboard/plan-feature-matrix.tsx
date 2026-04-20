"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, Plus, Trash2, Grid3x3 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  features: string[];
}

export function PlanFeatureMatrix({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/plans/${planId}`).then((r) => r.json()),
      fetch(`/api/plans`).then((r) => r.json()),
    ])
      .then(([one, all]) => {
        setPlan(one);
        setFeatures(one.features ?? []);
        setAllPlans(all);
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, [planId]);

  const addFeature = () => {
    const f = newFeature.trim();
    if (!f) return;
    if (features.includes(f)) return;
    setFeatures([...features, f]);
    setNewFeature("");
    setSaved(false);
  };

  const removeFeature = (f: string) => {
    setFeatures(features.filter((x) => x !== f));
    setSaved(false);
  };

  const handleSave = async () => {
    const res = await fetch(`/api/plans/${planId}/features`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (loading) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading…</div>;
  if (!plan) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Plan not found.</p>
        <Link href="/plans" className="mt-3 inline-block text-sm font-medium" style={{ color: "var(--gf-accent)" }}>Back to plans</Link>
      </div>
    );
  }

  // Union of features across all plans to form the matrix row list.
  const allFeatures = Array.from(new Set([...features, ...allPlans.flatMap((p) => p.features)])).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/plans/${planId}`} className="flex items-center justify-center rounded-lg border h-9 w-9 hover:opacity-70" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{plan.name} — Features</h1>
            </div>
            <p className="mt-0.5 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Toggle features for this plan; add new ones to the matrix</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: saved ? "#22c55e" : "var(--gf-accent)" }}>
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save Features"}
        </button>
      </div>

      {/* Add feature */}
      <div className="rounded-xl border p-4 flex flex-wrap gap-2" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <input
          type="text"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addFeature(); }}
          placeholder="e.g. SSO & SAML"
          className="flex-1 min-w-[220px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
          style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)", color: "var(--gf-text-primary)" }}
        />
        <button onClick={addFeature} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-3.5 w-3.5" />Add Feature
        </button>
      </div>

      {/* Matrix comparing this plan with all others */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                <th className="px-5 py-3 text-left font-medium">Feature</th>
                <th className="px-5 py-3 text-center font-medium">
                  {plan.name}
                  <span className="ml-1.5 text-[10px] font-normal opacity-70">(editing)</span>
                </th>
                {allPlans.filter((p) => p.id !== planId).map((p) => (
                  <th key={p.id} className="px-5 py-3 text-center font-medium">{p.name}</th>
                ))}
                <th className="px-5 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {allFeatures.length === 0 ? (
                <tr><td colSpan={allPlans.length + 2} className="px-5 py-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No features yet. Add one above.</td></tr>
              ) : allFeatures.map((feature) => {
                const inThisPlan = features.includes(feature);
                return (
                  <tr key={feature} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-5 py-3" style={{ color: "var(--gf-text-primary)" }}>{feature}</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => {
                          if (inThisPlan) removeFeature(feature);
                          else { setFeatures([...features, feature]); setSaved(false); }
                        }}
                      >
                        <div className={`relative h-5 w-9 rounded-full transition-colors mx-auto ${inThisPlan ? "bg-green-500" : "bg-gray-600"}`}>
                          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${inThisPlan ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </button>
                    </td>
                    {allPlans.filter((p) => p.id !== planId).map((p) => (
                      <td key={p.id} className="px-5 py-3 text-center">
                        {p.features.includes(feature) ? (
                          <CheckCircle2 className="h-4 w-4 inline-block" style={{ color: "#22c55e" }} />
                        ) : (
                          <span style={{ color: "var(--gf-text-muted)" }}>—</span>
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      {inThisPlan && (
                        <button onClick={() => removeFeature(feature)} className="p-1.5 rounded-lg hover:opacity-70 text-red-500" title="Remove from this plan">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
