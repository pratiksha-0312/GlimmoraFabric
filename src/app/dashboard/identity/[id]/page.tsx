"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Mail,
  Shield,
  Calendar,
  Clock,
  Building2,
  KeyRound,
  Pencil,
  UserX,
  UserCheck,
  Copy,
  Check,
  Activity,
  Globe,
  Fingerprint,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive" | "Invited";
  mfa: boolean;
  lastLogin: string;
  tenant: string;
  joinedDate: string;
}

const ALL_USERS: PlatformUser[] = [
  { id: "u1", name: "Ishan Yadav", email: "ishan@glimmora.com", role: "super_admin", status: "Active", mfa: true, lastLogin: "2 min ago", tenant: "Glimmora HQ", joinedDate: "2025-11-01" },
  { id: "u2", name: "Priya Sharma", email: "priya@glimmora.com", role: "platform_engineering_lead", status: "Active", mfa: true, lastLogin: "15 min ago", tenant: "Glimmora HQ", joinedDate: "2025-12-10" },
  { id: "u3", name: "Rahul Verma", email: "rahul@glimmora.com", role: "developer", status: "Active", mfa: true, lastLogin: "1 hr ago", tenant: "Glimmora HQ", joinedDate: "2026-01-05" },
  { id: "u4", name: "Anita Desai", email: "anita@glimmora.com", role: "qa_engineer", status: "Active", mfa: false, lastLogin: "3 hr ago", tenant: "VerifAI", joinedDate: "2026-01-12" },
  { id: "u5", name: "Vikram Singh", email: "vikram@glimmora.com", role: "cto", status: "Active", mfa: true, lastLogin: "1 day ago", tenant: "Glimmora HQ", joinedDate: "2025-12-20" },
  { id: "u6", name: "Neha Gupta", email: "neha@glimmora.com", role: "product_lead", status: "Active", mfa: false, lastLogin: "2 hr ago", tenant: "Diamond Corp", joinedDate: "2026-02-01" },
  { id: "u7", name: "Arjun Mehta", email: "arjun@glimmora.com", role: "ai_prompt_owner", status: "Active", mfa: true, lastLogin: "30 min ago", tenant: "Glimmora HQ", joinedDate: "2026-01-22" },
  { id: "u8", name: "Dev Patel", email: "dev@glimmora.com", role: "tenant_admin", status: "Active", mfa: true, lastLogin: "5 hr ago", tenant: "Tax Solutions", joinedDate: "2026-02-10" },
  { id: "u9", name: "Sara Khan", email: "sara@techvault.com", role: "developer", status: "Invited", mfa: false, lastLogin: "—", tenant: "VerifAI", joinedDate: "2026-03-20" },
  { id: "u10", name: "Ravi Kumar", email: "ravi@glimmora.com", role: "qa_engineer", status: "Inactive", mfa: false, lastLogin: "14 days ago", tenant: "Hospitality Co", joinedDate: "2026-01-30" },
];

const STATUS_COLORS: Record<string, string> = { Active: "#22c55e", Inactive: "#6b7280", Invited: "#f59e0b" };

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["All Modules", "User Management", "Configuration", "Tenant CRUD"],
  tenant_admin: ["Own Tenant", "Users (own)", "Payments", "Workflows", "Documents"],
  developer: ["Services", "API Gateway", "Dev Tools", "AI Platform", "Documents"],
  platform_engineer: ["All Services", "Monitoring", "Config", "API Gateway", "Deployment"],
  qa_engineer: ["Services", "Monitoring", "Dev Tools", "Audit Logs", "Analytics"],
  product_manager: ["Analytics", "Services", "Workflows", "Payments", "Tenants"],
  governance_admin: ["Audit", "Monitoring", "Compliance", "Users", "Tenants"],
  ai_prompt_owner: ["AI Platform", "Prompt Registry", "Dev Tools", "Documents"],
};

