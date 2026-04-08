import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/payments — create a Stripe PaymentIntent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, planName, amount, currency, billing, tenantId } = body;

    if (!amount || !planName) {
      return NextResponse.json(
        { error: "amount and planName are required" },
        { status: 400 },
      );
    }

    const amountInCents = Math.round(amount * 100);

    // Create or retrieve a Stripe customer
    let customerId: string | undefined;
    if (billing?.email) {
      const existing = await stripe.customers.list({
        email: billing.email,
        limit: 1,
      });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: billing.email,
          name: billing.fullName,
          address: {
            line1: billing.address,
            city: billing.city,
            state: billing.state,
            postal_code: billing.zip,
            country: billing.country,
          },
        });
        customerId = customer.id;
      }
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: (currency ?? "USD").toLowerCase(),
      customer: customerId,
      metadata: {
        planId: planId ?? "",
        planName,
        tenantId: tenantId ?? "",
      },
      automatic_payment_methods: { enabled: true },
    });

    // Store a pending payment in DB
    const payment = await prisma.payment.create({
      data: {
        tenantId: tenantId ?? "unknown",
        stripePaymentId: paymentIntent.id,
        amount: amountInCents,
        currency: (currency ?? "USD").toLowerCase(),
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        id: payment.id,
        stripePaymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount,
        currency: currency ?? "USD",
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/payments — list payments for a tenant
export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");

    const payments = await prisma.payment.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { refunds: true },
    });

    return NextResponse.json(payments);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to list payments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
