/** Validation for invoice settings and invoice input (server and client). */
import { z } from "zod";
import { isValidTimeZone } from "@/lib/timezones";
import { INVOICE_STATUSES } from "@/lib/invoice/i18n";

const text = (max: number) => z.string().trim().max(max);
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));
/** Official logo shipped with the website, used on invoices by default. */
export const DEFAULT_INVOICE_LOGO = "/assets/ilavioo-logo-horizontal.png";

// An uploaded https URL, a file from the site's own /assets folder, or empty.
const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) => v === "" || /^https:\/\//.test(v) || /^\/assets\/(?!.*\.\.)[\w./-]+$/.test(v),
    "URL harus diawali https://"
  );
const currency = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Kode mata uang 3 huruf");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD");
const money = z.coerce.number().finite().min(0).max(1e13);

const labelOverrides = z.object({
  item: text(40).optional(),
  description: text(40).optional(),
  sku: text(40).optional(),
  qty: text(40).optional(),
  price: text(40).optional(),
  amount: text(40).optional(),
});

export const paymentMethodSchema = z.object({
  id: z.string().min(1).max(40),
  type: z.enum(["bank", "paypal", "other"]),
  label: text(80).min(1, "Nama metode pembayaran wajib diisi"),
  details: text(600),
});

export const invoiceSettingsSchema = z.object({
  business: z.object({
    name: text(120).min(1, "Nama usaha wajib diisi"),
    address: text(400),
    email: text(200),
    phone: text(60),
    website: text(200),
    taxId: text(60),
    logoUrl: imageUrl,
    signatureUrl: imageUrl,
    signatoryName: text(120),
  }),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format #RRGGBB"),
  layout: z.enum(["classic", "modern", "minimal"]),
  numbering: z.object({
    prefix: z.string().trim().max(12).regex(/^[A-Za-z0-9/_.]*$/, "Prefix hanya huruf, angka, / _ ."),
    includeYear: z.boolean(),
    padding: z.coerce.number().int().min(1).max(8),
    resetYearly: z.boolean(),
  }),
  columns: z.object({
    discount: z.boolean(),
    tax: z.boolean(),
    shipping: z.boolean(),
    sku: z.boolean(),
  }),
  labels: z.object({ en: labelOverrides, id: labelOverrides }),
  footerText: text(400),
  defaultTerms: text(1000),
  defaultNotes: text(1000),
  defaultCurrency: currency,
  defaultLanguage: z.enum(["en", "id"]),
  defaultTaxEnabled: z.boolean(),
  defaultTaxRate: z.coerce.number().min(0).max(100),
  taxLabel: text(40).min(1),
  dueDays: z.coerce.number().int().min(0).max(365),
  paymentMethods: z.array(paymentMethodSchema).max(10),
});

export type InvoiceSettings = z.infer<typeof invoiceSettingsSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  business: {
    name: "PT. Ilavioo Nusantara Sejahtera",
    address: "Boyolali\nJawa Tengah, Indonesia",
    email: "marketing@ilavioo.com",
    phone: "",
    website: "ilavioo.com",
    taxId: "",
    logoUrl: DEFAULT_INVOICE_LOGO,
    signatureUrl: "",
    signatoryName: "",
  },
  accentColor: "#A8602A",
  layout: "classic",
  numbering: { prefix: "INV", includeYear: true, padding: 4, resetYearly: true },
  columns: { discount: true, tax: true, shipping: true, sku: false },
  labels: { en: {}, id: {} },
  footerText: "Thank you for choosing handmade Boyolali copper.",
  defaultTerms: "Payment due within 14 days. Production starts after a 50% deposit.",
  defaultNotes: "",
  defaultCurrency: "USD",
  defaultLanguage: "en",
  defaultTaxEnabled: false,
  defaultTaxRate: 11,
  taxLabel: "PPN",
  dueDays: 14,
  paymentMethods: [],
};

export const invoiceItemInputSchema = z.object({
  productId: z.coerce.number().int().positive().nullish().transform((v) => v ?? null),
  sku: optional(64),
  name: text(255).min(1, "Nama barang wajib diisi"),
  description: optional(2000),
  quantity: z.coerce.number().finite().positive("Jumlah harus lebih dari 0").max(1e6),
  unitPrice: money,
});

export const invoiceInputSchema = z
  .object({
    status: z.enum(INVOICE_STATUSES),
    language: z.enum(["en", "id"]),
    currency,
    customerName: text(160).min(1, "Nama pelanggan wajib diisi"),
    customerCompany: optional(160),
    customerEmail: z
      .string()
      .trim()
      .max(200)
      .nullish()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email tidak valid"),
    customerPhone: optional(60),
    customerAddress: optional(1000),
    customerCountry: z
      .string()
      .trim()
      .toUpperCase()
      .nullish()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || /^[A-Z]{2}$/.test(v), "Kode negara 2 huruf"),
    customerTimezone: z
      .string()
      .trim()
      .nullish()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || isValidTimeZone(v), "Zona waktu tidak dikenal"),
    issueDate: isoDate,
    dueDate: isoDate.nullish().or(z.literal("")).transform((v) => (v ? v : null)),
    discountType: z.enum(["percent", "amount"]),
    discountValue: money,
    taxEnabled: z.boolean(),
    taxLabel: text(40).min(1),
    taxRate: z.coerce.number().min(0).max(100),
    shipping: money,
    notes: optional(2000),
    terms: optional(2000),
    paymentMethodIds: z.array(z.string().max(40)).max(10),
    items: z.array(invoiceItemInputSchema).min(1, "Tambahkan minimal satu barang").max(100),
  })
  .refine((v) => v.discountType !== "percent" || v.discountValue <= 100, {
    message: "Diskon persen maksimal 100",
    path: ["discountValue"],
  })
  .refine((v) => !v.dueDate || v.dueDate >= v.issueDate, {
    message: "Jatuh tempo tidak boleh sebelum tanggal terbit",
    path: ["dueDate"],
  });

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
