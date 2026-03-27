"use client";

import {
  Shield,
  Users,
  Activity,
  FileText,
  Bell,
  type LucideIcon,
} from "lucide-react";

interface NotificationsDropdownProps {
  open: boolean;
  onClose: () => void;
}

interface Notification {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    icon: Shield,
    title: "Security Alert",
    description: "New login detected from unknown device",
    timeAgo: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: Users,
    title: "Team Update",
    description: "Priya Sharma accepted the invitation",
    timeAgo: "15 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: Activity,
    title: "Service Deployed",
    description: "auth-service v2.4.1 deployed successfully",
    timeAgo: "1 hour ago",
    unread: true,
  },
  {
    id: 4,
    icon: FileText,
    title: "Report Ready",
    description: "Monthly compliance report is ready",
    timeAgo: "3 hours ago",
    unread: false,
  },
  {
    id: 5,
    icon: Bell,
    title: "System Update",
    description: "Platform maintenance scheduled for Sunday",
    timeAgo: "1 day ago",
    unread: false,
  },
];

export function NotificationsDropdown({
  open,
  onClose,
}: NotificationsDropdownProps) {
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
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--gf-text-primary)" }}
          >
            Notifications
          </h3>
          <button
            className="text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
            onClick={() => {
              /* mark all read handler */
            }}
          >
            Mark all read
          </button>
        </div>

        {/* Notification list */}
        <div className="max-h-96 overflow-y-auto">
          {mockNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 text-center"
          style={{ borderTop: "1px solid var(--gf-border)" }}
        >
          <button
            className="text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
            onClick={onClose}
          >
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const Icon = notification.icon;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={
        {
          "--hover-bg": "var(--gf-bg-elevated)",
        } as React.CSSProperties
      }
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--gf-bg-elevated)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
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
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );
}
