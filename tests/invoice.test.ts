import { describe, expect, it } from "vitest";
import { calculateTotals, currencyDecimals, formatMoney, parsePrice, type CalcInput } from "@/lib/invoice/calc";
import { counterScope, formatInvoiceNumber } from "@/lib/invoice/numbering";
import { DEFAULT_INVOICE_SETTINGS, invoiceInputSchema, invoiceSettingsSchema } from "@/lib/invoice/schema";
import { effectiveStatus } from "@/lib/invoice/view";

const base: CalcInput = {
  currency: "USD",
  items: [],
  discountType: "percent",
  discountValue: 0,
  taxEnabled: false,
  taxRate: 0,
  shipping: 0,
};

describe("invoice totals", () => {
  it("sums line items", () => {
    const r = calculateTotals({
      ...base,
      items: [
        { quantity: 1, unitPrice: 3200 },
        { quantity: 2, unitPrice: 310 },
      ],
    });
    expect(r.lineAmounts).toEqual([3200, 620]);
    expect(r.subtotal).toBe(3820);
    expect(r.total).toBe(3820);
  });

  it("applies percent discount, tax on the discounted amount, untaxed shipping", () => {
    const r = calculateTotals({
      ...base,
      items: [{ quantity: 1, unitPrice: 1000 }],
      discountValue: 10,
      taxEnabled: true,
      taxRate: 11,
      shipping: 50,
    });
    expect(r.discount).toBe(100);
    expect(r.taxable).toBe(900);
    expect(r.tax).toBe(99);
    expect(r.shipping).toBe(50);
    expect(r.total).toBe(1049);
  });

  it("ignores the tax rate when tax is switched off", () => {
    const r = calculateTotals({ ...base, items: [{ quantity: 1, unitPrice: 1000 }], taxEnabled: false, taxRate: 11 });
    expect(r.tax).toBe(0);
    expect(r.total).toBe(1000);
  });

  it("caps a fixed discount at the subtotal", () => {
    const r = calculateTotals({
      ...base,
      items: [{ quantity: 1, unitPrice: 80 }],
      discountType: "amount",
      discountValue: 120,
      shipping: 20,
    });
    expect(r.discount).toBe(80);
    expect(r.total).toBe(20);
  });

  it("rounds to cents half away from zero (no float drift)", () => {
    const r = calculateTotals({
      ...base,
      items: [
        { quantity: 3, unitPrice: 0.1 }, // 0.30000000000000004
        { quantity: 1, unitPrice: 1.005 },
      ],
    });
    expect(r.lineAmounts).toEqual([0.3, 1.01]);
    expect(r.subtotal).toBe(1.31);
    const tax = calculateTotals({ ...base, items: [{ quantity: 1, unitPrice: 19.99 }], taxEnabled: true, taxRate: 11 });
    expect(tax.tax).toBe(2.2); // 2.1989 -> 2.20
    expect(tax.total).toBe(22.19);
  });

  it("uses whole rupiah for IDR", () => {
    expect(currencyDecimals("IDR")).toBe(0);
    expect(currencyDecimals("usd")).toBe(2);
    const r = calculateTotals({
      ...base,
      currency: "IDR",
      items: [{ quantity: 3, unitPrice: 1_333_333 }],
      taxEnabled: true,
      taxRate: 11,
    });
    expect(r.subtotal).toBe(3_999_999);
    expect(r.tax).toBe(440_000); // 439 999.89 -> 440 000
    expect(r.total).toBe(4_439_999);
  });

  it("supports fractional quantities", () => {
    const r = calculateTotals({ ...base, items: [{ quantity: 2.5, unitPrice: 12.34 }] });
    expect(r.subtotal).toBe(30.85);
  });

  it("treats invalid numbers as zero", () => {
    const r = calculateTotals({ ...base, items: [{ quantity: Number.NaN, unitPrice: 10 }], shipping: -5 });
    expect(r.total).toBe(0);
  });

  it("formats money per currency and language", () => {
    expect(formatMoney(1234.5, "USD", "en")).toBe("$1,234.50");
    expect(formatMoney(12500000, "IDR", "id").replace(/\s/g, " ")).toBe("Rp 12.500.000");
  });
});

