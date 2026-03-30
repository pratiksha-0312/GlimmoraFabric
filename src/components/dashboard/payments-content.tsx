"use client";

import {
  CreditCard,
  DollarSign,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Stats data
// ---------------------------------------------------------------------------

const stats = [
  { label: "Revenue (MTD)", value: "$124,500", icon: DollarSign },
  { label: "Transactions", value: "2,847", icon: ArrowUpDown },
  { label: "Success Rate", value: "99.2%", icon: CreditCard },
  { label: "Pending Refunds", value: "5", icon: RefreshCw },
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

const transactions: {
  id: string;
  amount: string;
  gateway: string;
  status: TxStatus;
  time: string;
}[] = [
  { id: "TXN-001", amount: "$250.00", gateway: "Stripe", status: "Succeeded", time: "12 min ago" },
  { id: "TXN-002", amount: "$1,200.00", gateway: "Razorpay", status: "Pending", time: "25 min ago" },
  { id: "TXN-003", amount: "$89.99", gateway: "Stripe", status: "Succeeded", time: "1 hr ago" },
  { id: "TXN-004", amount: "$450.00", gateway: "Adyen", status: "Failed", time: "2 hr ago" },
  { id: "TXN-005", amount: "$175.50", gateway: "Stripe", status: "Refunded", time: "3 hr ago" },
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

const refunds: {
  transactionId: string;
  amount: string;
  reason: string;
  status: RefundStatus;
  processedDate: string;
}[] = [
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
// Component
// ---------------------------------------------------------------------------

export function PaymentsContent() {
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
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Transaction ID", "Amount", "Gateway", "Status", "Time"].map((h) => (
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
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--gf-border)" }}>
                  <td className="px-4 py-3 font-mono" style={{ color: "var(--gf-text-primary)" }}>
                    {tx.id}
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
                </tr>
              ))}
            </tbody>
          </table>
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
                    {r.transactionId}
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
    </div>
  );
}
