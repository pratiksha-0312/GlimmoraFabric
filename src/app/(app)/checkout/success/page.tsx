"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Download,
  ArrowRight,
  CreditCard,
  Mail,
  Calendar,
  Hash,
  User,
  MapPin,
} from "lucide-react";

interface PaymentDetails {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  cardLast4: string;
  cardBrand: string;
  billing: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  receiptNumber: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) { setLoading(false); return; }
    (async () => {
      try {
        const { paymentsApi } = await import("@/lib/api");
        const p = await paymentsApi.get(paymentId);
        // Map FastAPI Payment -> receipt UI. The backend doesn't track per-
        // receipt billing details or card brand on the payment row, so we
        // surface what we have and leave the rest blank.
        setPayment({
          id: p.id,
          planName: "Subscription",
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          paymentMethod: p.provider,
          cardLast4: "****",
          cardBrand: p.provider,
          billing: { fullName: "", email: "", address: "", city: "", state: "", zip: "", country: "" },
          createdAt: p.created_at,
          receiptNumber: p.id.slice(0, 8).toUpperCase(),
        });
      } catch {
        setPayment(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [paymentId]);

  const handleDownloadPdf = useCallback(() => {
    if (!payment) return;

    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${payment.receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
    .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; }
    .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 13px; color: #6b7280; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-top: 8px; }
    .amount-box { text-align: center; background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .amount-box .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .amount-box .value { font-size: 36px; font-weight: 700; color: #7c3aed; margin-top: 4px; }
    .amount-box .currency { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .field { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .field .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field .value { font-size: 13px; font-weight: 500; color: #1a1a2e; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 11px; color: #9ca3af; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Glimmora Fabric</h1>
    <p>Payment Receipt</p>
    <span class="badge">Paid</span>
  </div>

  <div class="amount-box">
    <div class="label">Amount Paid</div>
    <div class="value">$${payment.amount}.00</div>
    <div class="currency">${payment.currency}</div>
  </div>

  <div class="grid">
    <div class="field">
      <div class="label">Receipt Number</div>
      <div class="value">${payment.receiptNumber}</div>
    </div>
    <div class="field">
      <div class="label">Payment Method</div>
      <div class="value">${payment.cardBrand ?? "Card"} •••• ${payment.cardLast4 ?? "****"}</div>
    </div>
    <div class="field">
      <div class="label">Date</div>
      <div class="value">${new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
    <div class="field">
      <div class="label">Plan</div>
      <div class="value">${payment.planName ?? "Subscription"} Plan</div>
    </div>
    <div class="field">
      <div class="label">Billed To</div>
      <div class="value">${payment.billing?.fullName ?? "—"}</div>
    </div>
    <div class="field">
      <div class="label">Email</div>
      <div class="value">${payment.billing?.email ?? "—"}</div>
    </div>
    <div class="field">
      <div class="label">Payment ID</div>
      <div class="value" style="font-size:11px;word-break:break-all;">${payment.id}</div>
    </div>
    <div class="field">
      <div class="label">Address</div>
      <div class="value">${payment.billing?.city ?? ""}${payment.billing?.state ? ", " + payment.billing.state : ""}</div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your purchase. This receipt was generated by Glimmora Fabric.</p>
    <p style="margin-top:4px;">Questions? Contact support@glimmora.com</p>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  }, [payment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--gf-accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Payment not found</p>
        <button onClick={() => router.push("/checkout")} className="mt-4 text-sm font-medium" style={{ color: "var(--gf-accent)" }}>
          Return to Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Payment Successful!</h1>
        <p className="text-sm mt-2" style={{ color: "var(--gf-text-secondary)" }}>
          Your subscription to the <strong>{payment.planName}</strong> plan is now active.
        </p>
      </div>

      {/* Receipt Card */}
      <div
        className="rounded-xl border shadow-sm"
        style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}
      >
        {/* Receipt Header */}
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Receipt</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: "var(--gf-text-primary)" }}>{payment.receiptNumber}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-500">
              Paid
            </span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5">
          {/* Amount */}
          <div className="text-center py-4 rounded-lg" style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--gf-text-muted)" }}>Amount Paid</p>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--gf-accent)" }}>
              ${payment.amount}.00
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--gf-text-muted)" }}>{payment.currency}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Hash className="h-4 w-4" />, label: "Payment ID", value: payment.id },
              { icon: <CreditCard className="h-4 w-4" />, label: "Payment Method", value: `${payment.cardBrand} •••• ${payment.cardLast4}` },
              { icon: <Calendar className="h-4 w-4" />, label: "Date", value: new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
              { icon: <User className="h-4 w-4" />, label: "Billed To", value: payment.billing.fullName },
              { icon: <Mail className="h-4 w-4" />, label: "Email", value: payment.billing.email },
              { icon: <MapPin className="h-4 w-4" />, label: "Address", value: `${payment.billing.city}, ${payment.billing.state}` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-base)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: "var(--gf-accent)" }}>{item.icon}</span>
                  <p className="text-[11px] font-medium" style={{ color: "var(--gf-text-muted)" }}>{item.label}</p>
                </div>
                <p className="text-xs font-medium truncate" style={{ color: "var(--gf-text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="border-t px-6 py-4" style={{ borderColor: "var(--gf-border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
              A confirmation email has been sent to {payment.billing.email}
            </p>
            <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 text-xs font-medium hover:opacity-80" style={{ color: "var(--gf-accent)" }}>
              <Download className="h-3.5 w-3.5" />Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "var(--gf-accent)" }}
        >
          Go to Dashboard<ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--gf-bg-base)" }}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--gf-accent)", borderTopColor: "transparent" }} />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
