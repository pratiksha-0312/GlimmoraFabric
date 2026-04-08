import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// GET /api/refunds — list all refunds
export async function GET() {
  try {
    const refunds = await prisma.refund.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        payment: { select: { tenantId: true, stripePaymentId: true } },
      },
    });

    const statusMap: Record<string, string> = {
      completed: "Completed",
      pending: "Pending",
      rejected: "Rejected",
    };

    return NextResponse.json(
      refunds.map((r) => ({
        id: r.id,
        paymentId: r.paymentId,
        tenant: r.payment.tenantId,
        amount: r.amount / 100,
        currency: r.currency.toUpperCase(),
        reason: r.reason,
        status: statusMap[r.status] ?? r.status,
        createdAt: r.createdAt.toISOString().slice(0, 10),
        processedAt: r.processedAt?.toISOString().slice(0, 10) ?? null,
      })),
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to list refunds";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/refunds — create a new refund via Stripe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, amount, reason } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 },
      );
    }

    // Find the payment in DB
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 },
      );
    }

    const refundAmountCents = amount
      ? Math.round(amount * 100)
      : payment.amount; // full refund if no amount specified

    // Create refund in Stripe
    let stripeRefund = null;
    if (payment.stripePaymentId) {
      stripeRefund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
        amount: refundAmountCents,
        reason: "requested_by_customer",
      });
    }

    // Save refund in DB
    const refund = await prisma.refund.create({
      data: {
        paymentId: payment.id,
        stripeRefundId: stripeRefund?.id ?? null,
        amount: refundAmountCents,
        currency: payment.currency,
        reason: reason ?? "",
        status: stripeRefund?.status === "succeeded" ? "completed" : "pending",
        processedAt:
          stripeRefund?.status === "succeeded" ? new Date() : null,
      },
    });

    // Update payment status if fully refunded
    if (refundAmountCents >= payment.amount) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "refunded" },
      });
    }

    const postStatusMap: Record<string, string> = {
      completed: "Completed",
      pending: "Pending",
      rejected: "Rejected",
    };

    return NextResponse.json(
      {
        id: refund.id,
        paymentId: refund.paymentId,
        amount: refund.amount / 100,
        currency: refund.currency.toUpperCase(),
        reason: refund.reason,
        status: postStatusMap[refund.status] ?? refund.status,
        createdAt: refund.createdAt.toISOString().slice(0, 10),
        processedAt: refund.processedAt?.toISOString().slice(0, 10) ?? null,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create refund";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
