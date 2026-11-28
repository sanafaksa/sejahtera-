"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles, RotateCcw, Loader2, Globe, Tag } from "lucide-react";
import { deterministicSeo, hasPublicOffer, SEO_STRING_FIELDS } from "@/lib/product-seo";

export type SeoFieldKey = "seoTitle" | "metaDescription" | "imageAlt" | "ogTitle" | "ogDescription";

const FIELDS: { key: SeoFieldKey; label: string; min: number; max: number; multiline?: boolean }[] = [
  { key: "seoTitle", label: "SEO title", min: 50, max: 60 },
  { key: "metaDescription", label: "Meta description", min: 140, max: 160, multiline: true },
  { key: "imageAlt", label: "Image alt text", min: 10, max: 125 },
  { key: "ogTitle", label: "Open Graph title", min: 20, max: 90 },
  { key: "ogDescription", label: "Open Graph description", min: 80, max: 200, multiline: true },
];

interface SeoPanelProps {
  source: { name: string; slug: string; description: string; material: string; price: string };
  values: Record<SeoFieldKey, string>;
  overrides: Set<string>;
  seoStatus: "published" | "draft";
  onField: (field: SeoFieldKey, value: string) => void;
  onToggleOverride: (field: SeoFieldKey, on: boolean) => void;
  onStatus: (status: "published" | "draft") => void;
}

export default function SeoPanel({
  source,
  values,
  overrides,
  seoStatus,
  onField,
  onToggleOverride,
  onStatus,
}: SeoPanelProps) {
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Deterministic baseline, recomputed live from the real product fields.
  const auto = useMemo(
    () =>
      deterministicSeo({
        name: source.name || "",
        slug: source.slug || "",
        description: source.description || "",
        specifications: { material: source.material || null, price: source.price || null },
      }),
    [source.name, source.slug, source.description, source.material, source.price]
  );

  const priced = hasPublicOffer({
    name: source.name,
    slug: source.slug,
    specifications: { price: source.price },
  });

  const effective = (key: SeoFieldKey) => (overrides.has(key) ? values[key] : auto[key]);

  const generateAI = async () => {
    setAiBusy(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/products/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: source.name,
          slug: source.slug,
          description: source.description || null,
          specifications: { material: source.material || null, price: source.price || null },
          enhance: true,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as {
        seo: Record<SeoFieldKey, string>;
        enhanced: boolean;
        aiAvailable: boolean;
      };
      for (const key of FIELDS.map((f) => f.key)) {
        if (data.seo[key]) {
          onField(key, data.seo[key]);
          onToggleOverride(key, true);
        }
      }
      setAiNote(
        data.enhanced
          ? "Filled with AI-enhanced copy — review and edit, then save."
          : data.aiAvailable
          ? "AI returned nothing usable; filled with the deterministic baseline."
          : "AI is not configured (no ANTHROPIC_API_KEY); filled with the deterministic baseline."
      );
    } catch {
      setAiNote("Could not generate — the deterministic preview below is still used on save.");
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-gray-50">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Search className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">SEO</h3>
          <p className="text-sm text-gray-500">
            Auto-generated from the product on save. Edit a field to override it; blank fields fall back to auto.
          </p>
        </div>
        <button
          type="button"
          onClick={generateAI}
          disabled={aiBusy || !source.name.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate SEO (AI)
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Status + schema mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {(["published", "draft"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatus(s)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  seoStatus === s ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {seoStatus === "draft" ? "Hidden from sitemap and listings; noindex." : "In sitemap and listings."}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ml-auto ${
              priced ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            {priced ? "Schema: Product + Offer" : "Schema: WebPage + Breadcrumb · Contact for Price"}
          </span>
        </div>

        {/* Canonical (always auto) */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-500">Canonical:</span>
          <span className="font-mono text-gray-700 truncate">{auto.canonicalUrl}</span>
        </div>

        {FIELDS.map((f) => {
          const isOverride = overrides.has(f.key);
          const value = effective(f.key);
          const len = value.length;
          const inRange = len >= f.min && len <= f.max;
          return (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-900">{f.label}</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isOverride ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isOverride ? "Edited" : "Auto"}
                  </span>
                  <span className={`text-xs ${inRange ? "text-emerald-600" : "text-amber-600"}`}>
                    {len}/{f.max}
                  </span>
                  {isOverride && (
                    <button
                      type="button"
                      onClick={() => onToggleOverride(f.key, false)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
                      title="Reset to auto-generated"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
              </div>
              {f.multiline ? (
                <textarea
                  rows={2}
                  value={value}
                  onChange={(e) => {
                    onToggleOverride(f.key, true);
                    onField(f.key, e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 text-black rounded-lg focus:border-purple-500 focus:outline-none focus:bg-white transition-all resize-none text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    onToggleOverride(f.key, true);
                    onField(f.key, e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 text-black rounded-lg focus:border-purple-500 focus:outline-none focus:bg-white transition-all text-sm"
                />
              )}
            </div>
          );
        })}

        {aiNote && <p className="text-xs text-gray-500">{aiNote}</p>}
      </div>
    </div>
  );
}

export const SEO_PANEL_FIELDS = SEO_STRING_FIELDS;
