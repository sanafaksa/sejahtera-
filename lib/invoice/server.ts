import { randomBytes } from "node:crypto";
import { Prisma, type Invoice, type InvoiceItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { calculateTotals } from "@/lib/invoice/calc";
import { counterScope, formatInvoiceNumber, type NumberingSettings } from "@/lib/invoice/numbering";
import {
  DEFAULT_INVOICE_SETTINGS,
  invoiceSettingsSchema,
  type InvoiceInput,
  type InvoiceSettings,
} from "@/lib/invoice/schema";
import type { InvoiceLanguage, InvoiceStatus } from "@/lib/invoice/i18n";
import type { InvoiceView } from "@/lib/invoice/view";
import { ADMIN_TZ, addDays, dateKey } from "@/lib/timezones";

export function getInvoiceSettings(): Promise<InvoiceSettings> {
  return getSetting("invoice", invoiceSettingsSchema, DEFAULT_INVOICE_SETTINGS);
}

/** 192 random bits, URL-safe: the public link cannot be guessed. */
export function newPublicToken(): string {
  return randomBytes(24).toString("base64url");
}

export function todayIso(): string {
  return dateKey(new Date(), ADMIN_TZ);
}

/** Atomically take the next sequence number for a numbering scope. */
async function takeSequence(tx: Prisma.TransactionClient, scope: string): Promise<number> {
  const rows = await tx.$queryRaw<Array<{ last: number }>>`
    INSERT INTO "invoice_counters" ("scope", "last") VALUES (${scope}, 1)
    ON CONFLICT ("scope") DO UPDATE SET "last" = "invoice_counters"."last" + 1
    RETURNING "last"`;
  return Number(rows[0].last);
}

async function nextNumber(tx: Prisma.TransactionClient, numbering: NumberingSettings, year: number) {
  const scope = counterScope(numbering, year);
  // Skip numbers that already exist (e.g. after the format was changed).
  for (let i = 0; i < 1000; i++) {
    const number = formatInvoiceNumber(numbering, year, await takeSequence(tx, scope));
    const taken = await tx.invoice.findUnique({ where: { number }, select: { id: true } });
    if (!taken) return number;
  }
  throw new Error("Could not allocate an invoice number");
}

function dateOnly(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function invoiceData(input: InvoiceInput) {
  const totals = calculateTotals(input);
  return {
    data: {
      status: input.status,
      language: input.language,
      currency: input.currency,
      customerName: input.customerName,
      customerCompany: input.customerCompany,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      customerCountry: input.customerCountry,
      customerTimezone: input.customerTimezone,
      issueDate: dateOnly(input.issueDate),
      dueDate: input.dueDate ? dateOnly(input.dueDate) : null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      taxEnabled: input.taxEnabled,
      taxLabel: input.taxLabel,
      taxRate: input.taxRate,
      shipping: input.shipping,
      subtotal: totals.subtotal,
      discountTotal: totals.discount,
      taxTotal: totals.tax,
      total: totals.total,
      notes: input.notes,
      terms: input.terms,
      paymentMethodIds: input.paymentMethodIds,
    },
    items: input.items.map((it, position) => ({
      position,
      productId: it.productId,
      sku: it.sku,
      name: it.name,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      amount: totals.lineAmounts[position],
    })),
  };
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  const settings = await getInvoiceSettings();
  const { data, items } = invoiceData(input);
  const year = Number(input.issueDate.slice(0, 4));
  return prisma.$transaction(async (tx) => {
    const number = await nextNumber(tx, settings.numbering, year);
    return tx.invoice.create({
      data: { ...data, number, publicToken: newPublicToken(), items: { create: items } },
    });
  });
}

export async function updateInvoice(id: number, input: InvoiceInput): Promise<Invoice> {
  const { data, items } = invoiceData(input);
  return prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    return tx.invoice.update({ where: { id }, data: { ...data, items: { create: items } } });
  });
}

export async function duplicateInvoice(id: number): Promise<Invoice | null> {
  const source = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!source) return null;
  const settings = await getInvoiceSettings();
  const issue = todayIso();
  const view = toView(source);
  return createInvoice({
    ...view,
    status: "draft",
    issueDate: issue,
    dueDate: settings.dueDays ? addDays(issue, settings.dueDays) : null,
  });
}

function num(v: Prisma.Decimal | number): number {
  return typeof v === "number" ? v : v.toNumber();
}

export function toView(inv: Invoice & { items: InvoiceItem[] }): InvoiceView {
  return {
    id: inv.id,
    number: inv.number,
    publicToken: inv.publicToken,
    status: inv.status as InvoiceStatus,
    language: (inv.language === "id" ? "id" : "en") as InvoiceLanguage,
    currency: inv.currency,
    customerName: inv.customerName,
    customerCompany: inv.customerCompany,
    customerEmail: inv.customerEmail,
    customerPhone: inv.customerPhone,
    customerAddress: inv.customerAddress,
    customerCountry: inv.customerCountry,
    customerTimezone: inv.customerTimezone,
    issueDate: inv.issueDate.toISOString().slice(0, 10),
    dueDate: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : null,
    discountType: inv.discountType === "amount" ? "amount" : "percent",
    discountValue: num(inv.discountValue),
    taxEnabled: inv.taxEnabled,
    taxLabel: inv.taxLabel,
    taxRate: num(inv.taxRate),
    shipping: num(inv.shipping),
    notes: inv.notes,
    terms: inv.terms,
    paymentMethodIds: inv.paymentMethodIds,
    items: [...inv.items]
      .sort((a, b) => a.position - b.position)
      .map((it) => ({
        productId: it.productId,
        sku: it.sku,
        name: it.name,
        description: it.description,
        quantity: num(it.quantity),
        unitPrice: num(it.unitPrice),
      })),
    createdAt: inv.createdAt.toISOString(),
  };
}

/** A blank invoice pre-filled from the settings. */
export function blankInvoice(settings: InvoiceSettings): InvoiceView {
  const issue = todayIso();
  return {
    number: "",
    status: "draft",
    language: settings.defaultLanguage,
    currency: settings.defaultCurrency,
    customerName: "",
    customerCompany: null,
    customerEmail: null,
    customerPhone: null,
    customerAddress: null,
    customerCountry: null,
    customerTimezone: null,
    issueDate: issue,
    dueDate: settings.dueDays ? addDays(issue, settings.dueDays) : null,
    discountType: "percent",
    discountValue: 0,
    taxEnabled: settings.columns.tax && settings.defaultTaxEnabled,
    taxLabel: settings.taxLabel,
    taxRate: settings.defaultTaxRate,
    shipping: 0,
    notes: settings.defaultNotes || null,
    terms: settings.defaultTerms || null,
    paymentMethodIds: settings.paymentMethods.map((m) => m.id),
    items: [{ productId: null, sku: null, name: "", description: null, quantity: 1, unitPrice: 0 }],
  };
}

/** Preview of the next number (not reserved). */
export async function peekNextNumber(settings: InvoiceSettings, year: number): Promise<string> {
  const scope = counterScope(settings.numbering, year);
  let last = 0;
  try {
    last = (await prisma.invoiceCounter.findUnique({ where: { scope } }))?.last ?? 0;
  } catch (error) {
    // Only a preview; the real number is allocated when the invoice is saved.
    console.warn("Could not read the invoice counter:", error);
  }
  return formatInvoiceNumber(settings.numbering, year, last + 1);
}
