import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Stripe sends raw body, so we need to disable the default body parser
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Payment succeeded ──────────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentId: pi.id },
          data: { status: "succeeded" },
        });
        break;
      }

      // ── Payment failed ─────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentId: pi.id },
          data: { status: "failed" },
        });
        break;
      }

      // ── Refund updated ─────────────────────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          const piId =
            typeof charge.payment_intent === "string"
              ? charge.payment_intent
              : charge.payment_intent.id;

          // Find the payment
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentId: piId },
          });

          if (payment) {
            // Update refund records
            for (const sr of charge.refunds?.data ?? []) {
              await prisma.refund.updateMany({
                where: { stripeRefundId: sr.id },
                data: {
                  status: sr.status === "succeeded" ? "completed" : "pending",
                  processedAt:
                    sr.status === "succeeded" ? new Date() : undefined,
                },
              });
            }

            // Mark payment as refunded if fully refunded
            if (charge.amount_refunded >= charge.amount) {
              await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "refunded" },
              });
            }
          }
        }
        break;
      }

      // ── Invoice paid ───────────────────────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null;

        await prisma.invoice.upsert({
          where: { stripeInvoiceId: invoice.id },
          update: {
            status: "paid",
            amount: invoice.amount_paid,
            pdfUrl: invoice.invoice_pdf ?? undefined,
          },
          create: {
            tenantId: customerId ?? "unknown",
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "paid",
            pdfUrl: invoice.invoice_pdf ?? undefined,
          },
        });
        break;
      }

      // ── Subscription updated ───────────────────────────────────────
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const custId =
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer.id;

        // Access period end safely — Stripe SDK versions vary in property names
        const subData = sub as unknown as Record<string, unknown>;
        const periodEnd = subData.current_period_end as
          | number
          | undefined;
        const canceledAt = subData.canceled_at as
          | number
          | undefined;

        await prisma.subscription.updateMany({
          where: { stripeSubId: sub.id },
          data: {
            status: sub.status === "active" ? "active" : sub.status,
            currentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : undefined,
            cancelledAt: canceledAt
              ? new Date(canceledAt * 1000)
              : null,
            stripeCustId: custId,
          },
        });
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Webhook handler error";
    console.error(`Webhook handler error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
