import { NextRequest, NextResponse } from "next/server";

// GET /api/tasks/:id — get task detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const task = {
    id,
    title: "Review Invoice #INV-2026-008",
    type: "Approval",
    workflow: "Invoice Approval",
    workflowInstanceId: "wi_002",
    priority: "High",
    status: "Pending",
    assignee: "Current User",
    requester: "Finance Bot",
    description: "Please review and approve the attached invoice for Q1 consulting services from Acme Corp. The total amount is $4,850.00 which falls within the pre-approved budget for this vendor.",
    dueDate: "2026-04-08",
    createdAt: "2026-04-06T14:30:00Z",
    metadata: {
      invoiceNumber: "INV-2026-008",
      vendor: "Acme Corp",
      amount: "$4,850.00",
      department: "Engineering",
      budgetCode: "ENG-2026-Q1",
    },
    history: [
      { action: "Created", by: "Finance Bot", at: "2026-04-06T14:30:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-04-06T14:30:05Z" },
      { action: "Reminder sent", by: "System", at: "2026-04-07T09:00:00Z" },
    ],
  };

  return NextResponse.json(task);
}
