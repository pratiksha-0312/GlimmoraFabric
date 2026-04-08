"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Pencil } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/roles";
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

const TENANT_ADMIN_ROLES: UserRole[] = [
  "billing_admin", "developer", "tenant_member", "guest_viewer",
];

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

export default function TenantUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
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
        <button onClick={() => router.push("/admin/tenant-users")} className="mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Users
        </button>
      </div>
    );
  }

  const RadioDisplay = ({ label, value }: { label: string; value: boolean }) => (
    <div>
      <span className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>{label}</span>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={value === true} readOnly className="accent-[var(--gf-accent)]" />
          <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Yes</span>
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={value === false} readOnly className="accent-[var(--gf-accent)]" />
          <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>No</span>
        </label>
      </div>
    </div>
  );

  return (
    <AuthGuard allowedRoles={["tenant_admin"] as UserRole[]}>
      <div className="space-y-6 max-w-2xl">
        <button onClick={() => router.push("/admin/tenant-users")} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Users
        </button>

        <div className="rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>View User</h2>
            <button
              onClick={() => router.push(`/admin/tenant-users/${userId}/edit`)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}
            >
              <Pencil className="h-3.5 w-3.5" />Edit
            </button>
          </div>

          {/* Form (read-only) */}
          <div className="p-6 space-y-5">
            {/* Account Information */}
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Account Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Code</label>
                <input type="text" value={user.code || user.id} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Type</label>
                <input type="text" value="End User" readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Full Name</label>
                <input type="text" value={user.name} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Username</label>
                <input type="text" value={user.email.split("@")[0]} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email Address</label>
                <input type="text" value={user.email} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role</label>
                <input type="text" value={ROLE_LABELS[user.role] ?? user.role} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
            </div>

            {/* Password */}
            <h3 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: "var(--gf-text-muted)" }}>Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Password</label>
                <input type="password" value={user.password || "••••••••"} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
            </div>

            {/* Settings */}
            <h3 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: "var(--gf-text-muted)" }}>Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Language</label>
                <input type="text" value="English, United States" readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Time Zone</label>
                <input type="text" value={user.joinedDate ? "Asia/Kolkata" : "Asia/Kolkata"} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RadioDisplay label="Blocked" value={user.status === "Inactive"} />
              <RadioDisplay label="Active" value={user.status === "Active"} />
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <input type="text" value={user.status} readOnly className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" style={fieldStyle} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
