export type InvoiceLanguage = "en" | "id";

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Status names in the (Indonesian) admin. */
export const STATUS_LABELS_ADMIN: Record<InvoiceStatus, string> = {
  draft: "Draf",
  sent: "Terkirim",
  paid: "Lunas",
  overdue: "Jatuh tempo",
  cancelled: "Batal",
};

/** Texts printed on the invoice itself. */
export const INVOICE_TEXT = {
  en: {
    invoice: "Invoice",
    number: "Invoice no.",
    issueDate: "Issue date",
    dueDate: "Due date",
    billTo: "Bill to",
    from: "From",
    item: "Item",
    description: "Description",
    sku: "SKU",
    qty: "Qty",
    price: "Unit price",
    amount: "Amount",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping",
    total: "Total",
    notes: "Notes",
    terms: "Payment terms",
    payment: "Payment methods",
    taxId: "Tax ID",
    status: "Status",
    buyerTime: "Your local time when issued",
    signature: "Authorised signature",
    download: "Download PDF",
    statuses: { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled" },
  },
  id: {
    invoice: "Faktur",
    number: "No. faktur",
    issueDate: "Tanggal terbit",
    dueDate: "Jatuh tempo",
    billTo: "Tagihan kepada",
    from: "Dari",
    item: "Barang",
    description: "Deskripsi",
    sku: "SKU",
    qty: "Jml",
    price: "Harga satuan",
    amount: "Jumlah",
    subtotal: "Subtotal",
    discount: "Diskon",
    shipping: "Ongkos kirim",
    total: "Total",
    notes: "Catatan",
    terms: "Syarat pembayaran",
    payment: "Metode pembayaran",
    taxId: "NPWP",
    status: "Status",
    buyerTime: "Waktu setempat Anda saat diterbitkan",
    signature: "Tanda tangan",
    download: "Unduh PDF",
    statuses: { draft: "Draf", sent: "Terkirim", paid: "Lunas", overdue: "Jatuh tempo", cancelled: "Batal" },
  },
} as const;

export type ColumnLabelKey = "item" | "description" | "sku" | "qty" | "price" | "amount";
export const COLUMN_LABEL_KEYS: ColumnLabelKey[] = ["item", "description", "sku", "qty", "price", "amount"];

export function formatInvoiceDate(isoDate: string | null, language: InvoiceLanguage): string {
  if (!isoDate) return "–";
  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}
