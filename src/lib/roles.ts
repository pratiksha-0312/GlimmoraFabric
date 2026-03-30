// ---------------------------------------------------------------------------
// Role definitions for Glimmora Fabric (Internal System Roles)
// ---------------------------------------------------------------------------

export type UserRole =
  | "super_admin"
  | "tenant_admin"
  | "developer"
  | "platform_engineer"
  | "qa_engineer"
  | "product_manager"
  | "governance_admin"
  | "ai_prompt_owner";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  tenant_admin: "Tenant Admin",
  developer: "Developer",
  platform_engineer: "Platform Engineer",
  qa_engineer: "QA Engineer",
  product_manager: "Product Manager",
  governance_admin: "Governance Admin",
  ai_prompt_owner: "AI Prompt Owner",
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
  platform_engineer: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  qa_engineer: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  product_manager: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    dot: "bg-violet-500",
  },
  governance_admin: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "bg-rose-500",
  },
  ai_prompt_owner: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-500",
  },
};

// ---------------------------------------------------------------------------
// Composite helpers used by dashboard components
// ---------------------------------------------------------------------------

export const ROLES: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "teal" },
  tenant_admin: { label: "Tenant Admin", color: "cyan" },
  developer: { label: "Developer", color: "amber" },
  platform_engineer: { label: "Platform Engineer", color: "blue" },
  qa_engineer: { label: "QA Engineer", color: "emerald" },
  product_manager: { label: "Product Manager", color: "violet" },
  governance_admin: { label: "Governance Admin", color: "rose" },
  ai_prompt_owner: { label: "AI Prompt Owner", color: "purple" },
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  super_admin: "bg-teal-500/10 text-teal-400",
  tenant_admin: "bg-cyan-500/10 text-cyan-400",
  developer: "bg-amber-500/10 text-amber-400",
  platform_engineer: "bg-blue-500/10 text-blue-400",
  qa_engineer: "bg-emerald-500/10 text-emerald-400",
  product_manager: "bg-violet-500/10 text-violet-400",
  governance_admin: "bg-rose-500/10 text-rose-400",
  ai_prompt_owner: "bg-purple-500/10 text-purple-400",
};

/** Returns true if the role can manage team members (add, edit, remove). */
export function canManageTeam(role: UserRole): boolean {
  return role === "super_admin" || role === "tenant_admin" || role === "governance_admin";
}
