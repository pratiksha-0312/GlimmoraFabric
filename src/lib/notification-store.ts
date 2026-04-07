// ---------------------------------------------------------------------------
// Global notification store – simulates WebSocket-driven real-time events
// ---------------------------------------------------------------------------

import {
  Shield,
  Users,
  Activity,
  FileText,
  Bell,
  CheckCircle,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export interface AppNotification {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
  timestamp: number;
}

type Listener = () => void;

// Simulated incoming task-related notifications
const REALTIME_EVENTS: Omit<AppNotification, "id" | "timeAgo" | "unread" | "timestamp">[] = [
  { icon: CheckCircle, title: "Task Approved", description: "Invoice #INV-2026-012 has been approved" },
  { icon: AlertTriangle, title: "Task Escalated", description: "Support Ticket #4590 escalated to you" },
  { icon: Users, title: "New Assignment", description: "You were assigned to Employee Onboarding — Jane Doe" },
  { icon: Activity, title: "Workflow Completed", description: "Tenant Provisioning for Nexus Corp finished" },
  { icon: FileText, title: "Comment Added", description: "Product Lead commented on Q1 Report review" },
  { icon: Bell, title: "Task Due Soon", description: "Budget Allocation Q3 is due in 2 hours" },
  { icon: Shield, title: "Approval Required", description: "New access request from dev-team@acme.io" },
];

let nextId = 100;
let notifications: AppNotification[] = [];
let listeners: Listener[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let started = false;

function emit() {
  listeners.forEach((fn) => fn());
}

function push(n: AppNotification) {
  notifications = [n, ...notifications].slice(0, 50);
  emit();
}

function pickRandom() {
  return REALTIME_EVENTS[Math.floor(Math.random() * REALTIME_EVENTS.length)];
}

// Public API ----------------------------------------------------------------

export const notificationStore = {
  /** Subscribe — returns unsubscribe fn */
  subscribe(fn: Listener) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },

  getAll(): AppNotification[] {
    return notifications;
  },

  getUnreadCount(): number {
    return notifications.filter((n) => n.unread).length;
  },

  markRead(id: number) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    emit();
  },

  markAllRead() {
    notifications = notifications.map((n) => ({ ...n, unread: false }));
    emit();
  },

  /** Start simulating incoming WebSocket events */
  start() {
    if (started) return;
    started = true;

    // Push an initial event after 4 seconds, then every 15-30 seconds
    timer = setTimeout(() => {
      const ev = pickRandom();
      push({ ...ev, id: nextId++, timeAgo: "Just now", unread: true, timestamp: Date.now() });

      timer = setInterval(() => {
        const ev = pickRandom();
        push({ ...ev, id: nextId++, timeAgo: "Just now", unread: true, timestamp: Date.now() });
      }, 15_000 + Math.random() * 15_000) as unknown as ReturnType<typeof setInterval>;
    }, 4_000) as unknown as ReturnType<typeof setInterval>;
  },

  stop() {
    if (timer) clearInterval(timer);
    started = false;
  },
};
