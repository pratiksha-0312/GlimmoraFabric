"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Save, CheckCircle2, Upload } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    description: "",
    industry: "Technology",
    website: "",
  });

  useEffect(() => {
    if (!user?.tenantId) { setLoading(false); return; }
    (async () => {
      try {
        const { tenantsApi } = await import("@/lib/api");
        const t = await tenantsApi.get(user.tenantId!);
        setForm({
          name: t.name,
          domain: t.domain ?? "",
          // Backend tenants don't track free-form description; address is the
          // closest field — surface it here for editing.
          description: t.address ?? "",
          industry: "Technology",
          website: "",
        });
      } catch {
        /* keep blank form */
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.tenantId]);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!user?.tenantId) return;
    setIsLoading(true);
    try {
      const { tenantsApi } = await import("@/lib/api");
      await tenantsApi.update(user.tenantId, {
        name: form.name,
        domain: form.domain || undefined,
        // Free-form description is stored as `address` since the backend
        // schema doesn't have a dedicated description column.
        address: form.description || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* swallow */
    } finally {
      setIsLoading(false);
    }
  };

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <AuthGuard allowedRoles={["tenant_admin"] as UserRole[]}>
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Organization Settings</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage your organization details</p>
        </div>
        <button onClick={() => router.push("/settings/organization/members")}
          className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80"
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
          Manage Members
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" /> Settings saved successfully!
        </div>
      )}

      {loading ? (
        <div className="text-sm py-10 text-center" style={{ color: "var(--gf-text-muted)" }}>Loading...</div>
      ) : (
      <div className="rounded-xl border p-6 space-y-6" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        {/* Logo */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--gf-text-secondary)" }}>Organization Logo</label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
              <Building2 className="h-8 w-8" style={{ color: "var(--gf-text-muted)" }} />
            </div>
            <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Upload className="h-4 w-4" /> Upload Logo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Organization Name</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Domain</label>
            <input value={form.domain} onChange={(e) => update("domain", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none" style={fieldStyle} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Industry</label>
            <select value={form.industry} onChange={(e) => update("industry", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle}>
              {["Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Other"].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Website</label>
            <input value={form.website} onChange={(e) => update("website", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--gf-border)" }}>
          <button onClick={handleSave} disabled={isLoading}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--gf-accent)" }}>
            <Save className="h-4 w-4" /> {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      )}
    </div>
    </AuthGuard>
  );
}
