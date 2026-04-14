"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Upload, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLANS = ["Starter", "Pro", "Enterprise"] as const;
const REGIONS = ["US-East", "US-West", "EU-West", "EU-Central", "AP-South", "AP-East"];

const USER_ROLES = ["CustomerAdministrator", "TenantAdmin", "Auditor", "Developer", "Viewer"];

const LANGUAGES = [
  "English, United States", "English, United Kingdom", "Spanish", "French",
  "German", "Portuguese", "Japanese", "Chinese (Simplified)", "Arabic", "Hindi",
];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Qatar", "Asia/Dubai", "Asia/Tokyo", "Asia/Shanghai",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Pacific/Auckland",
];

// ---------------------------------------------------------------------------
// Auto-generate customer code
// ---------------------------------------------------------------------------

let codeCounter = 0;
function generateCode() {
  codeCounter++;
  return `TEN_${String(codeCounter).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CreateTenantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customerCode: generateCode(),
    userRole: "CustomerAdministrator",
    customerName: "",
    username: "",
    email: "",
    logo: null as File | null,
    logoPreview: "",
    language: "English, United States",
    timezone: "Asia/Kolkata",
    blocked: false,
    active: true,
    password: "",
    confirmPassword: "",
    // existing fields
    plan: "Starter" as (typeof PLANS)[number],
    region: "US-East",
    domain: "",
    users: 0,
    description: "",
  });

  const update = (key: string, value: string | number | boolean | File | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: "File must be under 5MB" }));
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, logo: "Only PNG and JPG formats supported" }));
      return;
    }
    setErrors((prev) => { const { logo: _, ...rest } = prev; return rest; });
    update("logo", file);
    update("logoPreview", URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleLogoUpload(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Customer name is required";
    if (!form.username.trim()) e.username = "Username is required";
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
    setTimeout(() => router.push("/tenants"), 1500);
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
          <Building2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Tenant Created!</h2>
        <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
          <strong>{form.customerName}</strong> has been created and is now provisioning. Redirecting...
        </p>
      </div>
    );
  }

  // Radio button helper
  const RadioGroup = ({ label, name, value, onChange }: { label: string; name: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div>
      <span className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>{label}</span>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name={name} checked={value === true} onChange={() => onChange(true)}
            className="accent-[var(--gf-accent)]" />
          <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>Yes</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name={name} checked={value === false} onChange={() => onChange(false)}
            className="accent-[var(--gf-accent)]" />
          <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>No</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.push("/tenants")}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenants
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Create New Tenant</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
          Set up a new tenant account with their configuration and credentials
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border p-6 space-y-6"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        {/* ── ACCOUNT INFORMATION ─────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: "var(--gf-text-primary)" }}>
            Account Information
          </h3>

          {/* Customer Code + User Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Customer Code</label>
              <input
                type="text"
                value={form.customerCode}
                readOnly
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none opacity-70 cursor-not-allowed"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Role</label>
              <select
                value={form.userRole}
                onChange={(e) => update("userRole", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Customer Name */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Customer Name *</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              placeholder="Enter customer name"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
            {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Upload Logo */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Upload Logo</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors hover:border-[var(--gf-accent)]"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}
            >
              {form.logoPreview ? (
                <div className="relative">
                  <img src={form.logoPreview} alt="Logo preview" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); update("logo", null); update("logoPreview", ""); }}
                    className="absolute -top-2 -right-2 rounded-full p-0.5 bg-red-500 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mb-2" style={{ color: "var(--gf-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                    Drag and Drop or <span style={{ color: "var(--gf-accent)" }} className="font-medium">Click to upload</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>Supported formats: PNG, JPG. Max Size: 5MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); }}
              />
            </div>
            {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
          </div>
        </div>

        {/* ── SETTINGS ────────────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: "var(--gf-text-primary)" }}>
            Settings
          </h3>

          {/* Language + Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Language</label>
              <select
                value={form.language}
                onChange={(e) => update("language", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Time Zone</label>
              <select
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>

          {/* Radio toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RadioGroup label="Blocked" name="blocked" value={form.blocked} onChange={(v) => update("blocked", v)} />
            <RadioGroup label="Active" name="active" value={form.active} onChange={(v) => update("active", v)} />
          </div>
        </div>

        {/* ── PASSWORD ────────────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: "var(--gf-text-primary)" }}>
            Password
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>New Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Confirm Password *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* ── PLAN & REGION ───────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: "var(--gf-text-primary)" }}>
            Subscription Plan & Region
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update("plan", p)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${form.plan === p ? "ring-2 ring-[var(--gf-accent)]" : "hover:opacity-80"}`}
                    style={{
                      borderColor: form.plan === p ? "var(--gf-accent)" : "var(--gf-border)",
                      backgroundColor: form.plan === p ? "var(--gf-accent-bg)" : "var(--gf-bg-base)",
                      color: "var(--gf-text-primary)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>
                {form.plan === "Starter" && "Up to 50 users, basic features"}
                {form.plan === "Pro" && "Up to 200 users, advanced features"}
                {form.plan === "Enterprise" && "Up to 500 users, full platform access"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Region</label>
              <select
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <p className="text-xs mt-2" style={{ color: "var(--gf-text-muted)" }}>
                Data will be stored in the selected region for compliance
              </p>
            </div>
          </div>
        </div>

        {/* ── TECHNICAL CONFIG ────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: "var(--gf-text-primary)" }}>
            Technical Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Domain *</label>
              <input
                type="text"
                value={form.domain}
                onChange={(e) => update("domain", e.target.value)}
                placeholder="company.glimmora.io"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
              {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Initial User Seats</label>
              <input
                type="number"
                min={0}
                value={form.users}
                onChange={(e) => update("users", Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            placeholder="Brief description of the tenant and their use case..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button
            type="button"
            onClick={() => router.push("/tenants")}
            className="rounded-lg px-5 py-2.5 text-sm font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            {isSubmitting ? "Creating..." : "Create Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}
