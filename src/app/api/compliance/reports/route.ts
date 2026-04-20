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

export async function GET() {
  const reports = await prisma.complianceReport.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(reports.map(serialize));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.complianceReport.create({
    data: {
      name: body.name,
      type: body.type ?? "Custom",
      framework: body.framework ?? "Custom Framework",
      period: body.period ?? "",
      status: body.status ?? "Pending",
      date: body.date ?? new Date().toISOString().slice(0, 10),
      generatedBy: body.generatedBy ?? "Current User",
      summary: body.summary ?? "",
      sections: body.sections ? JSON.stringify(body.sections) : "[]",
    },
  });
  return NextResponse.json(serialize(created), { status: 201 });
}
