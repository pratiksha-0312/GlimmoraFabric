import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token || token.length < 8) {
    return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 400 });
  }
  return NextResponse.json({
    valid: true,
    token,
    email: "user@example.com",
  });
}
