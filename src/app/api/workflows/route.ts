import { NextRequest, NextResponse } from "next/server";

const workflows = [
  { id: "wf_001", name: "Employee Onboarding", description: "End-to-end onboarding process for new hires", status: "Published", version: 3, trigger: "Manual", steps: 8, createdBy: "Admin", createdAt: "2026-02-15", updatedAt: "2026-03-28" },
  { id: "wf_002", name: "Invoice Approval", description: "Multi-level invoice approval with SLA tracking", status: "Published", version: 5, trigger: "Event", steps: 6, createdBy: "Admin", createdAt: "2026-01-10", updatedAt: "2026-04-01" },
  { id: "wf_003", name: "Support Ticket Escalation", description: "Auto-escalate tickets based on SLA breach", status: "Published", version: 2, trigger: "Event", steps: 5, createdBy: "Admin", createdAt: "2026-03-01", updatedAt: "2026-03-20" },
  { id: "wf_004", name: "Document Review", description: "Document review and sign-off workflow", status: "Draft", version: 1, trigger: "API", steps: 4, createdBy: "Admin", createdAt: "2026-04-02", updatedAt: "2026-04-02" },
  { id: "wf_005", name: "Tenant Provisioning", description: "Automated tenant setup and resource allocation", status: "Published", version: 4, trigger: "API", steps: 10, createdBy: "Admin", createdAt: "2025-12-20", updatedAt: "2026-03-15" },
  { id: "wf_006", name: "Quarterly Report Generation", description: "Generate and distribute quarterly reports", status: "Archived", version: 2, trigger: "Schedule", steps: 6, createdBy: "Admin", createdAt: "2025-11-01", updatedAt: "2026-01-30" },
];

// GET /api/workflows — list all workflows
export async function GET() {
  return NextResponse.json(workflows);
}

// POST /api/workflows — create or save a workflow
export async function POST(req: NextRequest) {
  const body = await req.json();
  const newWorkflow = {
    id: `wf_${Date.now()}`,
    name: body.name ?? "Untitled Workflow",
    description: body.description ?? "",
    status: body.status ?? "Draft",
    version: 1,
    trigger: body.trigger ?? "Manual",
    steps: body.nodes?.length ?? 0,
    nodes: body.nodes ?? [],
    edges: body.edges ?? [],
    createdBy: "Current User",
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  return NextResponse.json(newWorkflow, { status: 201 });
}

// PUT /api/workflows — update a workflow
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const updated = {
    ...body,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  return NextResponse.json(updated);
}
