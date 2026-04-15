import { NextResponse } from "next/server";
import { getNotifications } from "../../route";
import { broadcastNotification } from "@/lib/notification-bus";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notifications = getNotifications();

  if (id === "all") {
    notifications.forEach((n) => {
      n.unread = false;
    });
    broadcastNotification({ type: "read_all" });
    return NextResponse.json({ ok: true, marked: notifications.length });
  }

  const target = notifications.find((n) => n.id === id);
  if (!target) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }
  target.unread = false;
  broadcastNotification({ type: "read", id: target.id });
  return NextResponse.json({ ok: true, notification: target });
}
