import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export interface FileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnailUrl: string | null;
}

function serialize(f: {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  thumbnailUrl: string | null;
  createdAt: Date;
}): FileRecord {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    size: f.size,
    mimeType: f.mimeType,
    uploadedBy: f.uploadedBy,
    uploadedAt: f.createdAt.toISOString(),
    thumbnailUrl: f.thumbnailUrl,
  };
}

// GET /api/files — list all files
export async function GET() {
  const files = await prisma.file.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(files.map(serialize));
}

// DELETE /api/files?id=file_001 — delete a file (row + underlying storage)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing file id" }, { status: 400 });

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  // Best-effort removal of the on-disk copy if this row refers to a real upload.
  if (file.storagePath && file.storagePath.startsWith("/uploads/")) {
    const diskPath = join(process.cwd(), "public", file.storagePath.replace(/^\//, ""));
    await unlink(diskPath).catch(() => null);
  }

  await prisma.file.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
