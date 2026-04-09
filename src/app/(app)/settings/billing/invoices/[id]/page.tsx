"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Building2, Calendar, CreditCard, Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvoiceDetail {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: string;
  tenant: string;
  paymentMethod: string;
  billingPeriod: string;
  lineItems: { description: string; qty: number; amount: number }[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paidAt: string;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [inv, setInv] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((data) => setInv(data))
      .catch(() => setInv(null))
      .finally(() => setLoading(false));
  }, [id]);

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };
  const statusColor = inv?.status === "Paid" ? "#22c55e" : inv?.status === "Failed" ? "#ef4444" : "#f59e0b";

  return (
    <AuthGuard allowedRoles={["billing_admin", "tenant_admin"] as UserRole[]}>
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings/billing/invoices")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Invoices
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gf-accent)" }} />
        </div>
      ) : !inv ? (
        <div className="rounded-xl border p-12 text-center" style={cardStyle}>
          <p className="text-sm" style={{ color: "var(--gf-text-muted)" }}>Invoice not found.</p>
        </div>
      ) : (
      <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>{inv.number}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />{inv.status}
            </span>
            <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>•</span>
            <span className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{inv.date}</span>
          </div>
        </div>
        <a href={`/api/invoices/${id}/pdf`} download
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}>
          <Download className="h-4 w-4" /> Download PDF
        </a>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Calendar className="h-4 w-4" />, label: "Invoice Date", value: inv.date },
          { icon: <Calendar className="h-4 w-4" />, label: "Due Date", value: inv.dueDate },
          { icon: <Building2 className="h-4 w-4" />, label: "Tenant", value: inv.tenant },
          { icon: <CreditCard className="h-4 w-4" />, label: "Payment", value: inv.paymentMethod },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border p-4" style={cardStyle}>
            <div className="flex items-center gap-2 mb-1" style={{ color: "var(--gf-accent)" }}>{item.icon}</div>
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Billing Period */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <p className="text-xs font-medium mb-1" style={{ color: "var(--gf-text-muted)" }}>Billing Period</p>
        <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{inv.billingPeriod}</p>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
              {["Description", "Qty", "Amount"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--gf-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.lineItems.map((item, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{item.description}</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{item.qty}</td>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>${item.amount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
              <td colSpan={2} className="px-4 py-3 text-right text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Total</td>
              <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--gf-accent)" }}>${inv.total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      </>
      )}
    </div>
    </AuthGuard>
  );
}
