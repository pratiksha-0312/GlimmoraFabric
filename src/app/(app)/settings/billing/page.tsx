"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CreditCard, TrendingUp, FileText, BarChart3,
  ArrowUpRight, X, AlertTriangle, CheckCircle2, Zap, Loader2,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  billingCycle: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  features: string[];
}

interface UsageItem {
  used: number;
  limit: number;
  label: string;
}

const PLANS = [
  { id: "p1", name: "Starter", price: 29, priceLabel: "$29/mo", desc: "For small teams", users: "50 users", highlight: false },
  { id: "p2", name: "Pro", price: 99, priceLabel: "$99/mo", desc: "For growing businesses", users: "200 users", highlight: true },
  { id: "p3", name: "Enterprise", price: 249, priceLabel: "$249/mo", desc: "For large organizations", users: "500 users", highlight: false },
];

// ---------------------------------------------------------------------------
// Upgrade/Downgrade Modal
// ---------------------------------------------------------------------------

function ChangePlanModal({ current, subscriptionId, onClose, onPlanChanged }: { current: string; subscriptionId: string; onClose: () => void; onPlanChanged: (updated: Partial<Subscription>) => void }) {
  const [selected, setSelected] = useState(current);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    const plan = PLANS.find((p) => p.name === selected);
    if (!plan) return;
    setSubmitting(true);
    setError(null);
    try {
      const { subscriptionsApi } = await import("@/lib/api");
      // The static UI plan list uses local IDs; the backend takes a real
      // plan UUID. For now, the PLANS array is used only for display so we
      // pass the local id as plan_id — this should be wired to a real list.
      const data = await subscriptionsApi.update(subscriptionId, { plan_id: plan.id });
      setDone(true);
      onPlanChanged({ planName: plan.name, price: plan.price });
      void data;
      setTimeout(onClose, 1500);
    } catch {
      setError("Failed to update plan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Change Plan</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Plan updated to {selected}!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-5">
              {PLANS.map((p) => (
                <button key={p.name} onClick={() => setSelected(p.name)}
                  className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${selected === p.name ? "ring-2 ring-[var(--gf-accent)]" : ""}`}
                  style={{ borderColor: "var(--gf-border)", backgroundColor: selected === p.name ? "var(--gf-accent-bg)" : "var(--gf-bg-base)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{p.desc} — {p.users}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--gf-accent)" }}>{p.priceLabel}</span>
                </button>
              ))}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button onClick={handleConfirm} disabled={selected === current || submitting}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--gf-accent)" }}>
                {submitting ? "Updating..." : selected === current ? "Current Plan" : `Switch to ${selected}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cancel Subscription Modal
// ---------------------------------------------------------------------------

function CancelModal({ subscriptionId, periodEnd, onClose, onCancelled }: { subscriptionId: string; periodEnd: string; onClose: () => void; onCancelled: (updated: Partial<Subscription>) => void }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { subscriptionsApi } = await import("@/lib/api");
      // Cancellation reason isn't accepted by the backend yet — surfaced
      // here only for the local UX. TODO: pipe through when supported.
      void reason;
      const sub = await subscriptionsApi.cancel(subscriptionId);
      setDone(true);
      onCancelled({ status: sub.status, cancelAtPeriodEnd: true });
      setTimeout(onClose, 1500);
    } catch {
      setError("Failed to cancel. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Subscription cancelled.</p>
            <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>Access continues until {periodEnd}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Cancel Subscription</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>
              Your access will continue until <strong>{periodEnd}</strong>. After that, your account will be downgraded to the free tier.
            </p>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="mb-5">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Reason for cancellation</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Tell us why you're leaving..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Keep Plan</button>
              <button onClick={handleCancel} disabled={submitting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                {submitting ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Record<string, UsageItem> | null>(null);
  const [loading, setLoading] = useState(true);

  const subscriptionId = subscription?.id ?? "sub_default";
  const tenantId = user?.tenantId ?? "default";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { subscriptionsApi, tenantsApi } = await import("@/lib/api");
      // Use the current-tenant subscription endpoint. The legacy code's
      // `subscriptionId` came from local state; now we resolve from server.
      const [sub, usageList] = await Promise.all([
        subscriptionsApi.current().catch(() => null),
        tenantId !== "default"
          ? tenantsApi.getUsage(tenantId).catch(() => [])
          : Promise.resolve([]),
      ]);

      if (sub) {
        const start = sub.start_date;
        const end = sub.end_date ?? "—";
        setSubscription({
          id: sub.id,
          planId: sub.plan_id,
          planName: sub.plan?.name ?? "Subscription",
          price: sub.plan?.price ?? 0,
          currency: sub.plan?.currency ?? "USD",
          billingCycle: sub.billing_cycle,
          status: sub.status,
          currentPeriodStart: start,
          currentPeriodEnd: end,
          cancelAtPeriodEnd: !sub.auto_renew,
          createdAt: sub.created_at,
          features: sub.plan?.features
            ? Object.keys(sub.plan.features).filter((k) =>
                Boolean((sub.plan!.features as Record<string, unknown>)[k]),
              )
            : [],
        });
      }

      // Convert tenant usage rows -> { resource_type: { used, limit, label } }.
      if (Array.isArray(usageList) && usageList.length > 0) {
        const map: Record<string, UsageItem> = {};
        for (const row of usageList) {
          map[row.resource_type] = {
            used: row.used,
            // Backend usage rows don't carry a limit; surface 0 to hide the
            // meter rather than show a misleading bar. TODO: combine with
            // entitlementsApi.check() to get usage_limit per resource.
            limit: 0,
            label: row.resource_type,
          };
        }
        setUsage(map);
      } else {
        setUsage(null);
      }
    } catch {
      // silently fail — UI shows loading state
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };

  const statusLabel = subscription?.cancelAtPeriodEnd ? "Cancelling" : subscription?.status === "active" ? "Active" : (subscription?.status ?? "Unknown");
  const statusColor = subscription?.cancelAtPeriodEnd ? "bg-amber-500/15 text-amber-500" : "bg-green-500/15 text-green-500";

  const usageItems = usage
    ? Object.values(usage).filter((u) => u.limit > 0)
    : [];

  return (
    <AuthGuard allowedRoles={["billing_admin", "tenant_admin"] as UserRole[]}>
    <div className="space-y-6">
      <button onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Billing & Subscription</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage your plan, payment methods, and invoices</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gf-accent)" }} />
        </div>
      ) : !subscription ? (
        <div className="rounded-xl border p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Unable to load subscription details.</p>
        </div>
      ) : (
      <>
      {/* Current Plan Card */}
      <div className="rounded-xl border p-6" style={cardStyle}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--gf-accent-bg)" }}>
              <Zap className="h-7 w-7" style={{ color: "var(--gf-accent)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{subscription.planName} Plan</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor}`}>{statusLabel}</span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>
                ${subscription.price}/{subscription.billingCycle === "Monthly" ? "mo" : "yr"} — Renews on {subscription.currentPeriodEnd}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowChangePlan(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--gf-accent)" }}>
              <TrendingUp className="h-4 w-4" /> Change Plan
            </button>
            <button onClick={() => setShowCancel(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10">
              Cancel
            </button>
          </div>
        </div>

        {subscription.features && subscription.features.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {subscription.features.map((f) => (
            <span key={f} className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>{f}</span>
          ))}
        </div>
        )}
      </div>

      {/* Usage Meters */}
      {usageItems.length > 0 && (
      <div className="rounded-xl border p-6" style={cardStyle}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Usage This Period</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {usageItems.map((u) => {
            const pct = Math.round((u.used / u.limit) * 100);
            const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
            return (
              <div key={u.label} className="rounded-lg border p-4" style={{ borderColor: "var(--gf-border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{u.label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>
                  {u.used > 1000 ? `${(u.used / 1000).toFixed(0)}k` : u.used} / {u.limit > 1000 ? `${(u.limit / 1000).toFixed(0)}k` : u.limit}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => router.push("/settings/billing/payment-methods")}
          className="flex items-center gap-4 rounded-xl border p-5 text-left transition-colors hover:border-[var(--gf-accent)]" style={cardStyle}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Payment Methods</p>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Manage cards and billing details</p>
          </div>
          <ArrowUpRight className="h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
        </button>

        <button onClick={() => router.push("/settings/billing/invoices")}
          className="flex items-center gap-4 rounded-xl border p-5 text-left transition-colors hover:border-[var(--gf-accent)]" style={cardStyle}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Invoices</p>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>View and download past invoices</p>
          </div>
          <ArrowUpRight className="h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
        </button>
      </div>

      {/* Modals */}
      {showChangePlan && <ChangePlanModal current={subscription.planName} subscriptionId={subscription.id} onClose={() => setShowChangePlan(false)} onPlanChanged={(updated) => setSubscription((prev) => prev ? { ...prev, ...updated } : prev)} />}
      {showCancel && <CancelModal subscriptionId={subscription.id} periodEnd={subscription.currentPeriodEnd} onClose={() => setShowCancel(false)} onCancelled={(updated) => setSubscription((prev) => prev ? { ...prev, ...updated } : prev)} />}
      </>
      )}
    </div>
    </AuthGuard>
  );
}
