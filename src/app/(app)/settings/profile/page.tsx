"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { ApiError, authApi } from "@/lib/api";

const TIMEZONES = [
  "Asia/Kolkata (IST, UTC+5:30)",
  "America/New_York (EST, UTC-5)",
  "America/Los_Angeles (PST, UTC-8)",
  "Europe/London (GMT, UTC+0)",
  "Europe/Berlin (CET, UTC+1)",
  "Asia/Tokyo (JST, UTC+9)",
  "Australia/Sydney (AEST, UTC+10)",
  "Asia/Singapore (SGT, UTC+8)",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    timezone: "Asia/Kolkata (IST, UTC+5:30)",
  });

  // Re-sync form when the cached profile changes (e.g., after refresh).
  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, fullName: user.fullName, email: user.email }));
    }
  }, [user]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    try {
      // The backend's profile endpoint only accepts `full_name` today; the
      // other fields stay client-side until the schema is extended.
      await authApi.updateProfile({ full_name: form.fullName });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
        Profile Settings
      </h1>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      <div
        className="rounded-xl border p-6 space-y-6"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            {initials}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
              {user?.fullName || "—"}
            </p>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
              {user?.role || "user"}
              {user?.emailVerified ? " • Email verified" : " • Email not verified"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--gf-text-secondary)" }}
            >
              Full Name
            </label>
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={fieldStyle}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--gf-text-secondary)" }}
            >
              Email (read-only)
            </label>
            <input
              value={form.email}
              readOnly
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none opacity-60 cursor-not-allowed"
              style={fieldStyle}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--gf-text-secondary)" }}
          >
            Timezone
          </label>
          <select
            value={form.timezone}
            onChange={(e) => update("timezone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={fieldStyle}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div
          className="flex justify-end pt-4 border-t"
          style={{ borderColor: "var(--gf-border)" }}
        >
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            <Save className="h-4 w-4" /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
