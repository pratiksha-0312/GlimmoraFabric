"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  UserX,
  UserCheck,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Shield,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, ROLE_BADGE_CLASSES, type UserRole } from "@/lib/roles";
import { useAuth } from "@/context/auth-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlatformUser {
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

// ---------------------------------------------------------------------------
// Initial mock data
// ---------------------------------------------------------------------------

const INITIAL_USERS: PlatformUser[] = [];

const STATUS_COLORS: Record<PlatformUser["status"], string> = {
  Active: "#22c55e",
  Inactive: "#6b7280",
  Invited: "#f59e0b",
};

const END_USER_ROLES: UserRole[] = [
  "tenant_admin", "auditor", "workflow_manager", "billing_admin",
  "developer", "tenant_member", "guest_viewer",
];

const INTERNAL_SYSTEM_ROLES: UserRole[] = [
  "cto", "platform_engineering_lead", "product_lead", "senior_backend_engineer",
  "frontend_engineer", "qa_engineer", "sdk_dx_engineer", "ai_prompt_owner",
  "product_fullstack_dev", "product_designer", "product_developer",
];

const ALL_ROLES: UserRole[] = [...END_USER_ROLES, ...INTERNAL_SYSTEM_ROLES];

const TENANT_ADMIN_ROLES: UserRole[] = [
  "billing_admin", "developer", "tenant_member", "guest_viewer",
];

const STATUSES: PlatformUser["status"][] = ["Active", "Inactive", "Invited"];

const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
          {icon}
        </div>
        <span className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{value}</span>
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------

