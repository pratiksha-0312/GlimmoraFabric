import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.documentTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Template name is required" }, { status: 400 });
  }

  const createdBy = req.headers.get("x-user-name") || "Current User";

  const created = await prisma.documentTemplate.create({
    data: {
      name: body.name,
      description: body.description ?? "",
      type: body.type ?? "invoice",
      format: body.format ?? "html",
      status: body.status ?? "draft",
      version: 1,
      content: body.content ?? "",
      usageCount: 0,
      createdBy,
      updatedBy: createdBy,
    },
  });

  // Record initial version snapshot.
  await prisma.documentTemplateVersion.create({
    data: {
      templateId: created.id,
      version: 1,
      status: "current",
      changedBy: createdBy,
      changeDescription: "Initial version",
      content: created.content,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
