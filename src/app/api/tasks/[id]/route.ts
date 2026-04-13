import { NextRequest, NextResponse } from "next/server";

// Mock tasks keyed by ID — matches the list from /api/tasks/my
const TASKS: Record<string, {
  id: string; title: string; type: string; workflow: string; workflowInstanceId: string;
  priority: string; status: string; assignee: string; approver: string; requester: string;
  description: string; dueDate: string; createdAt: string;
  metadata: Record<string, string>;
  history: { action: string; by: string; at: string }[];
}> = {
  task_001: {
    id: "task_001",
    title: "Review Invoice #INV-2026-008",
    type: "Approval",
    workflow: "Invoice Approval",
    workflowInstanceId: "wi_002",
    priority: "High",
    status: "Pending",
    assignee: "Current User",
    approver: "Current User",
    requester: "Finance Bot",
    description: "Please review and approve the attached invoice for Q1 consulting services from Acme Corp. The total amount is $4,850.00 which falls within the pre-approved budget for this vendor.",
    dueDate: "2026-04-08",
    createdAt: "2026-04-06T14:30:00Z",
    metadata: { invoiceNumber: "INV-2026-008", vendor: "Acme Corp", amount: "$4,850.00", department: "Engineering", budgetCode: "ENG-2026-Q1" },
    history: [
      { action: "Created", by: "Finance Bot", at: "2026-04-06T14:30:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-04-06T14:30:05Z" },
      { action: "Reminder sent", by: "System", at: "2026-04-07T09:00:00Z" },
    ],
  },
  task_002: {
    id: "task_002",
    title: "Approve Employee Onboarding — John Smith",
    type: "Approval",
    workflow: "Employee Onboarding",
    workflowInstanceId: "wi_005",
    priority: "Medium",
    status: "Pending",
    assignee: "Current User",
    approver: "Current User",
    requester: "HR Admin",
    description: "New employee John Smith is joining the Engineering team on April 14. Please review the onboarding checklist and approve to proceed with equipment provisioning and access setup.",
    dueDate: "2026-04-10",
    createdAt: "2026-04-05T09:00:00Z",
    metadata: { employeeName: "John Smith", department: "Engineering", startDate: "2026-04-14", position: "Software Engineer", manager: "Jane Doe" },
    history: [
      { action: "Created", by: "HR Admin", at: "2026-04-05T09:00:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-04-05T09:00:10Z" },
    ],
  },
  task_003: {
    id: "task_003",
    title: "Sign-off Document: Q1 Report",
    type: "Review",
    workflow: "Document Review",
    workflowInstanceId: "wi_008",
    priority: "Low",
    status: "Pending",
    assignee: "Current User",
    approver: "Current User",
    requester: "Product Lead",
    description: "The Q1 performance report has been finalized and requires your sign-off before distribution to stakeholders. Please review the attached document for accuracy.",
    dueDate: "2026-04-12",
    createdAt: "2026-04-04T11:00:00Z",
    metadata: { documentName: "Q1-2026-Performance-Report.pdf", pages: "24", author: "Product Lead", version: "2.1" },
    history: [
      { action: "Created", by: "Product Lead", at: "2026-04-04T11:00:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-04-04T11:00:05Z" },
    ],
  },
  task_004: {
    id: "task_004",
    title: "Escalated: Support Ticket #4521",
    type: "Escalation",
    workflow: "Support Ticket Escalation",
    workflowInstanceId: "wi_003",
    priority: "Urgent",
    status: "Pending",
    assignee: "Current User",
    approver: "Current User",
    requester: "System",
    description: "Support ticket #4521 has breached its SLA and has been automatically escalated to you. The customer reports a critical data export issue affecting their production environment.",
    dueDate: "2026-04-07",
    createdAt: "2026-04-07T08:15:00Z",
    metadata: { ticketId: "#4521", customer: "Nexus Corp", severity: "P1 — Critical", category: "Data Export", slaStatus: "Breached" },
    history: [
      { action: "Created", by: "Support System", at: "2026-04-06T10:00:00Z" },
      { action: "SLA Breached — Auto-escalated", by: "System", at: "2026-04-07T08:15:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-04-07T08:15:05Z" },
    ],
  },
  task_005: {
    id: "task_005",
    title: "Configure Tenant: Aero Systems",
    type: "Task",
    workflow: "Tenant Provisioning",
    workflowInstanceId: "wi_010",
    priority: "Medium",
    status: "Completed",
    assignee: "Current User",
    approver: "Current User",
    requester: "API",
    description: "Provision and configure a new tenant for Aero Systems. Set up resource allocation, default roles, and initial admin account.",
    dueDate: "2026-04-05",
    createdAt: "2026-04-03T16:00:00Z",
    metadata: { tenantName: "Aero Systems", plan: "Enterprise", region: "us-east-1", adminEmail: "admin@aerosystems.io" },
    history: [
      { action: "Created", by: "API", at: "2026-04-03T16:00:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-04-03T16:00:05Z" },
      { action: "Completed", by: "Current User", at: "2026-04-04T14:30:00Z" },
    ],
  },
  task_006: {
    id: "task_006",
    title: "Review Invoice #INV-2026-005",
    type: "Approval",
    workflow: "Invoice Approval",
    workflowInstanceId: "wi_011",
    priority: "High",
    status: "Rejected",
    assignee: "Current User",
    approver: "Current User",
    requester: "Finance Bot",
    description: "Invoice from CloudServe Inc. for cloud infrastructure services. Amount exceeds the pre-approved vendor budget by 15%.",
    dueDate: "2026-04-03",
    createdAt: "2026-04-01T10:00:00Z",
    metadata: { invoiceNumber: "INV-2026-005", vendor: "CloudServe Inc.", amount: "$12,300.00", department: "Infrastructure", budgetCode: "INFRA-2026-Q1" },
    history: [
      { action: "Created", by: "Finance Bot", at: "2026-04-01T10:00:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-04-01T10:00:05Z" },
      { action: "Rejected — over budget", by: "Current User", at: "2026-04-02T11:00:00Z" },
    ],
  },
  task_007: {
    id: "task_007",
    title: "Approve Budget Allocation Q2",
    type: "Approval",
    workflow: "Invoice Approval",
    workflowInstanceId: "wi_012",
    priority: "High",
    status: "Approved",
    assignee: "Current User",
    approver: "Current User",
    requester: "CFO",
    description: "Q2 budget allocation for the Engineering department has been prepared. Total allocation: $340,000. Please review and approve.",
    dueDate: "2026-04-02",
    createdAt: "2026-03-30T09:00:00Z",
    metadata: { totalBudget: "$340,000", department: "Engineering", quarter: "Q2 2026", preparedBy: "CFO Office" },
    history: [
      { action: "Created", by: "CFO", at: "2026-03-30T09:00:00Z" },
      { action: "Assigned to Current User", by: "System", at: "2026-03-30T09:00:05Z" },
      { action: "Approved", by: "Current User", at: "2026-03-31T15:00:00Z" },
    ],
  },
};

// GET /api/tasks/:id — get task detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const task = TASKS[id];
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}
