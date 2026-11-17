"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  FileDown,
  Mail,
  MessageCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";
import { CURRENCIES, calculateTotals, formatMoney } from "@/lib/invoice/calc";
import { INVOICE_STATUSES, STATUS_LABELS_ADMIN } from "@/lib/invoice/i18n";
import type { InvoiceSettings } from "@/lib/invoice/schema";
import type { InvoiceItemView, InvoiceView } from "@/lib/invoice/view";
import { COUNTRY_CODES, COUNTRY_TIMEZONES, Field, Section, Toggle, countryLabel, inputCls } from "./fields";

export interface CatalogProduct {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  priceText: string | null;
}

const emptyItem = (): InvoiceItemView => ({
  productId: null,
  sku: null,
  name: "",
  description: null,
  quantity: 1,
  unitPrice: 0,
});

const n = (v: string) => (v === "" ? 0 : Number(v));

export default function InvoiceForm({
  initial,
  settings,
  products,
  nextNumber,
  showBuyerTime,
}: {
  initial: InvoiceView;
  settings: InvoiceSettings;
  products: CatalogProduct[];
  /** Number the invoice will get on first save (preview only). */
  nextNumber: string;
  showBuyerTime: boolean;
}) {
  const router = useRouter();
  const [inv, setInv] = useState<InvoiceView>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const isNew = !inv.id;
  const cols = settings.columns;

  const zones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [] as string[];
    }
  }, []);

  const totals = calculateTotals(inv);
  const money = (v: number) => formatMoney(v, inv.currency, inv.language);
  const publicUrl = inv.publicToken && origin ? `${origin}/invoice/${inv.publicToken}` : null;

  function set<K extends keyof InvoiceView>(key: K, value: InvoiceView[K]) {
    setInv((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setItem(index: number, patch: Partial<InvoiceItemView>) {
    set(
      "items",
      inv.items.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function pickProduct(index: number, productId: string) {
    if (!productId) {
      setItem(index, { productId: null });
      return;
    }
    const p = products.find((x) => String(x.id) === productId);
    if (!p) return;
    setItem(index, {
      productId: p.id,
      name: p.name,
      description: p.description ? p.description.slice(0, 300) : null,
      ...(p.price !== null ? { unitPrice: p.price } : {}),
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...inv };
      const res = await fetch(isNew ? "/api/admin/invoices" : `/api/admin/invoices/${inv.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan invoice");
      setSaved(true);
      if (isNew) router.push(`/ilv-studio/invoice/${data.id}`);
      else router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan invoice");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const shareText = publicUrl
    ? inv.language === "id"
      ? `Halo ${inv.customerName}, berikut faktur ${inv.number} sebesar ${money(totals.total)}: ${publicUrl}`
      : `Hello ${inv.customerName}, here is invoice ${inv.number} for ${money(totals.total)}: ${publicUrl}`
    : "";
  const waNumber = (inv.customerPhone ?? "").replace(/[^\d]/g, "");

  const preview = (
    <InvoiceDocument
      invoice={{ ...inv, number: inv.number || nextNumber }}
      settings={settings}
      showBuyerTime={showBuyerTime}
      status={inv.status}
    />
  );

  return (
    <div className="max-w-[1600px] space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Link href="/ilv-studio/invoice" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-1">
            <ArrowLeft className="w-4 h-4" /> Semua invoice
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? "Invoice baru" : inv.number}
          </h1>
          {isNew && <p className="text-gray-600 text-sm">Nomor saat disimpan: {nextNumber}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={inv.status}
            onChange={(e) => set("status", e.target.value as InvoiceView["status"])}
            aria-label="Status"
            className={`${inputCls} w-auto`}
          >
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS_ADMIN[s]}
              </option>
            ))}
          </select>
          {publicUrl && (
            <>
              <button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Tersalin" : "Salin link"}
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a
                href={`mailto:${inv.customerEmail ?? ""}?subject=${encodeURIComponent(`Invoice ${inv.number}`)}&body=${encodeURIComponent(shareText)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Mail className="w-4 h-4" /> Email
              </a>
              <a
                href={`/invoice/${inv.publicToken}?print=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileDown className="w-4 h-4" /> PDF
              </a>
              <a
                href={`/invoice/${inv.publicToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" /> Buka
              </a>
            </>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#A8602A] hover:bg-[#8f4f21] text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan…" : saved ? "Tersimpan" : "Simpan"}
          </button>
        </div>
      </div>
      {isNew && (
        <p className="text-sm text-gray-500 -mt-3">Link publik, PDF dan tombol kirim muncul setelah invoice disimpan.</p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        {/* Form */}
        <div className="space-y-6 min-w-0">
          <Section title="Pelanggan">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nama *">
                <input className={inputCls} value={inv.customerName} maxLength={160} onChange={(e) => set("customerName", e.target.value)} />
              </Field>
              <Field label="Perusahaan">
                <input className={inputCls} value={inv.customerCompany ?? ""} maxLength={160} onChange={(e) => set("customerCompany", e.target.value || null)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={inv.customerEmail ?? ""} maxLength={200} onChange={(e) => set("customerEmail", e.target.value || null)} />
              </Field>
              <Field label="Telepon / WhatsApp" hint="Dengan kode negara, mis. +49 151 …">
                <input className={inputCls} value={inv.customerPhone ?? ""} maxLength={60} onChange={(e) => set("customerPhone", e.target.value || null)} />
              </Field>
              <Field label="Alamat" className="sm:col-span-2">
                <textarea rows={3} className={inputCls} value={inv.customerAddress ?? ""} maxLength={1000} onChange={(e) => set("customerAddress", e.target.value || null)} />
              </Field>
              <Field label="Negara" hint={inv.customerCountry ? countryLabel(inv.customerCountry) : "Kode 2 huruf, mis. DE"}>
                <input
                  list="country-codes"
                  className={`${inputCls} uppercase`}
                  value={inv.customerCountry ?? ""}
                  maxLength={2}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setInv((prev) => ({
                      ...prev,
                      customerCountry: code || null,
                      customerTimezone: prev.customerTimezone || COUNTRY_TIMEZONES[code] || null,
                    }));
                    setSaved(false);
                  }}
                />
                <datalist id="country-codes">
                  {COUNTRY_CODES.map((c) => (
                    <option key={c} value={c}>
                      {countryLabel(c)}
                    </option>
                  ))}
                </datalist>
              </Field>
              <Field label="Zona waktu pembeli" hint={showBuyerTime ? "Dicetak di invoice" : "Tidak dicetak (lihat Jam Wilayah > Pengaturan)"}>
                <input list="tz-options" className={inputCls} value={inv.customerTimezone ?? ""} onChange={(e) => set("customerTimezone", e.target.value || null)} placeholder="mis. Europe/Berlin" />
                <datalist id="tz-options">
                  {zones.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </Field>
            </div>
          </Section>

          <Section title="Detail invoice">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Bahasa invoice">
                <select className={inputCls} value={inv.language} onChange={(e) => set("language", e.target.value === "id" ? "id" : "en")}>
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                </select>
              </Field>
              <Field label="Mata uang">
                <select className={inputCls} value={inv.currency} onChange={(e) => set("currency", e.target.value)}>
                  {(CURRENCIES as readonly string[]).includes(inv.currency) ? null : <option value={inv.currency}>{inv.currency}</option>}
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tanggal terbit">
                <input type="date" className={inputCls} value={inv.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
              </Field>
              <Field label="Jatuh tempo">
                <input type="date" className={inputCls} value={inv.dueDate ?? ""} min={inv.issueDate} onChange={(e) => set("dueDate", e.target.value || null)} />
              </Field>
            </div>
          </Section>

          <Section
            title="Barang"
            action={
              <button
                type="button"
                onClick={() => set("items", [...inv.items, emptyItem()])}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#A8602A] text-[#A8602A] px-3 py-1.5 text-sm font-medium hover:bg-amber-50"
              >
                <Plus className="w-4 h-4" /> Tambah barang
              </button>
            }
          >
            <ol className="space-y-4">
              {inv.items.map((it, i) => (
                <li key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-2 text-xs font-semibold text-gray-400 w-5">{i + 1}.</span>
                    <div className="flex-1 grid sm:grid-cols-2 gap-3 min-w-0">
                      <Field label="Dari katalog">
                        <select className={inputCls} value={it.productId ?? ""} onChange={(e) => pickProduct(i, e.target.value)}>
                          <option value="">Isi manual</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                              {p.priceText ? ` — ${p.priceText}` : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Nama barang *">
                        <input className={inputCls} value={it.name} maxLength={255} onChange={(e) => setItem(i, { name: e.target.value })} />
                      </Field>
                      <Field label="Deskripsi" className="sm:col-span-2">
                        <textarea rows={2} className={inputCls} value={it.description ?? ""} maxLength={2000} onChange={(e) => setItem(i, { description: e.target.value || null })} />
                      </Field>
                      <div className={`sm:col-span-2 grid gap-3 ${cols.sku ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                        {cols.sku && (
                          <Field label="SKU">
                            <input className={inputCls} value={it.sku ?? ""} maxLength={64} onChange={(e) => setItem(i, { sku: e.target.value || null })} />
                          </Field>
                        )}
                        <Field label="Qty">
                          <input type="number" min={0} step="any" inputMode="decimal" className={inputCls} value={it.quantity} onChange={(e) => setItem(i, { quantity: n(e.target.value) })} />
                        </Field>
                        <Field label={`Harga (${inv.currency})`}>
                          <input type="number" min={0} step="any" inputMode="decimal" className={inputCls} value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: n(e.target.value) })} />
                        </Field>
                        <Field label="Jumlah">
                          <p className="py-2 text-sm font-medium text-gray-900 tabular-nums truncate">{money(totals.lineAmounts[i] ?? 0)}</p>
                        </Field>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => set("items", inv.items.filter((_, j) => j !== i))}
                      disabled={inv.items.length === 1}
                      aria-label={`Hapus barang ${i + 1}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Diskon, pajak & ongkir">
            <div className="grid sm:grid-cols-2 gap-4">
              {cols.discount && (
                <Field label="Diskon">
                  <div className="flex gap-2">
                    <select className={`${inputCls} w-28`} value={inv.discountType} onChange={(e) => set("discountType", e.target.value === "amount" ? "amount" : "percent")}>
                      <option value="percent">%</option>
                      <option value="amount">{inv.currency}</option>
                    </select>
                    <input type="number" min={0} max={inv.discountType === "percent" ? 100 : undefined} step="any" className={inputCls} value={inv.discountValue} onChange={(e) => set("discountValue", n(e.target.value))} />
                  </div>
                </Field>
              )}
              {cols.shipping && (
                <Field label={`Ongkos kirim (${inv.currency})`}>
                  <input type="number" min={0} step="any" className={inputCls} value={inv.shipping} onChange={(e) => set("shipping", n(e.target.value))} />
                </Field>
              )}
              {cols.tax && (
                <div className="sm:col-span-2 grid sm:grid-cols-[auto_1fr_8rem] items-end gap-3">
                  <div className="pb-2">
                    <Toggle checked={inv.taxEnabled} onChange={(v) => set("taxEnabled", v)} label="Kenakan pajak" />
                  </div>
                  <Field label="Nama pajak">
                    <input className={inputCls} value={inv.taxLabel} maxLength={40} disabled={!inv.taxEnabled} onChange={(e) => set("taxLabel", e.target.value)} />
                  </Field>
                  <Field label="Tarif (%)">
                    <input type="number" min={0} max={100} step="any" className={inputCls} value={inv.taxRate} disabled={!inv.taxEnabled} onChange={(e) => set("taxRate", n(e.target.value))} />
                  </Field>
                </div>
              )}
            </div>
            <dl className="mt-5 border-t border-gray-100 pt-4 space-y-1 text-sm text-gray-900">
              <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd className="tabular-nums">{money(totals.subtotal)}</dd></div>
              {cols.discount && <div className="flex justify-between"><dt className="text-gray-600">Diskon</dt><dd className="tabular-nums">−{money(totals.discount)}</dd></div>}
              {cols.tax && inv.taxEnabled && <div className="flex justify-between"><dt className="text-gray-600">{inv.taxLabel}</dt><dd className="tabular-nums">{money(totals.tax)}</dd></div>}
              {cols.shipping && <div className="flex justify-between"><dt className="text-gray-600">Ongkir</dt><dd className="tabular-nums">{money(totals.shipping)}</dd></div>}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1"><dt>Total</dt><dd className="tabular-nums">{money(totals.total)}</dd></div>
            </dl>
          </Section>

          <Section title="Pembayaran, catatan & syarat">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Metode pembayaran</p>
                {settings.paymentMethods.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Belum ada metode pembayaran.{" "}
                    <Link href="/ilv-studio/invoice/pengaturan" className="text-[#A8602A] hover:underline">
                      Tambahkan di Pengaturan Invoice
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {settings.paymentMethods.map((m) => (
                      <Toggle
                        key={m.id}
                        label={m.label}
                        checked={inv.paymentMethodIds.includes(m.id)}
                        onChange={(v) =>
                          set(
                            "paymentMethodIds",
                            v ? [...inv.paymentMethodIds, m.id] : inv.paymentMethodIds.filter((x) => x !== m.id)
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
              <Field label="Syarat pembayaran">
                <textarea rows={3} className={inputCls} value={inv.terms ?? ""} maxLength={2000} onChange={(e) => set("terms", e.target.value || null)} />
              </Field>
              <Field label="Catatan">
                <textarea rows={3} className={inputCls} value={inv.notes ?? ""} maxLength={2000} onChange={(e) => set("notes", e.target.value || null)} />
              </Field>
            </div>
          </Section>

          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="xl:hidden w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Sembunyikan pratinjau" : "Lihat pratinjau"}
          </button>
          {showPreview && <div className="xl:hidden overflow-x-auto rounded-xl border border-gray-200 bg-gray-100 p-3">{preview}</div>}
        </div>

        {/* Live preview */}
        <div className="hidden xl:block sticky top-24">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Pratinjau langsung</p>
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 max-h-[calc(100vh-8rem)] overflow-auto">{preview}</div>
        </div>
      </div>
    </div>
  );
}
