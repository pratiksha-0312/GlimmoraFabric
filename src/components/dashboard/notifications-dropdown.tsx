"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Activity,
  FileText,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { notificationStore, type AppNotification } from "@/lib/notification-store";

interface NotificationsDropdownProps {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

// Static seed notifications (shown immediately)
const SEED: AppNotification[] = [
  { id: "seed-1", icon: Shield, title: "Security Alert", description: "New login detected from unknown device", timeAgo: "2 min ago", unread: true, timestamp: Date.now() - 120_000 },
  { id: "seed-2", icon: Users, title: "Team Update", description: "A new user accepted the invitation", timeAgo: "15 min ago", unread: true, timestamp: Date.now() - 900_000 },
  { id: "seed-3", icon: Activity, title: "Service Deployed", description: "auth-service v2.4.1 deployed successfully", timeAgo: "1 hour ago", unread: true, timestamp: Date.now() - 3_600_000 },
  { id: "seed-4", icon: FileText, title: "Report Ready", description: "Monthly compliance report is ready", timeAgo: "3 hours ago", unread: false, timestamp: Date.now() - 10_800_000 },
  { id: "seed-5", icon: Bell, title: "System Update", description: "Platform maintenance scheduled for Sunday", timeAgo: "1 day ago", unread: false, timestamp: Date.now() - 86_400_000 },
];

export function NotificationsDropdown({
  open,
  onClose,
  onUnreadCountChange,
}: NotificationsDropdownProps) {
  // Subscribe to the global notification store
  const storeNotifications = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getAll,
    notificationStore.getAll,
  );

  // Merge seed + store
  const notifications = storeNotifications.length > 0
    ? [...storeNotifications, ...SEED.filter((s) => !storeNotifications.some((n) => n.id === s.id))]
    : SEED;

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Start the simulated WS feed on mount
  useEffect(() => {
    notificationStore.start();
  }, []);

  // Show toast for real-time notifications
  const [prevLen, setPrevLen] = useState(storeNotifications.length);
  useEffect(() => {
    if (storeNotifications.length > prevLen) {
      const newest = storeNotifications[0];
      if (newest) toast(newest.title, { description: newest.description });
    }
    setPrevLen(storeNotifications.length);
  }, [storeNotifications.length, prevLen, storeNotifications]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const markAllRead = useCallback(() => {
    notificationStore.markAllRead();
    // also mark seeds
    SEED.forEach((s) => (s.unread = false));
  }, []);

  const markOneRead = useCallback((id: string) => {
    notificationStore.markRead(id);
    const s = SEED.find((n) => n.id === id);
    if (s) s.unread = false;
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Dropdown panel */}
      <div
        data-dropdown
        className="absolute top-full right-0 z-50 mt-2 w-96 rounded-xl shadow-xl"
        style={{
          backgroundColor: "var(--gf-bg-surface)",
          border: "1px solid var(--gf-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--gf-border)" }}
        >
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--gf-text-primary)" }}
            >
              Notifications
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Live — connected" />
          </div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markOneRead}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 text-center"
          style={{ borderTop: "1px solid var(--gf-border)" }}
        >
          <Link
            href="/notifications"
            className="text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
            onClick={onClose}
          >
            View all notifications
          </Link>
        </div>
      </div>
    </>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const Icon = notification.icon;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{
        backgroundColor: notification.unread
          ? "rgba(20, 184, 166, 0.06)"
          : "transparent",
      }}
      onClick={() => {
        if (notification.unread) onRead(notification.id);
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = notification.unread
          ? "rgba(20, 184, 166, 0.10)"
          : "var(--gf-bg-elevated)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = notification.unread
          ? "rgba(20, 184, 166, 0.06)"
          : "")
      }
    >
      {/* Icon */}
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: "var(--gf-bg-elevated)",
          color: "var(--gf-text-secondary)",
        }}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--gf-text-primary)" }}
          >
            {notification.title}
          </p>
          <span
            className="shrink-0 text-xs"
            style={{ color: "var(--gf-text-muted)" }}
          >
            {notification.timeAgo}
          </span>
        </div>
        <p
          className="mt-0.5 text-xs truncate"
          style={{ color: "var(--gf-text-secondary)" }}
        >
          {notification.description}
        </p>
      </div>

      {/* Unread dot */}
      {notification.unread && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
      )}
    </div>
  );
}
