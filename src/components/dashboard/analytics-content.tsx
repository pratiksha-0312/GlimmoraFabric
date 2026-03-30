"use client";

import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const kpis = [
  { label: "Total Revenue", value: "$482,500", change: "+18.2%", up: true, icon: DollarSign },
  { label: "Active Users", value: "12,847", change: "+7.4%", up: true, icon: Users },
  { label: "API Calls (MTD)", value: "1.24M", change: "+24.1%", up: true, icon: Activity },
  { label: "Avg. Response Time", value: "142ms", change: "-12.3%", up: true, icon: TrendingUp },
];

const productMetrics = [
  { product: "VerifAI", users: "3,240", revenue: "$142,000", apiCalls: "412K", growth: "+22%" },
  { product: "Hospitality Cloud", users: "2,180", revenue: "$98,500", apiCalls: "285K", growth: "+15%" },
  { product: "Finance Platform", users: "4,120", revenue: "$186,000", apiCalls: "356K", growth: "+11%" },
  { product: "Diamond Grading", users: "890", revenue: "$34,200", apiCalls: "98K", growth: "+28%" },
  { product: "Tax Engine", users: "1,640", revenue: "$21,800", apiCalls: "89K", growth: "+9%" },
];

const serviceUsage = [
  { service: "Identity & Access", calls: "324K", uptime: "99.98%", avgLatency: "45ms" },
  { service: "Notification Hub", calls: "218K", uptime: "99.95%", avgLatency: "120ms" },
  { service: "Payment Orchestration", calls: "89K", uptime: "99.99%", avgLatency: "230ms" },
  { service: "Workflow Engine", calls: "156K", uptime: "99.92%", avgLatency: "85ms" },
  { service: "AI Platform", calls: "198K", uptime: "99.90%", avgLatency: "1.2s" },
  { service: "Document Service", calls: "67K", uptime: "99.96%", avgLatency: "340ms" },
];

const costAllocation = [
  { tenant: "Acme Corp", plan: "Enterprise", usage: "$12,400", tokens: "480K" },
  { tenant: "TechVault", plan: "Business", usage: "$8,200", tokens: "312K" },
  { tenant: "GlobalFinance", plan: "Enterprise", usage: "$15,600", tokens: "620K" },
  { tenant: "DataShield", plan: "Starter", usage: "$2,100", tokens: "84K" },
  { tenant: "CloudBase", plan: "Business", usage: "$6,800", tokens: "256K" },
];

export function AnalyticsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Analytics &amp; Reports
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Cross-product metrics, usage dashboards, and cost allocation
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                {kpi.label}
              </span>
              <kpi.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--gf-text-primary)" }}>
              {kpi.value}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {kpi.up ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${kpi.up ? "text-green-500" : "text-red-500"}`}>
                {kpi.change}
              </span>
              <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Product Metrics */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Product Metrics
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Product", "Active Users", "Revenue (MTD)", "API Calls", "Growth"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productMetrics.map((pm) => (
                <tr key={pm.product} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {pm.product}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{pm.users}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{pm.revenue}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{pm.apiCalls}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-green-500">{pm.growth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service Usage */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Fabric Service Usage
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Service", "Calls (MTD)", "Uptime", "Avg Latency"].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serviceUsage.map((su) => (
                <tr key={su.service} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{su.service}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{su.calls}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-green-500">{su.uptime}</span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{su.avgLatency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost Allocation */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Cost Allocation by Tenant
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Tenant", "Plan", "Usage (MTD)", "AI Tokens"].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costAllocation.map((ca) => (
                <tr key={ca.tenant} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{ca.tenant}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}
                    >
                      {ca.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--gf-text-primary)" }}>{ca.usage}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{ca.tokens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
