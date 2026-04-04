"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, CheckSquare, Users, Shield,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, ROLE_BADGE_CLASSES, isInternalTeam, type UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Permission matrix data
// ---------------------------------------------------------------------------
const MODULES = [
  "Notifications", "Payments", "Audit", "Workflows",
  "Documents", "Tenants", "AI Platform", "Configuration", "Analytics", "Monitoring", "Dev Tools",
];

const ACTIONS = ["View", "Create", "Edit", "Delete", "Manage"];

// Mock: super_admin gets all, others get partial
function getDefaultPerms(role: UserRole): Record<string, boolean> {
  const perms: Record<string, boolean> = {};
  for (const mod of MODULES) {
    for (const act of ACTIONS) {
      const key = `${mod}:${act}`;
      if (role === "super_admin" || role === "cto") {
        perms[key] = true;
      } else if (role === "tenant_admin") {
        perms[key] = act !== "Manage" || mod === "Tenants";
      } else if (role === "developer") {
        perms[key] = ["View", "Create", "Edit"].includes(act) && ["Dev Tools", "AI Platform", "Documents", "Notifications"].includes(mod);
      } else if (role === "auditor") {
        perms[key] = act === "View" && ["Audit", "Monitoring", "Analytics"].includes(mod);
      } else {
        perms[key] = act === "View";
      }
    }
  }
  return perms;
}

const MOCK_ROLE_USERS: Record<string, { name: string; email: string; status: string; lastLogin: string }[]> = {
  super_admin: [
    { name: "Super Admin", email: "superadmin@glimmora.com", status: "Active", lastLogin: "2 min ago" },
  ],
};

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as UserRole;
  const roleLabel = ROLE_LABELS[roleId] ?? roleId;
  const roleColor = ROLE_COLORS[roleId];
  const internal = isInternalTeam(roleId);

  const [tab, setTab] = useState<"permissions" | "users">("permissions");
  const [perms, setPerms] = useState(() => getDefaultPerms(roleId));
  const [saved, setSaved] = useState(false);

  const togglePerm = (key: string) => {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const users = MOCK_ROLE_USERS[roleId] ?? [
    { name: "User 1", email: "user1@glimmora.com", status: "Active", lastLogin: "5 hr ago" },
    { name: "User 2", email: "user2@glimmora.com", status: "Active", lastLogin: "1 day ago" },
  ];

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/dashboard/roles")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Roles
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-4 w-4 rounded-full ${roleColor?.dot ?? "bg-gray-500"}`} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{roleLabel}</h1>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${
              internal ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
            }`}>{internal ? "Internal System" : "End-User"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--gf-border)" }}>
        {(["permissions", "users"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? "border-[var(--gf-accent)]" : "border-transparent"
            }`}
            style={{ color: tab === t ? "var(--gf-accent)" : "var(--gf-text-secondary)" }}>
            {t === "permissions" ? <><CheckSquare className="h-4 w-4 inline mr-1.5" />Permissions</> :
              <><Users className="h-4 w-4 inline mr-1.5" />Users ({users.length})</>}
          </button>
        ))}
      </div>

      {/* Permissions Tab */}
      {tab === "permissions" && (
        <div className="space-y-4">
          <div className="rounded-xl border overflow-x-auto" style={cardStyle}>
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
                          <input type="checkbox" checked={!!perms[key]}
                            onChange={() => togglePerm(key)}
                            className="h-4 w-4 rounded accent-teal-500 cursor-pointer" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-400">
                <Shield className="h-4 w-4" /> Permissions saved!
              </span>
            )}
            <button onClick={handleSave}
              className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--gf-accent)" }}>
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--gf-accent)" }}>
              <Users className="h-4 w-4" /> Assign User
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden" style={cardStyle}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {["Name", "Email", "Status", "Last Login"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--gf-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{u.name}</td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.status === "Active" ? "bg-green-500/10 text-green-400" :
                        u.status === "Invited" ? "bg-amber-500/10 text-amber-400" : "bg-gray-500/10 text-gray-400"
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-muted)" }}>{u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
