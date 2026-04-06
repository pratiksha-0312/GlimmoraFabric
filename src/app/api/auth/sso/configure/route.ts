import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/sso/configure — save SSO provider config
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, provider, enabled, config } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "provider is required" },
        { status: 400 },
      );
    }

    const configString =
      typeof config === "string" ? config : JSON.stringify(config ?? {});

    const ssoConfig = await prisma.ssoConfig.upsert({
      where: {
        provider_tenantId: {
          provider,
          tenantId: tenantId ?? null,
        },
      },
      update: {
        enabled: enabled ?? false,
        config: configString,
      },
      create: {
        tenantId: tenantId ?? null,
        provider,
        enabled: enabled ?? false,
        config: configString,
      },
    });

    return NextResponse.json(ssoConfig, { status: 200 });
  } catch (error) {
    console.error("SSO configure error:", error);
    return NextResponse.json(
      { error: "Failed to save SSO configuration" },
      { status: 500 },
    );
  }
}