function DeleteModal({ user, onConfirm, onCancel }: { user: PlatformUser; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Remove User</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          Are you sure you want to remove <strong style={{ color: "var(--gf-text-primary)" }}>{user.name}</strong> ({user.email})? They will lose access to all platform resources immediately.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 transition-colors hover:bg-red-700">
            Remove User
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status Change Modal (Deactivate / Activate)
// ---------------------------------------------------------------------------

function StatusChangeModal({ user, action, onConfirm, onCancel }: { user: PlatformUser; action: "deactivate" | "activate"; onConfirm: () => void; onCancel: () => void }) {
  const isDeactivate = action === "deactivate";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDeactivate ? "bg-amber-500/15" : "bg-green-500/15"}`}>
            {isDeactivate ? <UserX className="h-5 w-5 text-amber-500" /> : <UserCheck className="h-5 w-5 text-green-500" />}
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
            {isDeactivate ? "Deactivate" : "Activate"} User
          </h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          {isDeactivate
            ? <>Deactivate <strong style={{ color: "var(--gf-text-primary)" }}>{user.name}</strong>? They will be unable to log in until reactivated.</>
            : <>Activate <strong style={{ color: "var(--gf-text-primary)" }}>{user.name}</strong>? They will regain access to the platform.</>
          }
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${isDeactivate ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}>
            {isDeactivate ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Invite / Edit User Modal
// ---------------------------------------------------------------------------

const LANGUAGES = [
  "English, United States", "English, United Kingdom", "Spanish", "French",
  "German", "Portuguese", "Japanese", "Chinese (Simplified)", "Arabic", "Hindi",
];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Qatar", "Asia/Dubai", "Asia/Tokyo", "Asia/Shanghai",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Pacific/Auckland",
];

function UserFormModal({
  user,
  onSave,
  onCancel,
  userCount,
  roleOptions,
}: {
  user?: PlatformUser | null;
  onSave: (data: Omit<PlatformUser, "id" | "lastLogin" | "joinedDate">) => void;
  onCancel: () => void;
  userCount: number;
  roleOptions: UserRole[];
}) {
  const isEdit = !!user;
  const defaultUserType = user ? (INTERNAL_SYSTEM_ROLES.includes(user.role) ? "internal" : "end-user") : "end-user";
  const [userCode] = useState(() => isEdit ? user!.id : `USR-${String(userCount + 1).padStart(4, "0")}`);
  const [userType, setUserType] = useState<"end-user" | "internal">(defaultUserType);
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? roleOptions[0]);
  const [status, setStatus] = useState<PlatformUser["status"]>(user?.status ?? "Invited");
  const [mfa, setMfa] = useState(user?.mfa ?? false);
  const tenant = user?.tenant ?? "Glimmora HQ";
  const [language, setLanguage] = useState("English, United States");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [blocked, setBlocked] = useState(false);
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUserTypeChange = (type: "end-user" | "internal") => {
    setUserType(type);
    const defaultRole = type === "end-user" ? (roleOptions[0] ?? "developer") : "frontend_engineer";
    setRole(defaultRole);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!isEdit && !username.trim()) e.username = "Username is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (!isEdit) {
      if (!password.trim()) e.password = "Password is required";
      else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({ name, email, role, status, mfa, tenant, ...(isEdit ? {} : { password }) });
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>
            {isEdit ? "Edit User" : "Create User"}
          </h2>
          <button onClick={onCancel} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ── ACCOUNT INFORMATION ── */}
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gf-text-muted)" }}>Account Information</h3>

          {/* User Code + User Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Code</label>
              <input type="text" value={userCode} readOnly
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed"
                style={fieldStyle} />
              <p className="mt-1 text-[11px]" style={{ color: "var(--gf-text-muted)" }}>System-generated</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Type</label>
              <input type="text" value="End User" readOnly
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed"
                style={fieldStyle} />
            </div>
          </div>

          {/* Full Name + Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Username *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. johndoe"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle} />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>
          </div>

          {/* Email + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}>
                {roleOptions.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          </div>


          {/* ── SETTINGS ── */}
          <h3 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: "var(--gf-text-muted)" }}>Settings</h3>

          {/* Language + Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Time Zone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          {/* Blocked + Active */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RadioGroup label="Blocked" radioName="user-blocked" value={blocked} onChange={setBlocked} />
            <RadioGroup label="Active" radioName="user-active" value={active} onChange={setActive} />
            {isEdit && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as PlatformUser["status"])}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                  style={fieldStyle}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* ── PASSWORD (create only) ── */}
          {!isEdit && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: "var(--gf-text-muted)" }}>Password</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>New Password *</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                    style={fieldStyle} />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Confirm Password *</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                    style={fieldStyle} />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              Cancel
            </button>
            <button type="submit" className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors" style={{ backgroundColor: "var(--gf-accent)" }}>
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resend Invite Modal
// ---------------------------------------------------------------------------

function ResendInviteModal({ user, onConfirm, onCancel }: { user: PlatformUser; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Resend Invitation</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
          Resend the invitation email to <strong style={{ color: "var(--gf-text-primary)" }}>{user.name}</strong> at {user.email}?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-blue-600 transition-colors hover:bg-blue-700">
            Resend Invite
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// User Detail Slide-Over
// ---------------------------------------------------------------------------

function UserDetail({ user, onClose, onEdit }: { user: PlatformUser; onClose: () => void; onEdit: () => void }) {
  const rc = ROLE_COLORS[user.role];
  const statusColor = STATUS_COLORS[user.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>User Details</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
              <Pencil className="h-3 w-3 inline mr-1" />Edit
            </button>
            <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar & name */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold"
              style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
            >
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{user.name}</h3>
              <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>{user.email}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${rc.bg} ${rc.text}`}>
              {ROLE_LABELS[user.role]}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              {user.status}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${user.mfa ? "bg-green-500/15 text-green-500" : "bg-gray-500/15 text-gray-400"}`}>
              MFA {user.mfa ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Tenant", value: user.tenant },
              { label: "Role", value: ROLE_LABELS[user.role] },
              { label: "Last Login", value: user.lastLogin },
              { label: "Joined", value: user.joinedDate },
              { label: "Email", value: user.email },
              { label: "User ID", value: user.id },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                <p className="text-sm font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Role Info */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Assigned Role</h4>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Recent Activity</h4>
            <div className="space-y-2">
              {[
                { action: "Logged in", time: user.lastLogin },
                { action: "Updated profile settings", time: "2 days ago" },
                { action: "Generated API key", time: "5 days ago" },
                { action: "Changed password", time: "2 weeks ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--gf-border)" }}>
                  <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{item.action}</span>
                  <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

type SortKey = "name" | "role" | "status" | "lastLogin";
type SortDir = "asc" | "desc";

function sortUsers(list: PlatformUser[], key: SortKey, dir: SortDir): PlatformUser[] {
  return [...list].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    return dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function IdentityContent({ mode }: { mode: "super_admin" | "tenant_admin" }) {
  const router = useRouter();
  const isSuperAdmin = mode === "super_admin";
  const SUPER_ADMIN_ROLES: UserRole[] = ["auditor", "workflow_manager"];
  const roleOptions = isSuperAdmin ? SUPER_ADMIN_ROLES : TENANT_ADMIN_ROLES;
  const [users, setUsers] = useState<PlatformUser[]>([]);

  const refreshUsers = useCallback(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: PlatformUser[]) => {
        if (isSuperAdmin) {
          setUsers(data.filter((u) => SUPER_ADMIN_ROLES.includes(u.role)));
        } else {
          setUsers(data.filter((u) => TENANT_ADMIN_ROLES.includes(u.role)));
        }
      });
  }, [isSuperAdmin]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "All">("All");
  const [filterStatus, setFilterStatus] = useState<PlatformUser["status"] | "All">("All");
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [formModal, setFormModal] = useState<{ open: boolean; user: PlatformUser | null }>({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState<PlatformUser | null>(null);
  const [statusModal, setStatusModal] = useState<{ user: PlatformUser; action: "deactivate" | "activate" } | null>(null);
  const [resendModal, setResendModal] = useState<PlatformUser | null>(null);
  const [viewUser, setViewUser] = useState<PlatformUser | null>(null);

  // Action dropdown
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.tenant.toLowerCase().includes(q));
    }
    if (filterRole !== "All") list = list.filter((u) => u.role === filterRole);
    if (filterStatus !== "All") list = list.filter((u) => u.status === filterStatus);
    return sortUsers(list, sortKey, sortDir);
  }, [users, search, filterRole, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Stats
  const totalUsersCount = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const mfaEnabled = users.length > 0 ? Math.round((users.filter((u) => u.mfa).length / users.length) * 100) : 0;
  const pendingInvites = users.filter((u) => u.status === "Invited").length;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleInvite = async (data: Omit<PlatformUser, "id" | "lastLogin" | "joinedDate">) => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    refreshUsers();
    setFormModal({ open: false, user: null });
  };

  const handleEdit = async (data: Omit<PlatformUser, "id" | "lastLogin" | "joinedDate">) => {
    if (!formModal.user) return;
    await fetch(`/api/users/${formModal.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    refreshUsers();
    setFormModal({ open: false, user: null });
    if (viewUser?.id === formModal.user.id) setViewUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    await fetch(`/api/users/${deleteModal.id}`, { method: "DELETE" });
    refreshUsers();
    setDeleteModal(null);
    if (viewUser?.id === deleteModal.id) setViewUser(null);
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    const newStatus: PlatformUser["status"] = statusModal.action === "deactivate" ? "Inactive" : "Active";
    await fetch(`/api/users/${statusModal.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    refreshUsers();
    if (viewUser?.id === statusModal.user.id) setViewUser((prev) => (prev ? { ...prev, status: newStatus } : null));
    setStatusModal(null);
  };

  const handleResendInvite = () => {
    setResendModal(null);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleExport = () => {
    const header = "Name,Email,Role,Status,MFA,Tenant,Last Login,Joined\n";
    const rows = users.map((u) => `"${u.name}","${u.email}","${ROLE_LABELS[u.role]}","${u.status}","${u.mfa ? "Yes" : "No"}","${u.tenant}","${u.lastLogin}","${u.joinedDate}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleMfa = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mfa: !user.mfa }),
    });
    refreshUsers();
  };

  const clearFilters = () => {
    setSearch("");
    setFilterRole("All");
    setFilterStatus("All");
    setPage(1);
  };

  const hasActiveFilters = search || filterRole !== "All" || filterStatus !== "All";

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
            Manage users, invitations, roles, and access controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => router.push("/admin/users/import")}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
            >
              <Download className="h-4 w-4" />
              Bulk Import
            </button>
          )}
          <button
            onClick={() => setFormModal({ open: true, user: null })}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={totalUsersCount} />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Active Users" value={activeUsers} />
        <StatCard icon={<KeyRound className="h-5 w-5" />} label="MFA Enabled" value={`${mfaEnabled}%`} />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="Pending Invites" value={pendingInvites} />
      </div>

      {/* ===================== USER LIST ===================== */}
      {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, or tenant..."
                className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`}
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)", backgroundColor: "var(--gf-bg-surface)" }}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
                  {[filterRole !== "All", filterStatus !== "All"].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => { setFilterRole(e.target.value as UserRole | "All"); setPage(1); }}
                  className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                  style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                >
                  <option value="All">All Roles</option>
                  {roleOptions.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value as PlatformUser["status"] | "All"); setPage(1); }}
                  className="rounded-lg border px-3 py-1.5 text-sm outline-none"
                  style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                >
                  <option value="All">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:text-red-400">
                  <X className="h-3 w-3" />Clear All
                </button>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Showing {filtered.length} of {users.length} users</p>
          )}

          {/* Users Table */}
          <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                    {([
                      { key: "name" as SortKey, label: "User" },
                      { key: "role" as SortKey, label: "Role" },
                      { key: "status" as SortKey, label: "Status" },
                      { key: "lastLogin" as SortKey, label: "Last Login" },
                      { key: null, label: "Actions" },
                    ] as const).map((col, i) => (
                      <th
                        key={i}
                        className={`px-5 py-3 text-left text-xs font-medium uppercase ${col.key ? "cursor-pointer select-none hover:opacity-80" : ""}`}
                        style={{ color: "var(--gf-text-secondary)" }}
                        onClick={col.key ? () => handleSort(col.key!) : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {col.key && <SortIcon col={col.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
                        <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No users found</p>
                        <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
                          {hasActiveFilters ? "Try adjusting your filters" : "Invite your first user to get started"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paged.map((u) => {
                      const rc = ROLE_COLORS[u.role];
                      const statusColor = STATUS_COLORS[u.status];

                      return (
                        <tr key={u.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                          {/* User */}
                          <td className="px-5 py-3">
                            <button onClick={() => setViewUser(u)} className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}
                              >
                                {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-sm underline-offset-2 hover:underline" style={{ color: "var(--gf-text-primary)" }}>{u.name}</p>
                                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{u.email}</p>
                              </div>
                            </button>
                          </td>

                          {/* Role */}
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.text}`}>
                              {ROLE_LABELS[u.role]}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: statusColor }}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                              {u.status}
                            </span>
                          </td>

                          {/* Last Login */}
                          <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{u.lastLogin}</td>

                          {/* Actions */}
                          <td className="px-5 py-3">
                            <div className="relative" ref={(el) => { if (el && openActionId === u.id) el.dataset.open = "true"; }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionId(openActionId === u.id ? null : u.id);
                                }}
                                className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                                style={{ color: "var(--gf-text-secondary)" }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {openActionId === u.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                                  <div
                                    className="fixed z-50 w-48 rounded-xl border py-1 shadow-xl"
                                    style={{
                                      backgroundColor: "var(--gf-bg-surface)",
                                      borderColor: "var(--gf-border)",
                                      top: "auto",
                                      right: "auto",
                                    }}
                                    ref={(el) => {
                                      if (!el) return;
                                      const btn = el.parentElement?.querySelector("button");
                                      if (!btn) return;
                                      const rect = btn.getBoundingClientRect();
                                      const spaceBelow = window.innerHeight - rect.bottom;
                                      const menuHeight = el.offsetHeight;
                                      if (spaceBelow < menuHeight + 8) {
                                        el.style.top = `${rect.top - menuHeight - 4}px`;
                                      } else {
                                        el.style.top = `${rect.bottom + 4}px`;
                                      }
                                      el.style.left = `${Math.max(8, rect.right - el.offsetWidth)}px`;
                                    }}
                                  >
                                    <button
                                      onClick={() => {
                                        router.push(isSuperAdmin ? `/admin/users/${u.id}` : `/admin/tenant-users/${u.id}`);
                                        setOpenActionId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                      style={{ color: "var(--gf-text-primary)" }}
                                    >
                                      <Eye className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />View Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        router.push(isSuperAdmin ? `/admin/users/${u.id}/edit` : `/admin/tenant-users/${u.id}/edit`);
                                        setOpenActionId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                      style={{ color: "var(--gf-text-primary)" }}
                                    >
                                      <Pencil className="h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />Edit User
                                    </button>
                                    {u.status === "Invited" && (
                                      <button
                                        onClick={() => { setResendModal(u); setOpenActionId(null); }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                        style={{ color: "#3b82f6" }}
                                      >
                                        <RefreshCw className="h-4 w-4" />Resend Invite
                                      </button>
                                    )}
                                    {u.status === "Active" && (
                                      <button
                                        onClick={() => { setStatusModal({ user: u, action: "deactivate" }); setOpenActionId(null); }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                        style={{ color: "#f59e0b" }}
                                      >
                                        <UserX className="h-4 w-4" />Deactivate
                                      </button>
                                    )}
                                    {u.status === "Inactive" && (
                                      <button
                                        onClick={() => { setStatusModal({ user: u, action: "activate" }); setOpenActionId(null); }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                        style={{ color: "#22c55e" }}
                                      >
                                        <UserCheck className="h-4 w-4" />Activate
                                      </button>
                                    )}
                                    <div className="my-1 border-t" style={{ borderColor: "var(--gf-border)" }} />
                                    <button
                                      onClick={() => { setDeleteModal(u); setOpenActionId(null); }}
                                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-4 w-4" />Remove User
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
                <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                  Page {safePage} of {totalPages} ({filtered.length} users)
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${n === safePage ? "text-white" : "hover:opacity-70"}`}
                      style={n === safePage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}
                    >
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="rounded-lg p-1.5 transition-colors hover:opacity-70 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

      {/* ---- Modals ---- */}

      {formModal.open && (
        <UserFormModal
          user={formModal.user}
          onSave={formModal.user ? handleEdit : handleInvite}
          onCancel={() => setFormModal({ open: false, user: null })}
          userCount={users.length}
          roleOptions={roleOptions}
        />
      )}

      {deleteModal && (
        <DeleteModal user={deleteModal} onConfirm={handleDelete} onCancel={() => setDeleteModal(null)} />
      )}

      {statusModal && (
        <StatusChangeModal user={statusModal.user} action={statusModal.action} onConfirm={handleStatusChange} onCancel={() => setStatusModal(null)} />
      )}

      {resendModal && (
        <ResendInviteModal user={resendModal} onConfirm={handleResendInvite} onCancel={() => setResendModal(null)} />
      )}

      {viewUser && (
        <UserDetail
          user={viewUser}
          onClose={() => setViewUser(null)}
          onEdit={() => { setFormModal({ open: true, user: viewUser }); setViewUser(null); }}
        />
      )}
    </div>
  );
}
