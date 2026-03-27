"use client";

import { Settings, Shield, Key } from "lucide-react";

// ---------------------------------------------------------------------------
// Settings sections
// ---------------------------------------------------------------------------

const sections = [
  {
    title: "General",
    description: "Platform name, timezone, and default preferences",
    icon: Settings,
  },
  {
    title: "Security",
    description: "Password policies, MFA enforcement, session limits",
    icon: Shield,
  },
  {
    title: "API Keys",
    description: "Manage API keys and webhook endpoints",
    icon: Key,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Platform Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Only Super Admins can access platform settings.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border p-5"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <section.icon className="h-5 w-5" style={{ color: "var(--gf-text-muted)" }} />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                    {section.title}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>
                    {section.description}
                  </p>
                </div>
              </div>
              <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-text-secondary)" }}>
                Coming soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
