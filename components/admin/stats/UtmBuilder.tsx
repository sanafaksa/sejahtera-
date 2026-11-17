"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Check, Copy, Download, Link2 } from "lucide-react";

const PRESETS = [
  { id: "whatsapp", label: "WhatsApp", source: "whatsapp", medium: "chat", campaign: "chat" },
  { id: "instagram", label: "Instagram bio", source: "instagram", medium: "social", campaign: "bio" },
  { id: "pinterest", label: "Pinterest", source: "pinterest", medium: "social", campaign: "pin" },
  { id: "katalog", label: "Katalog", source: "katalog", medium: "print", campaign: "katalog" },
] as const;

const PAGES = [
  { path: "/", label: "Beranda" },
  { path: "/products", label: "Produk" },
  { path: "/gallery", label: "Galeri" },
  { path: "/about", label: "Tentang" },
  { path: "/contact", label: "Kontak" },
];

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function UtmBuilder({ products }: { products: Array<{ slug: string; name: string }> }) {
  const [origin, setOrigin] = useState("");
  const [presetId, setPresetId] = useState<(typeof PRESETS)[number]["id"]>("whatsapp");
  const [path, setPath] = useState("/");
  const [campaign, setCampaign] = useState<string>(PRESETS[0].campaign);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => setOrigin(window.location.origin), []);

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];

  const link = useMemo(() => {
    if (!origin) return "";
    const url = new URL(path, origin);
    url.searchParams.set("utm_source", preset.source);
    url.searchParams.set("utm_medium", preset.medium);
    const c = slugify(campaign);
    if (c) url.searchParams.set("utm_campaign", c);
    return url.toString();
  }, [origin, path, preset, campaign]);

  useEffect(() => {
    if (!link) return;
    let cancelled = false;
    QRCode.toDataURL(link, { width: 480, margin: 2, color: { dark: "#2b1a10", light: "#ffffff" } })
      .then((data) => !cancelled && setQr(data))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [link]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="w-5 h-5 text-[#A8602A]" />
        <h2 className="font-semibold text-gray-900">Pembuat link bertanda</h2>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Bagikan link ini supaya kunjungan dari tiap saluran tercatat di &quot;Dibuka dari&quot;.
      </p>

      <div className="grid lg:grid-cols-[1fr_auto] gap-6">
        <div className="space-y-4 min-w-0">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Saluran</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPresetId(p.id);
                    setCampaign(p.campaign);
                  }}
                  aria-pressed={presetId === p.id}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    presetId === p.id
                      ? "bg-[#A8602A] border-[#A8602A] text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Halaman tujuan</span>
              <select
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
              >
                <optgroup label="Halaman">
                  {PAGES.map((p) => (
                    <option key={p.path} value={p.path}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
                {products.length > 0 && (
                  <optgroup label="Produk">
                    {products.map((p) => (
                      <option key={p.slug} value={`/products/${p.slug}`}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Nama kampanye</span>
              <input
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                maxLength={60}
                placeholder="mis. pameran-2026"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Link</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <code className="flex-1 min-w-0 break-all rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-800">
                {link || "…"}
              </code>
              <button
                type="button"
                onClick={copy}
                disabled={!link}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A8602A] hover:bg-[#8f4f21] text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-40 h-40 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
            {qr ? (
              <Image
                src={qr}
                alt="QR code untuk link di samping"
                width={160}
                height={160}
                unoptimized
                className="w-full h-full"
              />
            ) : (
              <span className="text-xs text-gray-400">QR code</span>
            )}
          </div>
          {qr && (
            <a
              href={qr}
              download={`qr-${preset.source}-${slugify(campaign) || "link"}.png`}
              className="inline-flex items-center gap-1.5 text-sm text-[#A8602A] hover:underline"
            >
              <Download className="w-4 h-4" />
              Unduh QR
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
