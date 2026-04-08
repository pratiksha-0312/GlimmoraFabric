import { NextRequest, NextResponse } from "next/server";

// Gateway configuration — in production you'd store these in an encrypted DB table.
// For now this returns the configured gateway info based on env vars.

function getGateways() {
  const hasStripe = !!process.env.STRIPE_SECRET_KEY;

  return [
    {
      id: "gw_stripe",
      name: "Stripe",
      provider: "stripe",
      enabled: hasStripe,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
        ? "live"
        : "test",
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        ? `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.slice(0, 12)}••••`
        : "Not configured",
      secretKey: hasStripe ? "sk_••••••••••••" : "Not configured",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        ? "whsec_••••••••••••"
        : "Not configured",
      webhookUrl: "/api/webhooks/stripe",
      supportedMethods: ["card", "bank_transfer", "wallet"],
      currencies: ["USD", "EUR", "GBP", "INR"],
    },
    {
      id: "gw_razorpay",
      name: "Razorpay",
      provider: "razorpay",
      enabled: false,
      mode: "test",
      publicKey: "Not configured",
      secretKey: "Not configured",
      webhookSecret: "Not configured",
      webhookUrl: "/api/webhooks/razorpay",
      supportedMethods: ["card", "upi", "netbanking", "wallet"],
      currencies: ["INR", "USD"],
    },
  ];
}

// GET /api/payment-gateways
export async function GET() {
  return NextResponse.json(getGateways());
}

// PUT /api/payment-gateways — update gateway configuration
// In production this would update encrypted values in DB
export async function PUT(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({
    ...body,
    updatedAt: new Date().toISOString(),
    message:
      "Gateway config received. In production, update your environment variables and redeploy.",
  });
}
