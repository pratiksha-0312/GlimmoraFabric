import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function randomScore() {
  return 90 + Math.floor(Math.random() * 10);
}
function randomSize() {
  return `${(1 + Math.random() * 3).toFixed(1)} MB`;
}

const DEFAULT_SECTIONS = [
  { name: "Access Control", score: 98, status: "pass", details: "Access controls properly implemented and reviewed." },
  { name: "Data Protection", score: 95, status: "pass", details: "Data protection measures meet compliance requirements." },
  { name: "Audit Trail", score: 100, status: "pass", details: "Comprehensive audit logging in place." },
  { name: "Incident Response", score: 92, status: "pass", details: "Incident response plan documented and tested." },
  { name: "Risk Management", score: 93, status: "pass", details: "Risk assessment framework reviewed and updated." },
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Report name is required" }, { status: 400 });
  }

  const generatedBy = req.headers.get("x-user-name") || "Current User";
  const today = new Date().toISOString().slice(0, 10);

  const score = randomScore();
  const findings = Math.floor(Math.random() * 3);

  const created = await prisma.complianceReport.create({
    data: {
      name: body.name,
      type: body.type ?? "Custom",
      framework: body.framework ?? "Custom Framework",
      period: body.period ?? "",
      status: "Generated",
      date: today,
      size: randomSize(),
      findings,
      score,
      generatedBy,
      summary: `Compliance report for ${body.framework ?? "the selected framework"} covering ${body.period ?? "the requested period"}. Overall compliance score: ${score}%.`,
      sections: JSON.stringify(DEFAULT_SECTIONS),
    },
  });

  let sections: unknown = [];
  try { sections = JSON.parse(created.sections); } catch { sections = []; }

  return NextResponse.json({
    id: created.id,
    name: created.name,
    type: created.type,
    framework: created.framework,
    period: created.period,
    status: created.status,
    date: created.date,
    size: created.size,
    findings: created.findings,
    score: created.score,
    generatedBy: created.generatedBy,
    summary: created.summary,
    sections,
  }, { status: 201 });
}
