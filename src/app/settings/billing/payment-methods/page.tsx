"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CreditCard, Plus, Trash2, X, CheckCircle2, AlertTriangle, Star,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  isDefault: boolean;
  holder: string;
}

const INITIAL_METHODS: PaymentMethod[] = [
  { id: "pm1", type: "visa", last4: "4242", expiry: "12/27", isDefault: true, holder: "Pratiksha Yadav" },
  { id: "pm2", type: "mastercard", last4: "8888", expiry: "06/26", isDefault: false, holder: "Pratiksha Yadav" },
];

const CARD_BRANDS: Record<string, { label: string; color: string }> = {
  visa: { label: "Visa", color: "#1a1f71" },
  mastercard: { label: "Mastercard", color: "#eb001b" },
  amex: { label: "Amex", color: "#006fcf" },
};

// ---------------------------------------------------------------------------
// Add Card Modal
// ---------------------------------------------------------------------------

function AddCardModal({ onSave, onClose }: { onSave: (m: PaymentMethod) => void; onClose: () => void }) {
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!holder.trim()) e.holder = "Required";
    if (number.replace(/\s/g, "").length < 16) e.number = "Enter 16 digits";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = "MM/YY format";
    if (cvc.length < 3) e.cvc = "3-4 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const last4 = number.replace(/\s/g, "").slice(-4);
    onSave({ id: `pm${Date.now()}`, type: "visa", last4, expiry, isDefault: false, holder });
  };

  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

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
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Cardholder Name *</label>
            <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Name on card"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
            {errors.holder && <p className="text-xs text-red-500 mt-1">{errors.holder}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Card Number *</label>
            <input value={number} onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))} placeholder="1234 5678 9012 3456"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none font-mono" style={fieldStyle} />
            {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Expiry *</label>
              <input value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 5))} placeholder="MM/YY"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
              {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>CVC *</label>
              <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none" style={fieldStyle} />
              {errors.cvc && <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--gf-accent)" }}>
              {submitting ? "Adding..." : "Add Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  const handleAdd = (m: PaymentMethod) => {
    setMethods((prev) => [...prev, m]);
    setShowAdd(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setMethods((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleSetDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };

  return (
    <AuthGuard allowedRoles={["billing_admin", "tenant_admin"] as UserRole[]}>
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
          const brand = CARD_BRANDS[m.type];
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
                  <p className="text-xs mt-0.5" style={{ color: "var(--gf-text-muted)" }}>{m.holder} — Expires {m.expiry}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!m.isDefault && (
                  <button onClick={() => handleSetDefault(m.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-80"
                    style={{ borderColor: "var(--gf-border)", color: "var(--gf-accent)" }}>
                    Set Default
                  </button>
                )}
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
      {showAdd && <AddCardModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}

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
              Remove {CARD_BRANDS[deleteTarget.type].label} ending in <strong>{deleteTarget.last4}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium border" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              <button onClick={handleDelete} className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
