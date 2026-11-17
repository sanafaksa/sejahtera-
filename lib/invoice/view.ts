/** Plain, serialisable invoice shape shared by the form, preview and public page. */
import type { InvoiceLanguage, InvoiceStatus } from "@/lib/invoice/i18n";

export interface InvoiceItemView {
  productId: number | null;
  sku: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceView {
  id?: number;
  number: string;
  publicToken?: string;
  status: InvoiceStatus;
  language: InvoiceLanguage;
  currency: string;
  customerName: string;
  customerCompany: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  customerCountry: string | null;
  customerTimezone: string | null;
  issueDate: string; // YYYY-MM-DD
  dueDate: string | null;
  discountType: "percent" | "amount";
  discountValue: number;
  taxEnabled: boolean;
  taxLabel: string;
  taxRate: number;
  shipping: number;
  notes: string | null;
  terms: string | null;
  paymentMethodIds: string[];
  items: InvoiceItemView[];
  createdAt?: string; // ISO
}

/** Status to show: a sent invoice past its due date counts as overdue. */
export function effectiveStatus(
  inv: Pick<InvoiceView, "status" | "dueDate">,
  todayIso: string
): InvoiceStatus {
  if (inv.status === "sent" && inv.dueDate && inv.dueDate < todayIso) return "overdue";
  return inv.status;
}
