import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/onboarding/progress?tenantId=xxx — get onboarding progress for a tenant
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing tenantId query parameter" },
      { status: 400 },
    );
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { platformUsers: { select: { id: true } } },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 },
      );
    }

    // Derive progress from tenant data
    const steps = [
      {
        step: 1,
        label: "Organization info",
        completed: Boolean(tenant.name && tenant.name.trim() !== ""),
      },
      {
        step: 2,
        label: "Plan selection",
        completed: Boolean(tenant.plan && tenant.plan !== "Starter"),
      },
      {
        step: 3,
        label: "Invite team members",
        completed: tenant.platformUsers.length > 0,
      },
      {
        step: 4,
        label: "Configuration",
        completed: Boolean(tenant.domain && tenant.domain.trim() !== ""),
      },
    ];

    const completedSteps = steps.filter((s) => s.completed).length;
    const currentStep = completedSteps < 4 ? completedSteps + 1 : 4;

    return NextResponse.json({
      tenantId: tenant.id,
      currentStep,
      totalSteps: 4,
      completedSteps,
      isComplete: completedSteps === 4,
      steps,
    });
  } catch (error) {
    console.error("Onboarding progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding progress" },
      { status: 500 },
    );
  }
}
