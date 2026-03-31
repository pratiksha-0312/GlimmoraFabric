"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Send } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_ROLES: UserRole[] = [
  "super_admin", "tenant_admin", "developer", "platform_engineer",
  "qa_engineer", "product_manager", "governance_admin", "ai_prompt_owner",
];

const TENANTS = ["Glimmora HQ", "VerifAI", "Diamond Corp", "Hospitality Co", "Tax Solutions", "Aero Systems"];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function InviteUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "developer" as UserRole,
    tenant: "Glimmora HQ",
    mfa: false,
    message: "",
  });

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
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push("/dashboard/identity"), 1500);
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 mb-4">
          <Send className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Invitation Sent!</h2>
        <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
          An invitation has been sent to <strong>{form.email}</strong>. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button onClick={() => router.push("/dashboard/identity")} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" />Back to Users &amp; Access
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Invite New User</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          Send an invitation to add a new user to the platform
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
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. John Doe" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email Address *</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="user@company.com" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Role & Tenant */}
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Access Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role</label>
              <select value={form.role} onChange={(e) => update("role", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
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
            className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors w-full sm:w-auto"
            style={fieldStyle}
          >
            <div className={`relative h-5 w-9 rounded-full transition-colors ${form.mfa ? "bg-green-500" : "bg-gray-600"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.mfa ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span>Require MFA on first login</span>
          </button>
        </div>

        {/* Personal message */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Personal Message (optional)</label>
          <textarea
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            rows={3}
            placeholder="Add a personal note to the invitation email..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button type="button" onClick={() => router.push("/dashboard/identity")} className="rounded-lg px-5 py-2.5 text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60" style={{ backgroundColor: "var(--gf-accent)" }}>
            <Send className="h-4 w-4" />
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </form>
    </div>
  );
}
