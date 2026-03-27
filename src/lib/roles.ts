// ---------------------------------------------------------------------------
// Role definitions for Glimmora Fabric
// ---------------------------------------------------------------------------

export type UserRole = "super_admin" | "admin" | "developer" | "auditor" | "viewer";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  developer: "Developer",
  auditor: "Auditor",
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
  admin: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  developer: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  auditor: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-500",
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
  admin: { label: "Admin", color: "blue" },
  developer: { label: "Developer", color: "amber" },
  auditor: { label: "Auditor", color: "purple" },
  viewer: { label: "Viewer", color: "gray" },
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  super_admin: "bg-teal-500/10 text-teal-400",
  admin: "bg-blue-500/10 text-blue-400",
  developer: "bg-amber-500/10 text-amber-400",
  auditor: "bg-purple-500/10 text-purple-400",
  viewer: "bg-gray-500/10 text-gray-400",
};

/** Returns true if the role can manage team members (add, edit, remove). */
export function canManageTeam(role: UserRole): boolean {
  return role === "super_admin" || role === "admin";
}
