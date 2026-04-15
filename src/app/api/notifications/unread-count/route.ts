import { NextResponse } from "next/server";
import { getNotifications } from "../route";

export async function GET() {
  const count = getNotifications().filter((n) => n.unread).length;
  return NextResponse.json({ count });
}
