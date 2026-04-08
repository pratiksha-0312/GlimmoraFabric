import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// GET /api/payments/:id — get payment details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { refunds: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Fetch additional details from Stripe if we have a payment intent ID
    let stripeDetails = null;
    if (payment.stripePaymentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(
          payment.stripePaymentId,
          { expand: ["latest_charge"] },
        );
        const charge =
          pi.latest_charge && typeof pi.latest_charge !== "string"
            ? pi.latest_charge
            : null;

        stripeDetails = {
          cardBrand:
            charge?.payment_method_details?.card?.brand ?? null,
          cardLast4:
            charge?.payment_method_details?.card?.last4 ?? null,
          receiptUrl: charge?.receipt_url ?? null,
          billing: {
            fullName: pi.customer
              ? ((await stripe.customers.retrieve(
                  typeof pi.customer === "string"
                    ? pi.customer
                    : pi.customer.id,
                )) as { name?: string | null }).name ?? ""
              : "",
            email: charge?.billing_details?.email ?? "",
            address: charge?.billing_details?.address?.line1 ?? "",
            city: charge?.billing_details?.address?.city ?? "",
            state: charge?.billing_details?.address?.state ?? "",
            zip: charge?.billing_details?.address?.postal_code ?? "",
            country: charge?.billing_details?.address?.country ?? "",
          },
        };
      } catch {
        // If Stripe fetch fails, continue with DB data only
      }
    }

    return NextResponse.json({
      id: payment.id,
      stripePaymentId: payment.stripePaymentId,
      amount: payment.amount / 100,
      currency: payment.currency.toUpperCase(),
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      receiptNumber: `RCT-${payment.id.slice(-6).toUpperCase()}`,
      refunds: payment.refunds,
      ...stripeDetails,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
