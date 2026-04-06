"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
  ROLE_LABELS, ROLE_COLORS, isInternalTeam, type UserRole,
} from "@/lib/roles";

const END_USER_ROLES: UserRole[] = [
  "super_admin", "tenant_admin", "auditor", "workflow_manager",
  "billing_admin", "developer", "tenant_member", "guest_viewer",
];

const INTERNAL_ROLES: UserRole[] = [
  "cto", "platform_engineering_lead", "product_lead", "senior_backend_engineer",
  "frontend_engineer", "qa_engineer", "sdk_dx_engineer", "ai_prompt_owner",
  "product_fullstack_dev", "product_designer", "product_developer",
];

const ROLE_DESCRIPTIONS: Partial<Record<UserRole, string>> = {
  super_admin: "Full platform ownership",
  tenant_admin: "Manage tenant config & users",
  auditor: "View-only audit & compliance",
  workflow_manager: "Manage workflows & approvals",
  billing_admin: "Manage billing & payments",
  developer: "Build with APIs & SDKs",
  tenant_member: "Standard member access",
  guest_viewer: "Read-only guest access",
  cto: "Strategic tech leadership",
  platform_engineering_lead: "Platform operations",
  product_lead: "Roadmap & features",
  senior_backend_engineer: "Backend systems",
  frontend_engineer: "Frontend development",
  qa_engineer: "Testing & validation",
  sdk_dx_engineer: "SDK & developer experience",
  ai_prompt_owner: "Prompt & AI management",
  product_fullstack_dev: "Full-stack product dev",
  product_designer: "Product design",
  product_developer: "Product development",
};

interface RoleAssignmentDropdownProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleAssignmentDropdown({ value, onChange }: RoleAssignmentDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filterRoles = (roles: UserRole[]) =>
    roles.filter((r) => ROLE_LABELS[r].toLowerCase().includes(search.toLowerCase()));

  const filteredEnd = filterRoles(END_USER_ROLES);
  const filteredInternal = filterRoles(INTERNAL_ROLES);
  const color = ROLE_COLORS[value];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm w-full"
        style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
        <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
        <span className="flex-1 text-left">{ROLE_LABELS[value]}</span>
        <ChevronDown className="h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-xl border shadow-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--gf-text-muted)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles..."
                className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs outline-none"
                style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredEnd.length > 0 && (
              <>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--gf-text-muted)", backgroundColor: "var(--gf-bg-elevated)" }}>End-User Roles</p>
                {filteredEnd.map((r) => (
                  <RoleItem key={r} role={r} selected={value === r} onClick={() => { onChange(r); setOpen(false); setSearch(""); }} />
                ))}
              </>
            )}
            {filteredInternal.length > 0 && (
              <>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--gf-text-muted)", backgroundColor: "var(--gf-bg-elevated)" }}>Internal System Roles</p>
                {filteredInternal.map((r) => (
                  <RoleItem key={r} role={r} selected={value === r} onClick={() => { onChange(r); setOpen(false); setSearch(""); }} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RoleItem({ role, selected, onClick }: { role: UserRole; selected: boolean; onClick: () => void }) {
  const color = ROLE_COLORS[role];
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${selected ? "bg-black/5 dark:bg-white/5" : ""}`}>
      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.dot}`} />
      <div className="min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{ROLE_LABELS[role]}</p>
        <p className="text-[10px] truncate" style={{ color: "var(--gf-text-muted)" }}>{ROLE_DESCRIPTIONS[role]}</p>
      </div>
    </button>
  );
}
