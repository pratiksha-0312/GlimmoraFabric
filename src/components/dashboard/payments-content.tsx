
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

const gateways = [
  {
    name: "Stripe",
    status: "Active" as const,
    role: "Primary gateway",
    share: "68% of transactions",
  },
  {
    name: "Razorpay",
    status: "Active" as const,
    role: "India region",
    share: "28% of transactions",
  },
  {
    name: "Adyen",
    status: "Standby" as const,
    role: "Failover gateway",
    share: "4% of transactions",
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

type RefundStatus = "Processed" | "Pending" | "Rejected";

type Refund = {
  transactionId: string;
  amount: string;
  reason: string;
  status: RefundStatus;
  processedDate: string;
};

const initialRefunds: Refund[] = [
  { transactionId: "TXN-005", amount: "$175.50", reason: "Customer request", status: "Processed", processedDate: "2026-03-29" },
  { transactionId: "TXN-098", amount: "$340.00", reason: "Duplicate charge", status: "Processed", processedDate: "2026-03-28" },
  { transactionId: "TXN-112", amount: "$59.99", reason: "Service not rendered", status: "Pending", processedDate: "—" },
  { transactionId: "TXN-087", amount: "$1,100.00", reason: "Billing error", status: "Pending", processedDate: "—" },
  { transactionId: "TXN-045", amount: "$25.00", reason: "Fraudulent charge", status: "Rejected", processedDate: "2026-03-27" },
];

const refundStatusColors: Record<RefundStatus, string> = {
  Processed: "#22c55e",
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
    setRefunds((prev) => [
      {
        transactionId: refundTx.id,
        amount: refundTx.amount,
        reason: "Customer request",
        status: "Pending",
        processedDate: "—",
      },
      ...prev,
    ]);
    setRefundTx(null);
    setToast("Refund added to Recent Refunds ✓");
    setTimeout(() => setToast(null), 3000);
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
          {gateways.map((gw) => (
            <div
              key={gw.name}
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="h-2.5 w-2.5 rounded-full inline-block"
                  style={{ backgroundColor: gw.status === "Active" ? "#22c55e" : "#f59e0b" }}
                />
                <span className="font-semibold" style={{ color: "var(--gf-text-primary)" }}>
                  {gw.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full ml-auto"
                  style={{
                    backgroundColor: gw.status === "Active" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                    color: gw.status === "Active" ? "#22c55e" : "#f59e0b",
                  }}
                >
                  {gw.status}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
                {gw.role}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--gf-text-secondary)" }}>
                {gw.share}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Transactions
        </h2>

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

      {/* Refunds */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>
          Recent Refunds
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Transaction ID", "Amount", "Reason", "Status", "Processed Date"].map((h) => (
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
              {refunds.map((r) => (
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
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>
                    {r.amount}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {r.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${refundStatusColors[r.status]}20`,
                        color: refundStatusColors[r.status],
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>
                    {r.processedDate}
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
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[10000] animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-lg px-4 py-3 text-sm font-medium shadow-lg"
          style={{ backgroundColor: "#22c55e", color: "#fff" }}
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
