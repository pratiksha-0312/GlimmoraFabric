// Invoices API — /api/v1/invoices/*.

import { apiClient } from "./client";

export interface Invoice {
  id: string;
  tenant_id: string;
  subscription_id: string | null;
  payment_id: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  issued_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreditNote {
  id: string;
  tenant_id: string;
  invoice_id: string;
  credit_note_number: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  issued_at: string;
  created_at: string;
}

export interface GenerateInvoiceInput {
  subscription_id?: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
  due_date?: string;
  metadata?: Record<string, unknown>;
}

export interface ListInvoicesParams {
  status?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export const invoicesApi = {
  generate(input: GenerateInvoiceInput): Promise<Invoice> {
    return apiClient.post<Invoice>("/api/v1/invoices/generate", input);
  },

  list(params: ListInvoicesParams = {}): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>("/api/v1/invoices", { query: params });
  },

  get(invoiceId: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/api/v1/invoices/${invoiceId}`);
  },

  // PDF download — returns the raw Response so the caller can stream/save it.
  // Usage:
  //   const res = await invoicesApi.downloadPdf(id);
  //   const blob = await res.blob();
  //   saveAs(blob, `${invoiceNumber}.pdf`);
  downloadPdf(invoiceId: string): Promise<Response> {
    return apiClient.get<Response>(`/api/v1/invoices/${invoiceId}/pdf`, { raw: true });
  },

  cancel(invoiceId: string): Promise<Invoice> {
    return apiClient.post<Invoice>(`/api/v1/invoices/${invoiceId}/cancel`);
  },

  // ---- Credit notes --------------------------------------------------------

  createCreditNote(
    invoiceId: string,
    input: { reason?: string; amount?: number } = {},
  ): Promise<CreditNote> {
    return apiClient.post<CreditNote>(`/api/v1/invoices/${invoiceId}/credit-note`, input);
  },

  listCreditNotes(invoiceId: string): Promise<CreditNote[]> {
    return apiClient.get<CreditNote[]>(`/api/v1/invoices/${invoiceId}/credit-notes`);
  },
};
