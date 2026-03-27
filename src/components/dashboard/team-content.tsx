"use client";

import { useAuth } from "@/context/auth-context";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  canManageTeam,
  type UserRole,
} from "@/lib/roles";
import { Plus } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface TeamMember {
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
}

const teamMembers: TeamMember[] = [
  {
    name: "Ishan Yadav",
    email: "ishan@glimmora.com",
    role: "super_admin",
    status: "active",
  },
  {
    name: "Priya Sharma",
    email: "priya@glimmora.com",
    role: "admin",
    status: "active",
  },
  {
    name: "Rahul Verma",
    email: "rahul@glimmora.com",
    role: "developer",
    status: "active",
  },
  {
    name: "Anita Desai",
    email: "anita@glimmora.com",
    role: "developer",
    status: "active",
  },
  {
    name: "Vikram Singh",
    email: "vikram@glimmora.com",
    role: "auditor",
    status: "active",
  },
  {
    name: "Dev Patel",
    email: "dev@glimmora.com",
    role: "viewer",
    status: "inactive",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeamContent() {
  const { user } = useAuth();
  const currentRole = user?.role ?? "viewer";
  const isManager = canManageTeam(currentRole);

  // Viewers cannot access team management
  if (currentRole === "viewer") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Team Members</h1>
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <p style={{ color: "var(--gf-text-secondary)" }}>
            You don&apos;t have permission to view team members
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Team Members</h1>
        {isManager && (
          <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors" style={{ backgroundColor: "var(--gf-accent)", color: "var(--gf-text-primary)" }}>
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-left font-medium">Role</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              {isManager && (
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => {
              const colors = ROLE_COLORS[member.role];
              const initial = member.name.charAt(0).toUpperCase();
              const isActive = member.status === "active";

              return (
                <tr
                  key={member.email}
                  className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: "var(--gf-border)" }}
                >
                  {/* Name + avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colors.dot}`}
                        style={{ color: "var(--gf-text-primary)" }}
                      >
                        {initial}
                      </div>
                      <span className="text-sm" style={{ color: "var(--gf-text-primary)" }}>{member.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                    {member.email}
                  </td>

                  {/* Role badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      {ROLE_LABELS[member.role]}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isActive ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  {isManager && (
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm transition-colors mr-3 hover:opacity-80" style={{ color: "var(--gf-text-secondary)" }}>
                        Edit
                      </button>
                      <button className="text-sm transition-colors hover:opacity-80" style={{ color: "var(--gf-text-secondary)" }}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
