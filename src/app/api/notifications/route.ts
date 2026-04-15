import { NextResponse } from "next/server";

export interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  description: string;
  unread: boolean;
  createdAt: string;
}

const globalKey = "__gf_notifications_store__";
type GlobalWithStore = typeof globalThis & { [globalKey]?: NotificationRecord[] };
const g = globalThis as GlobalWithStore;

const notifications: NotificationRecord[] = (g[globalKey] ??= [
  { id: "n-001", type: "task_approved", title: "Task Approved", description: "Invoice #INV-2026-012 has been approved", unread: true, createdAt: "2026-04-15T09:12:00Z" },
  { id: "n-002", type: "task_escalated", title: "Task Escalated", description: "Support Ticket #4590 escalated to you", unread: true, createdAt: "2026-04-15T08:47:00Z" },
  { id: "n-003", type: "new_assignment", title: "New Assignment", description: "You were assigned to Employee Onboarding — Jane Doe", unread: true, createdAt: "2026-04-15T08:15:00Z" },
  { id: "n-004", type: "workflow_completed", title: "Workflow Completed", description: "Tenant Provisioning for Nexus Corp finished", unread: false, createdAt: "2026-04-14T16:30:00Z" },
]);

export function getNotifications() {
  return notifications;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const unreadOnly = searchParams.get("unread") === "true";

  const filtered = unreadOnly ? notifications.filter((n) => n.unread) : notifications;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    items,
    page,
    pageSize,
    total: filtered.length,
    unreadCount: notifications.filter((n) => n.unread).length,
  });
}