// ---------------------------------------------------------------------------
// Info Row
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = ALL_USERS.find((u) => u.id === userId);
    setUser(found ?? null);
  }, [userId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Users className="h-12 w-12 mb-4 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>User Not Found</p>
        <p className="text-sm mt-1 mb-6" style={{ color: "var(--gf-text-secondary)" }}>The user you are looking for does not exist or has been removed.</p>
        <button onClick={() => router.push("/dashboard/identity")} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Users
        </button>
      </div>
    );
  }

  const rc = ROLE_COLORS[user.role];
  const statusColor = STATUS_COLORS[user.status];
  const permissions = ROLE_PERMISSIONS[user.role] ?? [];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => router.push("/dashboard/identity")} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" />Back to Users &amp; Access
      </button>

      {/* Header Card */}
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{user.name}</h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${rc.bg} ${rc.text}`}>{ROLE_LABELS[user.role]}</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />{user.status}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${user.mfa ? "bg-green-500/15 text-green-500" : "bg-gray-500/15 text-gray-400"}`}>
                  MFA {user.mfa ? "Enabled" : "Disabled"}
                </span>
                <button onClick={handleCopyId} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono transition-colors hover:opacity-70" style={{ color: "var(--gf-text-muted)", backgroundColor: "var(--gf-bg-elevated)" }}>
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}{userId}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/dashboard/identity/${userId}/edit`)} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Pencil className="h-4 w-4" />Edit
            </button>
            {user.status === "Active" && (
              <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-amber-600 text-white transition-colors hover:bg-amber-700">
                <UserX className="h-4 w-4" />Deactivate
              </button>
            )}
            {user.status === "Inactive" && (
              <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-green-600 text-white transition-colors hover:bg-green-700">
                <UserCheck className="h-4 w-4" />Activate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Clock className="h-5 w-5" />, label: "Last Login", value: user.lastLogin },
          { icon: <Calendar className="h-5 w-5" />, label: "Joined", value: user.joinedDate },
          { icon: <Fingerprint className="h-5 w-5" />, label: "MFA Status", value: user.mfa ? "Enabled" : "Disabled" },
          { icon: <Activity className="h-5 w-5" />, label: "Sessions", value: user.status === "Active" ? "1 active" : "None" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 rounded-xl border p-5" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{stat.icon}</div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{stat.label}</p>
              <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>General Information</h2>
          <InfoRow icon={<Users className="h-4 w-4" />} label="Full Name" value={user.name} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
          <InfoRow icon={<Shield className="h-4 w-4" />} label="Role" value={ROLE_LABELS[user.role]} />
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Tenant" value={user.tenant} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Joined" value={user.joinedDate} />
        </div>

        {/* Permissions */}
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Permissions ({ROLE_LABELS[user.role]})</h2>
          <div className="space-y-2">
            {permissions.map((p) => (
              <div key={p} className="flex items-center gap-2 py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                <Check className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: "Logged in from Chrome on Windows", time: user.lastLogin },
              { action: "Updated profile settings", time: "2 days ago" },
              { action: "Generated new API key", time: "5 days ago" },
              { action: "Changed password", time: "2 weeks ago" },
              { action: "Enabled two-factor authentication", time: "1 month ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                <p className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{item.action}</p>
                <span className="text-xs shrink-0 ml-4" style={{ color: "var(--gf-text-muted)" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Security Settings</h2>
          <div className="space-y-3">
            {[
              { label: "Multi-Factor Authentication", value: user.mfa ? "Enabled" : "Disabled", color: user.mfa ? "#22c55e" : "#ef4444" },
              { label: "Password Last Changed", value: "2 weeks ago", color: "var(--gf-text-primary)" },
              { label: "Active Sessions", value: user.status === "Active" ? "1" : "0", color: "var(--gf-text-primary)" },
              { label: "API Keys", value: "2 active", color: "var(--gf-text-primary)" },
              { label: "IP Restriction", value: "Not configured", color: "var(--gf-text-muted)" },
              { label: "Last Password Reset", value: "2026-03-15", color: "var(--gf-text-primary)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                <span className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{item.label}</span>
                <span className="text-sm font-medium" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
