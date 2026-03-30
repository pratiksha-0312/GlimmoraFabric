"use client";

import {
  Users,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Lock,
  Clock,
  ShieldAlert,
  MoreVertical,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/roles";

const stats = [
  { label: "Total Users", value: "482", icon: Users },
  { label: "Active Roles", value: "8", icon: ShieldCheck },
  { label: "MFA Enabled", value: "82%", icon: KeyRound },
  { label: "Pending Invites", value: "5", icon: UserPlus },
];

interface PlatformUser {
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive" | "Invited";
  mfa: boolean;
  lastLogin: string;
}

const users: PlatformUser[] = [
  { name: "Ishan Yadav", email: "ishan@glimmora.com", role: "super_admin", status: "Active", mfa: true, lastLogin: "2 min ago" },
  { name: "Priya Sharma", email: "priya@glimmora.com", role: "platform_engineer", status: "Active", mfa: true, lastLogin: "15 min ago" },
  { name: "Rahul Verma", email: "rahul@glimmora.com", role: "developer", status: "Active", mfa: true, lastLogin: "1 hr ago" },
  { name: "Anita Desai", email: "anita@glimmora.com", role: "qa_engineer", status: "Active", mfa: false, lastLogin: "3 hr ago" },
  { name: "Vikram Singh", email: "vikram@glimmora.com", role: "governance_admin", status: "Active", mfa: true, lastLogin: "1 day ago" },
  { name: "Neha Gupta", email: "neha@glimmora.com", role: "product_manager", status: "Active", mfa: false, lastLogin: "2 hr ago" },
  { name: "Arjun Mehta", email: "arjun@glimmora.com", role: "ai_prompt_owner", status: "Active", mfa: true, lastLogin: "30 min ago" },
  { name: "Dev Patel", email: "dev@glimmora.com", role: "tenant_admin", status: "Active", mfa: true, lastLogin: "5 hr ago" },
  { name: "Sara Khan", email: "sara@techvault.com", role: "developer", status: "Invited", mfa: false, lastLogin: "—" },
  { name: "Ravi Kumar", email: "ravi@glimmora.com", role: "qa_engineer", status: "Inactive", mfa: false, lastLogin: "14 days ago" },
];

const statusColors: Record<PlatformUser["status"], string> = {
  Active: "#22c55e",
  Inactive: "#6b7280",
  Invited: "#f59e0b",
};

const rolePermissions: { role: string; permissions: string[] }[] = [
  { role: "Super Admin", permissions: ["All Modules", "User Management", "Configuration", "Tenant CRUD"] },
  { role: "Tenant Admin", permissions: ["Own Tenant", "Users (own)", "Payments", "Workflows", "Documents"] },
  { role: "Developer", permissions: ["Services", "API Gateway", "Dev Tools", "AI Platform", "Documents"] },
  { role: "Platform Engineer", permissions: ["All Services", "Monitoring", "Config", "API Gateway", "Deployment"] },
  { role: "QA Engineer", permissions: ["Services", "Monitoring", "Dev Tools", "Audit Logs", "Analytics"] },
  { role: "Product Manager", permissions: ["Analytics", "Services", "Workflows", "Payments", "Tenants"] },
  { role: "Governance Admin", permissions: ["Audit", "Monitoring", "Compliance", "Users", "Tenants"] },
  { role: "AI Prompt Owner", permissions: ["AI Platform", "Prompt Registry", "Dev Tools", "Documents"] },
];

const securityPolicies = [
  { title: "Password Policy", description: "Min 12 chars, uppercase, number, special", icon: Lock },
  { title: "Session Timeout", description: "30 min inactive, max 8 hr", icon: Clock },
  { title: "MFA Enforcement", description: "Required for Admin & Engineer roles", icon: ShieldAlert },
];

export function IdentityContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            Users &amp; Access
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
            User management, RBAC roles, permissions, and security policies
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
              <span className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
                {stat.value}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* User List */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          User List
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  {["User", "Role", "Status", "MFA", "Last Login"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const rc = ROLE_COLORS[u.role];
                  return (
                    <tr key={u.email} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{u.name}</p>
                          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{u.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.text}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: statusColors[u.status] }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[u.status] }} />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: u.mfa ? "#22c55e" : "var(--gf-text-muted)" }}>
                        {u.mfa ? "Enabled" : "Disabled"}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                        {u.lastLogin}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role-Permission Matrix */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              Role &amp; Permission Mapping
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Role", "Permissions"].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rolePermissions.map((rp) => (
                <tr key={rp.role} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-5 py-3 font-medium whitespace-nowrap" style={{ color: "var(--gf-text-primary)" }}>
                    {rp.role}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rp.permissions.map((p) => (
                        <span key={p} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Security Policies */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>
            Security Policies
          </h2>
          <div className="space-y-4">
            {securityPolicies.map((policy) => (
              <div
                key={policy.title}
                className="rounded-lg p-4"
                style={{ border: "1px solid var(--gf-border)" }}
              >
                <div className="flex items-center gap-3">
                  <policy.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                      {policy.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>
                      {policy.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
