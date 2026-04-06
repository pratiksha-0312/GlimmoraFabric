
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
  Pencil,
  Pause,
  Plus,
  TrendingUp,
  Bell,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  CircleDot,
  XCircle,
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
  { id: "TXN-002", amount: "$1,200.00", gateway: "Razorpay", status: "Pending", time: "25 min ago", customerName: "User 1", customerEmail: "user1@example.com", cardType: "Mastercard •••• 8819", createdAt: "Mar 28, 2026 — 11:59 AM", description: "Invoice #INV-2026-118", metadata: '{ "plan": "enterprise", "cycle": "annual" }' },
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
type SubPlan = "Starter" | "Pro" | "Enterprise";
type SubCycle = "Monthly" | "Annual";

interface Subscription {
  id: number;
  tenant: string;
  plan: SubPlan;
  amount: string;
  billingCycle: SubCycle;
  status: SubStatus;
  nextBilling: string;
  memberSince: string;
  paymentMethod: string;
  autoRenew: boolean;
  reminderSent: boolean;
}

const initialSubscriptions: Subscription[] = [
  { id: 1, tenant: "Acme Corp", plan: "Enterprise", amount: "$2,400.00", billingCycle: "Annual", status: "Active", nextBilling: "2026-04-15", memberSince: "2024-01-10", paymentMethod: "Visa •••• 4242", autoRenew: true, reminderSent: false },
  { id: 2, tenant: "Globex Inc", plan: "Pro", amount: "$99.00", billingCycle: "Monthly", status: "Active", nextBilling: "2026-04-01", memberSince: "2024-06-15", paymentMethod: "Mastercard •••• 8819", autoRenew: true, reminderSent: false },
  { id: 3, tenant: "Initech", plan: "Enterprise", amount: "$2,400.00", billingCycle: "Annual", status: "Past Due", nextBilling: "2026-03-28", memberSince: "2023-11-20", paymentMethod: "Visa •••• 1234", autoRenew: true, reminderSent: false },
  { id: 4, tenant: "Wonka Ltd", plan: "Starter", amount: "$29.00", billingCycle: "Monthly", status: "Trialing", nextBilling: "2026-04-10", memberSince: "2026-03-10", paymentMethod: "Amex •••• 3782", autoRenew: true, reminderSent: false },
  { id: 5, tenant: "Umbrella Co", plan: "Pro", amount: "$99.00", billingCycle: "Monthly", status: "Cancelled", nextBilling: "—", memberSince: "2024-09-01", paymentMethod: "Visa •••• 9090", autoRenew: false, reminderSent: false },
];

const subStatusColors: Record<SubStatus, string> = {
  Active: "#22c55e",
  Trialing: "#f59e0b",
  "Past Due": "#ef4444",
  Cancelled: "#6b7280",
};

const planPrices: Record<SubPlan, { monthly: number; annual: number; features: string[] }> = {
  Starter: { monthly: 29, annual: 290, features: ["Up to 5 users", "Basic analytics", "Email support"] },
  Pro: { monthly: 99, annual: 990, features: ["Up to 50 users", "Advanced analytics", "Priority support"] },
  Enterprise: { monthly: 249, annual: 2400, features: ["Unlimited users", "Custom integrations", "Dedicated account manager"] },
};

type HistoryAction = "upgraded" | "downgraded" | "started" | "cancelled";

interface PlanHistoryEntry {
  action: HistoryAction;
  plan: string;
  fromPlan?: string;
  date: string;
  by: string;
}

const planHistory: Record<string, PlanHistoryEntry[]> = {
  "Acme Corp": [
    { action: "upgraded", plan: "Enterprise", fromPlan: "Pro", date: "Mar 15, 2026", by: "Super Admin" },
    { action: "started", plan: "Pro", date: "Jan 10, 2026", by: "System" },
  ],
  "Globex Inc": [
    { action: "started", plan: "Pro", date: "Feb 01, 2026", by: "System" },
  ],
  "Initech": [
    { action: "downgraded", plan: "Pro", fromPlan: "Enterprise", date: "Mar 01, 2026", by: "Admin" },
    { action: "upgraded", plan: "Enterprise", fromPlan: "Starter", date: "Nov 15, 2025", by: "Super Admin" },
    { action: "started", plan: "Starter", date: "Oct 01, 2025", by: "System" },
  ],
  "Wonka Ltd": [
    { action: "started", plan: "Starter", date: "Mar 20, 2026", by: "System" },
  ],
  "Umbrella Co": [
    { action: "cancelled", plan: "Pro", date: "Mar 25, 2026", by: "Admin" },
    { action: "started", plan: "Pro", date: "Jan 05, 2026", by: "System" },
  ],
};

