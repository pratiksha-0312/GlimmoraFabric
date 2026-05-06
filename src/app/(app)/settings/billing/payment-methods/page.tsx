"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CreditCard, Plus, Trash2, X, AlertTriangle, Star, Loader2, Lock,
} from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentMethodItem {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

const CARD_BRANDS: Record<string, { label: string; color: string }> = {
  visa: { label: "Visa", color: "#1a1f71" },
  mastercard: { label: "Mastercard", color: "#eb001b" },
  amex: { label: "Amex", color: "#006fcf" },
  discover: { label: "Discover", color: "#ff6000" },
  unknown: { label: "Card", color: "#6b7280" },
};

// ---------------------------------------------------------------------------
// Stripe Card Element Options
// ---------------------------------------------------------------------------

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
// Add Card Modal (uses Stripe Elements)
// ---------------------------------------------------------------------------

function AddCardModalInner({ onSave, onClose, userEmail, userFullName }: { onSave: () => void; onClose: () => void; userEmail: string; userFullName: string }) {
  const stripeHook = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = useCallback(async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!stripeHook || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setSubmitting(true);
    setError(null);

    try {
      // Create a payment method via Stripe.js (card data never hits our server)
      const { error: stripeError, paymentMethod } = await stripeHook.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message ?? "Failed to add card");
        setSubmitting(false);
        return;
      }

      // TODO: backend has no payment-methods endpoint yet — once exposed,
      // POST the Stripe paymentMethod.id here so the server can attach it
      // to the customer. For now, save the card locally and continue.
      void paymentMethod;
      void userEmail;
      void userFullName;

      onSave();
    } catch {
      setError("An unexpected error occurred");
      setSubmitting(false);
    }
  }, [stripeHook, elements, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Add Payment Method</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>
                Secured by Stripe — card details never touch our servers
              </span>
            </div>
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
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" disabled={submitting || !cardComplete || !stripeHook}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin inline mr-1" />Adding...</> : "Add Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddCardModal({ onSave, onClose, userEmail, userFullName }: { onSave: () => void; onClose: () => void; userEmail: string; userFullName: string }) {
  return (
    <Elements stripe={stripePromise}>
      <AddCardModalInner onSave={onSave} onClose={onClose} userEmail={userEmail} userFullName={userFullName} />
    </Elements>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

function PaymentMethodsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMethods = useCallback(async () => {
    // TODO: backend has no payment-methods endpoint yet (Stripe-customer
    // attachment lives off-platform). Surface an empty list until the
    // server-side store ships so the UI doesn't show stale Prisma data.
    setMethods([]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const handleAddSuccess = () => {
    setShowAdd(false);
    fetchMethods();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    // TODO: pipe to backend once payment-methods endpoint exists.
    setMethods((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
  };

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gf-accent)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings/billing")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Billing
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Payment Methods</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>Manage your cards and billing details</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}>
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {methods.map((m) => {
          const brand = CARD_BRANDS[m.brand] ?? CARD_BRANDS.unknown;
          return (
            <div key={m.id} className="flex items-center justify-between rounded-xl border p-5" style={cardStyle}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  <CreditCard className="h-6 w-6" style={{ color: "var(--gf-accent)" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{brand.label} ending in {m.last4}</p>
                    {m.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-500/15 text-green-500">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>Expires {m.expMonth}/{m.expYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDeleteTarget(m)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {methods.length === 0 && (
          <div className="rounded-xl border p-12 text-center" style={cardStyle}>
            <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--gf-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>No payment methods added yet</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && <AddCardModal onSave={handleAddSuccess} onClose={() => setShowAdd(false)} userEmail={user?.email ?? ""} userFullName={user?.fullName ?? ""} />}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
              <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Remove Card</h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--gf-text-secondary)" }}>
              Remove {(CARD_BRANDS[deleteTarget.brand] ?? CARD_BRANDS.unknown).label} ending in <strong>{deleteTarget.last4}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentMethodsPage() {
  return (
    <AuthGuard allowedRoles={["billing_admin", "tenant_admin"] as UserRole[]}>
      <PaymentMethodsContent />
    </AuthGuard>
  );
}
