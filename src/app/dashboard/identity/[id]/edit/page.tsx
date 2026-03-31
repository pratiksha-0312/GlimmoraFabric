"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Save } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

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
  { id: "u2", name: "Priya Sharma", email: "priya@glimmora.com", role: "platform_engineer", status: "Active", mfa: true, lastLogin: "15 min ago", tenant: "Glimmora HQ", joinedDate: "2025-12-10" },
  { id: "u3", name: "Rahul Verma", email: "rahul@glimmora.com", role: "developer", status: "Active", mfa: true, lastLogin: "1 hr ago", tenant: "Glimmora HQ", joinedDate: "2026-01-05" },
  { id: "u4", name: "Anita Desai", email: "anita@glimmora.com", role: "qa_engineer", status: "Active", mfa: false, lastLogin: "3 hr ago", tenant: "VerifAI", joinedDate: "2026-01-12" },
  { id: "u5", name: "Vikram Singh", email: "vikram@glimmora.com", role: "governance_admin", status: "Active", mfa: true, lastLogin: "1 day ago", tenant: "Glimmora HQ", joinedDate: "2025-12-20" },
  { id: "u6", name: "Neha Gupta", email: "neha@glimmora.com", role: "product_manager", status: "Active", mfa: false, lastLogin: "2 hr ago", tenant: "Diamond Corp", joinedDate: "2026-02-01" },
  { id: "u7", name: "Arjun Mehta", email: "arjun@glimmora.com", role: "ai_prompt_owner", status: "Active", mfa: true, lastLogin: "30 min ago", tenant: "Glimmora HQ", joinedDate: "2026-01-22" },
  { id: "u8", name: "Dev Patel", email: "dev@glimmora.com", role: "tenant_admin", status: "Active", mfa: true, lastLogin: "5 hr ago", tenant: "Tax Solutions", joinedDate: "2026-02-10" },
  { id: "u9", name: "Sara Khan", email: "sara@techvault.com", role: "developer", status: "Invited", mfa: false, lastLogin: "—", tenant: "VerifAI", joinedDate: "2026-03-20" },
  { id: "u10", name: "Ravi Kumar", email: "ravi@glimmora.com", role: "qa_engineer", status: "Inactive", mfa: false, lastLogin: "14 days ago", tenant: "Hospitality Co", joinedDate: "2026-01-30" },
];

const ALL_ROLES: UserRole[] = [
  "super_admin", "tenant_admin", "developer", "platform_engineer",
  "qa_engineer", "product_manager", "governance_admin", "ai_prompt_owner",
];

const STATUSES = ["Active", "Inactive", "Invited"] as const;
const TENANTS = ["Glimmora HQ", "VerifAI", "Diamond Corp", "Hospitality Co", "Tax Solutions", "Aero Systems"];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "developer" as UserRole,
    status: "Active" as (typeof STATUSES)[number],
    tenant: "Glimmora HQ",
    mfa: false,
  });

  useEffect(() => {
    const found = ALL_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      setForm({
        name: found.name,
        email: found.email,
        role: found.role,
        status: found.status,
        tenant: found.tenant,
        mfa: found.mfa,
      });
    }
  }, [userId]);

  const update = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push(`/dashboard/identity/${userId}`), 1500);
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Users className="h-12 w-12 mb-4 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>User Not Found</p>
        <button onClick={() => router.push("/dashboard/identity")} className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Users
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 mb-4">
          <Save className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Changes Saved!</h2>
        <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
          <strong>{form.name}</strong> has been updated. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button onClick={() => router.push(`/dashboard/identity/${userId}`)} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" />Back to User Details
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Edit User</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          Update details for <strong>{user.name}</strong>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>User Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email *</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Role, Status, Tenant */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Access & Role</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role</label>
              <select value={form.role} onChange={(e) => update("role", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant</label>
              <select value={form.tenant} onChange={(e) => update("tenant", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {TENANTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* MFA */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Security</h3>
          <button
            type="button"
            onClick={() => update("mfa", !form.mfa)}
            className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors"
            style={fieldStyle}
          >
            <div className={`relative h-5 w-9 rounded-full transition-colors ${form.mfa ? "bg-green-500" : "bg-gray-600"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.mfa ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span>Multi-Factor Authentication: {form.mfa ? "Enabled" : "Disabled"}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button type="button" onClick={() => router.push(`/dashboard/identity/${userId}`)} className="rounded-lg px-5 py-2.5 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60" style={{ backgroundColor: "var(--gf-accent)" }}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
