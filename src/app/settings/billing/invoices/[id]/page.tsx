"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Building2, Calendar, CreditCard } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const INVOICES: Record<string, {
  number: string; date: string; dueDate: string; amount: string; status: string;
  plan: string; period: string; tenant: string; paymentMethod: string;
  items: { desc: string; qty: number; price: string }[];
}> = {
  inv1: {
    number: "INV-2026-0012", date: "2026-04-01", dueDate: "2026-04-15", amount: "$49.00",
    status: "Paid", plan: "Pro", period: "Apr 1 – Apr 30, 2026", tenant: "Glimmora HQ",
    paymentMethod: "Visa ending in 4242",
    items: [
      { desc: "Pro Plan — Monthly subscription", qty: 1, price: "$49.00" },
    ],
  },
  inv2: {
    number: "INV-2026-0011", date: "2026-03-01", dueDate: "2026-03-15", amount: "$49.00",
    status: "Paid", plan: "Pro", period: "Mar 1 – Mar 31, 2026", tenant: "Glimmora HQ",
    paymentMethod: "Visa ending in 4242",
    items: [
      { desc: "Pro Plan — Monthly subscription", qty: 1, price: "$49.00" },
    ],
  },
};

// Fallback for unknown IDs
const FALLBACK = {
  number: "INV-0000-0000", date: "—", dueDate: "—", amount: "$0.00",
  status: "Unknown", plan: "—", period: "—", tenant: "—", paymentMethod: "—",
  items: [],
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const inv = INVOICES[id] ?? FALLBACK;

  const handleDownload = () => {
    const text = `INVOICE: ${inv.number}\nDate: ${inv.date}\nAmount: ${inv.amount}\nStatus: ${inv.status}\nPlan: ${inv.plan}\nPeriod: ${inv.period}\nTenant: ${inv.tenant}\nPayment: ${inv.paymentMethod}\n\nItems:\n${inv.items.map((i) => `  ${i.desc} x${i.qty} — ${i.price}`).join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${inv.number}.txt`;
    a.click();
  };

  const cardStyle = { borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" };
  const statusColor = inv.status === "Paid" ? "#22c55e" : inv.status === "Failed" ? "#ef4444" : "#f59e0b";

  return (
    <AuthGuard allowedRoles={["billing_admin", "tenant_admin"] as UserRole[]}>
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => router.push("/settings/billing/invoices")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Invoices
      </button>

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
        <button onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--gf-accent)" }}>
          <Download className="h-4 w-4" /> Download PDF
        </button>
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
        <p className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>{inv.period}</p>
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
            {inv.items.map((item, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "var(--gf-border)" }}>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{item.desc}</td>
                <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{item.qty}</td>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{item.price}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-elevated)" }}>
              <td colSpan={2} className="px-4 py-3 text-right text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Total</td>
              <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--gf-accent)" }}>{inv.amount}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    </AuthGuard>
  );
}
