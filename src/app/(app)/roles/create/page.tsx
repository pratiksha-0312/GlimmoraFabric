"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import {
  ROLE_LABELS, isInternalTeam, type UserRole, type EndUserRole, type InternalSystemRole,
} from "@/lib/roles";
import { ApiError, rolesApi } from "@/lib/api";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const END_USER_ROLES: EndUserRole[] = [
  "super_admin", "tenant_admin", "auditor", "workflow_manager",
  "billing_admin", "developer", "tenant_member", "guest_viewer",
];

const INTERNAL_ROLES: InternalSystemRole[] = [
  "cto", "platform_engineering_lead", "product_lead", "senior_backend_engineer",
  "frontend_engineer", "qa_engineer", "sdk_dx_engineer", "ai_prompt_owner",
  "product_fullstack_dev", "product_designer", "product_developer",
];

const MODULES = [
  "Notifications", "Payments", "Audit", "Workflows",
  "Documents", "Tenants", "AI Platform", "Configuration", "Analytics", "Monitoring", "Dev Tools",
];
const ACTIONS = ["View", "Create", "Edit", "Delete", "Manage"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Simulate existing role codes to check uniqueness
const EXISTING_CODES = new Set([
  "ROLE-0001", "ROLE-0002", "ROLE-0003", "ROLE-0004", "ROLE-0005",
  "ROLE-0006", "ROLE-0007", "ROLE-0008", "ROLE-0009", "ROLE-0010",
]);

let codeCounter = EXISTING_CODES.size;

function generateUniqueRoleCode(): string {
  let code: string;
  do {
    codeCounter += 1;
    code = `ROLE-${String(codeCounter).padStart(4, "0")}`;
  } while (EXISTING_CODES.has(code));
  EXISTING_CODES.add(code);
  return code;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CreateRolePage() {
  const router = useRouter();

  // Auto-generate unique role code on mount
  const [roleCode] = useState(() => generateUniqueRoleCode());

  // Form state
  const [userType, setUserType] = useState<"end-user" | "system">("end-user");
  const [roleName, setRoleName] = useState<string>("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Filtered roles based on user type
  const filteredRoles = useMemo(() => {
    return userType === "end-user" ? END_USER_ROLES : INTERNAL_ROLES;
  }, [userType]);

  // Reset role name when user type changes
  const handleTypeChange = (newType: "end-user" | "system") => {
    setUserType(newType);
    setRoleName("");
  };

  const togglePerm = (key: string) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = async () => {
    if (!roleName) { setError("Please select a role name."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      // Convert the matrix to "module.action" permission strings, dropping
      // unchecked entries. The backend stores them as a JSON array on the role.
      const permissionList = Object.entries(perms)
        .filter(([, on]) => on)
        .map(([k]) => k.replace(":", ".").toLowerCase());

      await rolesApi.create({
        // Backend's role name must be unique — use the role-key for stable
        // lookup, and surface the human label via description.
        name: roleName,
        description: `${ROLE_LABELS[roleName as UserRole] ?? roleName}${description ? ` — ${description}` : ""}`,
        permissions: permissionList,
      });
      toast.success("Role created successfully");
      router.push("/roles");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };
  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => router.push("/roles")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Roles
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Add Role</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Define a new role with custom permissions</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      {/* Role Information */}
      <div className="rounded-xl border p-6 space-y-4" style={cardStyle}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Role Information</h3>

        {/* Row 1: Role Code (system-generated, read-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role Code</label>
            <div className="flex items-center gap-2">
              <input value={roleCode} readOnly
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none cursor-not-allowed opacity-70"
                style={{ ...fieldStyle, backgroundColor: "var(--gf-bg-elevated)" }} />
              <span className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase"
                style={{ backgroundColor: "var(--gf-accent-bg)", color: "var(--gf-accent)" }}>
                Auto
              </span>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: "var(--gf-text-muted)" }}>System-generated unique code</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>User Type *</label>
            <select value={userType} onChange={(e) => handleTypeChange(e.target.value as "end-user" | "system")}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle}>
              <option value="end-user">End-User</option>
              <option value="system">Internal System</option>
            </select>
          </div>
        </div>

        {/* Row 2: Role Name + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Role Name (User Role) *</label>
            <select value={roleName} onChange={(e) => setRoleName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle}>
              <option value="">Select a role...</option>
              {filteredRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Row 3: Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            placeholder="Describe what this role is for..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none" style={fieldStyle} />
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="rounded-xl border overflow-hidden" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--gf-border)" }}>
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--gf-text-primary)" }}>
            <CheckSquare className="h-4 w-4" /> Permission Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--gf-text-muted)" }}>Module</th>
                {ACTIONS.map((a) => (
                  <th key={a} className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: "var(--gf-text-muted)" }}>{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => (
                <tr key={mod} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{mod}</td>
                  {ACTIONS.map((act) => {
                    const key = `${mod}:${act}`;
                    return (
                      <td key={act} className="px-4 py-3 text-center">
                        <input type="checkbox" checked={!!perms[key]} onChange={() => togglePerm(key)}
                          className="h-4 w-4 rounded accent-teal-500 cursor-pointer" />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button onClick={() => router.push("/roles")}
          className="rounded-lg px-5 py-2.5 text-sm font-medium border"
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
        <button onClick={handleSubmit} disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--gf-accent)" }}>
          <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
