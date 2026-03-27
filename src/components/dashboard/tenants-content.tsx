"use client";

import { Building2, Plus, Globe, Users } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Tenant {
  name: string;
  plan: "Enterprise" | "Pro" | "Starter";
  users: number;
  region: string;
  status: "Active" | "Provisioning" | "Suspended";
  created: string;
}

const tenants: Tenant[] = [
  { name: "Glimmora HQ", plan: "Enterprise", users: 120, region: "US-East", status: "Active", created: "Jan 2026" },
  { name: "VerifAI", plan: "Pro", users: 85, region: "US-West", status: "Active", created: "Jan 2026" },
  { name: "Diamond Corp", plan: "Pro", users: 62, region: "EU-West", status: "Active", created: "Feb 2026" },
  { name: "Hospitality Co", plan: "Starter", users: 34, region: "AP-South", status: "Active", created: "Feb 2026" },
  { name: "Tax Solutions", plan: "Pro", users: 48, region: "US-East", status: "Active", created: "Mar 2026" },
  { name: "Aero Systems", plan: "Enterprise", users: 133, region: "EU-Central", status: "Provisioning", created: "Mar 2026" },
];

const PLAN_BADGE_STYLES: Record<Tenant["plan"], { bg: string; color: string }> = {
  Enterprise: { bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6" },
  Pro:        { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  Starter:    { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
};

const STATUS_DOT_COLORS: Record<Tenant["status"], string> = {
  Active:       "#22c55e",
  Provisioning: "#f59e0b",
  Suspended:    "#ef4444",
};

// ---------------------------------------------------------------------------
// Stats card
// ---------------------------------------------------------------------------

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string | number; detail?: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border p-5"
      style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
        {detail && (
          <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{detail}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TenantsContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            Tenant Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            Multi-tenant onboarding, plans, entitlements, and isolation configuration
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          style={{ backgroundColor: "var(--gf-accent)", color: "var(--gf-text-primary)" }}
        >
          <Plus className="h-4 w-4" />
          Create Tenant
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Active Tenants" value={6} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={482} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Plans" value={3} detail="Starter / Pro / Enterprise" />
        <StatCard icon={<Globe className="h-5 w-5" />} label="Regions" value={4} />
      </div>

      {/* Tenants Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        <table className="w-full">
          <thead>
            <tr
              className="text-xs uppercase"
              style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}
            >
              <th className="px-6 py-3 text-left font-medium">Tenant Name</th>
              <th className="px-6 py-3 text-left font-medium">Plan</th>
              <th className="px-6 py-3 text-left font-medium">Users</th>
              <th className="px-6 py-3 text-left font-medium">Region</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const planStyle = PLAN_BADGE_STYLES[tenant.plan];
              const statusColor = STATUS_DOT_COLORS[tenant.status];

              return (
                <tr
                  key={tenant.name}
                  className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: "var(--gf-border)" }}
                >
                  {/* Tenant Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
                      >
                        {tenant.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
                        {tenant.name}
                      </span>
                    </div>
                  </td>

                  {/* Plan badge */}
                  <td className="px-6 py-4">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: planStyle.bg, color: planStyle.color }}
                    >
                      {tenant.plan}
                    </span>
                  </td>

                  {/* Users */}
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-primary)" }}>
                    {tenant.users}
                  </td>

                  {/* Region */}
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                    {tenant.region}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      <span className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                        {tenant.status}
                      </span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                    {tenant.created}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
