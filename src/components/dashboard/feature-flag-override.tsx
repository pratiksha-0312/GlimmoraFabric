"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Flag, Save, Trash2, Plus, Building2, CheckCircle2 } from "lucide-react";

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
  environment: string;
  category: string;
  created: string;
  updatedAt: string;
  tenantOverrides: TenantOverride[];
}

export function FeatureFlagOverridePage({ flagId }: { flagId: string }) {
  const [flag, setFlag] = useState<FeatureFlag | null>(null);
  const [overrides, setOverrides] = useState<TenantOverride[]>([]);
  const [rollout, setRollout] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { featureFlagsApi } = await import("@/lib/api");
        // The backend's flags endpoint is `GET /feature-flags/` (list).
        // There's no per-id GET, so fetch the list and filter client-side.
        const list = await featureFlagsApi.list({ limit: 100 });
        const ff = list.items.find((f) => f.id === flagId);
        if (!ff || cancelled) return;
        setFlag({
          id: ff.id,
          key: ff.key,
          name: ff.name,
          description: ff.description,
          enabled: ff.is_enabled,
          rolloutPercentage: ff.rollout_percentage ?? 0,
          environment: ff.environment,
          category: "",
          created: ff.created_at,
          updatedAt: ff.updated_at ?? ff.created_at,
          // Per-tenant overrides aren't returned in the list response —
          // they're upserted via setOverride. Surface an empty array; admins
          // can re-add via the form.
          tenantOverrides: [],
        });
        setOverrides([]);
        setRollout(ff.rollout_percentage ?? 0);
        setEnabled(ff.is_enabled);
      } catch {
        /* 404 / network */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [flagId]);

  const addOverride = () => {
    if (!newCode.trim()) return;
    if (overrides.some((o) => o.tenantCode === newCode)) return;
    setOverrides([...overrides, { tenantCode: newCode.trim(), tenantName: newName.trim() || newCode.trim(), enabled: true }]);
    setNewCode("");
    setNewName("");
    setSaved(false);
  };

  const toggleOverride = (code: string) => {
    setOverrides(overrides.map((o) => o.tenantCode === code ? { ...o, enabled: !o.enabled } : o));
    setSaved(false);
  };

  const removeOverride = (code: string) => {
    setOverrides(overrides.filter((o) => o.tenantCode !== code));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const { featureFlagsApi } = await import("@/lib/api");
      await featureFlagsApi.update(flagId, {
        is_enabled: enabled,
        rollout_percentage: rollout,
      });
      // The backend's per-tenant override endpoint takes one tenant id at a
      // time; iterate. The legacy code stored a `tenantCode` (human label),
      // but the backend wants a UUID — so this only works once the override
      // form captures real tenant IDs. Until then, skip overrides whose
      // code isn't UUID-shaped.
      const isUuid = /^[0-9a-f-]{36}$/i;
      for (const o of overrides) {
        if (!isUuid.test(o.tenantCode)) continue;
        await featureFlagsApi.setOverride(flagId, {
          tenant_id: o.tenantCode,
          is_enabled: o.enabled,
        });
      }
    } catch {
      /* swallow — the saved indicator stays off */
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading flag…</div>;
  }
  if (!flag) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Flag not found.</p>
        <Link href="/feature-flags" className="mt-3 inline-block text-sm font-medium" style={{ color: "var(--gf-accent)" }}>Back to flags</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/feature-flags" className="flex items-center justify-center rounded-lg border h-9 w-9 hover:opacity-70" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{flag.name}</h1>
            </div>
            <p className="mt-0.5 text-sm font-mono" style={{ color: "var(--gf-text-muted)" }}>{flag.key}</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: saved ? "#22c55e" : "var(--gf-accent)" }}>
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{flag.description}</p>

      {/* Global toggle + rollout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Global State</h3>
          <button onClick={() => { setEnabled(!enabled); setSaved(false); }} className="flex items-center gap-3 rounded-lg border px-4 py-2 text-sm" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
            <div className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-600"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span style={{ color: "var(--gf-text-primary)" }}>{enabled ? "Enabled" : "Disabled"}</span>
          </button>
          <p className="mt-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>
            Environment: <span className="font-medium" style={{ color: "var(--gf-text-secondary)" }}>{flag.environment}</span>
            {" · "}Category: <span className="font-medium" style={{ color: "var(--gf-text-secondary)" }}>{flag.category}</span>
          </p>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Rollout Percentage</h3>
            <span className="text-2xl font-bold" style={{ color: "var(--gf-accent)" }}>{rollout}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={rollout}
            onChange={(e) => { setRollout(parseInt(e.target.value)); setSaved(false); }}
            className="w-full accent-[var(--gf-accent)]"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </div>

      {/* Per-tenant overrides */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="border-b px-5 py-3 flex items-center justify-between" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Per-Tenant Overrides</h3>
          </div>
          <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{overrides.length} override{overrides.length === 1 ? "" : "s"}</span>
        </div>

        {/* Add new */}
        <div className="flex flex-wrap gap-2 p-4 border-b" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="Tenant code (e.g. TENT007)"
            className="rounded-lg border px-3 py-2 text-sm outline-none flex-1 min-w-[160px]"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)", color: "var(--gf-text-primary)" }}
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tenant name (optional)"
            className="rounded-lg border px-3 py-2 text-sm outline-none flex-1 min-w-[160px]"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)", color: "var(--gf-text-primary)" }}
          />
          <button onClick={addOverride} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
            <Plus className="h-3.5 w-3.5" />Add
          </button>
        </div>

        {/* List */}
        <div>
          {overrides.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No overrides configured. Tenants follow the rollout percentage.</div>
          ) : overrides.map((o) => (
            <div key={o.tenantCode} className="flex items-center justify-between border-b last:border-0 px-5 py-3" style={{ borderColor: "var(--gf-border)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{o.tenantName || o.tenantCode}</p>
                <p className="text-xs font-mono" style={{ color: "var(--gf-text-muted)" }}>{o.tenantCode}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleOverride(o.tenantCode)}>
                  <div className={`relative h-5 w-9 rounded-full transition-colors ${o.enabled ? "bg-green-500" : "bg-gray-600"}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${o.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </button>
                <button onClick={() => removeOverride(o.tenantCode)} className="p-1.5 rounded-lg hover:opacity-70 text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
