"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Search, Plus, Eye, Pencil,
  ChevronLeft, ChevronRight, Users, Lock, UserCheck,
} from "lucide-react";
import {
  ROLE_LABELS, ROLE_COLORS,
  isInternalTeam, type UserRole,
} from "@/lib/roles";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const ALL_ROLES: UserRole[] = [
  "super_admin","tenant_admin","auditor","workflow_manager","billing_admin",
  "developer","tenant_member","guest_viewer",
  "cto","platform_engineering_lead","product_lead","senior_backend_engineer",
  "frontend_engineer","qa_engineer","sdk_dx_engineer","ai_prompt_owner",
  "product_fullstack_dev","product_designer","product_developer",
];

const MOCK_USERS_COUNT: Record<UserRole, number> = {
  super_admin: 2, tenant_admin: 4, auditor: 2, workflow_manager: 3,
  billing_admin: 2, developer: 12, tenant_member: 18, guest_viewer: 5,
  cto: 1, platform_engineering_lead: 2, product_lead: 3, senior_backend_engineer: 4,
  frontend_engineer: 5, qa_engineer: 3, sdk_dx_engineer: 2, ai_prompt_owner: 1,
  product_fullstack_dev: 3, product_designer: 2, product_developer: 4,
};

const MOCK_PERMS_COUNT: Record<UserRole, number> = {
  super_admin: 60, tenant_admin: 35, auditor: 12, workflow_manager: 18,
  billing_admin: 15, developer: 22, tenant_member: 8, guest_viewer: 4,
  cto: 55, platform_engineering_lead: 50, product_lead: 30, senior_backend_engineer: 40,
  frontend_engineer: 28, qa_engineer: 25, sdk_dx_engineer: 22, ai_prompt_owner: 20,
  product_fullstack_dev: 32, product_designer: 15, product_developer: 28,
};

// Mock role-user assignment data
const MOCK_ROLE_USERS: { name: string; email: string; role: UserRole; status: "Active" | "Inactive" | "Invited"; assignedOn: string }[] = [
  { name: "Ishan Verma", email: "ishan@glimmora.com", role: "super_admin", status: "Active", assignedOn: "2026-01-10" },
  { name: "Pratiksha Yadav", email: "pratiksha@glimmora.com", role: "super_admin", status: "Active", assignedOn: "2026-01-10" },
  { name: "Vanshika Singh", email: "vanshika@glimmora.com", role: "frontend_engineer", status: "Active", assignedOn: "2026-01-15" },
  { name: "Arjun Mehta", email: "arjun@glimmora.com", role: "tenant_admin", status: "Active", assignedOn: "2026-01-20" },
  { name: "Riya Kapoor", email: "riya@glimmora.com", role: "tenant_admin", status: "Active", assignedOn: "2026-02-01" },
  { name: "Dev Sharma", email: "dev@glimmora.com", role: "developer", status: "Active", assignedOn: "2026-02-05" },
  { name: "Priya Nair", email: "priya@glimmora.com", role: "developer", status: "Active", assignedOn: "2026-02-10" },
  { name: "Karan Patel", email: "karan@glimmora.com", role: "developer", status: "Active", assignedOn: "2026-02-10" },
  { name: "Sneha Joshi", email: "sneha@glimmora.com", role: "auditor", status: "Active", assignedOn: "2026-02-15" },
  { name: "Rahul Gupta", email: "rahul@glimmora.com", role: "cto", status: "Active", assignedOn: "2026-01-05" },
  { name: "Neha Reddy", email: "neha@glimmora.com", role: "platform_engineering_lead", status: "Active", assignedOn: "2026-01-08" },
  { name: "Amit Tiwari", email: "amit@glimmora.com", role: "qa_engineer", status: "Active", assignedOn: "2026-02-20" },
  { name: "Pooja Das", email: "pooja@glimmora.com", role: "billing_admin", status: "Active", assignedOn: "2026-03-01" },
  { name: "Vikram Roy", email: "vikram@glimmora.com", role: "workflow_manager", status: "Invited", assignedOn: "2026-03-15" },
  { name: "Ananya Iyer", email: "ananya@glimmora.com", role: "tenant_member", status: "Active", assignedOn: "2026-03-10" },
  { name: "Rohan Mishra", email: "rohan@glimmora.com", role: "guest_viewer", status: "Inactive", assignedOn: "2026-02-28" },
];

