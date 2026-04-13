// ---------------------------------------------------------------------------
// Global notification store – connects to WebSocket /ws/notifications
// Falls back to simulated events if WebSocket is unavailable
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

// Task-related notification event templates
const NOTIFICATION_EVENTS: Omit<AppNotification, "id" | "timeAgo" | "unread" | "timestamp">[] = [
  { icon: CheckCircle, title: "Task Approved", description: "Invoice #INV-2026-012 has been approved" },
  { icon: AlertTriangle, title: "Task Escalated", description: "Support Ticket #4590 escalated to you" },
  { icon: Users, title: "New Assignment", description: "You were assigned to Employee Onboarding — Jane Doe" },
  { icon: Activity, title: "Workflow Completed", description: "Tenant Provisioning for Nexus Corp finished" },
  { icon: FileText, title: "Comment Added", description: "Product Lead commented on Q1 Report review" },
  { icon: Bell, title: "Task Due Soon", description: "Budget Allocation Q3 is due in 2 hours" },
  { icon: Shield, title: "Approval Required", description: "New access request from dev-team@acme.io" },
];

// Icon mapping for WebSocket messages
const ICON_MAP: Record<string, LucideIcon> = {
  task_approved: CheckCircle,
  task_escalated: AlertTriangle,
  new_assignment: Users,
  workflow_completed: Activity,
  comment_added: FileText,
  task_due_soon: Bell,
  approval_required: Shield,
};

let nextId = 100;
let notifications: AppNotification[] = [];
let listeners: Listener[] = [];
let ws: WebSocket | null = null;
let fallbackTimer: ReturnType<typeof setInterval> | null = null;
let started = false;
let wsConnected = false;

function emit() {
  listeners.forEach((fn) => fn());
}

function push(n: AppNotification) {
  notifications = [n, ...notifications].slice(0, 50);
  emit();
}

function pickRandom() {
  return NOTIFICATION_EVENTS[Math.floor(Math.random() * NOTIFICATION_EVENTS.length)];
}

function connectWebSocket() {
  if (typeof window === "undefined") return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      wsConnected = true;
      // Stop fallback simulation when WS is connected
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const icon = ICON_MAP[data.type] ?? Bell;
        push({
          id: nextId++,
          icon,
          title: data.title ?? "Notification",
          description: data.description ?? "",
          timeAgo: "Just now",
          unread: true,
          timestamp: Date.now(),
        });
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsConnected = false;
      ws = null;
      // Start fallback simulation
      startFallbackSimulation();
      // Attempt reconnect after 5 seconds
      if (started) {
        setTimeout(() => {
          if (started && !wsConnected) connectWebSocket();
        }, 5000);
      }
    };

    ws.onerror = () => {
      // Will trigger onclose, which handles fallback
      ws?.close();
    };
  } catch {
    // WebSocket not available, use fallback
    wsConnected = false;
    startFallbackSimulation();
  }
}

function startFallbackSimulation() {
  if (fallbackTimer || !started) return;

  // Push an initial event after 4 seconds, then every 15-30 seconds
  fallbackTimer = setTimeout(() => {
    const ev = pickRandom();
    push({ ...ev, id: nextId++, timeAgo: "Just now", unread: true, timestamp: Date.now() });

    fallbackTimer = setInterval(() => {
      const ev = pickRandom();
      push({ ...ev, id: nextId++, timeAgo: "Just now", unread: true, timestamp: Date.now() });
    }, 15_000 + Math.random() * 15_000) as unknown as ReturnType<typeof setInterval>;
  }, 4_000) as unknown as ReturnType<typeof setInterval>;
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

  /** Whether the store is connected via real WebSocket */
  isWebSocketConnected(): boolean {
    return wsConnected;
  },

  /** Start listening — tries WebSocket first, falls back to simulation */
  start() {
    if (started) return;
    started = true;
    connectWebSocket();
  },

  stop() {
    started = false;
    if (fallbackTimer) {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    wsConnected = false;
  },
};
