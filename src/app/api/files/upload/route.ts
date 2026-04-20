import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

function fileCategory(mimeType: string): "image" | "document" {
  return mimeType.startsWith("image/") ? "image" : "document";
}

// POST /api/files/upload — upload a file and record it in the database
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const storagePath = `/uploads/${filename}`;
    const type = fileCategory(file.type || "");
    const uploadedBy = req.headers.get("x-user-name") || "Current User";

    const record = await prisma.file.create({
      data: {
        name: file.name,
        type,
        size: buffer.byteLength,
        mimeType: file.type || "application/octet-stream",
        storagePath,
        uploadedBy,
        // For real image uploads we can serve the bytes directly; /thumbnail
        // will fall back to the storagePath when it's set.
        thumbnailUrl: type === "image" ? storagePath : null,
      },
    });

    return NextResponse.json({
      id: record.id,
      url: storagePath,
      name: record.name,
      type: record.type,
      size: record.size,
      mimeType: record.mimeType,
      uploadedBy: record.uploadedBy,
      uploadedAt: record.createdAt.toISOString(),
      thumbnailUrl: record.thumbnailUrl,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
