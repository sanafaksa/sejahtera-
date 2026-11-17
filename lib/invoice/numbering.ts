/** Invoice numbers such as "INV-2026-0001". */

export interface NumberingSettings {
  prefix: string;
  includeYear: boolean;
  padding: number; // digits of the running number, 1-8
  resetYearly: boolean;
}

/** Counter scope: one sequence per prefix, and per year when it resets yearly. */
export function counterScope(n: NumberingSettings, year: number): string {
  const prefix = n.prefix.trim() || "INV";
  return n.resetYearly ? `${prefix}:${year}` : prefix;
}

export function formatInvoiceNumber(n: NumberingSettings, year: number, sequence: number): string {
  const parts = [n.prefix.trim()].filter(Boolean);
  if (n.includeYear) parts.push(String(year));
  parts.push(String(sequence).padStart(Math.min(8, Math.max(1, n.padding)), "0"));
  return parts.join("-");
}
