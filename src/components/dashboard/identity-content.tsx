"use client";

import {
  Users,
  KeyRound,
  ShieldCheck,
  Coins,
  Lock,
  Clock,
  ShieldAlert,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const stats = [
  { label: "Active Users", value: "248", icon: Users },
  { label: "SSO Providers", value: "3", detail: "Google, Microsoft, SAML", icon: KeyRound },
  { label: "MFA Enabled", value: "82%", icon: ShieldCheck },
  { label: "API Tokens", value: "34", icon: Coins },
];

const authEvents = [
  { user: "Ishan Yadav", action: "Login via SSO", ip: "192.168.1.1", time: "2 min ago" },
  { user: "Priya Sharma", action: "MFA Challenge Passed", ip: "10.0.0.42", time: "8 min ago" },
  { user: "Alex Chen", action: "API Token Created", ip: "172.16.5.12", time: "15 min ago" },
  { user: "Maria Lopez", action: "Password Reset", ip: "192.168.1.87", time: "23 min ago" },
  { user: "James Walker", action: "Login via OAuth2", ip: "10.0.0.99", time: "31 min ago" },
];

const securityPolicies = [
  {
    title: "Password Policy",
    description: "Min 12 chars, uppercase, number, special",
    icon: Lock,
  },
  {
    title: "Session Timeout",
    description: "30 min inactive",
    icon: Clock,
  },
  {
    title: "MFA Enforcement",
    description: "Required for Admin+",
    icon: ShieldAlert,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IdentityContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Identity &amp; Access
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          SSO, RBAC, MFA, OAuth2/OIDC, API tokens, tenant identity
        </p>
      </div>

      {/* Stats row */}
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
            {stat.detail && (
              <p className="mt-0.5 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                {stat.detail}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Auth Events table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
      >
        <div className="p-5 pb-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Recent Auth Events
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["User", "Action", "IP Address", "Time"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-2 text-left text-xs font-medium"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {authEvents.map((event, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: idx < authEvents.length - 1 ? "1px solid var(--gf-border)" : undefined }}
                >
                  <td className="px-5 py-3" style={{ color: "var(--gf-text-primary)" }}>
                    {event.user}
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--gf-text-primary)" }}>
                    {event.action}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {event.ip}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {event.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Policies */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Security Policies
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {securityPolicies.map((policy) => (
            <div
              key={policy.title}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <policy.icon className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
              <h3 className="mt-4 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                {policy.title}
              </h3>
              <p className="mt-1 text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                {policy.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
