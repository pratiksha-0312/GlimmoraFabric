import { NextResponse } from "next/server";

// GET /api/tasks/my — get current user's task inbox
export async function GET() {
  const tasks = [
    { id: "task_001", title: "Review Invoice #INV-2026-008", type: "Approval", workflow: "Invoice Approval", priority: "High", status: "Pending", assignee: "Current User", requester: "Finance Bot", dueDate: "2026-04-08", createdAt: "2026-04-06T14:30:00Z" },
    { id: "task_002", title: "Approve Employee Onboarding — John Smith", type: "Approval", workflow: "Employee Onboarding", priority: "Medium", status: "Pending", assignee: "Current User", requester: "HR Admin", dueDate: "2026-04-10", createdAt: "2026-04-05T09:00:00Z" },
    { id: "task_003", title: "Sign-off Document: Q1 Report", type: "Review", workflow: "Document Review", priority: "Low", status: "Pending", assignee: "Current User", requester: "Product Lead", dueDate: "2026-04-12", createdAt: "2026-04-04T11:00:00Z" },
    { id: "task_004", title: "Escalated: Support Ticket #4521", type: "Escalation", workflow: "Support Ticket Escalation", priority: "Urgent", status: "Pending", assignee: "Current User", requester: "System", dueDate: "2026-04-07", createdAt: "2026-04-07T08:15:00Z" },
    { id: "task_005", title: "Configure Tenant: Aero Systems", type: "Task", workflow: "Tenant Provisioning", priority: "Medium", status: "Completed", assignee: "Current User", requester: "API", dueDate: "2026-04-05", createdAt: "2026-04-03T16:00:00Z" },
    { id: "task_006", title: "Review Invoice #INV-2026-005", type: "Approval", workflow: "Invoice Approval", priority: "High", status: "Rejected", assignee: "Current User", requester: "Finance Bot", dueDate: "2026-04-03", createdAt: "2026-04-01T10:00:00Z" },
    { id: "task_007", title: "Approve Budget Allocation Q2", type: "Approval", workflow: "Invoice Approval", priority: "High", status: "Approved", assignee: "Current User", requester: "CFO", dueDate: "2026-04-02", createdAt: "2026-03-30T09:00:00Z" },
  ];

  return NextResponse.json(tasks);
}
