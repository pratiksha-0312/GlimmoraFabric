import { NextResponse } from "next/server";

const PLANS = [
  {
    id: "p1",
    name: "Starter",
    slug: "starter",
    price: 29,
    billingCycle: "Monthly",
    currency: "USD",
    features: [
      "Up to 5 users",
      "Basic AI Platform",
      "10 Workflows",
      "5 GB Document Storage",
      "Email Support",
    ],
  },
  {
    id: "p2",
    name: "Pro",
    slug: "pro",
    price: 99,
    billingCycle: "Monthly",
    currency: "USD",
    features: [
      "Up to 25 users",
      "Advanced AI Platform",
      "Unlimited Workflows",
      "50 GB Document Storage",
      "API Access",
      "Priority Support",
    ],
  },
  {
    id: "p3",
    name: "Enterprise",
    slug: "enterprise",
    price: 249,
    billingCycle: "Monthly",
    currency: "USD",
    features: [
      "Unlimited users",
      "Full AI Platform",
      "Unlimited Workflows",
      "Unlimited Storage",
      "API Access",
      "Custom Branding",
      "SSO / SAML",
      "Dedicated Support",
      "Audit Logs",
      "Advanced Analytics",
    ],
  },
];

// GET /api/plans — list available plans
export async function GET() {
  return NextResponse.json(PLANS);
}
