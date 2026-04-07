"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  Plus,
  X,
  Check,
  Clock,
  XCircle,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

interface Refund {
  id: string;
  paymentId: string;
  tenant: string;
  amount: number;
  currency: string;
  reason: string;
  status: "Completed" | "Pending" | "Rejected";
  createdAt: string;
  processedAt: string | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Completed: { bg: "bg-green-500/15", text: "text-green-500", icon: <Check className="h-3 w-3" /> },
  Pending: { bg: "bg-amber-500/15", text: "text-amber-500", icon: <Clock className="h-3 w-3" /> },
  Rejected: { bg: "bg-red-500/15", text: "text-red-500", icon: <XCircle className="h-3 w-3" /> },
};

export default function RefundManagementPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formPaymentId, setFormPaymentId] = useState("");
  const [formTenant, setFormTenant] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchRefunds = () => {
    setLoading(true);
    fetch("/api/refunds")
      .then((r) => r.json())
      .then((d) => { setRefunds(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRefunds(); }, []);

  const filtered = refunds.filter((r) => {
    const q = search.toLowerCase();
    return r.tenant.toLowerCase().includes(q) || r.paymentId.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
  });

  const totalRefunded = refunds.filter((r) => r.status === "Completed").reduce((s, r) => s + r.amount, 0);
  const pendingCount = refunds.filter((r) => r.status === "Pending").length;

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!formPaymentId.trim()) e.paymentId = "Required";
    if (!formTenant.trim()) e.tenant = "Required";
    if (!formAmount.trim() || isNaN(Number(formAmount))) e.amount = "Valid amount required";
    if (!formReason.trim()) e.reason = "Required";
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    const res = await fetch("/api/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId: formPaymentId,
        tenant: formTenant,
        amount: Number(formAmount),
        reason: formReason,
      }),
    });
    const newRefund = await res.json();
    setRefunds((prev) => [newRefund, ...prev]);
    setShowModal(false);
    setFormPaymentId("");
    setFormTenant("");
    setFormAmount("");
    setFormReason("");
    setSubmitting(false);
  };

  const fieldStyle = {
    backgroundColor: "var(--gf-bg-base)",
    borderColor: "var(--gf-border)",
    color: "var(--gf-text-primary)",
  };

  return (
    <AuthGuard allowedRoles={["super_admin", "billing_admin"] as UserRole[]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Refund Management</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
              Process and track payment refunds
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--gf-accent)" }}
          >
            <Plus className="h-4 w-4" />Issue Refund
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Total Refunded</p>
                <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>${totalRefunded.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Pending Refunds</p>
                <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)", color: "var(--gf-accent)" }}>
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Total Requests</p>
                <p className="text-xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{refunds.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tenant, payment ID, or reason..."
            className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
                  {["Refund ID", "Payment ID", "Tenant", "Amount", "Reason", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No refunds found</td></tr>
                ) : (
                  filtered.map((r) => {
                    const s = STATUS_STYLES[r.status];
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--gf-border)" }}>
                        <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-primary)" }}>{r.id}</td>
                        <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gf-text-muted)" }}>{r.paymentId}</td>
                        <td className="px-5 py-3 text-sm font-medium" style={{ color: "var(--gf-text-primary)" }}>{r.tenant}</td>
                        <td className="px-5 py-3 text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>${r.amount}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-secondary)" }}>{r.reason}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                            {s.icon}{r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--gf-text-muted)" }}>{r.createdAt}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Refund Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowModal(false)}>
            <div
              className="w-full max-w-lg rounded-2xl border shadow-2xl"
              style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
                <h2 className="text-lg font-bold" style={{ color: "var(--gf-text-primary)" }}>Issue Refund</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:opacity-70" style={{ color: "var(--gf-text-muted)" }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-500">Refunds are irreversible. Please verify the details before proceeding.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Payment ID *</label>
                    <input type="text" value={formPaymentId} onChange={(e) => setFormPaymentId(e.target.value)} placeholder="pay_xxx" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                    {formErrors.paymentId && <p className="text-xs text-red-500 mt-1">{formErrors.paymentId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant *</label>
                    <input type="text" value={formTenant} onChange={(e) => setFormTenant(e.target.value)} placeholder="Tenant name" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                    {formErrors.tenant && <p className="text-xs text-red-500 mt-1">{formErrors.tenant}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Amount (USD) *</label>
                  <input type="text" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="99.00" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
                  {formErrors.amount && <p className="text-xs text-red-500 mt-1">{formErrors.amount}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Reason *</label>
                  <select value={formReason} onChange={(e) => setFormReason(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle}>
                    <option value="">Select reason...</option>
                    <option value="Duplicate charge">Duplicate charge</option>
                    <option value="Service not as described">Service not as described</option>
                    <option value="Accidental purchase">Accidental purchase</option>
                    <option value="Downgrade difference">Downgrade difference</option>
                    <option value="Cancelled within trial">Cancelled within trial</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.reason && <p className="text-xs text-red-500 mt-1">{formErrors.reason}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium border hover:opacity-80" style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
                  <button onClick={handleSubmit} disabled={submitting} className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "var(--gf-accent)" }}>
                    {submitting ? "Processing..." : "Issue Refund"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
