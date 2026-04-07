import { NextResponse } from "next/server";

// GET /api/billing/analytics — revenue analytics data
export async function GET() {
  const analytics = {
    mrr: 12450,
    arr: 149400,
    churnRate: 2.3,
    activeSubscriptions: 126,
    totalRevenue: 89250,
    avgRevenuePerUser: 98.75,
    newSubscriptions: 14,
    cancelledSubscriptions: 3,
    mrrGrowth: 8.5,
    revenueByPlan: [
      { plan: "Starter", revenue: 2610, subscribers: 90, percentage: 29 },
      { plan: "Pro", revenue: 5940, subscribers: 60, percentage: 47 },
      { plan: "Enterprise", revenue: 3900, subscribers: 16, percentage: 24 },
    ],
    monthlyRevenue: [
      { month: "Oct", revenue: 9800 },
      { month: "Nov", revenue: 10200 },
      { month: "Dec", revenue: 10800 },
      { month: "Jan", revenue: 11200 },
      { month: "Feb", revenue: 11800 },
      { month: "Mar", revenue: 12450 },
    ],
    churnHistory: [
      { month: "Oct", rate: 3.1 },
      { month: "Nov", rate: 2.8 },
      { month: "Dec", rate: 2.5 },
      { month: "Jan", rate: 2.9 },
      { month: "Feb", rate: 2.4 },
      { month: "Mar", rate: 2.3 },
    ],
  };

  return NextResponse.json(analytics);
}
