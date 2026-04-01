
"use client";

import { useState, useRef, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  ArrowUpDown,
  RefreshCw,
  Copy,
  Check,
  Eye,
  X,
  RotateCcw,
  Search,
  FilterX,
  Calendar,
  ChevronDown,
  AlertCircle,
  Settings,
  EyeOff,
  Star,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Stats data
// ---------------------------------------------------------------------------

const baseStats = [
  { label: "Revenue (MTD)", value: "$124,500", icon: DollarSign },
  { label: "Transactions", value: "2,847", icon: ArrowUpDown },
  { label: "Success Rate", value: "99.2%", icon: CreditCard },
  { label: "Pending Refunds", value: "", icon: RefreshCw },
];

// ---------------------------------------------------------------------------
// Gateway data
// ---------------------------------------------------------------------------

type GwStatus = "Active" | "Standby" | "Inactive";

type Gateway = {
  name: string;
  status: GwStatus;
  isPrimary: boolean;
  share: string;
  apiKey: string;
  webhookSecret: string;
  region: string;
  currency: string;
  maxRetry: number;
  description: string;
};

const initialGateways: Gateway[] = [
  {
    name: "Stripe",
    status: "Active",
    isPrimary: true,
    share: "68% of transactions",
    apiKey: "sk_live_••••••••••••4242",
    webhookSecret: "whsec_••••••••••••abcd",
    region: "Global",
    currency: "USD",
    maxRetry: 3,
    description: "Primary gateway for all USD transactions",
  },
  {
    name: "Razorpay",
    status: "Active",
    isPrimary: false,
    share: "28% of transactions",
    apiKey: "rzp_live_••••••••••••8819",
    webhookSecret: "whsec_••••••••••••efgh",
    region: "India",
    currency: "INR",
    maxRetry: 3,
    description: "India region gateway for INR transactions",
  },
  {
    name: "Adyen",
    status: "Standby",
    isPrimary: false,
    share: "4% of transactions",
    apiKey: "adyen_live_••••••••••••3782",
    webhookSecret: "whsec_••••••••••••ijkl",
    region: "Europe",
    currency: "EUR",
    maxRetry: 2,
    description: "Failover gateway for high availability",
  },
];

// ---------------------------------------------------------------------------
// Recent transactions data
// ---------------------------------------------------------------------------

type TxStatus = "Succeeded" | "Pending" | "Failed" | "Refunded";

type Transaction = {
  id: string;
  amount: string;
  gateway: string;
  status: TxStatus;
  time: string;
  customerName: string;
  customerEmail: string;
  cardType: string;
  createdAt: string;
  description: string;
  metadata: string;
};

const initialTransactions: Transaction[] = [
  { id: "TXN-001", amount: "$250.00", gateway: "Stripe", status: "Succeeded", time: "12 min ago", customerName: "John Doe", customerEmail: "john@example.com", cardType: "Visa •••• 4242", createdAt: "Mar 28, 2026 — 12:12 PM", description: "Subscription payment", metadata: '{ "plan": "pro", "cycle": "monthly" }' },
  { id: "TXN-002", amount: "$1,200.00", gateway: "Razorpay", status: "Pending", time: "25 min ago", customerName: "Priya Sharma", customerEmail: "priya@example.com", cardType: "Mastercard •••• 8819", createdAt: "Mar 28, 2026 — 11:59 AM", description: "Invoice #INV-2026-118", metadata: '{ "plan": "enterprise", "cycle": "annual" }' },
  { id: "TXN-003", amount: "$89.99", gateway: "Stripe", status: "Succeeded", time: "1 hr ago", customerName: "Alice Martin", customerEmail: "alice@example.com", cardType: "Visa •••• 1234", createdAt: "Mar 28, 2026 — 11:24 AM", description: "One-time purchase", metadata: '{ "product": "widget-x", "qty": 1 }' },
  { id: "TXN-004", amount: "$450.00", gateway: "Adyen", status: "Failed", time: "2 hr ago", customerName: "Carlos Rivera", customerEmail: "carlos@example.com", cardType: "Amex •••• 3782", createdAt: "Mar 28, 2026 — 10:31 AM", description: "Upgrade to Business plan", metadata: '{ "plan": "business", "prev_plan": "starter" }' },
  { id: "TXN-005", amount: "$175.50", gateway: "Stripe", status: "Refunded", time: "3 hr ago", customerName: "Emily Chen", customerEmail: "emily@example.com", cardType: "Visa •••• 9090", createdAt: "Mar 28, 2026 — 09:45 AM", description: "Subscription payment", metadata: '{ "plan": "pro", "cycle": "monthly" }' },
];

const statusColors: Record<TxStatus, string> = {
  Succeeded: "#22c55e",
  Pending: "#f59e0b",
  Failed: "#ef4444",
  Refunded: "#3b82f6",
};

// ---------------------------------------------------------------------------
// Subscriptions data
// ---------------------------------------------------------------------------

type SubStatus = "Active" | "Trialing" | "Past Due" | "Cancelled";

const subscriptions: {
  tenant: string;
  plan: string;
  amount: string;
  billingCycle: string;
  status: SubStatus;
  nextBilling: string;
}[] = [
  { tenant: "Acme Corp", plan: "Enterprise", amount: "$2,400.00", billingCycle: "Annual", status: "Active", nextBilling: "2026-04-15" },
  { tenant: "Globex Inc", plan: "Pro", amount: "$99.00", billingCycle: "Monthly", status: "Active", nextBilling: "2026-04-01" },
  { tenant: "Initech", plan: "Enterprise", amount: "$2,400.00", billingCycle: "Annual", status: "Past Due", nextBilling: "2026-03-28" },
  { tenant: "Wonka Ltd", plan: "Starter", amount: "$29.00", billingCycle: "Monthly", status: "Trialing", nextBilling: "2026-04-10" },
  { tenant: "Umbrella Co", plan: "Pro", amount: "$99.00", billingCycle: "Monthly", status: "Cancelled", nextBilling: "—" },
];

const subStatusColors: Record<SubStatus, string> = {
  Active: "#22c55e",
  Trialing: "#3b82f6",
  "Past Due": "#f59e0b",
  Cancelled: "#ef4444",
};

// ---------------------------------------------------------------------------
// Refunds data
// ---------------------------------------------------------------------------

type RefundStatus = "Pending" | "Approved" | "Rejected";

type Refund = {
  transactionId: string;
  customer: string;
  amount: string;
  reason: string;
  requestedOn: string;
  status: RefundStatus;
  processedDate: string;
  approvedBy: string;
  timeline: { label: string; date: string; done: boolean }[];
};

const initialRefunds: Refund[] = [
  { transactionId: "TXN-112", customer: "Sarah Johnson", amount: "$59.99", reason: "Service not rendered", requestedOn: "Mar 30, 2026", status: "Pending", processedDate: "—", approvedBy: "—", timeline: [
    { label: "Refund Requested", date: "Mar 30, 2026 — 10:30 AM", done: true },
    { label: "Under Review", date: "Mar 30, 2026 — 11:00 AM", done: true },
    { label: "Approved / Rejected", date: "—", done: false },
    { label: "Processed / Closed", date: "—", done: false },
  ]},
  { transactionId: "TXN-087", customer: "Mike Chen", amount: "$1,100.00", reason: "Billing error", requestedOn: "Mar 29, 2026", status: "Pending", processedDate: "—", approvedBy: "—", timeline: [
    { label: "Refund Requested", date: "Mar 29, 2026 — 09:15 AM", done: true },
    { label: "Under Review", date: "Mar 29, 2026 — 10:00 AM", done: true },
    { label: "Approved / Rejected", date: "—", done: false },
    { label: "Processed / Closed", date: "—", done: false },
  ]},
  { transactionId: "TXN-034", customer: "Priya Sharma", amount: "$299.00", reason: "Duplicate charge", requestedOn: "Mar 28, 2026", status: "Pending", processedDate: "—", approvedBy: "—", timeline: [
    { label: "Refund Requested", date: "Mar 28, 2026 — 02:00 PM", done: true },
    { label: "Under Review", date: "Mar 28, 2026 — 02:30 PM", done: true },
    { label: "Approved / Rejected", date: "—", done: false },
    { label: "Processed / Closed", date: "—", done: false },
  ]},
  { transactionId: "TXN-076", customer: "James Wilson", amount: "$45.00", reason: "Customer request", requestedOn: "Mar 27, 2026", status: "Pending", processedDate: "—", approvedBy: "—", timeline: [
    { label: "Refund Requested", date: "Mar 27, 2026 — 08:45 AM", done: true },
    { label: "Under Review", date: "Mar 27, 2026 — 09:15 AM", done: true },
    { label: "Approved / Rejected", date: "—", done: false },
    { label: "Processed / Closed", date: "—", done: false },
  ]},
  { transactionId: "TXN-091", customer: "Emma Davis", amount: "$199.50", reason: "Fraudulent charge", requestedOn: "Mar 26, 2026", status: "Pending", processedDate: "—", approvedBy: "—", timeline: [
    { label: "Refund Requested", date: "Mar 26, 2026 — 11:20 AM", done: true },
    { label: "Under Review", date: "Mar 26, 2026 — 12:00 PM", done: true },
    { label: "Approved / Rejected", date: "—", done: false },
    { label: "Processed / Closed", date: "—", done: false },
  ]},
  { transactionId: "TXN-005", customer: "Rahul Gupta", amount: "$175.50", reason: "Customer request", requestedOn: "Mar 25, 2026", status: "Approved", processedDate: "Mar 26, 2026", approvedBy: "Super Admin", timeline: [
    { label: "Refund Requested", date: "Mar 25, 2026 — 10:30 AM", done: true },
    { label: "Under Review", date: "Mar 25, 2026 — 11:00 AM", done: true },
    { label: "Approved / Rejected", date: "Mar 26, 2026 — 09:15 AM", done: true },
    { label: "Processed / Closed", date: "Mar 26, 2026 — 02:00 PM", done: true },
  ]},
  { transactionId: "TXN-098", customer: "Lisa Park", amount: "$340.00", reason: "Duplicate charge", requestedOn: "Mar 24, 2026", status: "Approved", processedDate: "Mar 25, 2026", approvedBy: "Super Admin", timeline: [
    { label: "Refund Requested", date: "Mar 24, 2026 — 03:00 PM", done: true },
    { label: "Under Review", date: "Mar 24, 2026 — 03:30 PM", done: true },
    { label: "Approved / Rejected", date: "Mar 25, 2026 — 10:00 AM", done: true },
    { label: "Processed / Closed", date: "Mar 25, 2026 — 04:00 PM", done: true },
  ]},
  { transactionId: "TXN-045", customer: "Tom Brown", amount: "$25.00", reason: "Fraudulent charge", requestedOn: "Mar 23, 2026", status: "Rejected", processedDate: "Mar 24, 2026", approvedBy: "Super Admin", timeline: [
    { label: "Refund Requested", date: "Mar 23, 2026 — 09:00 AM", done: true },
    { label: "Under Review", date: "Mar 23, 2026 — 09:30 AM", done: true },
    { label: "Approved / Rejected", date: "Mar 24, 2026 — 11:00 AM", done: true },
    { label: "Processed / Closed", date: "Mar 24, 2026 — 03:00 PM", done: true },
  ]},
];

const refundStatusColors: Record<RefundStatus, string> = {
  Approved: "#22c55e",
  Pending: "#f59e0b",
  Rejected: "#ef4444",
};

// ---------------------------------------------------------------------------
// Routing rules data
// ---------------------------------------------------------------------------

const routingRules = [
  {
    name: "India Region",
    description: "Route all INR transactions to Razorpay for lower fees and faster settlement in the India market.",
    gateway: "Razorpay",
    condition: "Currency = INR",
  },
  {
    name: "Europe Region",
    description: "Route EUR and GBP transactions to Stripe for optimized European payment processing.",
    gateway: "Stripe",
    condition: "Currency = EUR, GBP",
  },
  {
    name: "Failover",
    description: "Automatically route to Adyen when primary gateway returns 5xx errors or timeout exceeds 10s.",
    gateway: "Adyen",
    condition: "Primary gateway failure",
  },
  {
    name: "High-Value Transactions",
    description: "Route transactions over $5,000 to Stripe for enhanced fraud detection and chargeback protection.",
    gateway: "Stripe",
    condition: "Amount > $5,000",
  },
];

// ---------------------------------------------------------------------------
// Custom Dropdown (always opens downward)
// ---------------------------------------------------------------------------

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm outline-none transition-shadow focus:ring-2 focus:ring-orange-500 whitespace-nowrap"
        style={{
          backgroundColor: "var(--gf-bg-elevated)",
          border: "1px solid var(--gf-border)",
          color: "var(--gf-text-primary)",
        }}
      >
        {value}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--gf-text-secondary)" }} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 min-w-full rounded-lg py-1 shadow-xl z-50 overflow-hidden"
          style={{
            backgroundColor: "var(--gf-bg-elevated)",
            border: "1px solid var(--gf-border)",
          }}
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm transition-colors"
              style={{
                color: o === value ? "#f97316" : "var(--gf-text-primary)",
                backgroundColor: o === value ? "rgba(249,115,22,0.1)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (o !== value) e.currentTarget.style.backgroundColor = "var(--gf-bg-surface)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = o === value ? "rgba(249,115,22,0.1)" : "transparent";
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentsContent() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewTx, setViewTx] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [refunds, setRefunds] = useState<Refund[]>(initialRefunds);
  const [refundTx, setRefundTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<"transactions" | "refunds">("transactions");

  // Refunds tab state
  const [refundSearch, setRefundSearch] = useState("");
  const [refundStatusFilter, setRefundStatusFilter] = useState("All");
  const [approveTarget, setApproveTarget] = useState<Refund | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Refund | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewRefund, setViewRefund] = useState<Refund | null>(null);

  // Gateway state
  const [gateways, setGateways] = useState<Gateway[]>(initialGateways);
  const [configGw, setConfigGw] = useState<Gateway | null>(null);
  const [configForm, setConfigForm] = useState({ apiKey: "", webhookSecret: "", region: "", currency: "", maxRetry: 3, description: "" });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openConfigDrawer = (gw: Gateway) => {
    setConfigGw(gw);
    setConfigForm({
      apiKey: gw.apiKey,
      webhookSecret: gw.webhookSecret,
      region: gw.region,
      currency: gw.currency,
      maxRetry: gw.maxRetry,
      description: gw.description,
    });
    setShowApiKey(false);
    setShowWebhook(false);
    document.body.style.overflow = "hidden";
  };

  const closeConfigDrawer = () => {
    setConfigGw(null);
    document.body.style.overflow = "";
  };

  const saveConfig = () => {
    if (!configGw) return;
    setGateways((prev) =>
      prev.map((gw) =>
        gw.name === configGw.name
          ? { ...gw, ...configForm }
          : gw
      )
    );
    closeConfigDrawer();
    showToast("Gateway configuration saved ✓");
  };

  const toggleGwStatus = (name: string) => {
    const gw = gateways.find((g) => g.name === name);
    if (!gw) return;

    if (gw.status === "Active") {
      const activeCount = gateways.filter((g) => g.status === "Active").length;
      if (activeCount <= 1) {
        showToast("At least one gateway must remain Active");
        return;
      }
      setGateways((prev) =>
        prev.map((g) => (g.name === name ? { ...g, status: "Standby" as GwStatus } : g))
      );
      showToast(`${name} moved to Standby`);
    } else {
      setGateways((prev) =>
        prev.map((g) => (g.name === name ? { ...g, status: "Active" as GwStatus } : g))
      );
      showToast(`${name} is now Active ✓`);
    }
  };

  const setAsPrimary = (name: string) => {
    setGateways((prev) =>
      prev.map((gw) => ({ ...gw, isPrimary: gw.name === name }))
    );
    showToast(`${name} set as Primary gateway ✓`);
  };

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("All Gateways");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const isFilterActive =
    searchQuery !== "" ||
    gatewayFilter !== "All Gateways" ||
    statusFilter !== "All Status" ||
    dateRange !== "Last 30 days";

  const clearFilters = () => {
    setSearchQuery("");
    setGatewayFilter("All Gateways");
    setStatusFilter("All Status");
    setDateRange("Last 30 days");
    setCustomFrom("");
    setCustomTo("");
  };

  // Parse "createdAt" like "Mar 28, 2026 — 12:12 PM" into a Date
  const parseCreatedAt = (s: string): Date => {
    const cleaned = s.replace("—", "").replace(/\s+/g, " ").trim();
    return new Date(cleaned);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (searchQuery && !tx.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (gatewayFilter !== "All Gateways" && tx.gateway !== gatewayFilter) return false;
    if (statusFilter !== "All Status" && tx.status !== statusFilter) return false;

    // Date filtering
    const txDate = parseCreatedAt(tx.createdAt);
    const now = new Date();
    if (dateRange === "Last 7 days") {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
      if (txDate < cutoff) return false;
    } else if (dateRange === "Last 30 days") {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      if (txDate < cutoff) return false;
    } else if (dateRange === "Custom") {
      if (customFrom && txDate < new Date(customFrom)) return false;
      if (customTo) {
        const toEnd = new Date(customTo);
        toEnd.setHours(23, 59, 59, 999);
        if (txDate > toEnd) return false;
      }
    }

    return true;
  });

  const pendingRefundCount = refunds.filter((r) => r.status === "Pending").length;
  const stats = baseStats.map((s) =>
    s.label === "Pending Refunds" ? { ...s, value: String(pendingRefundCount) } : s
  );

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmRefund = () => {
    if (!refundTx) return;
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === refundTx.id ? { ...tx, status: "Refunded" as TxStatus } : tx
      )
    );
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = today.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setRefunds((prev) => [
      {
        transactionId: refundTx.id,
        customer: refundTx.customerName,
        amount: refundTx.amount,
        reason: "Customer request",
        requestedOn: dateStr,
        status: "Pending" as RefundStatus,
        processedDate: "—",
        approvedBy: "—",
        timeline: [
          { label: "Refund Requested", date: `${dateStr} — ${timeStr}`, done: true },
          { label: "Under Review", date: `${dateStr} — ${timeStr}`, done: true },
          { label: "Approved / Rejected", date: "—", done: false },
          { label: "Processed / Closed", date: "—", done: false },
        ],
      },
      ...prev,
    ]);
    setRefundTx(null);
    showToast("Refund added to Refunds ✓");
  };

  // Refund approve/reject handlers
  const approveRefund = () => {
    if (!approveTarget) return;
    setRefunds((prev) =>
      prev.map((r) =>
        r.transactionId === approveTarget.transactionId
          ? {
              ...r,
              status: "Approved" as RefundStatus,
              processedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              approvedBy: "Super Admin",
              timeline: r.timeline.map((t, i) =>
                i === 2 ? { ...t, date: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`, done: true }
                : i === 3 ? { ...t, date: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`, done: true }
                : t
              ),
            }
          : r
      )
    );
    setApproveTarget(null);
    showToast("Refund approved successfully ✓");
  };

  const rejectRefund = () => {
    if (!rejectTarget) return;
    setRefunds((prev) =>
      prev.map((r) =>
        r.transactionId === rejectTarget.transactionId
          ? {
              ...r,
              status: "Rejected" as RefundStatus,
              processedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              approvedBy: "Super Admin",
              timeline: r.timeline.map((t, i) =>
                i === 2 ? { ...t, label: "Rejected", date: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`, done: true }
                : i === 3 ? { ...t, label: "Closed", date: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`, done: true }
                : t
              ),
            }
          : r
      )
    );
    setRejectTarget(null);
    setRejectReason("");
    showToast("Refund rejected ✓");
  };

  // Filtered refunds
  const filteredRefunds = refunds.filter((r) => {
    if (refundSearch) {
      const q = refundSearch.toLowerCase();
      if (!r.transactionId.toLowerCase().includes(q) && !r.customer.toLowerCase().includes(q)) return false;
    }
    if (refundStatusFilter !== "All" && r.status !== refundStatusFilter) return false;
    return true;
  });

  const refundStats = {
    pending: refunds.filter((r) => r.status === "Pending").length,
    approvedToday: refunds.filter((r) => r.status === "Approved").length,
    rejectedToday: refunds.filter((r) => r.status === "Rejected").length,
    totalRefunded: refunds.filter((r) => r.status === "Approved").reduce((sum, r) => sum + parseFloat(r.amount.replace(/[$,]/g, "")), 0),
  };

  const exportCsv = () => {
    if (filteredTransactions.length === 0) {
      setToast("No transactions to export");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    const headers = "Transaction ID,Amount,Gateway,Status,Customer Name,Customer Email,Card Type,Time";
    const rows = filteredTransactions.map((tx) =>
      [tx.id, tx.amount, tx.gateway, tx.status, tx.customerName, tx.customerEmail, tx.cardType, tx.time]
        .map((v) => `"${v}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `glimmora-transactions-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Exporting CSV... ✓");
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>
          Payment Orchestration
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
          Multi-gateway payments, subscriptions, invoices, and reconciliation
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                {stat.label}
              </span>
              <stat.icon className="h-5 w-5" style={{ color: "var(--gf-accent)" }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "var(--gf-text-primary)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Payment Gateways */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Payment Gateways
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {gateways.map((gw) => {
            const statusColor =
              gw.status === "Active" ? "#22c55e" : gw.status === "Standby" ? "#f59e0b" : "#6b7280";
            return (
              <div
                key={gw.name}
                className="rounded-xl p-5"
                style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
              >
                {/* Row 1: Name + badges + configure */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                    {gw.name}
                  </span>
                  {/* Primary / Secondary badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: gw.isPrimary ? "rgba(249,115,22,0.15)" : "rgba(107,114,128,0.15)",
                      color: gw.isPrimary ? "#f97316" : "#6b7280",
                    }}
                  >
                    {gw.isPrimary ? "Primary" : "Secondary"}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full ml-auto"
                    style={{
                      backgroundColor: `${statusColor}20`,
                      color: statusColor,
                    }}
                  >
                    {gw.status}
                  </span>
                  <button
                    title="Configure"
                    onClick={() => openConfigDrawer(gw)}
                    className="shrink-0 inline-flex items-center justify-center rounded-lg transition-colors hover:opacity-80"
                    style={{
                      width: 30,
                      height: 30,
                      border: "1px solid var(--gf-border)",
                      color: "var(--gf-text-secondary)",
                    }}
                  >
                    <Settings size={14} />
                  </button>
                </div>

                {/* Info */}
                <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                  {gw.share}
                </p>
                <p className="text-xs mt-1 mb-3" style={{ color: "var(--gf-text-muted)" }}>
                  {gw.description}
                </p>

                {/* Row 2: Toggle + Set as Primary */}
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid var(--gf-border)" }}>
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleGwStatus(gw.name)}
                    className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{
                      backgroundColor: gw.status === "Active" ? "#22c55e" : gw.status === "Standby" ? "#f59e0b" : "#6b7280",
                    }}
                  >
                    <span
                      className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                      style={{
                        transform: gw.status === "Active" ? "translate(21px, 2px)" : "translate(2px, 2px)",
                      }}
                    />
                  </button>
                  <span className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                    {gw.status}
                  </span>

                  {!gw.isPrimary && (
                    <button
                      onClick={() => setAsPrimary(gw.name)}
                      className="ml-auto text-xs font-medium px-2.5 py-1 rounded-lg transition-colors hover:opacity-90"
                      style={{
                        border: "1px solid #f97316",
                        color: "#f97316",
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f97316";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#f97316";
                      }}
                    >
                      <span className="inline-flex items-center gap-1"><Star size={12} /> Set as Primary</span>
                    </button>
                  )}
                  {gw.isPrimary && (
                    <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-lg" style={{ color: "#f97316" }}>
                      <span className="inline-flex items-center gap-1"><Star size={12} fill="#f97316" /> Primary</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions & Refunds Tabs */}
      <div>
        {/* Tab navigation */}
        <div className="flex gap-6 mb-4" style={{ borderBottom: "1px solid var(--gf-border)" }}>
          {(["transactions", "refunds"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2.5 text-sm font-medium transition-colors capitalize"
              style={{
                color: activeTab === tab ? "#f97316" : "var(--gf-text-secondary)",
                borderBottom: activeTab === tab ? "2px solid #f97316" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "transactions" && (
        <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Transactions
          </h2>
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              border: "1px solid #f97316",
              color: "#f97316",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f97316";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#f97316";
            }}
          >
            ⬇ Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-end gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--gf-text-secondary)" }}
            />
            <input
              type="text"
              placeholder="Search by Transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-shadow focus:ring-2 focus:ring-orange-500"
              style={{
                backgroundColor: "var(--gf-bg-elevated)",
                border: "1px solid var(--gf-border)",
                color: "var(--gf-text-primary)",
              }}
            />
          </div>

          {/* Gateway Filter */}
          <Dropdown
            value={gatewayFilter}
            options={["All Gateways", "Stripe", "Razorpay", "Adyen"]}
            onChange={setGatewayFilter}
          />

          {/* Status Filter */}
          <Dropdown
            value={statusFilter}
            options={["All Status", "Succeeded", "Pending", "Failed", "Refunded"]}
            onChange={setStatusFilter}
          />

          {/* Date Range */}
          <Dropdown
            value={dateRange}
            options={["Last 7 days", "Last 30 days", "Custom"]}
            onChange={setDateRange}
          />

          {/* Custom Date Inputs */}
          {dateRange === "Custom" && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm outline-none transition-shadow focus:ring-2 focus:ring-orange-500 dark:[color-scheme:dark]"
                style={{
                  backgroundColor: "var(--gf-bg-elevated)",
                  border: "1px solid var(--gf-border)",
                  color: "var(--gf-text-primary)",
                }}
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm outline-none transition-shadow focus:ring-2 focus:ring-orange-500 dark:[color-scheme:dark]"
                style={{
                  backgroundColor: "var(--gf-bg-elevated)",
                  border: "1px solid var(--gf-border)",
                  color: "var(--gf-text-primary)",
                }}
              />
            </>
          )}

          {/* Clear Filters */}
          {isFilterActive && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: "var(--gf-bg-elevated)",
                border: "1px solid var(--gf-border)",
                color: "#f97316",
              }}
            >
              <FilterX size={14} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs mb-2" style={{ color: "var(--gf-text-secondary)" }}>
          Showing {filteredTransactions.length} of {transactions.length} results
        </p>

        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <AlertCircle size={40} style={{ color: "var(--gf-text-secondary)" }} className="mb-3 opacity-50" />
              <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>
                No transactions found
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)", opacity: 0.7 }}>
                Try adjusting your filters
              </p>
            </div>
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Transaction ID", "Amount", "Gateway", "Status", "Time", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-mono" style={{ color: "var(--gf-text-primary)" }}>
                    <span className="inline-flex items-center gap-1.5">
                      {tx.id}
                      <button
                        title="Copy ID"
                        onClick={() => copyToClipboard(tx.id)}
                        className="inline-flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        style={{ width: 22, height: 22, color: copiedId === tx.id ? "#22c55e" : "var(--gf-text-secondary)" }}
                      >
                        {copiedId === tx.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>
                    {tx.amount}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {tx.gateway}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${statusColors[tx.status]}20`,
                        color: statusColors[tx.status],
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {tx.time}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <button
                        title="View Details"
                        onClick={() => setViewTx(tx)}
                        className="inline-flex items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        style={{ width: 28, height: 28, color: "#3b82f6" }}
                      >
                        <Eye size={16} />
                      </button>
                      {(tx.status === "Succeeded" || tx.status === "Failed") && (
                        <button
                          title="Refund"
                          onClick={() => setRefundTx(tx)}
                          className="inline-flex items-center justify-center rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                          style={{ width: 28, height: 28, color: "#f97316" }}
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
        )}

        {/* Refunds Tab */}
        {activeTab === "refunds" && (
        <div className="space-y-4">
          {/* Refund Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Pending Refunds", value: String(refundStats.pending), color: "#f59e0b" },
              { label: "Approved Today", value: String(refundStats.approvedToday), color: "#22c55e" },
              { label: "Rejected Today", value: String(refundStats.rejectedToday), color: "#ef4444" },
              { label: "Total Refunded", value: `$${refundStats.totalRefunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "var(--gf-text-primary)" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-5"
                style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Refund Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--gf-text-secondary)" }}
              />
              <input
                type="text"
                placeholder="Search by Transaction ID or Customer..."
                value={refundSearch}
                onChange={(e) => setRefundSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-shadow focus:ring-2 focus:ring-orange-500"
                style={{
                  backgroundColor: "var(--gf-bg-elevated)",
                  border: "1px solid var(--gf-border)",
                  color: "var(--gf-text-primary)",
                }}
              />
            </div>
            <Dropdown
              value={refundStatusFilter}
              options={["All", "Pending", "Approved", "Rejected"]}
              onChange={setRefundStatusFilter}
            />
            {(refundSearch || refundStatusFilter !== "All") && (
              <button
                onClick={() => { setRefundSearch(""); setRefundStatusFilter("All"); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "#f97316" }}
              >
                <FilterX size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* Refunds Table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
          >
            {filteredRefunds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <AlertCircle size={40} style={{ color: "var(--gf-text-secondary)" }} className="mb-3 opacity-50" />
                <p className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>No refunds found</p>
                <p className="text-xs mt-1" style={{ color: "var(--gf-text-secondary)", opacity: 0.7 }}>Try adjusting your filters</p>
              </div>
            ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  {["Transaction ID", "Customer", "Amount", "Reason", "Requested On", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((r) => (
                  <tr key={r.transactionId} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                    <td className="px-4 py-3 font-mono" style={{ color: "var(--gf-text-primary)" }}>
                      <span className="inline-flex items-center gap-1.5">
                        {r.transactionId}
                        <button
                          title="Copy ID"
                          onClick={() => copyToClipboard(r.transactionId)}
                          className="inline-flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          style={{ width: 22, height: 22, color: copiedId === r.transactionId ? "#22c55e" : "var(--gf-text-secondary)" }}
                        >
                          {copiedId === r.transactionId ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{r.customer}</td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{r.amount}</td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{r.reason}</td>
                    <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{r.requestedOn}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${refundStatusColors[r.status]}20`, color: refundStatusColors[r.status] }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        {r.status === "Pending" && (
                          <>
                            <button
                              title="Approve"
                              onClick={() => setApproveTarget(r)}
                              className="inline-flex items-center justify-center rounded text-xs font-medium px-2 py-1 transition-colors"
                              style={{ border: "1px solid #22c55e", color: "#22c55e" }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#22c55e"; e.currentTarget.style.color = "#fff"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#22c55e"; }}
                            >
                              Approve
                            </button>
                            <button
                              title="Reject"
                              onClick={() => { setRejectTarget(r); setRejectReason(""); }}
                              className="inline-flex items-center justify-center rounded text-xs font-medium px-2 py-1 transition-colors"
                              style={{ border: "1px solid #ef4444", color: "#ef4444" }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status !== "Pending" && (
                          <button
                            title="View Details"
                            onClick={() => { setViewRefund(r); document.body.style.overflow = "hidden"; }}
                            className="inline-flex items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            style={{ width: 28, height: 28, color: "#3b82f6" }}
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Subscriptions */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Subscriptions
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Tenant", "Plan", "Amount", "Billing Cycle", "Status", "Next Billing"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium"
                    style={{ color: "var(--gf-text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.tenant} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>
                    {sub.tenant}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>
                    {sub.plan}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>
                    {sub.amount}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {sub.billingCycle}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${subStatusColors[sub.status]}20`,
                        color: subStatusColors[sub.status],
                      }}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {sub.nextBilling}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Routing Rules */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Routing Rules
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {routingRules.map((rule) => (
            <div
              key={rule.name}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                  {rule.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.15)",
                    color: "#6366f1",
                  }}
                >
                  {rule.gateway}
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: "var(--gf-text-secondary)" }}>
                {rule.description}
              </p>
              <p className="text-xs font-mono" style={{ color: "var(--gf-text-secondary)" }}>
                Condition: {rule.condition}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Approve Refund Dialog */}
      {approveTarget && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setApproveTarget(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Confirm Approval</h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>
              Approve refund of <strong style={{ color: "var(--gf-text-primary)" }}>{approveTarget.amount}</strong> for
              transaction <strong style={{ color: "var(--gf-text-primary)" }}>{approveTarget.transactionId}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={approveRefund} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#22c55e", color: "#fff" }}>
                Yes, Approve
              </button>
              <button onClick={() => setApproveTarget(null)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Refund Dialog */}
      {rejectTarget && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Confirm Rejection</h3>
            <p className="text-sm mb-4" style={{ color: "var(--gf-text-secondary)" }}>
              Reject refund of <strong style={{ color: "var(--gf-text-primary)" }}>{rejectTarget.amount}</strong> for
              transaction <strong style={{ color: "var(--gf-text-primary)" }}>{rejectTarget.transactionId}</strong>?
            </p>
            <input
              type="text"
              placeholder="Enter rejection reason (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-5 focus:ring-2 focus:ring-orange-500"
              style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
            />
            <div className="flex gap-3">
              <button onClick={rejectRefund} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                Yes, Reject
              </button>
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Detail Modal */}
      {viewRefund && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => { setViewRefund(null); document.body.style.overflow = ""; }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Refund Details</h3>
              <button onClick={() => { setViewRefund(null); document.body.style.overflow = ""; }} className="rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors p-1" style={{ color: "var(--gf-text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {([
                ["Transaction ID", viewRefund.transactionId],
                ["Customer", viewRefund.customer],
                ["Amount", viewRefund.amount],
                ["Reason", viewRefund.reason],
                ["Requested On", viewRefund.requestedOn],
                ["Status", viewRefund.status],
                ["Processed Date", viewRefund.processedDate],
                ["Approved By", viewRefund.approvedBy],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="font-medium shrink-0" style={{ color: "var(--gf-text-secondary)", minWidth: 130 }}>{label}</span>
                  <span
                    className={label === "Transaction ID" ? "font-mono" : ""}
                    style={{
                      color: label === "Status" ? refundStatusColors[value as RefundStatus] : "var(--gf-text-primary)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Status Timeline */}
            <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--gf-border)" }}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--gf-text-primary)" }}>Status Timeline</h4>
              <div className="space-y-0">
                {viewRefund.timeline.map((step, i) => (
                  <div key={i} className="flex gap-3 relative">
                    {/* Vertical line */}
                    {i < viewRefund.timeline.length - 1 && (
                      <div
                        className="absolute left-[7px] top-[18px] w-0.5"
                        style={{
                          height: "calc(100% - 2px)",
                          backgroundColor: step.done ? "#f97316" : "var(--gf-border)",
                        }}
                      />
                    )}
                    {/* Dot */}
                    <div
                      className="shrink-0 mt-0.5 rounded-full"
                      style={{
                        width: 16,
                        height: 16,
                        border: step.done ? "none" : "2px solid var(--gf-border)",
                        backgroundColor: step.done ? "#f97316" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.done && <Check size={10} color="#fff" />}
                    </div>
                    {/* Content */}
                    <div className="pb-5">
                      <p className="text-sm font-medium" style={{ color: step.done ? "var(--gf-text-primary)" : "var(--gf-text-muted)" }}>{step.label}</p>
                      <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setViewRefund(null); document.body.style.overflow = ""; }}
              className="mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--gf-text-secondary)", color: "var(--gf-bg-surface)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[10000] animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-lg px-4 py-3 text-sm font-medium shadow-lg"
          style={{
            backgroundColor: toast.includes("At least one") || toast.includes("rejected") ? "#ef4444"
              : toast.includes("No transactions") || toast.includes("Standby") ? "#f97316"
              : "#22c55e",
            color: "#fff",
          }}
        >
          {toast}
        </div>
      )}

      {/* Refund Confirmation Dialog */}
      {refundTx && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          onClick={() => setRefundTx(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--gf-bg-surface)",
              border: "1px solid var(--gf-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
              Confirm Refund
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>
              Initiate refund of <strong style={{ color: "var(--gf-text-primary)" }}>{refundTx.amount}</strong> for
              transaction <strong style={{ color: "var(--gf-text-primary)" }}>{refundTx.id}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmRefund}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "#f97316", color: "#fff" }}
              >
                Yes, Refund
              </button>
              <button
                onClick={() => setRefundTx(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--gf-text-secondary)", color: "var(--gf-bg-surface)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Config Drawer */}
      {configGw && (
        <div
          className="flex justify-end animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={closeConfigDrawer}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto animate-in slide-in-from-right duration-300"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderLeft: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                  Configure {configGw.name}
                </h3>
                <button
                  onClick={closeConfigDrawer}
                  className="rounded-lg p-1 transition-colors hover:opacity-80"
                  style={{ color: "var(--gf-text-secondary)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Gateway Name (read-only) */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Gateway Name</label>
                  <div
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-muted)" }}
                  >
                    {configGw.name}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={configForm.apiKey}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:opacity-80"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Webhook Secret</label>
                  <div className="relative">
                    <input
                      type={showWebhook ? "text" : "password"}
                      value={configForm.webhookSecret}
                      onChange={(e) => setConfigForm({ ...configForm, webhookSecret: e.target.value })}
                      className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhook((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:opacity-80"
                      style={{ color: "var(--gf-text-secondary)" }}
                    >
                      {showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Region</label>
                  <Dropdown
                    value={configForm.region}
                    options={["Global", "India", "Europe", "US"]}
                    onChange={(v) => setConfigForm({ ...configForm, region: v })}
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Currency</label>
                  <Dropdown
                    value={configForm.currency}
                    options={["USD", "INR", "EUR", "GBP"]}
                    onChange={(v) => setConfigForm({ ...configForm, currency: v })}
                  />
                </div>

                {/* Max Retry */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Max Retry</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={configForm.maxRetry}
                    onChange={(e) => setConfigForm({ ...configForm, maxRetry: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Description</label>
                  <textarea
                    rows={3}
                    value={configForm.description}
                    onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500"
                    style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveConfig}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: "#f97316", color: "#fff" }}
                >
                  Save Configuration
                </button>
                <button
                  onClick={closeConfigDrawer}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {viewTx && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          onClick={() => setViewTx(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--gf-bg-surface)",
              border: "1px solid var(--gf-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                Transaction Details
              </h3>
              <button
                onClick={() => setViewTx(null)}
                className="rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors p-1"
                style={{ color: "var(--gf-text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {([
                ["Transaction ID", viewTx.id],
                ["Amount", viewTx.amount],
                ["Gateway", viewTx.gateway],
                ["Status", viewTx.status],
                ["Customer Name", viewTx.customerName],
                ["Customer Email", viewTx.customerEmail],
                ["Card Type", viewTx.cardType],
                ["Created At", viewTx.createdAt],
                ["Description", viewTx.description],
                ["Metadata", viewTx.metadata],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span
                    className="font-medium shrink-0"
                    style={{ color: "var(--gf-text-secondary)", minWidth: 130 }}
                  >
                    {label}
                  </span>
                  <span
                    className={label === "Transaction ID" || label === "Metadata" ? "font-mono" : ""}
                    style={{
                      color:
                        label === "Status"
                          ? statusColors[value as TxStatus]
                          : "var(--gf-text-primary)",
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewTx(null)}
              className="mt-6 w-full py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: "var(--gf-text-secondary)",
                color: "var(--gf-bg-surface)",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
