import { NextRequest, NextResponse } from "next/server";

const commentsStore: Record<string, { id: string; author: string; text: string; createdAt: string }[]> = {};

// GET /api/tasks/:id/comments — get comments
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const defaultComments = [
    { id: "c1", author: "Finance Bot", text: "Invoice has been verified against PO #PO-2026-142. All line items match.", createdAt: "2026-04-06T14:35:00Z" },
    { id: "c2", author: "Budget System", text: "Budget check passed. Remaining budget for ENG-2026-Q1: $12,150.00", createdAt: "2026-04-06T14:36:00Z" },
  ];

  return NextResponse.json(commentsStore[id] ?? defaultComments);
}

// POST /api/tasks/:id/comments — add a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const comment = {
    id: `c_${Date.now()}`,
    author: "Current User",
    text: body.text ?? "",
    createdAt: new Date().toISOString(),
  };

  if (!commentsStore[id]) commentsStore[id] = [];
  commentsStore[id].push(comment);

  return NextResponse.json(comment, { status: 201 });
}
