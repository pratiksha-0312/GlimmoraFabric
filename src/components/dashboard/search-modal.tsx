"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  FileText,
  Zap,
  Users,
  Settings,
  Shield,
  Bell,
  CreditCard,
  GitBranch,
  File,
  BookOpen,
  ArrowRight,
  LayoutDashboard,
  Activity,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SearchItem {
  name: string;
  category: "Pages" | "Services" | "Actions" | "Docs";
  icon: typeof Search;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const SEARCHABLE_ITEMS: SearchItem[] = [
  // Pages
  { name: "Dashboard", category: "Pages", icon: LayoutDashboard },
  { name: "Services", category: "Pages", icon: Activity },
  { name: "Team", category: "Pages", icon: Users },
  { name: "Settings", category: "Pages", icon: Settings },

  // Services
  { name: "Identity & Access", category: "Services", icon: Shield },
  { name: "Notification Hub", category: "Services", icon: Bell },
  { name: "Payment Orchestration", category: "Services", icon: CreditCard },
  { name: "Audit & Compliance", category: "Services", icon: FileText },
  { name: "Workflow Engine", category: "Services", icon: GitBranch },
  { name: "Document Service", category: "Services", icon: File },

  // Actions
  { name: "Create User", category: "Actions", icon: Users },
  { name: "Manage Roles", category: "Actions", icon: Shield },
  { name: "View Audit Logs", category: "Actions", icon: FileText },
  { name: "Generate Report", category: "Actions", icon: Zap },

  // Docs
  { name: "API Documentation", category: "Docs", icon: BookOpen },
  { name: "Getting Started", category: "Docs", icon: ArrowRight },
  { name: "Integration Guide", category: "Docs", icon: BookOpen },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  /* ---------- filtering ---------- */

  const filtered = SEARCHABLE_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Group by category, preserving insertion order
  const grouped = filtered.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Flat list for keyboard navigation
  const flatResults = Object.values(grouped).flat();

  /* ---------- reset on open ---------- */

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // Auto-focus the input after the modal renders
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* ---------- clamp selected index when results change ---------- */

  useEffect(() => {
    if (selectedIndex >= flatResults.length) {
      setSelectedIndex(Math.max(0, flatResults.length - 1));
    }
  }, [flatResults.length, selectedIndex]);

  /* ---------- scroll selected item into view ---------- */

  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  /* ---------- keyboard handler ---------- */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatResults.length - 1,
        );
      } else if (e.key === "Enter" && flatResults.length > 0) {
        e.preventDefault();
        onClose();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatResults.length, onClose],
  );

  /* ---------- don't render when closed ---------- */

  if (!open) return null;

  /* ---------- build a running index across groups ---------- */

  let runningIndex = 0;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      {/* Modal */}
      <div
        className="w-full max-w-lg rounded-xl border shadow-2xl"
        style={{
          backgroundColor: "var(--gf-bg-surface)",
          borderColor: "var(--gf-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--gf-border)" }}
        >
          <Search
            size={18}
            style={{ color: "var(--gf-text-secondary)", flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, services, actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:opacity-50"
            style={{
              backgroundColor: "var(--gf-bg-elevated)",
              color: "var(--gf-text-primary)",
              borderRadius: "0.375rem",
              padding: "0.375rem 0.5rem",
            }}
          />
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-80 overflow-y-auto px-2 py-2"
        >
          {flatResults.length === 0 ? (
            <div
              className="py-8 text-center text-sm"
              style={{ color: "var(--gf-text-secondary)" }}
            >
              No results found
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              const categoryBlock = (
                <div key={category}>
                  <div
                    className="mb-1 mt-2 px-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {category}
                  </div>

                  {items.map((item) => {
                    const idx = runningIndex++;
                    const isSelected = idx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={`${item.category}-${item.name}`}
                        data-index={idx}
                        onClick={onClose}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{
                          color: "var(--gf-text-primary)",
                          borderLeft: isSelected
                            ? "2px solid rgb(20 184 166)" /* teal-500 */
                            : "2px solid transparent",
                          backgroundColor: isSelected
                            ? "var(--gf-bg-elevated)"
                            : undefined,
                        }}
                      >
                        <Icon
                          size={16}
                          style={{ color: "var(--gf-text-secondary)", flexShrink: 0 }}
                        />
                        <span className="flex-1 truncate">{item.name}</span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--gf-text-secondary)" }}
                        >
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );

              return categoryBlock;
            })
          )}
        </div>

        {/* Keyboard hints */}
        <div
          className="flex items-center justify-center gap-4 border-t px-4 py-2 text-xs"
          style={{
            borderColor: "var(--gf-border)",
            color: "var(--gf-text-secondary)",
          }}
        >
          <span>↑↓ Navigate</span>
          <span>•</span>
          <span>Enter Select</span>
          <span>•</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
