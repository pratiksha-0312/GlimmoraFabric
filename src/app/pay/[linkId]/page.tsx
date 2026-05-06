"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import {
  Check,
  CreditCard,
  Lock,
  Shield,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { checkoutApi } from "@/lib/api";

interface PaymentLink {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  description: string;
  features: string[];
  active: boolean;
  createdBy: string;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#e2e8f0",
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      "::placeholder": { color: "#64748b" },
    },
    invalid: { color: "#ef4444" },
  },
};

// ---------------------------------------------------------------------------
// Payment Form (with Stripe Elements)
// ---------------------------------------------------------------------------

function PaymentForm({ link }: { link: PaymentLink }) {
  const router = useRouter();
  const stripeHook = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  const handlePay = useCallback(async () => {
    if (!stripeHook || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setProcessing(true);
    setFormError(null);

    try {
      // 1. Initiate the payment via the public checkout endpoint. The
      //    backend returns the provider order, including Stripe's
      //    client_secret on the response payload.
      const data = (await checkoutApi.pay(link.id, "stripe")) as {
        client_secret?: string;
        id?: string;
        payment_id?: string;
      };
      const clientSecret = data.client_secret ?? "";
      const paymentId = data.payment_id ?? data.id ?? link.id;

      if (!clientSecret) {
        setFormError("Failed to create payment.");
        setProcessing(false);
        return;
      }

      // 2. Confirm payment with Stripe.js (handles 3DS automatically)
      const { error, paymentIntent } = await stripeHook.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { email },
          },
        },
      );

      if (error) {
        setFormError(error.message ?? "Payment was declined.");
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        router.push(`/checkout/success?paymentId=${paymentId}`);
      } else {
        setFormError("Payment could not be completed. Please try again.");
        setProcessing(false);
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  }, [stripeHook, elements, email, link, router]);

  return (
    <div
      className="rounded-xl border p-6"
      style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Lock className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
        <span className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Secure Payment
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Email *</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Card Details *</label>
          <div
            className="rounded-lg border px-3 py-3"
            style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)" }}
          >
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
        </div>

        {formError && (
          <p className="text-xs text-red-500">{formError}</p>
        )}

        <button
          onClick={handlePay}
          disabled={processing || !cardComplete || !stripeHook}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 mt-2"
          style={{ backgroundColor: "#22c55e" }}
        >
          {processing ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
          ) : (
            <><CreditCard className="h-4 w-4" />Pay ${link.amount}.00</>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-3">
          <Shield className="h-3.5 w-3.5" style={{ color: "#22c55e" }} />
          <span className="text-[11px]" style={{ color: "var(--gf-text-muted)" }}>
            Secured by Stripe. 256-bit SSL encryption.
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

function PaymentLinkContent() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkoutApi
      .getDetails(linkId)
      .then((d) => {
        setLink({
          id: d.link_id,
          planId: d.link_id,
          planName: d.description || "Payment",
          amount: d.amount,
          currency: d.currency,
          billingCycle: "one-time",
          description: d.description || "Payment",
          features: [],
          active: d.status?.toLowerCase() === "active",
          createdBy: "",
        });
      })
      .catch(() => setError("This payment link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [linkId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gf-bg-base)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gf-accent)" }} />
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gf-bg-base)" }}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h1 className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Invalid Payment Link</h1>
          <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
            {error ?? "This payment link does not exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--gf-text-muted)" }}>
            Payment requested by {link.createdBy}
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
            {link.description}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan Details */}
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
          >
            <h2 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>
              {link.planName} Plan
            </h2>
            <div className="mb-5">
              <span className="text-3xl font-bold" style={{ color: "var(--gf-accent)" }}>
                ${link.amount}
              </span>
              <span className="text-sm" style={{ color: "var(--gf-text-muted)" }}>
                /{link.billingCycle.toLowerCase()}
              </span>
            </div>
            <ul className="space-y-2.5">
              {link.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                  <Check className="h-4 w-4 shrink-0" style={{ color: "#22c55e" }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Form */}
          <PaymentForm link={link} />
        </div>
      </div>
    </div>
  );
}

export default function PaymentLinkPage() {
  if (!stripePromise) return null;

  return (
    <Elements stripe={stripePromise}>
      <PaymentLinkContent />
    </Elements>
  );
}
