import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatDT(d: Date | null) {
  if (!d) return null;
  return d.toISOString().slice(0, 16).replace("T", " ");
}

function serialize(r: {
  id: string;
  name: string;
  dataScope: string;
  format: string;
  status: string;
  requestedBy: string;
  requestedAt: Date;
  completedAt: Date | null;
  fileSize: string | null;
  progress: number;
  reason: string;
}) {
  return {
    id: r.id,
    name: r.name,
    dataScope: r.dataScope,
    format: r.format,
    status: r.status,
    requestedBy: r.requestedBy,
    requestedAt: formatDT(r.requestedAt) ?? "",
    completedAt: formatDT(r.completedAt),
    fileSize: r.fileSize,
    progress: r.progress,
    reason: r.reason,
  };
}

export async function GET() {
  const rows = await prisma.dataExportRequest.findMany({ orderBy: { requestedAt: "desc" } });
  return NextResponse.json(rows.map(serialize));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Export name is required" }, { status: 400 });
  if (!body.reason?.trim()) return NextResponse.json({ error: "Reason is required" }, { status: 400 });

  const requestedBy = req.headers.get("x-user-name") || "Current User";

  const created = await prisma.dataExportRequest.create({
    data: {
      name: body.name,
      dataScope: body.dataScope ?? "Audit Logs",
      format: body.format ?? "CSV",
      status: "Queued",
      requestedBy,
      reason: body.reason,
      progress: 0,
    },
  });

  // Simulated async processing: complete the export ~3s later with a size.
  setTimeout(async () => {
    try {
      await prisma.dataExportRequest.update({
        where: { id: created.id },
        data: {
          status: "Completed",
          progress: 100,
          completedAt: new Date(),
          fileSize: `${(1 + Math.random() * 20).toFixed(1)} MB`,
        },
      });
    } catch {
      // request may have been deleted; ignore
    }
  }, 3000);

  return NextResponse.json(serialize(created), { status: 201 });
}
