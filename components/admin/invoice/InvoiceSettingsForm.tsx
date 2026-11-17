"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2, Upload } from "lucide-react";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";
import { CURRENCIES } from "@/lib/invoice/calc";
import { COLUMN_LABEL_KEYS, INVOICE_TEXT, type InvoiceLanguage } from "@/lib/invoice/i18n";
import { formatInvoiceNumber } from "@/lib/invoice/numbering";
import type { InvoiceSettings, PaymentMethod } from "@/lib/invoice/schema";
import type { InvoiceView } from "@/lib/invoice/view";
import { Field, Section, Toggle, inputCls } from "./fields";

const LAYOUTS: Array<{ id: InvoiceSettings["layout"]; label: string; hint: string }> = [
  { id: "classic", label: "Klasik", hint: "Judul berwarna, header tabel aksen" },
  { id: "modern", label: "Modern", hint: "Pita warna penuh di atas" },
  { id: "minimal", label: "Minimal", hint: "Bersih, garis tipis" },
];

const PAYMENT_TYPES: Array<{ id: PaymentMethod["type"]; label: string; placeholder: string }> = [
  { id: "bank", label: "Rekening bank", placeholder: "Bank BCA\nNo. rek 1234567890\na.n. PT. Ilavioo Nusantara Sejahtera\nSWIFT: CENAIDJA" },
  { id: "paypal", label: "PayPal", placeholder: "paypal.me/ilavioo atau email PayPal" },
  { id: "other", label: "Lainnya", placeholder: "Wise, Western Union, dll." },
];

function sampleInvoice(s: InvoiceSettings, lang: InvoiceLanguage, year: number): InvoiceView {
  const today = new Date().toISOString().slice(0, 10);
  return {
    number: formatInvoiceNumber(s.numbering, year, 1),
    status: "sent",
    language: lang,
    currency: s.defaultCurrency,
    customerName: "Anna Schneider",
    customerCompany: "Haus & Bad GmbH",
    customerEmail: "anna@example.com",
    customerPhone: "+49 151 0000000",
    customerAddress: "Musterstraße 12\n10115 Berlin",
    customerCountry: "DE",
    customerTimezone: "Europe/Berlin",
    issueDate: today,
    dueDate: today,
    discountType: "percent",
    discountValue: 5,
    taxEnabled: s.columns.tax && s.defaultTaxEnabled,
    taxLabel: s.taxLabel,
    taxRate: s.defaultTaxRate,
    shipping: s.defaultCurrency === "IDR" ? 2_500_000 : 180,
    notes: s.defaultNotes || null,
    terms: s.defaultTerms || null,
    paymentMethodIds: s.paymentMethods.map((m) => m.id),
    items: [
      {
        productId: null,
        sku: "BT-170",
        name: "Hammered copper bathtub",
        description: "170 cm, natural patina finish",
        quantity: 1,
        unitPrice: s.defaultCurrency === "IDR" ? 45_000_000 : 3200,
      },
      {
        productId: null,
        sku: "SK-42",
        name: "Copper vessel sink",
        description: null,
        quantity: 2,
        unitPrice: s.defaultCurrency === "IDR" ? 4_250_000 : 310,
      },
    ],
  };
}