function historyActionColor(action: HistoryAction): string {
  switch (action) {
    case "upgraded": return "#22c55e";
    case "downgraded": return "#ef4444";
    case "started": return "#f59e0b";
    case "cancelled": return "#ef4444";
  }
}

function historyActionLabel(entry: PlanHistoryEntry): string {
  switch (entry.action) {
    case "upgraded": return `Upgraded to ${entry.plan}`;
    case "downgraded": return `Downgraded to ${entry.plan}`;
    case "started": return `Started ${entry.plan} Trial`;
    case "cancelled": return `Cancelled ${entry.plan}`;
  }
}

function historyActionSubtext(entry: PlanHistoryEntry): string {
  switch (entry.action) {
    case "upgraded": return `from ${entry.fromPlan} → ${entry.plan}`;
    case "downgraded": return `from ${entry.fromPlan} → ${entry.plan}`;
    case "started": return "New subscription created";
    case "cancelled": return "Subscription cancelled";
  }
}

function computeMrr(subs: Subscription[]): number {
  return subs.reduce((sum, s) => {
    if (s.status === "Cancelled") return sum;
    const amt = parseFloat(s.amount.replace(/[$,]/g, ""));
    return sum + (s.billingCycle === "Annual" ? amt / 12 : amt);
  }, 0);
}

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
  { transactionId: "TXN-034", customer: "User 1", amount: "$299.00", reason: "Duplicate charge", requestedOn: "Mar 28, 2026", status: "Pending", processedDate: "—", approvedBy: "—", timeline: [
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
  { transactionId: "TXN-005", customer: "User 2", amount: "$175.50", reason: "Customer request", requestedOn: "Mar 25, 2026", status: "Approved", processedDate: "Mar 26, 2026", approvedBy: "Super Admin", timeline: [
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

  // Subscription state
  const [subs, setSubs] = useState<Subscription[]>(initialSubscriptions);
  const [subSearch, setSubSearch] = useState("");
  const [subPlanFilter, setSubPlanFilter] = useState("All Plans");
  const [subStatusFilter, setSubStatusFilter] = useState("All Status");
  const [subCycleFilter, setSubCycleFilter] = useState("All");
  const [viewSub, setViewSub] = useState<Subscription | null>(null);
  const [changePlanSub, setChangePlanSub] = useState<Subscription | null>(null);
  const [cancelSub, setCancelSub] = useState<Subscription | null>(null);
  const [renewSub, setRenewSub] = useState<Subscription | null>(null);
  const [reminderSub, setReminderSub] = useState<Subscription | null>(null);
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSubForm, setNewSubForm] = useState({ tenant: "", plan: "Starter" as SubPlan, billingCycle: "Monthly" as SubCycle, amount: "$29.00", startDate: new Date().toISOString().split("T")[0], status: "Active" as "Active" | "Trialing", paymentMethod: "", autoRenew: true });
  const [nextSubId, setNextSubId] = useState(6);

  const subFiltersActive = subSearch !== "" || subPlanFilter !== "All Plans" || subStatusFilter !== "All Status" || subCycleFilter !== "All";

  const filteredSubs = subs.filter((s) => {
    if (subSearch && !s.tenant.toLowerCase().includes(subSearch.toLowerCase())) return false;
    if (subPlanFilter !== "All Plans" && s.plan !== subPlanFilter) return false;
    if (subStatusFilter !== "All Status" && s.status !== subStatusFilter) return false;
    if (subCycleFilter !== "All" && s.billingCycle !== subCycleFilter) return false;
    return true;
  });

  const subMrr = computeMrr(subs);
  const subActiveCount = subs.filter((s) => s.status === "Active").length;
  const subPastDueCount = subs.filter((s) => s.status === "Past Due").length;
  const subTrialingCount = subs.filter((s) => s.status === "Trialing").length;

  const handleChangePlan = (sub: Subscription, newPlan: SubPlan) => {
    const price = sub.billingCycle === "Annual" ? planPrices[newPlan].annual : planPrices[newPlan].monthly;
    setSubs((prev) => prev.map((s) => s.id === sub.id ? { ...s, plan: newPlan, amount: `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}` } : s));
    setChangePlanSub(null);
    showToast(`Plan updated to ${newPlan} \u2713`);
  };

  const handleCancelSub = (sub: Subscription) => {
    setSubs((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "Cancelled" as SubStatus, nextBilling: "\u2014", autoRenew: false } : s));
    setCancelSub(null);
    showToast("Subscription cancelled \u2713");
  };

  const handleRenewSub = (sub: Subscription) => {
    const next = new Date();
    next.setDate(next.getDate() + 30);
    const nextStr = next.toISOString().split("T")[0];
    setSubs((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "Active" as SubStatus, nextBilling: nextStr, autoRenew: true } : s));
    setRenewSub(null);
    showToast("Subscription renewed \u2713");
  };

  const handleSendReminder = (sub: Subscription) => {
    setSubs((prev) => prev.map((s) => s.id === sub.id ? { ...s, reminderSent: true } : s));
    setReminderSub(null);
    showToast(`Reminder sent to ${sub.tenant} \u2713`);
  };

  const handleAddSub = () => {
    if (!newSubForm.tenant.trim()) return;
    const newSub: Subscription = {
      id: nextSubId,
      tenant: newSubForm.tenant,
      plan: newSubForm.plan,
      amount: newSubForm.amount,
      billingCycle: newSubForm.billingCycle,
      status: newSubForm.status,
      nextBilling: (() => { const d = new Date(newSubForm.startDate); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0]; })(),
      memberSince: newSubForm.startDate,
      paymentMethod: newSubForm.paymentMethod || "—",
      autoRenew: newSubForm.autoRenew,
      reminderSent: false,
    };
    setSubs((prev) => [newSub, ...prev]);
    setNextSubId((p) => p + 1);
    setShowAddSub(false);
    setNewSubForm({ tenant: "", plan: "Starter", billingCycle: "Monthly", amount: "$29.00", startDate: new Date().toISOString().split("T")[0], status: "Active", paymentMethod: "", autoRenew: true });
    document.body.style.overflow = "";
    showToast("Subscription created \u2713");
  };

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

      {/* Subscription Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total MRR", value: `$${subMrr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#22c55e", icon: TrendingUp },
          { label: "Active", value: String(subActiveCount), color: "#22c55e", icon: Check },
          { label: "Past Due", value: String(subPastDueCount), color: "#ef4444", icon: AlertCircle },
          { label: "Trialing", value: String(subTrialingCount), color: "#f59e0b", icon: Clock },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--gf-text-secondary)" }}>{s.label}</span>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Subscriptions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Subscriptions</h2>
          <button
            onClick={() => { setShowAddSub(true); document.body.style.overflow = "hidden"; }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#f97316" }}
          >
            <Plus className="h-4 w-4" /> Add Subscription
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-secondary)" }} />
            <input
              type="text"
              placeholder="Search by tenant name..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
              style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}
            />
          </div>
          <Dropdown value={subPlanFilter} options={["All Plans", "Starter", "Pro", "Enterprise"]} onChange={setSubPlanFilter} />
          <Dropdown value={subStatusFilter} options={["All Status", "Active", "Past Due", "Trialing", "Cancelled"]} onChange={setSubStatusFilter} />
          <Dropdown value={subCycleFilter} options={["All", "Monthly", "Annual"]} onChange={setSubCycleFilter} />
          {subFiltersActive && (
            <button
              onClick={() => { setSubSearch(""); setSubPlanFilter("All Plans"); setSubStatusFilter("All Status"); setSubCycleFilter("All"); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "#f97316", border: "1px solid #f97316", backgroundColor: "rgba(249,115,22,0.08)" }}
            >
              <FilterX className="h-4 w-4" /> Clear Filters
            </button>
          )}
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gf-border)" }}>
                {["Tenant", "Plan", "Amount", "Billing Cycle", "Status", "Next Billing", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs" style={{ color: "var(--gf-text-secondary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: "var(--gf-text-secondary)" }}>No subscriptions match your filters.</td></tr>
              )}
              {filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  style={{
                    borderBottom: "1px solid var(--gf-border)",
                    borderLeft: sub.status === "Past Due" ? "3px solid #ef4444" : "3px solid transparent",
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{sub.tenant}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{sub.plan}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-primary)" }}>{sub.amount}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{sub.billingCycle}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${subStatusColors[sub.status]}20`, color: subStatusColors[sub.status] }}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{sub.nextBilling}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* View Details */}
                      <button onClick={() => setViewSub(sub)} className="rounded-lg p-1.5 hover:opacity-80 transition-opacity" style={{ backgroundColor: "#3b82f620", color: "#3b82f6" }} title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Change Plan */}
                      <button onClick={() => setChangePlanSub(sub)} className="rounded-lg p-1.5 hover:opacity-80 transition-opacity" style={{ backgroundColor: "#f59e0b20", color: "#f59e0b" }} title="Change Plan">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {/* Cancel — Active or Trialing only */}
                      {(sub.status === "Active" || sub.status === "Trialing") && (
                        <button onClick={() => setCancelSub(sub)} className="rounded-lg p-1.5 hover:opacity-80 transition-opacity" style={{ backgroundColor: "#ef444420", color: "#ef4444" }} title="Cancel Subscription">
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      {/* Renew — Past Due or Cancelled only */}
                      {(sub.status === "Past Due" || sub.status === "Cancelled") && (
                        <button onClick={() => setRenewSub(sub)} className="rounded-lg p-1.5 hover:opacity-80 transition-opacity" style={{ backgroundColor: "#22c55e20", color: "#22c55e" }} title="Renew Subscription">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      {/* Send Reminder — Past Due only */}
                      {sub.status === "Past Due" && (
                        sub.reminderSent ? (
                          <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ color: "#6b7280", backgroundColor: "var(--gf-border)" }}>
                            Reminder Sent ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => setReminderSub(sub)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium hover:opacity-80 transition-opacity"
                            style={{ color: "#ef4444", border: "1px solid #ef4444", backgroundColor: "transparent" }}
                          >
                            <Bell className="h-3 w-3" /> Send Reminder
                          </button>
                        )
                      )}
                    </div>
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

      {/* View Subscription Details Modal */}
      {viewSub && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setViewSub(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Subscription Details</h3>
              <button onClick={() => setViewSub(null)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ["Tenant", viewSub.tenant],
                ["Plan", viewSub.plan],
                ["Amount", viewSub.amount],
                ["Billing Cycle", viewSub.billingCycle],
                ["Status", viewSub.status],
                ["Next Billing", viewSub.nextBilling],
                ["Member Since", viewSub.memberSince],
                ["Payment Method", viewSub.paymentMethod],
                ["Auto Renew", viewSub.autoRenew ? "Enabled" : "Disabled"],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="font-medium shrink-0" style={{ color: "var(--gf-text-secondary)", minWidth: 130 }}>{label}</span>
                  <span style={{ color: label === "Status" ? subStatusColors[value as SubStatus] ?? "var(--gf-text-primary)" : "var(--gf-text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Plan Change History */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--gf-border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4" style={{ color: "var(--gf-accent)" }} />
                <h4 className="text-sm font-semibold" style={{ color: "var(--gf-text-primary)" }}>Plan Change History</h4>
              </div>
              {(() => {
                const history = planHistory[viewSub.tenant];
                if (!history || history.length === 0) {
                  return <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>No plan changes recorded</p>;
                }
                const HistoryIcon = ({ action }: { action: HistoryAction }) => {
                  const color = historyActionColor(action);
                  const props = { className: "h-4 w-4", style: { color } };
                  switch (action) {
                    case "upgraded": return <ArrowUpCircle {...props} />;
                    case "downgraded": return <ArrowDownCircle {...props} />;
                    case "started": return <CircleDot {...props} />;
                    case "cancelled": return <XCircle {...props} />;
                  }
                };
                return (
                  <div className="max-h-[300px] overflow-y-auto">
                    {history.map((entry, idx) => {
                      const isLast = idx === history.length - 1;
                      return (
                        <div key={idx} className="flex gap-3 relative" style={{ paddingBottom: isLast ? 0 : 16 }}>
                          {/* Vertical dotted line */}
                          {!isLast && (
                            <div
                              className="absolute left-[9px] top-[22px] w-0"
                              style={{
                                height: "calc(100% - 14px)",
                                borderLeft: "2px dotted var(--gf-border)",
                              }}
                            />
                          )}
                          {/* Icon */}
                          <div className="relative z-10 flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5">
                            <HistoryIcon action={entry.action} />
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium" style={{ color: historyActionColor(entry.action) }}>
                                {historyActionLabel(entry)}
                              </p>
                              <span className="text-xs shrink-0" style={{ color: "var(--gf-text-secondary)" }}>{entry.date}</span>
                            </div>
                            <p className="text-xs" style={{ color: "var(--gf-text-secondary)" }}>
                              {historyActionSubtext(entry)} &middot; by {entry.by}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <button onClick={() => setViewSub(null)} className="mt-6 w-full py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "var(--gf-text-secondary)", color: "var(--gf-bg-surface)" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {changePlanSub && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setChangePlanSub(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Change Plan — {changePlanSub.tenant}</h3>
              <button onClick={() => setChangePlanSub(null)} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["Starter", "Pro", "Enterprise"] as SubPlan[]).map((plan) => {
                const isCurrent = changePlanSub.plan === plan;
                const price = changePlanSub.billingCycle === "Annual" ? planPrices[plan].annual : planPrices[plan].monthly;
                return (
                  <div
                    key={plan}
                    className="rounded-xl p-4 cursor-pointer transition-all hover:opacity-90"
                    style={{
                      border: isCurrent ? "2px solid #f97316" : "1px solid var(--gf-border)",
                      backgroundColor: isCurrent ? "rgba(249,115,22,0.08)" : "var(--gf-bg-elevated)",
                    }}
                    onClick={() => { if (!isCurrent) handleChangePlan(changePlanSub, plan); }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>{plan}</span>
                      {isCurrent && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#f9731620", color: "#f97316" }}>Current</span>}
                    </div>
                    <p className="text-lg font-bold mb-2" style={{ color: "var(--gf-text-primary)" }}>
                      ${price.toLocaleString()}<span className="text-xs font-normal" style={{ color: "var(--gf-text-secondary)" }}>/{changePlanSub.billingCycle === "Annual" ? "yr" : "mo"}</span>
                    </p>
                    <ul className="space-y-1">
                      {planPrices[plan].features.map((f) => (
                        <li key={f} className="text-xs flex items-center gap-1.5" style={{ color: "var(--gf-text-secondary)" }}>
                          <Check className="h-3 w-3 shrink-0" style={{ color: "#22c55e" }} /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Dialog */}
      {cancelSub && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setCancelSub(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Cancel Subscription</h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>
              Cancel subscription for <strong style={{ color: "var(--gf-text-primary)" }}>{cancelSub.tenant}</strong>? They will lose access at end of billing period.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleCancelSub(cancelSub)} className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "#ef4444", color: "#fff" }}>Yes, Cancel</button>
              <button onClick={() => setCancelSub(null)} className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Subscription Dialog */}
      {renewSub && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setRenewSub(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Renew Subscription</h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>
              Renew subscription for <strong style={{ color: "var(--gf-text-primary)" }}>{renewSub.tenant}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleRenewSub(renewSub)} className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "#22c55e", color: "#fff" }}>Yes, Renew</button>
              <button onClick={() => setRenewSub(null)} className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Dialog */}
      {reminderSub && (
        <div
          className="flex items-center justify-center animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setReminderSub(null)}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--gf-bg-surface)", border: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--gf-text-primary)" }}>Send Payment Reminder</h3>
            <p className="text-sm mb-5" style={{ color: "var(--gf-text-secondary)" }}>
              Send payment reminder email to <strong style={{ color: "var(--gf-text-primary)" }}>{reminderSub.tenant}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleSendReminder(reminderSub)} className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "#f97316", color: "#fff" }}>Yes, Send</button>
              <button onClick={() => setReminderSub(null)} className="flex-1 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscription Drawer */}
      {showAddSub && (
        <div
          className="flex justify-end animate-in fade-in duration-200"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => { setShowAddSub(false); document.body.style.overflow = ""; }}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto animate-in slide-in-from-right duration-300"
            style={{ backgroundColor: "var(--gf-bg-surface)", borderLeft: "1px solid var(--gf-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>Add Subscription</h3>
                <button onClick={() => { setShowAddSub(false); document.body.style.overflow = ""; }} className="rounded-lg p-1 hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}><X size={18} /></button>
              </div>
              <div className="space-y-4">
                {/* Tenant Name */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Tenant Name *</label>
                  <input type="text" value={newSubForm.tenant} onChange={(e) => setNewSubForm({ ...newSubForm, tenant: e.target.value })} placeholder="e.g. Acme Corp" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }} />
                </div>
                {/* Plan */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Plan</label>
                  <Dropdown value={newSubForm.plan} options={["Starter", "Pro", "Enterprise"]} onChange={(v) => {
                    const p = v as SubPlan;
                    const cycle = newSubForm.billingCycle;
                    const price = cycle === "Annual" ? planPrices[p].annual : planPrices[p].monthly;
                    setNewSubForm({ ...newSubForm, plan: p, amount: `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}` });
                  }} />
                </div>
                {/* Billing Cycle */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Billing Cycle</label>
                  <Dropdown value={newSubForm.billingCycle} options={["Monthly", "Annual"]} onChange={(v) => {
                    const cycle = v as SubCycle;
                    const price = cycle === "Annual" ? planPrices[newSubForm.plan].annual : planPrices[newSubForm.plan].monthly;
                    setNewSubForm({ ...newSubForm, billingCycle: cycle, amount: `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}` });
                  }} />
                </div>
                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Amount</label>
                  <input type="text" value={newSubForm.amount} onChange={(e) => setNewSubForm({ ...newSubForm, amount: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }} />
                </div>
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Start Date</label>
                  <input type="date" value={newSubForm.startDate} onChange={(e) => setNewSubForm({ ...newSubForm, startDate: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }} />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Status</label>
                  <Dropdown value={newSubForm.status} options={["Active", "Trialing"]} onChange={(v) => setNewSubForm({ ...newSubForm, status: v as "Active" | "Trialing" })} />
                </div>
                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gf-text-secondary)" }}>Payment Method</label>
                  <input type="text" value={newSubForm.paymentMethod} onChange={(e) => setNewSubForm({ ...newSubForm, paymentMethod: e.target.value })} placeholder="e.g. Visa •••• 4242" className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }} />
                </div>
                {/* Auto Renew */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium" style={{ color: "var(--gf-text-secondary)" }}>Auto Renew</label>
                  <button
                    onClick={() => setNewSubForm({ ...newSubForm, autoRenew: !newSubForm.autoRenew })}
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{ backgroundColor: newSubForm.autoRenew ? "#22c55e" : "var(--gf-border)" }}
                  >
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: newSubForm.autoRenew ? "translateX(20px)" : "translateX(0)" }} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddSub} className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "#f97316", color: "#fff" }}>Save Subscription</button>
                <button onClick={() => { setShowAddSub(false); document.body.style.overflow = ""; }} className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: "var(--gf-bg-elevated)", border: "1px solid var(--gf-border)", color: "var(--gf-text-primary)" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[10000] animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-lg px-4 py-3 text-sm font-medium shadow-lg"
          style={{
            backgroundColor: toast.includes("At least one") || toast.includes("rejected") || toast.includes("cancelled") ? "#ef4444"
              : toast.includes("No transactions") || toast.includes("Standby") || toast.includes("Reminder sent") ? "#f97316"
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
