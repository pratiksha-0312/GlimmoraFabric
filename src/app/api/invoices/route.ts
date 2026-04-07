import { NextResponse } from "next/server";

const invoices = [
  { id: "inv_001", number: "INV-2026-001", date: "2026-04-01", dueDate: "2026-04-15", plan: "Pro", amount: 99, currency: "USD", status: "Paid" },
  { id: "inv_002", number: "INV-2026-002", date: "2026-03-01", dueDate: "2026-03-15", plan: "Pro", amount: 99, currency: "USD", status: "Paid" },
  { id: "inv_003", number: "INV-2026-003", date: "2026-02-01", dueDate: "2026-02-15", plan: "Pro", amount: 99, currency: "USD", status: "Paid" },
  { id: "inv_004", number: "INV-2026-004", date: "2026-01-01", dueDate: "2026-01-15", plan: "Starter", amount: 29, currency: "USD", status: "Paid" },
  { id: "inv_005", number: "INV-2025-005", date: "2025-12-01", dueDate: "2025-12-15", plan: "Starter", amount: 29, currency: "USD", status: "Paid" },
  { id: "inv_006", number: "INV-2025-006", date: "2025-11-01", dueDate: "2025-11-15", plan: "Starter", amount: 29, currency: "USD", status: "Pending" },
  { id: "inv_007", number: "INV-2025-007", date: "2025-10-01", dueDate: "2025-10-15", plan: "Starter", amount: 29, currency: "USD", status: "Failed" },
  { id: "inv_008", number: "INV-2025-008", date: "2025-09-01", dueDate: "2025-09-15", plan: "Starter", amount: 29, currency: "USD", status: "Paid" },
];

// GET /api/invoices — list all invoices
export async function GET() {
  return NextResponse.json(invoices);
}
