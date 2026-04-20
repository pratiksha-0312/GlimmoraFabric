"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  Globe,
  Users,
  Mail,
  Calendar,
  Activity,
  Shield,
  Server,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types (shared with tenants-content)
// ---------------------------------------------------------------------------

interface Tenant {
  id: string;
  name: string;
  plan: "Enterprise" | "Pro" | "Starter";
  users: number;
  region: string;
  domain: string;
  status: "Active" | "Provisioning" | "Suspended";
  apiCalls: string;
  created: string;
  email: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Mock data (same source as tenants list)
// ---------------------------------------------------------------------------

const ALL_TENANTS: Tenant[] = [
  { id: "t1", name: "Glimmora HQ", plan: "Enterprise", users: 120, region: "US-East", domain: "app.glimmora.com", status: "Active", apiCalls: "324K", created: "2026-01-10", email: "admin@glimmora.com", description: "Primary headquarters tenant" },
  { id: "t2", name: "VerifAI", plan: "Pro", users: 85, region: "US-West", domain: "verifai.glimmora.io", status: "Active", apiCalls: "218K", created: "2026-01-18", email: "ops@verifai.com", description: "AI verification platform" },
  { id: "t3", name: "Diamond Corp", plan: "Pro", users: 62, region: "EU-West", domain: "diamond.glimmora.io", status: "Active", apiCalls: "156K", created: "2026-02-05", email: "it@diamondcorp.com", description: "European diamond trading" },
  { id: "t4", name: "Hospitality Co", plan: "Starter", users: 34, region: "AP-South", domain: "hospitality.glimmora.io", status: "Active", apiCalls: "89K", created: "2026-02-20", email: "tech@hospitality.co", description: "Hospitality management" },
  { id: "t5", name: "Tax Solutions", plan: "Pro", users: 48, region: "US-East", domain: "tax.glimmora.io", status: "Active", apiCalls: "67K", created: "2026-03-01", email: "dev@taxsolutions.com", description: "Tax filing and compliance" },
  { id: "t6", name: "Aero Systems", plan: "Enterprise", users: 133, region: "EU-Central", domain: "aero.glimmora.io", status: "Provisioning", apiCalls: "—", created: "2026-03-15", email: "platform@aerosys.io", description: "Aerospace systems integration" },
];

const PLAN_BADGE: Record<string, { bg: string; color: string }> = {
  Enterprise: { bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6" },
  Pro: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
  Starter: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
};

const STATUS_COLOR: Record<string, string> = {
  Active: "#22c55e",
  Provisioning: "#f59e0b",
  Suspended: "#ef4444",
};

// ---------------------------------------------------------------------------
// Info Row helper
// ---------------------------------------------------------------------------

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
      <div className="mt-0.5" style={{ color: "var(--gf-accent)" }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>{label}</p>
        <p className="text-sm font-medium mt-0.5" style={{ color: "var(--gf-text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = ALL_TENANTS.find((t) => t.id === tenantId);
    setTenant(found ?? null);
  }, [tenantId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(tenantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 mb-4 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Tenant Not Found</p>
        <p className="text-sm mt-1 mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          The tenant you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/tenants")}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ backgroundColor: "var(--gf-accent)", color: "white" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </button>
      </div>
    );
  }

  const planStyle = PLAN_BADGE[tenant.plan];
  const statusColor = STATUS_COLOR[tenant.status];
  const maxSeats = tenant.plan === "Enterprise" ? 500 : tenant.plan === "Pro" ? 200 : 50;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/tenants")}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenants
      </button>

      {/* Header Card */}
      <div
        className="rounded-xl border p-6"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold"
              style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
            >
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{tenant.name}</h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{tenant.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: planStyle.bg, color: planStyle.color }}
                >
                  {tenant.plan}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                  {tenant.status}
                </span>
                <button
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono transition-colors hover:opacity-70"
                  style={{ color: "var(--gf-text-muted)", backgroundColor: "var(--gf-bg-elevated)" }}
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {tenantId}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/tenants/${tenantId}/settings`)}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            {tenant.status === "Active" && (
              <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-amber-600 text-white transition-colors hover:bg-amber-700">
                <Ban className="h-4 w-4" />
                Suspend
              </button>
            )}
            {tenant.status === "Suspended" && (
              <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-green-600 text-white transition-colors hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Activate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users className="h-5 w-5" />, label: "Users", value: tenant.users.toString(), detail: `of ${maxSeats} seats` },
          { icon: <Activity className="h-5 w-5" />, label: "API Calls", value: tenant.apiCalls, detail: "this month" },
          { icon: <Server className="h-5 w-5" />, label: "Storage", value: "12.4 GB", detail: "of 50 GB" },
          { icon: <Shield className="h-5 w-5" />, label: "Uptime", value: "99.97%", detail: "last 30 days" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border p-5"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{stat.label}</p>
              <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{stat.value}</p>
              {stat.detail && <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{stat.detail}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>General Information</h2>
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Tenant Name" value={tenant.name} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Admin Email" value={tenant.email} />
          <InfoRow icon={<Globe className="h-4 w-4" />} label="Domain" value={tenant.domain} />
          <InfoRow icon={<Globe className="h-4 w-4" />} label="Region" value={tenant.region} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Created" value={tenant.created} />
        </div>

        {/* Usage & Limits */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Usage & Limits</h2>
          <div className="space-y-4">
            {[
              { label: "User Seats", value: `${tenant.users} / ${maxSeats}`, pct: (tenant.users / maxSeats) * 100 },
              { label: "Storage", value: "12.4 GB / 50 GB", pct: 24.8 },
              { label: "API Rate", value: "80% of limit", pct: 80 },
              { label: "Bandwidth", value: "45 GB / 100 GB", pct: 45 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "var(--gf-text-secondary)" }}>{item.label}</span>
                  <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.value}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.pct > 85 ? "#ef4444" : item.pct > 70 ? "#f59e0b" : "var(--gf-accent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: "User login", who: "admin@" + tenant.domain.split(".")[0] + ".com", time: "2 min ago" },
              { action: "API key rotated", who: "System", time: "1 hour ago" },
              { action: "New user invited", who: "admin@" + tenant.domain.split(".")[0] + ".com", time: "3 hours ago" },
              { action: "Plan upgraded", who: "billing@" + tenant.domain.split(".")[0] + ".com", time: "2 days ago" },
              { action: "Webhook configured", who: "dev@" + tenant.domain.split(".")[0] + ".com", time: "5 days ago" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--gf-border)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.action}</p>
                  <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{item.who}</p>
                </div>
                <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Configuration</h2>
          <div className="space-y-3">
            {[
              { label: "SSO Enabled", value: tenant.plan === "Enterprise" ? "Yes" : "No (requires Enterprise)" },
              { label: "Custom Domain", value: tenant.domain },
              { label: "Data Residency", value: tenant.region },
              { label: "Backup Schedule", value: "Daily at 02:00 UTC" },
              { label: "Retention Policy", value: "90 days" },
              { label: "IP Allowlist", value: tenant.plan === "Enterprise" ? "Configured (3 ranges)" : "Not available" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--gf-border)" }}
              >
                <span className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{item.label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
