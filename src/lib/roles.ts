// ---------------------------------------------------------------------------
// Role definitions for Glimmora Fabric
// Dual Hierarchy: End-User (Application) roles & Internal System (Org) roles
// ---------------------------------------------------------------------------

export type EndUserRole =
  | "super_admin"
  | "tenant_admin"
  | "auditor"
  | "workflow_manager"
  | "billing_admin"
  | "developer"
  | "tenant_member"
  | "guest_viewer";

export type InternalSystemRole =
  | "cto"
  | "platform_engineering_lead"
  | "product_lead"
  | "senior_backend_engineer"
  | "frontend_engineer"
  | "qa_engineer"
  | "sdk_dx_engineer"
  | "ai_prompt_owner"
  | "product_fullstack_dev"
  | "product_designer"
  | "product_developer";

export type UserRole = EndUserRole | InternalSystemRole;

// ---------------------------------------------------------------------------
// UI Labels
// ---------------------------------------------------------------------------

export const ROLE_LABELS: Record<UserRole, string> = {
  // End-User
  super_admin: "Super Admin",
  tenant_admin: "Tenant Admin",
  auditor: "Auditor",
  workflow_manager: "Workflow Manager",
  billing_admin: "Billing Admin",
  developer: "Developer",
  tenant_member: "Tenant Member",
  guest_viewer: "Guest / Viewer",

  // Internal System
  cto: "CTO / VP Engineering",
  platform_engineering_lead: "Platform Eng Lead",
  product_lead: "Product Lead / PM",
  senior_backend_engineer: "Sr. Backend Engineer",
  frontend_engineer: "Frontend / Full-Stack Dev",
  qa_engineer: "QA / Test Engineer",
  sdk_dx_engineer: "SDK / DX Engineer",
  ai_prompt_owner: "Prompt & AI Owner",
  product_fullstack_dev: "Product Full-Stack Dev",
  product_designer: "Product Designer",
  product_developer: "Product Developer",
};

// ---------------------------------------------------------------------------
// UI Colors & Styling
// ---------------------------------------------------------------------------

export const ROLE_COLORS: Record<
  UserRole,
  { bg: string; text: string; dot: string }
> = {
  // End-User Roles (Cool / Blue / Green spectrum)
  super_admin: { bg: "bg-teal-500/10", text: "text-teal-400", dot: "bg-teal-500" },
  tenant_admin: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-500" },
  auditor: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-500" },
  workflow_manager: { bg: "bg-indigo-500/10", text: "text-indigo-400", dot: "bg-indigo-500" },
  billing_admin: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
  developer: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  tenant_member: { bg: "bg-sky-500/10", text: "text-sky-400", dot: "bg-sky-500" },
  guest_viewer: { bg: "bg-gray-500/10", text: "text-gray-400", dot: "bg-gray-500" },

  // Internal System Roles (Warm / Purple / Pink spectrum)
  cto: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500" },
  platform_engineering_lead: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", dot: "bg-fuchsia-500" },
  product_lead: { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-500" },
  senior_backend_engineer: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-500" },
  frontend_engineer: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
  qa_engineer: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-500" },
  sdk_dx_engineer: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
  ai_prompt_owner: { bg: "bg-pink-500/10", text: "text-pink-400", dot: "bg-pink-500" },
  product_fullstack_dev: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
  product_designer: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", dot: "bg-fuchsia-500" },
  product_developer: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
};

// Composite helper for dashboard mapped directly from ROLE_COLORS
export const ROLES: Record<UserRole, { label: string; color: string }> = {
  // End-User
  super_admin: { label: "Super Admin", color: "teal" },
  tenant_admin: { label: "Tenant Admin", color: "cyan" },
  auditor: { label: "Auditor", color: "slate" },
  workflow_manager: { label: "Workflow Manager", color: "indigo" },
  billing_admin: { label: "Billing Admin", color: "emerald" },
  developer: { label: "Developer", color: "blue" },
  tenant_member: { label: "Tenant Member", color: "sky" },
  guest_viewer: { label: "Guest / Viewer", color: "gray" },

  // Internal System
  cto: { label: "CTO / VP Engineering", color: "purple" },
  platform_engineering_lead: { label: "Platform Eng Lead", color: "fuchsia" },
  product_lead: { label: "Product Lead / PM", color: "violet" },
  senior_backend_engineer: { label: "Sr. Backend Engineer", color: "rose" },
  frontend_engineer: { label: "Frontend / Full-Stack Dev", color: "orange" },
  qa_engineer: { label: "QA / Test Engineer", color: "amber" },
  sdk_dx_engineer: { label: "SDK / DX Engineer", color: "yellow" },
  ai_prompt_owner: { label: "Prompt & AI Owner", color: "pink" },
  product_fullstack_dev: { label: "Product Full-Stack Dev", color: "red" },
  product_designer: { label: "Product Designer", color: "fuchsia" },
  product_developer: { label: "Product Developer", color: "orange" },
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  // End-User
  super_admin: "bg-teal-500/10 text-teal-400",
  tenant_admin: "bg-cyan-500/10 text-cyan-400",
  auditor: "bg-slate-500/10 text-slate-400",
  workflow_manager: "bg-indigo-500/10 text-indigo-400",
  billing_admin: "bg-emerald-500/10 text-emerald-400",
  developer: "bg-blue-500/10 text-blue-400",
  tenant_member: "bg-sky-500/10 text-sky-400",
  guest_viewer: "bg-gray-500/10 text-gray-400",

  // Internal System
  cto: "bg-purple-500/10 text-purple-400",
  platform_engineering_lead: "bg-fuchsia-500/10 text-fuchsia-400",
  product_lead: "bg-violet-500/10 text-violet-400",
  senior_backend_engineer: "bg-rose-500/10 text-rose-400",
  frontend_engineer: "bg-orange-500/10 text-orange-400",
  qa_engineer: "bg-amber-500/10 text-amber-400",
  sdk_dx_engineer: "bg-yellow-500/10 text-yellow-400",
  ai_prompt_owner: "bg-pink-500/10 text-pink-400",
  product_fullstack_dev: "bg-red-500/10 text-red-400",
  product_designer: "bg-fuchsia-500/10 text-fuchsia-400",
  product_developer: "bg-orange-500/10 text-orange-400",
};

// ---------------------------------------------------------------------------
// Permission & Identity Helpers
// ---------------------------------------------------------------------------

/** Returns true if the role belongs to the Internal System Team */
export function isInternalTeam(role: UserRole): boolean {
  const internalRoles: UserRole[] = [
    "cto",
    "platform_engineering_lead",
    "product_lead",
    "senior_backend_engineer",
    "frontend_engineer",
    "qa_engineer",
    "sdk_dx_engineer",
    "ai_prompt_owner",
    "product_fullstack_dev",
    "product_designer",
    "product_developer",
  ];
  return internalRoles.includes(role);
}

/** Returns true if the role can manage their team members (add, edit, remove). */
export function canManageTeam(role: UserRole): boolean {
  // End-user team management: super admin or tenant admin
  // Internal team management: CTO or platform lead might have overall capabilities
  return (
    role === "super_admin" ||
    role === "tenant_admin" ||
    role === "cto" ||
    role === "platform_engineering_lead"
  );
}
