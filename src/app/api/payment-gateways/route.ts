import { NextRequest, NextResponse } from "next/server";

const gateways = [
  {
    id: "gw_stripe",
    name: "Stripe",
    provider: "stripe",
    enabled: true,
    mode: "live",
    publicKey: "pk_live_••••••••••••4242",
    secretKey: "sk_live_••••••••••••8888",
    webhookSecret: "whsec_••••••••••••",
    webhookUrl: "https://api.glimmora.io/hooks/stripe",
    supportedMethods: ["card", "bank_transfer", "wallet"],
    currencies: ["USD", "EUR", "GBP", "INR"],
    createdAt: "2025-11-01",
  },
  {
    id: "gw_razorpay",
    name: "Razorpay",
    provider: "razorpay",
    enabled: false,
    mode: "test",
    publicKey: "rzp_test_••••••••••••",
    secretKey: "••••••••••••••••",
    webhookSecret: "••••••••••••••••",
    webhookUrl: "https://api.glimmora.io/hooks/razorpay",
    supportedMethods: ["card", "upi", "netbanking", "wallet"],
    currencies: ["INR", "USD"],
    createdAt: "2026-01-15",
  },
];

// GET /api/payment-gateways — list all gateways
export async function GET() {
  return NextResponse.json(gateways);
}

// PUT /api/payment-gateways — update gateway configuration
export async function PUT(req: NextRequest) {
  const body = await req.json();

  const updated = {
    ...body,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updated);
}
