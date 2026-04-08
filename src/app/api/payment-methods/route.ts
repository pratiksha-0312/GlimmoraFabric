import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// GET /api/payment-methods?customerId=cus_xxx
export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get("customerId");
    const tenantId = req.nextUrl.searchParams.get("tenantId");

    // If Stripe customerId is provided, fetch from Stripe
    if (customerId) {
      const methods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });

      return NextResponse.json(
        methods.data.map((m) => ({
          id: m.id,
          brand: m.card?.brand ?? "unknown",
          last4: m.card?.last4 ?? "0000",
          expMonth: m.card?.exp_month ?? 0,
          expYear: m.card?.exp_year ?? 0,
          isDefault: false,
          createdAt: new Date(m.created * 1000).toISOString(),
        })),
      );
    }

    // Otherwise fetch from DB
    const methods = await prisma.storedPaymentMethod.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(methods);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to list payment methods";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/payment-methods — attach a payment method to a customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentMethodId, customerId, tenantId } = body;

    if (!paymentMethodId || !customerId) {
      return NextResponse.json(
        { error: "paymentMethodId and customerId are required" },
        { status: 400 },
      );
    }

    // Attach the payment method to the customer in Stripe
    const method = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Store in DB
    const stored = await prisma.storedPaymentMethod.create({
      data: {
        tenantId: tenantId ?? "unknown",
        stripeMethodId: method.id,
        brand: method.card?.brand ?? "unknown",
        last4: method.card?.last4 ?? "0000",
        expMonth: method.card?.exp_month ?? 0,
        expYear: method.card?.exp_year ?? 0,
        isDefault: false,
      },
    });

    return NextResponse.json(stored, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to add payment method";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/payment-methods?id=pm_xxx
export async function DELETE(req: NextRequest) {
  try {
    const stripeMethodId = req.nextUrl.searchParams.get("id");

    if (!stripeMethodId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(stripeMethodId);

    // Remove from DB
    await prisma.storedPaymentMethod
      .delete({ where: { stripeMethodId } })
      .catch(() => {
        // Might not exist in DB yet
      });

    return NextResponse.json({ id: stripeMethodId, deleted: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete payment method";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
