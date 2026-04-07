"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  FileText,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Shield,
  Lock,
  AlertTriangle,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  currency: string;
  features: string[];
}

interface BillingInfo {
  fullName: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CardInfo {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { label: "Plan", icon: ShoppingCart },
  { label: "Billing", icon: FileText },
  { label: "Payment", icon: CreditCard },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className="w-10 h-0.5 rounded-full"
                style={{ backgroundColor: done ? "var(--gf-accent)" : "var(--gf-border)" }}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done ? "text-white" : active ? "text-white" : ""
                }`}
                style={{
                  backgroundColor: done || active ? "var(--gf-accent)" : "var(--gf-bg-elevated)",
                  color: done || active ? "#fff" : "var(--gf-text-muted)",
                }}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: active ? "var(--gf-text-primary)" : "var(--gf-text-muted)" }}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Plan Selection
// ---------------------------------------------------------------------------

function PlanSelection({
  plans,
  selectedPlan,
  onSelect,
}: {
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelect: (plan: Plan) => void;
}) {
  const planColors: Record<string, string> = {
    Starter: "#f59e0b",
    Pro: "#3b82f6",
    Enterprise: "#14b8a6",
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--gf-text-primary)" }}>
        Choose Your Plan
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
        Select the plan that best fits your needs
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const accent = planColors[plan.name] ?? "var(--gf-accent)";
          return (
            <button
              key={plan.id}
              onClick={() => onSelect(plan)}
              className="rounded-xl border p-5 text-left transition-all hover:shadow-lg"
              style={{
                borderColor: isSelected ? accent : "var(--gf-border)",
                backgroundColor: "var(--gf-bg-surface)",
                boxShadow: isSelected ? `0 0 0 2px ${accent}` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${accent}20`, color: accent }}
                >
                  {plan.name}
                </span>
                {isSelected && (
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: accent }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
                  ${plan.price}
                </span>
                <span className="text-sm" style={{ color: "var(--gf-text-muted)" }}>
                  /{plan.billingCycle.toLowerCase()}
                </span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Billing Details
// ---------------------------------------------------------------------------

function BillingDetails({
  billing,
  onChange,
  errors,
}: {
  billing: BillingInfo;
  onChange: (b: BillingInfo) => void;
  errors: Record<string, string>;
}) {
  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  const update = (key: keyof BillingInfo, value: string) =>
    onChange({ ...billing, [key]: value });

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--gf-text-primary)" }}>
        Billing Details
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
        Enter your billing information
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Full Name *
            </label>
            <input
              type="text"
              value={billing.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Email *
            </label>
            <input
              type="email"
              value={billing.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="john@company.com"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
            Company
          </label>
          <input
            type="text"
            value={billing.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Acme Inc."
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
            Address *
          </label>
          <input
            type="text"
            value={billing.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="123 Main Street"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              City *
            </label>
            <input
              type="text"
              value={billing.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="New York"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              State
            </label>
            <input
              type="text"
              value={billing.state}
              onChange={(e) => update("state", e.target.value)}
              placeholder="NY"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              ZIP *
            </label>
            <input
              type="text"
              value={billing.zip}
              onChange={(e) => update("zip", e.target.value)}
              placeholder="10001"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            />
            {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Country *
            </label>
            <select
              value={billing.country}
              onChange={(e) => update("country", e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
              style={fieldStyle}
            >
              <option value="US">United States</option>
              <option value="IN">India</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
              <option value="JP">Japan</option>
              <option value="AE">UAE</option>
              <option value="QA">Qatar</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Payment Method (Stripe Elements mock)
// ---------------------------------------------------------------------------

function PaymentMethod({
  card,
  onChange,
  errors,
}: {
  card: CardInfo;
  onChange: (c: CardInfo) => void;
  errors: Record<string, string>;
}) {
  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  const update = (key: keyof CardInfo, value: string) =>
    onChange({ ...card, [key]: value });

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--gf-text-primary)" }}>
        Payment Method
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
        Enter your card details securely
      </p>

      {/* Stripe-style card form */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>
            Secured by Stripe
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {["Visa", "MC", "Amex"].map((b) => (
              <span
                key={b}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-muted)" }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
            Card Number *
          </label>
          <input
            type="text"
            value={card.number}
            onChange={(e) => update("number", formatCardNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono"
            style={fieldStyle}
          />
          {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
            Cardholder Name *
          </label>
          <input
            type="text"
            value={card.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={fieldStyle}
          />
          {errors.cardName && <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              Expiry *
            </label>
            <input
              type="text"
              value={card.expiry}
              onChange={(e) => update("expiry", formatExpiry(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono"
              style={fieldStyle}
            />
            {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>
              CVC *
            </label>
            <input
              type="text"
              value={card.cvc}
              onChange={(e) => update("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              maxLength={4}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40 font-mono"
              style={fieldStyle}
            />
            {errors.cvc && <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 px-1">
        <Shield className="h-4 w-4" style={{ color: "#22c55e" }} />
        <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
          Your payment information is encrypted and secure. We never store your card details.
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3D Secure Modal
// ---------------------------------------------------------------------------

function ThreeDSecureModal({
  paymentId,
  onSuccess,
  onCancel,
}: {
  paymentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      await fetch(`/api/payments/${paymentId}/3ds`, { method: "POST" });
      setVerifying(false);
      setTimeout(onSuccess, 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [paymentId, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>3D Secure Verification</h3>
          <button onClick={onCancel} className="p-1 hover:opacity-70" style={{ color: "var(--gf-text-muted)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center py-6">
          {verifying ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: "var(--gf-accent)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>
                Verifying with your bank...
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>
                Please do not close this window
              </p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 mb-4">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-green-500">Verification Successful</p>
              <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>Completing payment...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payment Error Component
// ---------------------------------------------------------------------------

function PaymentError({
  message,
  onRetry,
  onCancel,
}: {
  message: string;
  onRetry: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="rounded-xl border p-5 mt-4"
      style={{ borderColor: "#ef444440", backgroundColor: "#ef444410" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 mt-0.5">
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-500">Payment Failed</p>
          <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)" }}>{message}</p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />Retry Payment
            </button>
            <button
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}
            >
              Change Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order Summary Sidebar
// ---------------------------------------------------------------------------

function OrderSummary({ plan }: { plan: Plan | null }) {
  if (!plan) return null;
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
    >
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--gf-text-primary)" }}>Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--gf-text-secondary)" }}>{plan.name} Plan</span>
          <span style={{ color: "var(--gf-text-primary)" }}>${plan.price}/{plan.billingCycle.toLowerCase().slice(0, 2)}</span>
        </div>
        <div className="border-t pt-3" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--gf-text-secondary)" }}>Subtotal</span>
            <span style={{ color: "var(--gf-text-primary)" }}>${plan.price}.00</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span style={{ color: "var(--gf-text-secondary)" }}>Tax</span>
            <span style={{ color: "var(--gf-text-muted)" }}>$0.00</span>
          </div>
        </div>
        <div className="border-t pt-3" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex justify-between">
            <span className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>Total</span>
            <span className="text-lg font-bold" style={{ color: "var(--gf-accent)" }}>${plan.price}.00</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: "var(--gf-text-muted)" }}>
            Billed {plan.billingCycle.toLowerCase()}. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Checkout Page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billing, setBilling] = useState<BillingInfo>({
    fullName: "", email: "", company: "", address: "", city: "", state: "", zip: "", country: "US",
  });
  const [card, setCard] = useState<CardInfo>({ number: "", expiry: "", cvc: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [show3ds, setShow3ds] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans").then((r) => r.json()).then(setPlans);
  }, []);

  const validateBilling = () => {
    const e: Record<string, string> = {};
    if (!billing.fullName.trim()) e.fullName = "Required";
    if (!billing.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) e.email = "Invalid email";
    if (!billing.address.trim()) e.address = "Required";
    if (!billing.city.trim()) e.city = "Required";
    if (!billing.zip.trim()) e.zip = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateCard = () => {
    const e: Record<string, string> = {};
    const digits = card.number.replace(/\s/g, "");
    if (digits.length < 13) e.number = "Invalid card number";
    if (!card.name.trim()) e.cardName = "Required";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = "Invalid (MM/YY)";
    if (card.cvc.length < 3) e.cvc = "Invalid CVC";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !selectedPlan) return;
    if (step === 1 && !validateBilling()) return;
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setPaymentError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSubmitPayment = async () => {
    if (!validateCard() || !selectedPlan) return;
    setProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          billing,
          paymentMethod: "card",
        }),
      });

      const payment = await res.json();

      if (payment.requires3ds) {
        setPendingPaymentId(payment.id);
        setShow3ds(true);
        setProcessing(false);
        return;
      }

      if (payment.status === "succeeded") {
        router.push(`/checkout/success?paymentId=${payment.id}`);
      } else {
        setPaymentError("Payment was declined. Please check your card details and try again.");
        setProcessing(false);
      }
    } catch {
      setPaymentError("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  const handle3dsSuccess = useCallback(() => {
    setShow3ds(false);
    if (pendingPaymentId) {
      router.push(`/checkout/success?paymentId=${pendingPaymentId}`);
    }
  }, [pendingPaymentId, router]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Checkout</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
            Complete your subscription in a few simple steps
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl border p-6"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
            >
              {step === 0 && (
                <PlanSelection plans={plans} selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
              )}
              {step === 1 && (
                <BillingDetails billing={billing} onChange={setBilling} errors={errors} />
              )}
              {step === 2 && (
                <>
                  <PaymentMethod card={card} onChange={setCard} errors={errors} />
                  {paymentError && (
                    <PaymentError
                      message={paymentError}
                      onRetry={handleSubmitPayment}
                      onCancel={() => { setPaymentError(null); setStep(2); }}
                    />
                  )}
                </>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t" style={{ borderColor: "var(--gf-border)" }}>
                {step > 0 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors hover:opacity-80"
                    style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
                  >
                    <ChevronLeft className="h-4 w-4" />Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 2 ? (
                  <button
                    onClick={handleNext}
                    disabled={step === 0 && !selectedPlan}
                    className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
                    style={{ backgroundColor: "var(--gf-accent)" }}
                  >
                    Continue<ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitPayment}
                    disabled={processing}
                    className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#22c55e" }}
                  >
                    {processing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                    ) : (
                      <><Lock className="h-4 w-4" />Pay ${selectedPlan?.price}.00</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <OrderSummary plan={selectedPlan} />
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" style={{ color: "#22c55e" }} />
                <span className="text-xs font-bold" style={{ color: "var(--gf-text-primary)" }}>Secure Checkout</span>
              </div>
              <ul className="space-y-1.5">
                {["256-bit SSL encryption", "PCI DSS compliant", "30-day money-back guarantee"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "var(--gf-text-muted)" }}>
                    <Check className="h-3 w-3" style={{ color: "#22c55e" }} />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Secure Modal */}
      {show3ds && pendingPaymentId && (
        <ThreeDSecureModal
          paymentId={pendingPaymentId}
          onSuccess={handle3dsSuccess}
          onCancel={() => { setShow3ds(false); setProcessing(false); }}
        />
      )}
    </div>
  );
}
