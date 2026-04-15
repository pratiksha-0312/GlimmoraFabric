// Global notification store backed by /api/notifications + real-time WS /ws/notifications.

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
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
  timestamp: number;
}

interface ServerNotification {
  id: string;
  type: string;
  title: string;
  description: string;
  unread: boolean;
  createdAt: string;
}

type WsMessage =
  | { type: "hello"; ts: number }
  | { type: "created"; notification: ServerNotification }
  | { type: "read"; id: string }
  | { type: "read_all" };

type Listener = () => void;

const ICON_MAP: Record<string, LucideIcon> = {
  task_approved: CheckCircle,
  task_escalated: AlertTriangle,
  new_assignment: Users,
  workflow_completed: Activity,
  comment_added: FileText,
  task_due_soon: Bell,
  approval_required: Shield,
};

let notifications: AppNotification[] = [];
let listeners: Listener[] = [];
let ws: WebSocket | null = null;
let started = false;
let connected = false;

function emit() {
  listeners.forEach((fn) => fn());
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function toApp(n: ServerNotification): AppNotification {
  return {
    id: n.id,
    icon: ICON_MAP[n.type] ?? Bell,
    title: n.title,
    description: n.description,
    timeAgo: formatTimeAgo(n.createdAt),
    unread: n.unread,
    timestamp: new Date(n.createdAt).getTime(),
  };
}

async function refresh() {
  try {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = (await res.json()) as { items: ServerNotification[] };
    notifications = data.items.map(toApp);
    emit();
  } catch {
    // ignore
  }
}

function connect() {
  if (typeof window === "undefined" || ws) return;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = `${protocol}//${window.location.host}/ws/notifications`;

  try {
    ws = new WebSocket(url);
  } catch {
    ws = null;
    return;
  }

  ws.onopen = () => {
    connected = true;
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WsMessage;
      if (msg.type === "created") {
        notifications = [toApp(msg.notification), ...notifications].slice(0, 100);
        emit();
      } else if (msg.type === "read") {
        notifications = notifications.map((n) =>
          n.id === msg.id ? { ...n, unread: false } : n
        );
        emit();
      } else if (msg.type === "read_all") {
        notifications = notifications.map((n) => ({ ...n, unread: false }));
        emit();
      }
    } catch {
      // ignore malformed
    }
  };

  ws.onclose = () => {
    connected = false;
    ws = null;
    if (started) setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export const notificationStore = {
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

  async markRead(id: string) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    emit();
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
  },

  async markAllRead() {
    notifications = notifications.map((n) => ({ ...n, unread: false }));
    emit();
    await fetch(`/api/notifications/all/read`, { method: "PUT" });
  },

  isConnected(): boolean {
    return connected;
  },

  start() {
    if (started) return;
    started = true;
    void refresh();
    connect();
  },

  stop() {
    started = false;
    ws?.close();
    ws = null;
    connected = false;
  },
};
