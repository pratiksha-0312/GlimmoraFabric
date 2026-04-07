import { NextRequest, NextResponse } from "next/server";

// GET /api/workflow-instances/:id — get instance detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const instance = {
    id,
    workflowId: "wf_001",
    workflowName: "Employee Onboarding",
    triggeredBy: "HR Admin",
    status: "Running",
    startedAt: "2026-04-05T09:00:00Z",
    sla: "Within SLA",
    steps: [
      { id: "s1", name: "Start", type: "start", status: "completed", completedAt: "2026-04-05T09:00:00Z" },
      { id: "s2", name: "HR Review", type: "task", status: "completed", completedAt: "2026-04-05T10:30:00Z", assignee: "HR Admin" },
      { id: "s3", name: "Background Check", type: "task", status: "completed", completedAt: "2026-04-05T14:00:00Z", assignee: "Compliance" },
      { id: "s4", name: "Check Passed?", type: "decision", status: "completed", completedAt: "2026-04-05T14:05:00Z", result: "Yes" },
      { id: "s5", name: "IT Setup", type: "task", status: "running", assignee: "IT Team", startedAt: "2026-04-05T14:10:00Z" },
      { id: "s6", name: "Access Provisioning", type: "task", status: "pending", assignee: "IT Team" },
      { id: "s7", name: "Manager Notification", type: "task", status: "pending", assignee: "System" },
      { id: "s8", name: "End", type: "end", status: "pending" },
    ],
  };

  return NextResponse.json(instance);
}
