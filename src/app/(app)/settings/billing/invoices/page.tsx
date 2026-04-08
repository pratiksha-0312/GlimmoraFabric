"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Download, Eye, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  plan: string;
}

const INVOICES: Invoice[] = [
  { id: "inv1", number: "INV-2026-0012", date: "2026-04-01", amount: "$49.00", status: "Paid", plan: "Pro" },
  { id: "inv2", number: "INV-2026-0011", date: "2026-03-01", amount: "$49.00", status: "Paid", plan: "Pro" },
  { id: "inv3", number: "INV-2026-0010", date: "2026-02-01", amount: "$49.00", status: "Paid", plan: "Pro" },
  { id: "inv4", number: "INV-2026-0009", date: "2026-01-01", amount: "$49.00", status: "Paid", plan: "Pro" },
  { id: "inv5", number: "INV-2025-0008", date: "2025-12-01", amount: "$19.00", status: "Paid", plan: "Starter" },
  { id: "inv6", number: "INV-2025-0007", date: "2025-11-01", amount: "$19.00", status: "Paid", plan: "Starter" },
  { id: "inv7", number: "INV-2025-0006", date: "2025-10-01", amount: "$19.00", status: "Failed", plan: "Starter" },
  { id: "inv8", number: "INV-2025-0005", date: "2025-09-01", amount: "$19.00", status: "Paid", plan: "Starter" },
];

const STATUS_COLORS: Record<string, string> = { Paid: "#22c55e", Pending: "#f59e0b", Failed: "#ef4444" };
const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return INVOICES;
    const q = search.toLowerCase();
    return INVOICES.filter((inv) => inv.number.toLowerCase().includes(q) || inv.date.includes(q) || inv.plan.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AuthGuard allowedRoles={["billing_admin", "tenant_admin"] as UserRole[]}>
    <div className="space-y-6">
      <button onClick={() => router.push("/settings/billing")}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        style={{ color: "var(--gf-text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Billing
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--gf-text-primary)" }}>Invoices</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--gf-text-secondary)" }}>View and download your billing history</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--gf-text-muted)" }} />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search invoices..."
          className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }} />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--gf-bg-elevated)" }}>
              {["Invoice", "Date", "Plan", "Amount", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gf-text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((inv) => {
              const sc = STATUS_COLORS[inv.status];
              return (
                <tr key={inv.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--gf-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{inv.number}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{inv.date}</td>
                  <td className="px-4 py-3" style={{ color: "var(--gf-text-secondary)" }}>{inv.plan}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--gf-text-primary)" }}>{inv.amount}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: sc }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sc }} />{inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => router.push(`/settings/billing/invoices/${inv.id}`)} title="View"
                        className="rounded-lg p-1.5 hover:bg-black/10 dark:hover:bg-white/10"
                        style={{ color: "var(--gf-text-secondary)" }}><Eye className="h-4 w-4" /></button>
                      <button title="Download PDF"
                        className="rounded-lg p-1.5 hover:bg-black/10 dark:hover:bg-white/10"
                        style={{ color: "var(--gf-text-secondary)" }}><Download className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "var(--gf-text-muted)" }}>No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--gf-text-muted)" }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              className="rounded-lg border px-2 py-1 disabled:opacity-40"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
              className="rounded-lg border px-2 py-1 disabled:opacity-40"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-secondary)" }}><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