describe("price parsing from the catalogue", () => {
  it.each([
    ["Rp 12.500.000", 12500000],
    ["$1,250.50", 1250.5],
    ["€ 1.250,50", 1250.5],
    ["USD 450", 450],
    ["12,50", 12.5],
    ["1,250", 1250],
    ["Hubungi kami", null],
    [null, null],
  ])("%s -> %s", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });
});

describe("invoice numbering", () => {
  const def = DEFAULT_INVOICE_SETTINGS.numbering;

  it("defaults to INV-2026-0001", () => {
    expect(formatInvoiceNumber(def, 2026, 1)).toBe("INV-2026-0001");
    expect(formatInvoiceNumber(def, 2026, 123)).toBe("INV-2026-0123");
    expect(formatInvoiceNumber(def, 2026, 12345)).toBe("INV-2026-12345");
  });

  it("honours prefix, year and padding settings", () => {
    expect(formatInvoiceNumber({ ...def, prefix: "ILV", padding: 3 }, 2027, 7)).toBe("ILV-2027-007");
    expect(formatInvoiceNumber({ ...def, includeYear: false }, 2027, 7)).toBe("INV-0007");
    expect(formatInvoiceNumber({ ...def, prefix: "" }, 2027, 7)).toBe("2027-0007");
  });

  it("resets the sequence per year only when configured", () => {
    expect(counterScope(def, 2026)).toBe("INV:2026");
    expect(counterScope(def, 2027)).toBe("INV:2027");
    expect(counterScope({ ...def, resetYearly: false }, 2026)).toBe("INV");
    expect(counterScope({ ...def, resetYearly: false }, 2027)).toBe("INV");
  });
});

describe("invoice validation", () => {
  const valid = {
    status: "draft",
    language: "en",
    currency: "usd",
    customerName: "Anna",
    customerEmail: "anna@example.com",
    customerCountry: "de",
    customerTimezone: "Europe/Berlin",
    issueDate: "2026-11-17",
    dueDate: "2026-12-01",
    discountType: "percent",
    discountValue: 5,
    taxEnabled: false,
    taxLabel: "PPN",
    taxRate: 11,
    shipping: 0,
    paymentMethodIds: [],
    items: [{ name: "Bathtub", quantity: 1, unitPrice: 3200 }],
  };

  it("accepts and normalises a valid invoice", () => {
    const r = invoiceInputSchema.parse(valid);
    expect(r.currency).toBe("USD");
    expect(r.customerCountry).toBe("DE");
    expect(r.items[0].productId).toBeNull();
  });

  it("rejects bad input", () => {
    expect(invoiceInputSchema.safeParse({ ...valid, items: [] }).success).toBe(false);
    expect(invoiceInputSchema.safeParse({ ...valid, customerEmail: "nope" }).success).toBe(false);
    expect(invoiceInputSchema.safeParse({ ...valid, discountValue: 150 }).success).toBe(false);
    expect(invoiceInputSchema.safeParse({ ...valid, dueDate: "2026-11-01" }).success).toBe(false);
    expect(invoiceInputSchema.safeParse({ ...valid, customerTimezone: "Mars/Base" }).success).toBe(false);
    expect(invoiceInputSchema.safeParse({ ...valid, status: "lost" }).success).toBe(false);
  });

  it("ships valid default settings", () => {
    expect(invoiceSettingsSchema.safeParse(DEFAULT_INVOICE_SETTINGS).success).toBe(true);
    expect(
      invoiceSettingsSchema.safeParse({
        ...DEFAULT_INVOICE_SETTINGS,
        business: { ...DEFAULT_INVOICE_SETTINGS.business, logoUrl: "javascript:alert(1)" },
      }).success
    ).toBe(false);
  });

  it("shows sent invoices past due as overdue", () => {
    expect(effectiveStatus({ status: "sent", dueDate: "2026-11-01" }, "2026-11-17")).toBe("overdue");
    expect(effectiveStatus({ status: "sent", dueDate: "2026-11-17" }, "2026-11-17")).toBe("sent");
    expect(effectiveStatus({ status: "paid", dueDate: "2026-11-01" }, "2026-11-17")).toBe("paid");
  });
});
