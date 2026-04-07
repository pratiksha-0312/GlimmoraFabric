import { NextResponse } from "next/server";

// GET /api/workflows/sla-status — SLA status dashboard data
export async function GET() {
  const slaData = {
    summary: {
      totalActive: 42,
      withinSLA: 36,
      atRisk: 4,
      breached: 2,
      complianceRate: 85.7,
    },
    byWorkflow: [
      { workflow: "Employee Onboarding", total: 12, withinSLA: 11, atRisk: 1, breached: 0, avgCompletion: "2.3 days", slaTarget: "3 days" },
      { workflow: "Invoice Approval", total: 15, withinSLA: 12, atRisk: 2, breached: 1, avgCompletion: "4.1 hrs", slaTarget: "4 hrs" },
      { workflow: "Support Ticket Escalation", total: 8, withinSLA: 7, atRisk: 0, breached: 1, avgCompletion: "1.8 hrs", slaTarget: "2 hrs" },
      { workflow: "Tenant Provisioning", total: 5, withinSLA: 4, atRisk: 1, breached: 0, avgCompletion: "45 min", slaTarget: "1 hr" },
      { workflow: "Document Review", total: 2, withinSLA: 2, atRisk: 0, breached: 0, avgCompletion: "1.2 days", slaTarget: "2 days" },
    ],
    trend: [
      { month: "Nov", compliance: 78 },
      { month: "Dec", compliance: 80 },
      { month: "Jan", compliance: 82 },
      { month: "Feb", compliance: 84 },
      { month: "Mar", compliance: 85.7 },
    ],
  };

  return NextResponse.json(slaData);
}
