"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, CheckSquare, Check, X, Shield,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, isInternalTeam, type UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Permission matrix data
// ---------------------------------------------------------------------------
const MODULES = [
  "Notifications", "Payments", "Audit", "Workflows",
  "Documents", "Tenants", "AI Platform", "Configuration", "Analytics", "Monitoring", "Dev Tools",
];

const ACTIONS = ["View", "Create", "Edit", "Delete", "Manage"];

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

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as UserRole;
  const roleLabel = ROLE_LABELS[roleId] ?? roleId;
  const roleColor = ROLE_COLORS[roleId];
  const internal = isInternalTeam(roleId);
  const perms = getDefaultPerms(roleId);

  const enabledCount = Object.values(perms).filter(Boolean).length;
  const totalCount = Object.keys(perms).length;

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/roles")}
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
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                internal ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
              }`}>{internal ? "Internal System" : "End-User"}</span>
              <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400">
                {enabledCount}/{totalCount} permissions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Summary */}
      <div className="rounded-xl border p-5 space-y-3" style={cardStyle}>
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--gf-text-primary)" }}>
          <Shield className="h-4 w-4" style={{ color: "var(--gf-accent)" }} /> Enabled Permissions
        </h3>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((mod) => {
            const enabled = ACTIONS.filter((act) => perms[`${mod}:${act}`]);
            if (enabled.length === 0) return null;
            return (
              <div key={mod} className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--gf-text-primary)" }}>{mod}</p>
                <div className="flex flex-wrap gap-1">
                  {enabled.map((act) => (
                    <span key={act} className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400">{act}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Permission Matrix */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--gf-text-primary)" }}>
          <CheckSquare className="h-4 w-4" style={{ color: "var(--gf-accent)" }} /> Permission Matrix
        </h3>
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
                    const enabled = !!perms[key];
                    return (
                      <td key={act} className="px-4 py-3 text-center">
                        {enabled ? (
                          <Check className="h-4 w-4 mx-auto text-green-400" />
                        ) : (
                          <X className="h-4 w-4 mx-auto" style={{ color: "var(--gf-text-muted)", opacity: 0.3 }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
