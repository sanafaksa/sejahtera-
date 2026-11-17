/**
 * Invoice arithmetic. All rounding happens in integer minor units of the
 * invoice currency (cents for USD, whole rupiah for IDR), half away from zero.
 *
 * total = (subtotal - discount) + tax + shipping
 * tax   = (subtotal - discount) x rate          (shipping is not taxed)
 */

/** Currencies that have no minor unit in practice. */
const ZERO_DECIMAL = new Set(["IDR", "JPY", "KRW", "VND", "CLP", "ISK", "HUF", "TWD", "UGX", "XAF", "XOF", "PYG"]);

export const CURRENCIES = [
  "USD", "EUR", "GBP", "AUD", "SGD", "MYR", "JPY", "IDR", "CAD", "CHF", "NZD", "AED", "SAR", "HKD", "CNY", "KRW", "THB",
] as const;

export function currencyDecimals(currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2;
}

function toMinor(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  const scaled = value * factor;
  // Nudge by a relative epsilon so 1.005 -> 101 cents instead of 100.
  return Math.sign(scaled) * Math.round(Math.abs(scaled) * (1 + Number.EPSILON) + 1e-9);
}

function fromMinor(minor: number, decimals: number): number {
  return minor / 10 ** decimals;
}

export interface CalcItem {
  quantity: number;
  unitPrice: number;
}

export interface CalcInput {
  currency: string;
  items: CalcItem[];
  discountType: "percent" | "amount";
  discountValue: number;
  taxEnabled: boolean;
  taxRate: number; // percent, e.g. 11
  shipping: number;
}

export interface CalcResult {
  lineAmounts: number[];
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  shipping: number;
  total: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const finite = (v: number) => (Number.isFinite(v) ? v : 0);

export function calculateTotals(input: CalcInput): CalcResult {
  const d = currencyDecimals(input.currency);

  const lineMinor = input.items.map((it) =>
    toMinor(finite(it.quantity) * finite(it.unitPrice), d)
  );
  const subtotalMinor = lineMinor.reduce((a, b) => a + b, 0);

  let discountMinor =
    input.discountType === "percent"
      ? toMinor((fromMinor(subtotalMinor, d) * clamp(finite(input.discountValue), 0, 100)) / 100, d)
      : toMinor(Math.max(0, finite(input.discountValue)), d);
  // Never discount more than the subtotal (and never below zero).
  discountMinor = clamp(discountMinor, 0, Math.max(0, subtotalMinor));

  const taxableMinor = subtotalMinor - discountMinor;
  const taxMinor = input.taxEnabled
    ? toMinor((fromMinor(taxableMinor, d) * clamp(finite(input.taxRate), 0, 100)) / 100, d)
    : 0;
  const shippingMinor = toMinor(Math.max(0, finite(input.shipping)), d);
  const totalMinor = taxableMinor + taxMinor + shippingMinor;

  return {
    lineAmounts: lineMinor.map((m) => fromMinor(m, d)),
    subtotal: fromMinor(subtotalMinor, d),
    discount: fromMinor(discountMinor, d),
    taxable: fromMinor(taxableMinor, d),
    tax: fromMinor(taxMinor, d),
    shipping: fromMinor(shippingMinor, d),
    total: fromMinor(totalMinor, d),
  };
}

export function formatMoney(value: number, currency: string, language: "en" | "id"): string {
  const d = currencyDecimals(currency);
  try {
    return new Intl.NumberFormat(language === "id" ? "id-ID" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(d)}`;
  }
}

/** Parse a free-form price such as "Rp 12.500.000" or "$1,250.50"; null if none. */
export function parsePrice(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized: string;
  if (lastComma > -1 && lastDot > -1) {
    // Whichever comes last is the decimal separator.
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (lastComma > -1) {
    // "12,50" -> decimal; "12,500" or "1,250,000" -> thousands
    normalized = /,\d{3}$/.test(cleaned) ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".");
  } else if ((cleaned.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  } else {
    normalized = cleaned;
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}