const ROLES_PAGE_SIZE = 5;
const USERS_PAGE_SIZE = 8;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RolesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"roles" | "assignments">("roles");

  // Roles tab state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "end-user" | "internal">("all");
  const [page, setPage] = useState(1);

  // Assignments tab state
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userPage, setUserPage] = useState(1);

  // Roles filtering
  const filtered = useMemo(() => {
    return ALL_ROLES.filter((r) => {
      const label = ROLE_LABELS[r].toLowerCase();
      if (search && !label.includes(search.toLowerCase())) return false;
      if (typeFilter === "end-user" && isInternalTeam(r)) return false;
      if (typeFilter === "internal" && !isInternalTeam(r)) return false;
      return true;
    });
  }, [search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ROLES_PAGE_SIZE);
  const paged = filtered.slice((page - 1) * ROLES_PAGE_SIZE, page * ROLES_PAGE_SIZE);
  const endUserCount = ALL_ROLES.filter((r) => !isInternalTeam(r)).length;
  const internalCount = ALL_ROLES.filter((r) => isInternalTeam(r)).length;

  // Assignments filtering
  const filteredUsers = useMemo(() => {
    return MOCK_ROLE_USERS.filter((u) => {
      if (userSearch) {
        const q = userSearch.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      return true;
    });
  }, [userSearch, roleFilter]);

  const userTotalPages = Math.ceil(filteredUsers.length / USERS_PAGE_SIZE);
  const pagedUsers = filteredUsers.slice((userPage - 1) * USERS_PAGE_SIZE, userPage * USERS_PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Role & Permission Management</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage roles, permissions, and user assignments</p>
        </div>
        <button onClick={() => router.push("/dashboard/roles/create")}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-4 w-4" /> Add Role
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Roles", value: ALL_ROLES.length, icon: <Shield className="h-5 w-5" /> },
          { label: "End-User Roles", value: endUserCount, icon: <Users className="h-5 w-5" /> },
          { label: "Internal Roles", value: internalCount, icon: <Lock className="h-5 w-5" /> },
          { label: "Total Assignments", value: MOCK_ROLE_USERS.length, icon: <UserCheck className="h-5 w-5" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>{s.icon}</div>
              <span className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{s.value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--gf-border)" }}>
        <button onClick={() => setActiveTab("roles")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "roles" ? "border-[var(--gf-accent)]" : "border-transparent"
          }`}
          style={{ color: activeTab === "roles" ? "var(--gf-accent)" : "var(--gf-text-secondary)" }}>
          <Shield className="h-4 w-4 inline mr-1.5" />Roles ({ALL_ROLES.length})
        </button>
        <button onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "assignments" ? "border-[var(--gf-accent)]" : "border-transparent"
          }`}
          style={{ color: activeTab === "assignments" ? "var(--gf-accent)" : "var(--gf-text-secondary)" }}>
          <UserCheck className="h-4 w-4 inline mr-1.5" />Role-User Assignments ({MOCK_ROLE_USERS.length})
        </button>
      </div>

      {/* ====== ROLES TAB ====== */}
      {activeTab === "roles" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search roles..." className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
              className="rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="all">All Types</option>
              <option value="end-user">End-User</option>
              <option value="internal">Internal</option>
            </select>
          </div>

          {/* Roles Table */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {["Role Name", "Type", "Users", "Permissions", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gf-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => {
                  const color = ROLE_COLORS[r];
                  const internal = isInternalTeam(r);
                  return (
                    <tr key={r} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
                          <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{ROLE_LABELS[r]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          internal ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                        }`}>{internal ? "Internal" : "End-User"}</span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{MOCK_USERS_COUNT[r]}</td>
                      <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{MOCK_PERMS_COUNT[r]}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => router.push(`/dashboard/roles/${r}`)} title="View"
                            className="rounded-lg p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                            style={{ color: "var(--gf-text-secondary)" }}><Eye className="h-4 w-4" /></button>
                          <button onClick={() => router.push(`/dashboard/roles/${r}`)} title="Edit"
                            className="rounded-lg p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                            style={{ color: "var(--gf-text-secondary)" }}><Pencil className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Roles Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                Showing {(page - 1) * ROLES_PAGE_SIZE + 1}–{Math.min(page * ROLES_PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}
                  className="rounded-lg border px-2 py-1 disabled:opacity-40"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
                  className="rounded-lg border px-2 py-1 disabled:opacity-40"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ====== ROLE-USER ASSIGNMENTS TAB ====== */}
      {activeTab === "assignments" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
              <input value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                placeholder="Search users..." className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setUserPage(1); }}
              className="rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <option value="all">All Roles</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {/* Assignments Table */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {["User", "Email", "Assigned Role", "Type", "Status", "Assigned On"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gf-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((u, i) => {
                  const color = ROLE_COLORS[u.role];
                  const internal = isInternalTeam(u.role);
                  return (
                    <tr key={i} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--gf-accent)" }}>
                            {u.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${color.dot}`} />
                          <span className="font-medium" style={{ color: "var(--gf-text-primary)" }}>{ROLE_LABELS[u.role]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          internal ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                        }`}>{internal ? "Internal" : "End-User"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === "Active" ? "bg-green-500/10 text-green-400" :
                          u.status === "Invited" ? "bg-amber-500/10 text-amber-400" : "bg-gray-500/10 text-gray-400"
                        }`}>{u.status}</span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--gf-text-muted)" }}>{u.assignedOn}</td>
                    </tr>
                  );
                })}
                {pagedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No assignments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Assignments Pagination */}
          {userTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
                Showing {(userPage - 1) * USERS_PAGE_SIZE + 1}–{Math.min(userPage * USERS_PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setUserPage(userPage - 1)} disabled={userPage === 1}
                  className="rounded-lg border px-2 py-1 disabled:opacity-40"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setUserPage(userPage + 1)} disabled={userPage === userTotalPages}
                  className="rounded-lg border px-2 py-1 disabled:opacity-40"
                  style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