export default function InvoiceSettingsForm({ initial, year }: { initial: InvoiceSettings; year: number }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [lang, setLang] = useState<InvoiceLanguage>(initial.defaultLanguage);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "signature" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = JSON.stringify(s) !== JSON.stringify(initial);

  function patch<K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }
  const business = (k: keyof InvoiceSettings["business"], v: string) => patch("business", { ...s.business, [k]: v });

  function setMethod(id: string, change: Partial<PaymentMethod>) {
    patch(
      "paymentMethods",
      s.paymentMethods.map((m) => (m.id === id ? { ...m, ...change } : m))
    );
  }

  async function upload(kind: "logo" | "signature", file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload gagal");
      business(kind === "logo" ? "logoUrl" : "signatureUrl", data.url);
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Upload gagal" });
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/invoice", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      setMessage({ ok: true, text: "Pengaturan invoice disimpan." });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Gagal menyimpan" });
    } finally {
      setSaving(false);
    }
  }

  const imageField = (kind: "logo" | "signature", label: string) => {
    const url = kind === "logo" ? s.business.logoUrl : s.business.signatureUrl;
    return (
      <Field label={label} hint="PNG, JPG atau WebP, maks. 2 MB. Latar transparan paling bagus.">
        <div className="flex items-center gap-3">
          <div className="w-28 h-16 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {url ? (
              <Image src={url} alt="" width={112} height={64} unoptimized className="max-h-full w-auto object-contain" />
            ) : (
              <span className="text-xs text-gray-400">Belum ada</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="relative inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading === kind ? "Mengunggah…" : "Unggah"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading !== null}
                onChange={(e) => {
                  upload(kind, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </span>
            {url && (
              <button
                type="button"
                onClick={() => business(kind === "logo" ? "logoUrl" : "signatureUrl", "")}
                className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </Field>
    );
  };

  return (
    <div className="max-w-[1600px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link href="/ilv-studio/invoice" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-1">
            <ArrowLeft className="w-4 h-4" /> Semua invoice
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Invoice</h1>
          <p className="text-gray-600">Atur tampilan dan isi bawaan invoice tanpa mengubah kode.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {message && (
            <span role="status" className={`text-sm ${message.ok ? "text-[#1F6B45]" : "text-red-600"}`}>
              {message.text}
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 rounded-lg bg-[#A8602A] hover:bg-[#8f4f21] text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan…" : "Simpan pengaturan"}
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <Section title="Identitas usaha">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nama usaha *" className="sm:col-span-2">
                <input className={inputCls} value={s.business.name} maxLength={120} onChange={(e) => business("name", e.target.value)} />
              </Field>
              <Field label="Alamat" className="sm:col-span-2">
                <textarea rows={3} className={inputCls} value={s.business.address} maxLength={400} onChange={(e) => business("address", e.target.value)} />
              </Field>
              <Field label="Email">
                <input className={inputCls} value={s.business.email} maxLength={200} onChange={(e) => business("email", e.target.value)} />
              </Field>
              <Field label="Telepon / WhatsApp">
                <input className={inputCls} value={s.business.phone} maxLength={60} onChange={(e) => business("phone", e.target.value)} />
              </Field>
              <Field label="Website">
                <input className={inputCls} value={s.business.website} maxLength={200} onChange={(e) => business("website", e.target.value)} />
              </Field>
              <Field label="NPWP / ID pajak" hint="Kosongkan bila tidak ada">
                <input className={inputCls} value={s.business.taxId} maxLength={60} onChange={(e) => business("taxId", e.target.value)} />
              </Field>
              {imageField("logo", "Logo")}
              {imageField("signature", "Tanda tangan / stempel")}
              <Field label="Nama penanda tangan">
                <input className={inputCls} value={s.business.signatoryName} maxLength={120} onChange={(e) => business("signatoryName", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Tampilan">
            <div className="space-y-4">
              <Field label="Warna aksen">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={s.accentColor}
                    onChange={(e) => patch("accentColor", e.target.value)}
                    aria-label="Pilih warna aksen"
                    className="h-10 w-14 rounded-lg border border-gray-200 bg-white p-1 cursor-pointer"
                  />
                  <input
                    className={`${inputCls} w-32 font-mono uppercase`}
                    value={s.accentColor}
                    maxLength={7}
                    onChange={(e) => patch("accentColor", e.target.value)}
                  />
                  <button type="button" onClick={() => patch("accentColor", "#A8602A")} className="text-sm text-gray-500 hover:text-gray-800">
                    Kembalikan tembaga
                  </button>
                </div>
              </Field>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-2">Tata letak</legend>
                <div className="grid sm:grid-cols-3 gap-2">
                  {LAYOUTS.map((l) => (
                    <label
                      key={l.id}
                      className={`rounded-lg border px-3 py-2.5 cursor-pointer text-sm ${
                        s.layout === l.id ? "border-[#A8602A] bg-amber-50/60" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="layout"
                        className="sr-only"
                        checked={s.layout === l.id}
                        onChange={() => patch("layout", l.id)}
                      />
                      <span className="font-medium text-gray-900">{l.label}</span>
                      <span className="block text-xs text-gray-500">{l.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </Section>

          <Section title="Format nomor">
            <div className="grid sm:grid-cols-3 gap-4 items-end">
              <Field label="Prefix">
                <input
                  className={`${inputCls} uppercase`}
                  value={s.numbering.prefix}
                  maxLength={12}
                  onChange={(e) => patch("numbering", { ...s.numbering, prefix: e.target.value.toUpperCase() })}
                />
              </Field>
              <Field label="Panjang urutan">
                <input
                  type="number"
                  min={1}
                  max={8}
                  className={inputCls}
                  value={s.numbering.padding}
                  onChange={(e) => patch("numbering", { ...s.numbering, padding: Number(e.target.value) || 1 })}
                />
              </Field>
              <div className="space-y-2 pb-1">
                <Toggle checked={s.numbering.includeYear} onChange={(v) => patch("numbering", { ...s.numbering, includeYear: v })} label="Sertakan tahun" />
                <Toggle checked={s.numbering.resetYearly} onChange={(v) => patch("numbering", { ...s.numbering, resetYearly: v })} label="Mulai dari 1 tiap tahun" />
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Contoh: <strong className="font-mono">{formatInvoiceNumber(s.numbering, year, 1)}</strong>,{" "}
              <strong className="font-mono">{formatInvoiceNumber(s.numbering, year, 2)}</strong>
            </p>
          </Section>

          <Section title="Kolom & label">
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
              <Toggle checked={s.columns.discount} onChange={(v) => patch("columns", { ...s.columns, discount: v })} label="Diskon" />
              <Toggle checked={s.columns.tax} onChange={(v) => patch("columns", { ...s.columns, tax: v })} label="Pajak" />
              <Toggle checked={s.columns.shipping} onChange={(v) => patch("columns", { ...s.columns, shipping: v })} label="Ongkir" />
              <Toggle checked={s.columns.sku} onChange={(v) => patch("columns", { ...s.columns, sku: v })} label="Kolom SKU" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-medium text-gray-700">Label kolom</p>
              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 ml-auto">
                {(["en", "id"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={`px-3 py-1 text-xs rounded-md ${lang === l ? "bg-[#A8602A] text-white" : "text-gray-700"}`}
                  >
                    {l === "en" ? "English" : "Indonesia"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLUMN_LABEL_KEYS.map((k) => (
                <Field key={k} label={INVOICE_TEXT.id[k]}>
                  <input
                    className={inputCls}
                    placeholder={INVOICE_TEXT[lang][k]}
                    maxLength={40}
                    value={s.labels[lang][k] ?? ""}
                    onChange={(e) =>
                      patch("labels", { ...s.labels, [lang]: { ...s.labels[lang], [k]: e.target.value || undefined } })
                    }
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Bawaan invoice baru">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Mata uang">
                <select className={inputCls} value={s.defaultCurrency} onChange={(e) => patch("defaultCurrency", e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Bahasa">
                <select className={inputCls} value={s.defaultLanguage} onChange={(e) => patch("defaultLanguage", e.target.value === "id" ? "id" : "en")}>
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                </select>
              </Field>
              <Field label="Nama pajak">
                <input className={inputCls} value={s.taxLabel} maxLength={40} onChange={(e) => patch("taxLabel", e.target.value)} />
              </Field>
              <Field label="Tarif pajak (%)">
                <input type="number" min={0} max={100} step="any" className={inputCls} value={s.defaultTaxRate} onChange={(e) => patch("defaultTaxRate", Number(e.target.value) || 0)} />
              </Field>
              <div className="sm:col-span-2">
                <Toggle checked={s.defaultTaxEnabled} onChange={(v) => patch("defaultTaxEnabled", v)} label="Pajak aktif secara bawaan (ekspor biasanya 0%)" />
              </div>
              <Field label="Jatuh tempo (hari setelah terbit)">
                <input type="number" min={0} max={365} className={inputCls} value={s.dueDays} onChange={(e) => patch("dueDays", Number(e.target.value) || 0)} />
              </Field>
              <div />
              <Field label="Syarat pembayaran bawaan" className="sm:col-span-2">
                <textarea rows={3} className={inputCls} value={s.defaultTerms} maxLength={1000} onChange={(e) => patch("defaultTerms", e.target.value)} />
              </Field>
              <Field label="Catatan bawaan" className="sm:col-span-2">
                <textarea rows={2} className={inputCls} value={s.defaultNotes} maxLength={1000} onChange={(e) => patch("defaultNotes", e.target.value)} />
              </Field>
              <Field label="Teks footer" className="sm:col-span-2">
                <input className={inputCls} value={s.footerText} maxLength={400} onChange={(e) => patch("footerText", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section
            title="Metode pembayaran"
            action={
              <button
                type="button"
                onClick={() =>
                  patch("paymentMethods", [
                    ...s.paymentMethods,
                    { id: `pm-${Date.now().toString(36)}`, type: "bank", label: "", details: "" },
                  ])
                }
                disabled={s.paymentMethods.length >= 10}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#A8602A] text-[#A8602A] px-3 py-1.5 text-sm font-medium hover:bg-amber-50 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            }
          >
            {s.paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada. Tambahkan rekening bank, PayPal, atau metode lain.</p>
            ) : (
              <ul className="space-y-4">
                {s.paymentMethods.map((m) => (
                  <li key={m.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="grid sm:grid-cols-[10rem_1fr_auto] gap-3 items-end">
                      <Field label="Jenis">
                        <select className={inputCls} value={m.type} onChange={(e) => setMethod(m.id, { type: e.target.value as PaymentMethod["type"] })}>
                          {PAYMENT_TYPES.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Nama tampil">
                        <input className={inputCls} value={m.label} maxLength={80} placeholder="mis. Bank transfer (USD)" onChange={(e) => setMethod(m.id, { label: e.target.value })} />
                      </Field>
                      <button
                        type="button"
                        onClick={() => patch("paymentMethods", s.paymentMethods.filter((x) => x.id !== m.id))}
                        aria-label={`Hapus ${m.label || "metode"}`}
                        className="p-2 mb-0.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Field label="Detail" className="mt-3">
                      <textarea
                        rows={3}
                        className={inputCls}
                        value={m.details}
                        maxLength={600}
                        placeholder={PAYMENT_TYPES.find((p) => p.id === m.type)?.placeholder}
                        onChange={(e) => setMethod(m.id, { details: e.target.value })}
                      />
                    </Field>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="xl:sticky xl:top-24">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Pratinjau langsung (contoh)</p>
            <span className="text-xs text-gray-500">{lang === "en" ? "English" : "Indonesia"}</span>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-100 p-3 sm:p-4 xl:max-h-[calc(100vh-8rem)] overflow-auto">
            <InvoiceDocument invoice={sampleInvoice(s, lang, year)} settings={s} status="sent" />
          </div>
        </div>
      </div>
    </div>
  );
}
