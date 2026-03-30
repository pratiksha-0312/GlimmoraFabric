// ---------------------------------------------------------------------------
// Role definitions for Glimmora Fabric
// ---------------------------------------------------------------------------

export type UserRole =
  | "super_admin"
  | "platform_admin"
  | "tenant_admin"
  | "developer"
  | "finance_manager"
  | "auditor"
  | "support_agent"
  | "viewer";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  platform_admin: "Platform Admin",
  tenant_admin: "Tenant Admin",
  developer: "Developer",
  finance_manager: "Finance Manager",
  auditor: "Auditor",
  support_agent: "Support Agent",
  viewer: "Viewer",
};

export const ROLE_COLORS: Record<
  UserRole,
  { bg: string; text: string; dot: string }
> = {
  super_admin: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    dot: "bg-teal-500",
  },
  platform_admin: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  tenant_admin: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    dot: "bg-cyan-500",
  },
  developer: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  finance_manager: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  auditor: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-500",
  },
  support_agent: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-500",
  },
  viewer: {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    dot: "bg-gray-500",
  },
};

// ---------------------------------------------------------------------------
// Composite helpers used by dashboard components
// ---------------------------------------------------------------------------

export const ROLES: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "teal" },
  platform_admin: { label: "Platform Admin", color: "blue" },
  tenant_admin: { label: "Tenant Admin", color: "cyan" },
  developer: { label: "Developer", color: "amber" },
  finance_manager: { label: "Finance Manager", color: "emerald" },
  auditor: { label: "Auditor", color: "purple" },
  support_agent: { label: "Support Agent", color: "orange" },
  viewer: { label: "Viewer", color: "gray" },
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  super_admin: "bg-teal-500/10 text-teal-400",
  platform_admin: "bg-blue-500/10 text-blue-400",
  tenant_admin: "bg-cyan-500/10 text-cyan-400",
  developer: "bg-amber-500/10 text-amber-400",
  finance_manager: "bg-emerald-500/10 text-emerald-400",
  auditor: "bg-purple-500/10 text-purple-400",
  support_agent: "bg-orange-500/10 text-orange-400",
  viewer: "bg-gray-500/10 text-gray-400",
};

/** Returns true if the role can manage team members (add, edit, remove). */
export function canManageTeam(role: UserRole): boolean {
  return role === "super_admin" || role === "platform_admin" || role === "tenant_admin";
}
