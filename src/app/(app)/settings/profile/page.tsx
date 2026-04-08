"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ROLE_LABELS } from "@/lib/roles";

const TIMEZONES = [
  "Asia/Kolkata (IST, UTC+5:30)", "America/New_York (EST, UTC-5)", "America/Los_Angeles (PST, UTC-8)",
  "Europe/London (GMT, UTC+0)", "Europe/Berlin (CET, UTC+1)", "Asia/Tokyo (JST, UTC+9)",
  "Australia/Sydney (AEST, UTC+10)", "Asia/Singapore (SGT, UTC+8)",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: "",
    jobTitle: user?.role ? ROLE_LABELS[user.role] : "",
    bio: "",
    timezone: "Asia/Kolkata (IST, UTC+5:30)",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const initials = user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U";

  const handleSave = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-email": user.email },
        body: JSON.stringify({
          name: form.fullName,
          phone: form.phone,
          jobTitle: form.jobTitle,
          bio: form.bio,
          timezone: form.timezone,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/files/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      const updateRes = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-email": user.email },
        body: JSON.stringify({ avatarUrl: url }),
      });
      if (!updateRes.ok) throw new Error("Failed to update avatar");
      setAvatarUrl(url);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-email": user.email },
        body: JSON.stringify({ avatarUrl: null }),
      });
      if (!res.ok) throw new Error("Failed to remove avatar");
      setAvatarUrl(null);
    } catch (err) {
      console.error("Remove avatar failed:", err);
    }
  };

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Profile Settings</h1>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      <div className="rounded-xl border p-6 space-y-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        {/* Avatar */}
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: "var(--gf-accent)" }}>{initials}</div>
          )}
          <div className="space-y-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Upload className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload Photo"}
            </button>
            <button onClick={handleRemoveAvatar} className="flex items-center gap-2 text-xs hover:opacity-80" style={{ color: "var(--gf-text-muted)" }}>
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Full Name</label>
            <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email (read-only)</label>
            <input value={form.email} readOnly
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none opacity-60 cursor-not-allowed" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Phone Number</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 ..."
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Job Title</label>
            <input value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Bio</label>
          <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3}
            placeholder="Tell us about yourself..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none" style={fieldStyle} />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Timezone</label>
          <select value={form.timezone} onChange={(e) => update("timezone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle}>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button onClick={handleSave} disabled={isLoading}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--gf-accent)" }}>
            <Save className="h-4 w-4" /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
