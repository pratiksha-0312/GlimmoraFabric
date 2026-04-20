import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await prisma.documentTemplate.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.documentTemplate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updatedBy = req.headers.get("x-user-name") || "Current User";
  const contentChanged = typeof body.content === "string" && body.content !== existing.content;
  const nextVersion = contentChanged ? existing.version + 1 : existing.version;

  const updated = await prisma.documentTemplate.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.format !== undefined && { format: body.format }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.content !== undefined && { content: body.content }),
      version: nextVersion,
      updatedBy,
    },
  });

  // Snapshot the new version; mark prior versions as previous.
  if (contentChanged) {
    await prisma.documentTemplateVersion.updateMany({
      where: { templateId: id },
      data: { status: "previous" },
    });
    await prisma.documentTemplateVersion.create({
      data: {
        templateId: id,
        version: nextVersion,
        status: "current",
        changedBy: updatedBy,
        changeDescription: body.changeDescription ?? "Updated template content",
        content: updated.content,
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.documentTemplate.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
