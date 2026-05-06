"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Users, Zap, HardDrive, Workflow } from "lucide-react";

interface UsageMetric {
  used: number;
  limit: number; // -1 = unlimited
  label: string;
}

interface UsageResponse {
  users: UsageMetric;
  apiCalls: UsageMetric;
  storage: UsageMetric;
  workflows: UsageMetric;
}

interface Tenant {
  id: string;
  name: string;
  plan: string;
}

const ICON_MAP: Record<string, typeof Users> = {
  users: Users,
  apiCalls: Zap,
  storage: HardDrive,
  workflows: Workflow,
};

export function TenantUsageDashboard({ tenantId }: { tenantId: string }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { tenantsApi } = await import("@/lib/api");
        const [t, usageRows] = await Promise.all([
          tenantsApi.get(tenantId).catch(() => null),
          tenantsApi.getUsage(tenantId).catch(() => [] as Awaited<ReturnType<typeof tenantsApi.getUsage>>),
        ]);
        if (t) {
          // The backend tenant doesn't carry a "plan" field on the row —
          // surface a placeholder until we wire the tenant→subscription
          // join through entitlementsApi.
          setTenant({ id: t.id, name: t.name, plan: "—" });
        }
        // Aggregate usage rows by resource_type. Backend doesn't return a
        // limit on the usage endpoint, so we surface limit:-1 ("unlimited")
        // and callers can layer entitlementsApi.check() on top for quotas.
        if (Array.isArray(usageRows) && usageRows.length > 0) {
          const sumByType: Record<string, number> = {};
          for (const row of usageRows) {
            sumByType[row.resource_type] = (sumByType[row.resource_type] ?? 0) + row.used;
          }
          setUsage({
            users: { used: sumByType.users ?? 0, limit: -1, label: "Users" },
            apiCalls: { used: sumByType.api_calls ?? sumByType.apiCalls ?? 0, limit: -1, label: "API Calls" },
            storage: { used: sumByType.storage ?? 0, limit: -1, label: "Storage (GB)" },
            workflows: { used: sumByType.workflows ?? 0, limit: -1, label: "Workflows" },
          });
        }
      } catch {
        /* handled in render */
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  if (loading) return <div className="p-10 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading usage…</div>;

  const metrics: Array<{ key: keyof UsageResponse; metric: UsageMetric }> = usage
    ? [
        { key: "users", metric: usage.users },
        { key: "apiCalls", metric: usage.apiCalls },
        { key: "storage", metric: usage.storage },
        { key: "workflows", metric: usage.workflows },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/tenants/${tenantId}`} className="flex items-center justify-center rounded-lg border h-9 w-9 hover:opacity-70" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
              {tenant?.name ?? "Tenant"} — Usage
            </h1>
          </div>
          {tenant?.plan && (
            <p className="mt-0.5 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
              Current plan: <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{tenant.plan}</span>
            </p>
          )}
        </div>
      </div>

      {!usage && (
        <div className="rounded-xl border p-10 text-center text-sm" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-muted)" }}>
          Usage data unavailable.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map(({ key, metric }) => {
          const Icon = ICON_MAP[key] ?? BarChart3;
          const unlimited = metric.limit < 0;
          const pct = unlimited ? 0 : Math.min(100, Math.round((metric.used / metric.limit) * 100));
          const warn = !unlimited && pct >= 80;
          const barColor = unlimited ? "#6366f1" : warn ? "#f59e0b" : "#22c55e";
          return (
            <div key={key} className="rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{metric.label}</p>
                    <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                      {unlimited ? "Unlimited" : `${pct}% of limit`}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--gf-text-primary)" }}>
                  {metric.used.toLocaleString()}
                  {!unlimited && <span className="text-sm font-normal ml-1" style={{ color: "var(--gf-text-muted)" }}>/ {metric.limit.toLocaleString()}</span>}
                </p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${unlimited ? 50 : pct}%`, backgroundColor: barColor, opacity: unlimited ? 0.5 : 1 }} />
              </div>
              {warn && (
                <p className="mt-2 text-xs font-medium" style={{ color: "#f59e0b" }}>
                  Approaching limit — consider upgrading the plan.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
