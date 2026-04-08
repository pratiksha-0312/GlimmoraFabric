"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, X } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import { AuthGuard } from "@/components/auth/auth-guard";

interface PlatformUser {
  id: string;
  code: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: "Active" | "Inactive" | "Invited";
  mfa: boolean;
  lastLogin: string;
  tenant: string;
  joinedDate: string;
}

const SUPER_ADMIN_ROLES: UserRole[] = ["auditor", "workflow_manager"];

const LANGUAGES = [
  "English, United States", "English, United Kingdom", "Spanish", "French",
  "German", "Portuguese", "Japanese", "Chinese (Simplified)", "Arabic", "Hindi",
];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Qatar", "Asia/Dubai", "Asia/Tokyo", "Asia/Shanghai",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Pacific/Auckland",
];

const STATUSES: PlatformUser["status"][] = ["Active", "Inactive", "Invited"];

export default function SuperAdminUserEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(SUPER_ADMIN_ROLES[0]);
  const [status, setStatus] = useState<PlatformUser["status"]>("Active");
  const [mfa, setMfa] = useState(false);
  const [language, setLanguage] = useState("English, United States");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [blocked, setBlocked] = useState(false);
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data: PlatformUser) => {
        setUser(data);
        setName(data.name);
        setUsername(data.email.split("@")[0]);
        setEmail(data.email);
        setRole(data.role);
        setStatus(data.status);
        setMfa(data.mfa);
        setBlocked(data.status === "Inactive");
        setActive(data.status === "Active");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  const RadioGroup = ({ label, radioName, value, onChange }: { label: string; radioName: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div>
      <span className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>{label}</span>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name={radioName} checked={value === true} onChange={() => onChange(true)} className="accent-[var(--gf-accent)]" />
          <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Yes</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name={radioName} checked={value === false} onChange={() => onChange(false)} className="accent-[var(--gf-accent)]" />
          <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>No</span>
        </label>
      </div>
    </div>
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (password && password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload: Record<string, unknown> = { name, email, role, status, mfa, tenant: user?.tenant };
    if (password.trim()) payload.password = password;
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    router.push("/admin/users");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Users className="h-12 w-12 mb-4 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>User Not Found</p>
        <button onClick={() => router.push("/admin/users")} className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Users
        </button>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["super_admin"] as UserRole[]}>
      <div className="space-y-6 max-w-2xl">
        <button onClick={() => router.push("/admin/users")} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Users
        </button>

        <div className="rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Edit User</h2>
            <button onClick={() => router.push("/admin/users")} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Account Information */}
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Account Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Code</label>
                <input type="text" value={user.code || user.id} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
                <p className="mt-1 text-[11px]" style={{ color: "var(--gf-text-muted)" }}>System-generated</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Type</label>
                <input type="text" value="End User" readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. johndoe"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email Address *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  {SUPER_ADMIN_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
            </div>

            {/* Settings */}
            <h3 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: "var(--gf-text-muted)" }}>Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Time Zone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RadioGroup label="Blocked" radioName="edit-blocked" value={blocked} onChange={setBlocked} />
              <RadioGroup label="Active" radioName="edit-active" value={active} onChange={setActive} />
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as PlatformUser["status"])}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <h3 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: "var(--gf-text-muted)" }}>Change Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => router.push("/admin/users")}
                className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "var(--gf-accent)" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
