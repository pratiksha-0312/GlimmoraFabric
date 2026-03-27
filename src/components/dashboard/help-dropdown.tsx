"use client";

import {
  BookOpen,
  Zap,
  MessageCircle,
  Bug,
  FileText,
  ExternalLink,
} from "lucide-react";

interface HelpDropdownProps {
  open: boolean;
  onClose: () => void;
}

interface HelpItem {
  icon: typeof BookOpen;
  label: string;
  description: string;
  href: string;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

const sections: HelpSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        icon: BookOpen,
        label: "Documentation",
        description: "Read the platform docs",
        href: "#",
      },
      {
        icon: Zap,
        label: "Quick Start Guide",
        description: "Get up and running fast",
        href: "#",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: MessageCircle,
        label: "Contact Support",
        description: "Get help from our team",
        href: "#",
      },
      {
        icon: Bug,
        label: "Report a Bug",
        description: "Let us know about issues",
        href: "#",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        icon: FileText,
        label: "API Reference",
        description: "Explore the API docs",
        href: "#",
      },
      {
        icon: ExternalLink,
        label: "GitHub",
        description: "View source code",
        href: "#",
      },
    ],
  },
];

export function HelpDropdown({ open, onClose }: HelpDropdownProps) {
  if (!open) return null;

  return (
    <>
      {/* Dropdown panel */}
      <div
        data-dropdown
        className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: "var(--gf-bg-surface)",
          border: "1px solid var(--gf-border)",
        }}
      >
        {sections.map((section, sectionIndex) => (
          <div key={section.title}>
            {/* Section header */}
            <div
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--gf-text-muted)" }}
            >
              {section.title}
            </div>

            {/* Section items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ textDecoration: "none" }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: "var(--gf-text-secondary)" }}
                  />
                  <div className="min-w-0">
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--gf-text-primary)" }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      {item.description}
                    </div>
                  </div>
                </a>
              );
            })}

            {/* Separator between sections */}
            {sectionIndex < sections.length - 1 && (
              <div
                className="border-b"
                style={{ borderColor: "var(--gf-border)" }}
              />
            )}
          </div>
        ))}

        {/* Footer */}
        <div
          className="border-t px-4 py-3 text-center text-xs"
          style={{
            borderColor: "var(--gf-border)",
            color: "var(--gf-text-muted)",
          }}
        >
          Glimmora Fabric v1.0.0
        </div>
      </div>
    </>
  );
}
