import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/onboarding — complete onboarding for a tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, organizationName, domain, branding, invitedMembers } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: "Missing tenantId" },
        { status: 400 },
      );
    }

    // Update tenant with onboarding data
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: organizationName || undefined,
        domain: domain || undefined,
        status: "Active",
      },
    });

    // Create invited platform users (if any)
    if (invitedMembers && Array.isArray(invitedMembers) && invitedMembers.length > 0) {
      const usersToCreate = invitedMembers.map((member: { name: string; email: string; role: string }) => ({
        name: member.name,
        email: member.email,
        role: member.role || "tenant_member",
        status: "Invited",
        tenant: updatedTenant.name,
        tenantId: updatedTenant.id,
        joinedDate: new Date().toISOString().split("T")[0],
      }));

      await prisma.platformUser.createMany({ data: usersToCreate });
    }

    return NextResponse.json({
      success: true,
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        domain: updatedTenant.domain,
        plan: updatedTenant.plan,
        status: updatedTenant.status,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
