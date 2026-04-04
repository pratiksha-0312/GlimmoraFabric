"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";
import {
  User, Shield, Building2, Monitor, Key, Lock, Bell, CreditCard, ChevronRight,
} from "lucide-react";

interface SettingsSection {
  title: string;
  description: string;
  icon: typeof User;
  href: string;
  visibleTo?: UserRole[]; // undefined = all authenticated users
}

const sections: SettingsSection[] = [
  { title: "Profile", description: "Update your name, avatar, and personal details", icon: User, href: "/settings/profile" },
  { title: "Security", description: "Password, MFA, and security preferences", icon: Shield, href: "/settings/security" },
  { title: "Billing & Subscription", description: "Manage plan, payment methods, and invoices", icon: CreditCard, href: "/settings/billing", visibleTo: ["billing_admin", "tenant_admin"] },
  { title: "Organization", description: "Manage organization details and members", icon: Building2, href: "/settings/organization", visibleTo: ["tenant_admin"] },
  { title: "Active Sessions", description: "View and manage your logged-in devices", icon: Monitor, href: "/settings/sessions" },
  { title: "API Tokens", description: "Generate and manage personal API tokens", icon: Key, href: "/settings/api-tokens", visibleTo: ["developer", "tenant_admin"] },
  { title: "SSO Configuration", description: "Configure Single Sign-On providers", icon: Lock, href: "/settings/sso", visibleTo: ["tenant_admin", "super_admin"] },
  { title: "Notifications", description: "Manage notification preferences", icon: Bell, href: "/dashboard/notifications" },
];

export function SettingsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role;

  const visibleSections = sections.filter(
    (s) => !s.visibleTo || (userRole && s.visibleTo.includes(userRole)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Manage your account and platform preferences
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleSections.map((s) => (
          <button
            key={s.title}
            onClick={() => router.push(s.href)}
            className="flex items-center gap-4 rounded-xl border p-5 text-left transition-colors hover:border-[var(--gf-accent)]"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
              <s.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{s.title}</h3>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--gf-text-secondary)" }}>{s.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--gf-text-muted)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
