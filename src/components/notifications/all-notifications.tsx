"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Bell,
  Shield,
  Users,
  Activity,
  FileText,
  CreditCard,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Clock,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ============================================================================
// TYPES & DATA
// ============================================================================

interface Notification {
  id: string;
  icon: LucideIcon;
  category: "security" | "team" | "system" | "billing" | "compliance" | "deployment";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const CATEGORY_META: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  security: { label: "Security", color: "#ef4444", icon: Shield },
  team: { label: "Team", color: "#3b82f6", icon: Users },
  system: { label: "System", color: "#8b5cf6", icon: Settings },
  billing: { label: "Billing", color: "#22c55e", icon: CreditCard },
  compliance: { label: "Compliance", color: "#f59e0b", icon: FileText },
  deployment: { label: "Deployment", color: "#06b6d4", icon: Activity },
};

const PAGE_SIZE = 8;

// ============================================================================
// CUSTOM SELECT
// ============================================================================

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm min-w-[140px] outline-none" style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--gf-text-muted)" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[160px] max-h-[240px] overflow-y-auto rounded-xl border py-1 shadow-xl" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            {options.map((opt) => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`flex w-full items-center px-3 py-2 text-sm hover:bg-white/5 ${opt.value === value ? "font-medium" : ""}`} style={{ color: opt.value === value ? "var(--gf-accent)" : "var(--gf-text-primary)" }}>{opt.label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

const TYPE_TO_CATEGORY: Record<string, Notification["category"]> = {
  task_approved: "team",
  task_escalated: "security",
  new_assignment: "team",
  workflow_completed: "deployment",
  comment_added: "team",
  task_due_soon: "system",
  approval_required: "security",
};

interface ServerItem {
  id: string;
  type: string;
  title: string;
  description: string;
  unread: boolean;
  createdAt: string;
}

function mapServerItem(s: ServerItem): Notification {
  const category = TYPE_TO_CATEGORY[s.type] ?? "system";
  return {
    id: s.id,
    icon: CATEGORY_META[category].icon,
    category,
    title: s.title,
    description: s.description,
    timestamp: s.createdAt.replace("T", " ").slice(0, 16),
    read: !s.unread,
  };
}

export function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [readFilter, setReadFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const load = async () => {
      try {
        const { notificationsApi } = await import("@/lib/api");
        const data = await notificationsApi.inApp.list({ limit: 100 });
        setNotifications(
          data.items.map((it) =>
            mapServerItem({
              id: it.id,
              title: it.title,
              description: it.body,
              category: (it.payload?.category as string) ?? "general",
              priority: (it.payload?.priority as string) ?? "low",
              actor: (it.payload?.actor as string) ?? "system",
              read: !!it.read_at,
              timestamp: it.created_at,
              link: (it.payload?.link as string) ?? undefined,
            } as ServerItem),
          ),
        );
      } catch {
        // ignore
      }
    };

    const connect = async () => {
      try {
        const { connectNotificationSocket } = await import("@/lib/api");
        const socket = connectNotificationSocket({
          onStateChange: (s) => setWsConnected(s === "open"),
          onMessage: (raw) => {
            try {
              const msg = raw as { type?: string; id?: string; notification?: ServerItem };
              if (msg.type === "read" && msg.id) {
                setNotifications((prev) =>
                  prev.map((n) => (n.id === msg.id ? { ...n, read: true } : n)),
                );
              } else if (msg.type === "read_all") {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              } else if (msg.type === "created" && msg.notification) {
                setNotifications((prev) => [mapServerItem(msg.notification!), ...prev]);
              }
            } catch {
              /* ignore */
            }
          },
        });
        cleanup = () => socket.close();
      } catch {
        // No active session — leave the socket disconnected.
      }
    };

    load();
    connect();

    return () => {
      cleanup?.();
    };
  }, []);

  const filtered = useMemo(() => {
    let list = notifications;
    if (search) { const q = search.toLowerCase(); list = list.filter((n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)); }
    if (categoryFilter !== "All") list = list.filter((n) => n.category === categoryFilter);
    if (readFilter === "Unread") list = list.filter((n) => !n.read);
    if (readFilter === "Read") list = list.filter((n) => n.read);
    return list;
  }, [notifications, search, categoryFilter, readFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      const { notificationsApi } = await import("@/lib/api");
      await notificationsApi.inApp.markRead(id);
    } catch { /* swallow */ }
  };
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Backend has no bulk-mark-read endpoint yet; mark each unread row.
    try {
      const { notificationsApi } = await import("@/lib/api");
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => notificationsApi.inApp.markRead(n.id)),
      );
    } catch { /* swallow */ }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>All Notifications</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: wsConnected ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: wsConnected ? "#22c55e" : "#ef4444" }}>
            <Wifi className="h-3 w-3" />{wsConnected ? "Live" : "Connecting..."}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <CheckCircle2 className="h-4 w-4" />Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const count = notifications.filter((n) => n.category === key).length;
          const unread = notifications.filter((n) => n.category === key && !n.read).length;
          return (
            <button key={key} onClick={() => { setCategoryFilter(categoryFilter === key ? "All" : key); setPage(1); }} className={`rounded-xl border p-3 text-left transition-colors ${categoryFilter === key ? "ring-2 ring-[var(--gf-accent)]/40" : ""}`} style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>{meta.label}</span>
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>{count}</p>
              {unread > 0 && <p className="text-xs" style={{ color: meta.color }}>{unread} unread</p>}
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search notifications..." className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
        </div>
        <CustomSelect value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setPage(1); }} options={[{ label: "All Categories", value: "All" }, ...Object.entries(CATEGORY_META).map(([k, v]) => ({ label: v.label, value: k }))]} />
        <CustomSelect value={readFilter} onChange={(v) => { setReadFilter(v); setPage(1); }} options={[{ label: "All", value: "All" }, { label: "Unread", value: "Unread" }, { label: "Read", value: "Read" }]} />
      </div>

      {/* Notification List */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
        {paged.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No notifications found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--gf-border)" }}>
            {paged.map((n) => {
              const meta = CATEGORY_META[n.category];
              const Icon = n.icon;
              return (
                <div key={n.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/5" style={{ backgroundColor: n.read ? "transparent" : "rgba(var(--gf-accent-rgb), 0.04)", borderColor: "var(--gf-border)" }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5" style={{ backgroundColor: `${meta.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>{meta.label}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{n.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-secondary)" }}>{n.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3" style={{ color: "var(--gf-text-muted)" }} />
                      <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{n.timestamp}</span>
                    </div>
                  </div>
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="shrink-0 rounded-lg p-1.5 hover:opacity-70" style={{ color: "var(--gf-accent)" }} title="Mark as read">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--gf-border)" }}>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>Page {safePage} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1} className="rounded-lg p-1.5 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`h-7 w-7 rounded-lg text-xs font-medium ${n === safePage ? "text-white" : ""}`} style={n === safePage ? { backgroundColor: "var(--gf-accent)" } : { color: "var(--gf-text-secondary)" }}>{n}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages} className="rounded-lg p-1.5 disabled:opacity-30" style={{ color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
