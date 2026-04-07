"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  Lock,
  Shield,
  Loader2,
  AlertTriangle,
} from "lucide-react";

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

export default function PaymentLinkPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.linkId as string;

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Card form state
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/payment-links/${linkId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Link not found");
        return r.json();
      })
      .then((data) => { setLink(data); setLoading(false); })
      .catch(() => { setError("This payment link is invalid or has expired."); setLoading(false); });
  }, [linkId]);

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
    if (cardNumber.replace(/\s/g, "").length < 13) e.cardNumber = "Invalid card number";
    if (!cardName.trim()) e.cardName = "Required";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = "Invalid";
    if (cvc.length < 3) e.cvc = "Invalid";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate() || !link) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: link.planId,
          planName: link.planName,
          amount: link.amount,
          currency: link.currency,
          billing: { fullName: cardName, email },
          paymentMethod: "card",
        }),
      });
      const payment = await res.json();
      router.push(`/checkout/success?paymentId=${payment.id}`);
    } catch {
      setProcessing(false);
      setFormErrors({ submit: "Payment failed. Please try again." });
    }
  };

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
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Card Number *</label>
                <input
                  type="text" value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242" maxLength={19}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono"
                  style={fieldStyle}
                />
                {formErrors.cardNumber && <p className="text-xs text-red-500 mt-1">{formErrors.cardNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Cardholder Name *</label>
                <input
                  type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
                  style={fieldStyle}
                />
                {formErrors.cardName && <p className="text-xs text-red-500 mt-1">{formErrors.cardName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Expiry *</label>
                  <input
                    type="text" value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY" maxLength={5}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono"
                    style={fieldStyle}
                  />
                  {formErrors.expiry && <p className="text-xs text-red-500 mt-1">{formErrors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>CVC *</label>
                  <input
                    type="text" value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123" maxLength={4}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono"
                    style={fieldStyle}
                  />
                  {formErrors.cvc && <p className="text-xs text-red-500 mt-1">{formErrors.cvc}</p>}
                </div>
              </div>

              {formErrors.submit && (
                <p className="text-xs text-red-500 mt-1">{formErrors.submit}</p>
              )}

              <button
                onClick={handlePay}
                disabled={processing}
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
        </div>
      </div>
    </div>
  );
}
