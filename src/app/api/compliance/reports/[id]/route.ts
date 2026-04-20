import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(r: {
  id: string;
  name: string;
  type: string;
  framework: string;
  period: string;
  status: string;
  date: string;
  size: string;
  findings: number;
  score: number;
  generatedBy: string;
  summary: string;
  sections: string;
}) {
  let sections: unknown = [];
  try { sections = JSON.parse(r.sections || "[]"); } catch { sections = []; }
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    framework: r.framework,
    period: r.period,
    status: r.status,
    date: r.date,
    size: r.size,
    findings: r.findings,
    score: r.score,
    generatedBy: r.generatedBy,
    summary: r.summary,
    sections,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await prisma.complianceReport.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(report));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.complianceReport.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
