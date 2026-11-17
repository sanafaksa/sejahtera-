import Image from "next/image";
import { calculateTotals, formatMoney } from "@/lib/invoice/calc";
import { INVOICE_TEXT, formatInvoiceDate, type ColumnLabelKey } from "@/lib/invoice/i18n";
import type { InvoiceSettings } from "@/lib/invoice/schema";
import type { InvoiceView } from "@/lib/invoice/view";
import { formatDateTime, isValidTimeZone } from "@/lib/timezones";

function countryName(code: string | null, language: "en" | "id") {
  if (!code) return null;
  try {
    return new Intl.DisplayNames([language === "id" ? "id" : "en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function MultiLine({ text, className = "" }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  return <p className={`whitespace-pre-line ${className}`}>{text}</p>;
}

/**
 * The invoice sheet. Pure presentational, so the live preview, the public
 * link and the printed PDF are always identical.
 */
export default function InvoiceDocument({
  invoice,
  settings,
  showBuyerTime = false,
  status,
}: {
  invoice: InvoiceView;
  settings: InvoiceSettings;
  showBuyerTime?: boolean;
  /** Status to print (e.g. "overdue"); hidden for drafts. */
  status?: InvoiceView["status"];
}) {
  const lang = invoice.language;
  const t = INVOICE_TEXT[lang];
  const label = (k: ColumnLabelKey) => settings.labels[lang]?.[k] || t[k];
  const money = (v: number) => formatMoney(v, invoice.currency, lang);
  const accent = settings.accentColor;
  const layout = settings.layout;
  const cols = settings.columns;

  const totals = calculateTotals(invoice);
  const methods = settings.paymentMethods.filter((m) => invoice.paymentMethodIds.includes(m.id));
  const b = settings.business;
  const buyerTz = invoice.customerTimezone;
  const issuedAt = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  const showDiscount = cols.discount && totals.discount > 0;
  const showTax = cols.tax && invoice.taxEnabled;
  const showShipping = cols.shipping && totals.shipping > 0;

  const isModern = layout === "modern";
  const isMinimal = layout === "minimal";

  const businessBlock = (
    <div className={`text-[12px] leading-relaxed ${isModern ? "text-white/90" : "text-gray-600"}`}>
      <p className={`text-[15px] font-semibold ${isModern ? "text-white" : "text-gray-900"}`}>{b.name}</p>
      <MultiLine text={b.address} />
      {[b.email, b.phone, b.website].filter(Boolean).map((v) => (
        <p key={v}>{v}</p>
      ))}
      {b.taxId && (
        <p>
          {t.taxId}: {b.taxId}
        </p>
      )}
    </div>
  );

  const logo = b.logoUrl ? (
    <Image
      src={b.logoUrl}
      alt={b.name}
      width={240}
      height={96}
      unoptimized
      className="h-14 w-auto max-w-[200px] object-contain"
    />
  ) : null;

  const statusBadge =
    status && status !== "draft" ? (
      <span
        className="inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ borderColor: accent, color: isModern ? "#fff" : accent }}
      >
        {t.statuses[status]}
      </span>
    ) : null;

  return (
    <article
      className="invoice-sheet bg-white text-gray-900 w-full max-w-[820px] mx-auto shadow-sm print:shadow-none text-[13px] overflow-hidden"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Header */}
      {isModern ? (
        <header className="px-8 sm:px-10 py-8" style={{ background: accent }}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              {logo && <div className="bg-white rounded-lg p-2 inline-block">{logo}</div>}
              {businessBlock}
            </div>
            <div className="text-right text-white space-y-1">
              <h1 className="text-3xl font-bold uppercase tracking-wide">{t.invoice}</h1>
              <p className="text-white/90">{invoice.number || "—"}</p>
              {statusBadge}
            </div>
          </div>
        </header>
      ) : (
        <header className={`px-8 sm:px-10 pt-10 ${isMinimal ? "pb-6" : "pb-8"}`}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              {logo}
              {businessBlock}
            </div>
            <div className="text-right space-y-1">
              <h1
                className={
                  isMinimal
                    ? "text-xl font-medium uppercase tracking-[0.3em] text-gray-900"
                    : "text-3xl font-bold uppercase tracking-wide"
                }
                style={isMinimal ? undefined : { color: accent }}
              >
                {t.invoice}
              </h1>
              <p className="text-gray-600">{invoice.number || "—"}</p>
              {statusBadge}
            </div>
          </div>
          {!isMinimal && <div className="mt-8 h-1 rounded-full" style={{ background: accent }} />}
          {isMinimal && <div className="mt-6 h-px" style={{ background: accent }} />}
        </header>
      )}

      <div className={`px-8 sm:px-10 ${isModern ? "pt-8" : ""} pb-10 space-y-8`}>
        {/* Parties & dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{t.billTo}</p>
            <p className="font-semibold text-gray-900">{invoice.customerName || "—"}</p>
            {invoice.customerCompany && <p className="text-gray-700">{invoice.customerCompany}</p>}
            <MultiLine text={invoice.customerAddress} className="text-gray-600" />
            {invoice.customerCountry && <p className="text-gray-600">{countryName(invoice.customerCountry, lang)}</p>}
            {[invoice.customerEmail, invoice.customerPhone].filter(Boolean).map((v) => (
              <p key={v} className="text-gray-600">
                {v}
              </p>
            ))}
          </div>
          <dl className="sm:text-right space-y-1.5">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{t.number}</dt>
              <dd className="font-medium">{invoice.number || "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{t.issueDate}</dt>
              <dd>{formatInvoiceDate(invoice.issueDate, lang)}</dd>
            </div>
            {invoice.dueDate && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{t.dueDate}</dt>
                <dd>{formatInvoiceDate(invoice.dueDate, lang)}</dd>
              </div>
            )}
            {showBuyerTime && buyerTz && isValidTimeZone(buyerTz) && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{t.buyerTime}</dt>
                <dd>
                  {formatDateTime(issuedAt, buyerTz)} ({buyerTz.split("/").pop()?.replace(/_/g, " ")})
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Items */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={isMinimal ? "border-b border-gray-300" : ""}
              style={
                layout === "classic"
                  ? { background: accent, color: "#fff" }
                  : isModern
                    ? { background: `${accent}1A`, color: "#111827" }
                    : undefined
              }
            >
              <th className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider">{label("item")}</th>
              {cols.sku && <th className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider">{label("sku")}</th>}
              <th className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-right whitespace-nowrap">{label("qty")}</th>
              <th className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-right whitespace-nowrap">{label("price")}</th>
              <th className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-right whitespace-nowrap">{label("amount")}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i} className="border-b border-gray-100 align-top">
                <td className="py-3 px-3">
                  <p className="font-medium text-gray-900">{it.name || "—"}</p>
                  {it.description && (
                    <p className="text-[12px] text-gray-500 whitespace-pre-line mt-0.5">{it.description}</p>
                  )}
                </td>
                {cols.sku && <td className="py-3 px-3 text-gray-600">{it.sku || "–"}</td>}
                <td className="py-3 px-3 text-right tabular-nums">{it.quantity.toLocaleString(lang === "id" ? "id-ID" : "en-US")}</td>
                <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap">{money(it.unitPrice)}</td>
                <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap">{money(totals.lineAmounts[i] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <dl className="w-full sm:w-72 space-y-1.5">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">{t.subtotal}</dt>
              <dd className="tabular-nums">{money(totals.subtotal)}</dd>
            </div>
            {showDiscount && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">
                  {t.discount}
                  {invoice.discountType === "percent" ? ` (${invoice.discountValue}%)` : ""}
                </dt>
                <dd className="tabular-nums">−{money(totals.discount)}</dd>
              </div>
            )}
            {showTax && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">
                  {invoice.taxLabel} ({invoice.taxRate}%)
                </dt>
                <dd className="tabular-nums">{money(totals.tax)}</dd>
              </div>
            )}
            {showShipping && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">{t.shipping}</dt>
                <dd className="tabular-nums">{money(totals.shipping)}</dd>
              </div>
            )}
            <div
              className={`flex justify-between gap-4 pt-2 mt-2 text-[15px] font-bold ${
                isModern ? "rounded-md px-3 py-2 text-white" : "border-t-2"
              }`}
              style={isModern ? { background: accent } : { borderColor: accent }}
            >
              <dt>
                {t.total} ({invoice.currency})
              </dt>
              <dd className="tabular-nums">{money(totals.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Payment, notes, terms */}
        {(methods.length > 0 || invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[12px]">
            {methods.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{t.payment}</p>
                <div className="space-y-2">
                  {methods.map((m) => (
                    <div key={m.id}>
                      <p className="font-semibold text-gray-900">{m.label}</p>
                      <MultiLine text={m.details} className="text-gray-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              {invoice.terms && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{t.terms}</p>
                  <MultiLine text={invoice.terms} className="text-gray-600" />
                </div>
              )}
              {invoice.notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{t.notes}</p>
                  <MultiLine text={invoice.notes} className="text-gray-600" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signature */}
        {(b.signatureUrl || b.signatoryName) && (
          <div className="flex justify-end">
            <div className="text-center w-52">
              {b.signatureUrl && (
                <Image
                  src={b.signatureUrl}
                  alt={t.signature}
                  width={200}
                  height={100}
                  unoptimized
                  className="h-20 w-auto mx-auto object-contain"
                />
              )}
              <div className="border-t border-gray-300 mt-1 pt-1.5 text-[12px]">
                <p className="font-medium text-gray-900">{b.signatoryName || b.name}</p>
                <p className="text-gray-500">{t.signature}</p>
              </div>
            </div>
          </div>
        )}

        {settings.footerText && (
          <p className="text-center text-[12px] text-gray-500 pt-4 border-t border-gray-100">{settings.footerText}</p>
        )}
      </div>
    </article>
  );
}
