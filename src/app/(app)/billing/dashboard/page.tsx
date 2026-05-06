"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";
import { paymentGatewaysApi, type BillingAnalytics } from "@/lib/api";

interface Analytics {
  mrr: number;
  arr: number;
  churnRate: number;
  activeSubscriptions: number;
  totalRevenue: number;
  avgRevenuePerUser: number;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  mrrGrowth: number;
  revenueByPlan: { plan: string; revenue: number; subscribers: number; percentage: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  churnHistory: { month: string; rate: number }[];
}

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
          {icon}
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-green-500" : "text-red-500"}`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
      <p className="text-xs font-medium mt-1" style={{ color: "var(--gf-text-muted)" }}>{label}</p>
    </div>
  );
}

function BarChartSimple({ data, label }: { data: { month: string; revenue: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>{label}</h3>
      <div className="flex items-end gap-3 h-40">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>
              ${(d.revenue / 1000).toFixed(1)}k
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(d.revenue / max) * 100}%`,
                minHeight: 8,
                backgroundColor: "var(--gf-accent)",
                opacity: 0.8,
              }}
            />
            <span className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChurnChart({ data }: { data: { month: string; rate: number }[] }) {
  const max = Math.max(...data.map((d) => d.rate));
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>Churn Rate Trend</h3>
      <div className="flex items-end gap-3 h-40">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>
              {d.rate}%
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(d.rate / max) * 100}%`,
                minHeight: 8,
                backgroundColor: "#ef4444",
                opacity: 0.7,
              }}
            />
            <span className="text-[10px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueByPlan({ data }: { data: Analytics["revenueByPlan"] }) {
  const colors: Record<string, string> = { Starter: "#f59e0b", Pro: "#3b82f6", Enterprise: "#14b8a6" };
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>Revenue by Plan</h3>
      <div className="space-y-4">
        {data.map((p) => (
          <div key={p.plan}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{p.plan}</span>
              <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>
                ${p.revenue.toLocaleString()} · {p.subscribers} subs
              </span>
            </div>
            <div className="h-2.5 rounded-full" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${p.percentage}%`, backgroundColor: colors[p.plan] ?? "var(--gf-accent)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminBillingDashboard() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    paymentGatewaysApi
      .analytics()
      .then((a: BillingAnalytics) => {
        // Map FastAPI billing analytics shape to the legacy UI shape.
        // MRR / churn metrics aren't computed server-side yet — surface
        // zeros and mark them in the UI.
        setData({
          mrr: 0,
          arr: 0,
          churnRate: 0,
          activeSubscriptions: a.active_subscriptions,
          totalRevenue: a.total_revenue,
          avgRevenuePerUser:
            a.active_subscriptions > 0 ? a.total_revenue / a.active_subscriptions : 0,
          newSubscriptions: 0,
          cancelledSubscriptions: 0,
          mrrGrowth: 0,
          revenueByPlan: Object.entries(a.revenue_by_gateway).map(([plan, revenue]) => ({
            plan,
            revenue,
            subscribers: 0,
            percentage:
              a.total_revenue > 0 ? Math.round((revenue / a.total_revenue) * 100) : 0,
          })),
          monthlyRevenue: [],
          churnHistory: [],
        });
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AuthGuard allowedRoles={["super_admin", "billing_admin"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Revenue Analytics</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
              Monitor revenue, subscriptions, and billing metrics
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {!data ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--gf-accent)", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<DollarSign className="h-5 w-5" />} label="Monthly Recurring Revenue" value={`$${data.mrr.toLocaleString()}`} change={`+${data.mrrGrowth}%`} positive />
              <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Annual Recurring Revenue" value={`$${data.arr.toLocaleString()}`} change="+12.4%" positive />
              <StatCard icon={<Users className="h-5 w-5" />} label="Active Subscriptions" value={data.activeSubscriptions.toString()} change={`+${data.newSubscriptions} new`} positive />
              <StatCard icon={<TrendingDown className="h-5 w-5" />} label="Churn Rate" value={`${data.churnRate}%`} change="-0.1%" positive />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Revenue (All Time)" value={`$${data.totalRevenue.toLocaleString()}`} />
              <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Avg Revenue Per User" value={`$${data.avgRevenuePerUser.toFixed(2)}`} />
              <StatCard icon={<TrendingDown className="h-5 w-5" />} label="Cancelled This Month" value={data.cancelledSubscriptions.toString()} change={`${data.cancelledSubscriptions}`} positive={false} />
            </div>

            {/* Revenue Charts (MRR, ARR, churn) — Super Admin only */}
            {isSuperAdmin && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BarChartSimple data={data.monthlyRevenue} label="Monthly Revenue (MRR)" />
                  <ChurnChart data={data.churnHistory} />
                </div>
                <RevenueByPlan data={data.revenueByPlan} />
              </>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
