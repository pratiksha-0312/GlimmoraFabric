import { NextResponse } from "next/server";

const instances = [
  { id: "wi_001", workflowId: "wf_001", workflowName: "Employee Onboarding", triggeredBy: "HR Admin", status: "Running", currentStep: "IT Setup", progress: 62, startedAt: "2026-04-05T09:00:00Z", sla: "Within SLA" },
  { id: "wi_002", workflowId: "wf_002", workflowName: "Invoice Approval", triggeredBy: "Finance Bot", status: "Running", currentStep: "Manager Review", progress: 50, startedAt: "2026-04-06T14:30:00Z", sla: "Within SLA" },
  { id: "wi_003", workflowId: "wf_002", workflowName: "Invoice Approval", triggeredBy: "Finance Bot", status: "Running", currentStep: "Director Sign-off", progress: 83, startedAt: "2026-04-04T11:00:00Z", sla: "At Risk" },
  { id: "wi_004", workflowId: "wf_003", workflowName: "Support Ticket Escalation", triggeredBy: "System", status: "Running", currentStep: "L2 Review", progress: 40, startedAt: "2026-04-07T08:15:00Z", sla: "Within SLA" },
  { id: "wi_005", workflowId: "wf_005", workflowName: "Tenant Provisioning", triggeredBy: "API", status: "Completed", currentStep: "Done", progress: 100, startedAt: "2026-04-03T16:00:00Z", sla: "Within SLA" },
  { id: "wi_006", workflowId: "wf_001", workflowName: "Employee Onboarding", triggeredBy: "HR Admin", status: "Failed", currentStep: "Background Check", progress: 37, startedAt: "2026-04-02T10:00:00Z", sla: "Breached" },
  { id: "wi_007", workflowId: "wf_003", workflowName: "Support Ticket Escalation", triggeredBy: "System", status: "Cancelled", currentStep: "L1 Triage", progress: 20, startedAt: "2026-04-01T13:45:00Z", sla: "N/A" },
];

// GET /api/workflow-instances — list all instances
export async function GET() {
  return NextResponse.json(instances);
}
