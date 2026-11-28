/**
 * Product SEO: the single source of truth for a product's SEO strings and
 * structured data.
 *
 * - `deterministicSeo()` builds SEO from the product's real fields (name,
 *   category, material, description). No invented data, never the word "Tumang".
 * - `resolveProductSeo()` prefers a persisted/override column when present and
 *   otherwise falls back to the deterministic value — so when the SEO columns
 *   are empty the output is identical to the old render-time behaviour. This is
 *   the ONLY place product SEO is computed; `generateMetadata`, the JSON-LD and
 *   the save path all go through here, so they can never diverge.
 */
import { SITE, SITE_URL, absoluteUrl, metaDescription, webPageStructuredData } from "@/lib/site";
import { categorizeProduct } from "@/lib/categories";

/** SEO string fields that are generated and may be overridden by an admin. */
export const SEO_STRING_FIELDS = [
  "seoTitle",
  "metaDescription",
  "imageAlt",
  "ogTitle",
  "ogDescription",
  "canonicalUrl",
] as const;
export type SeoField = (typeof SEO_STRING_FIELDS)[number];

export type SeoStatus = "published" | "draft";

export interface ProductSeoSpec {
  size?: string | null;
  finishing?: string | null;
  material?: string | null;
  price?: string | null;
}

/** Minimal shape needed to compute SEO; a Prisma Product satisfies it. */
export interface ProductSeoInput {
  name: string;
  slug: string;
  description?: string | null;
  specifications?: ProductSeoSpec | null;
  images?: { imageUrl: string; isFeatured?: boolean; isCatalog?: boolean }[] | null;
  // Persisted SEO columns (optional; absent on a fresh input).
  seoTitle?: string | null;
  metaDescription?: string | null;
  imageAlt?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
  seoStatus?: string | null;
  seoOverrides?: string[] | null;
}

export interface ResolvedProductSeo {
  seoTitle: string;
  metaDescription: string;
  imageAlt: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
}

const ORIGIN = "Boyolali, Indonesia";

/** Remove the word "Tumang" (and a dangling comma) and tidy whitespace. */
export function stripTumang(input: string): string {
  return input
    .replace(/\btumang\b\s*,\s*/gi, "")
    .replace(/\s*\bin tumang\b/gi, "")
    .replace(/\s*\btumang\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}

/** SEO-friendly, stable slug. Mirrors the admin form but also strips "Tumang". */
export function slugify(text: string): string {
  return stripTumang(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Trim to a max length on a word boundary (no mid-word cut, no trailing comma). */
function clampWords(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, "");
}

function buildSeoTitle(name: string, categoryName: string): string {
  const base = clampWords(stripTumang(name), 60);
  // Grow toward ~50–60 chars with natural, non-stuffed context.
  const suffixes = [categoryName, `Handcrafted in Boyolali`];
  let title = base;
  for (const suf of suffixes) {
    if (title.length >= 50) break;
    const candidate = `${title} | ${stripTumang(suf)}`;
    if (candidate.length <= 60) title = candidate;
  }
  return title;
}

function buildMetaDescription(input: ProductSeoInput, material?: string | null): string {
  const described = input.description ? stripTumang(input.description) : "";
  if (described && described.replace(/\s+/g, " ").trim().length >= 80) {
    return metaDescription(described, 158);
  }
  const mat = material ? material.toLowerCase() : "copper and brass";
  const fallback = `Handcrafted ${stripTumang(input.name)} in solid ${mat}, made to order in ${ORIGIN} and shipped worldwide. Contact us for a project quote.`;
  return metaDescription(stripTumang(fallback), 158);
}

function buildImageAlt(name: string, material?: string | null): string {
  const mat = material ? material.toLowerCase() : "copper and brass";
  return clampWords(stripTumang(`${name} — handmade ${mat} by ${SITE.name} in Boyolali, Indonesia`), 125);
}

/** Deterministic SEO built only from real product data. */
export function deterministicSeo(input: ProductSeoInput): ResolvedProductSeo {
  const category = categorizeProduct({ name: input.name, slug: input.slug });
  const material = input.specifications?.material ?? null;
  const name = stripTumang(input.name);
  const seoTitle = buildSeoTitle(name, category.name);
  const metaDesc = buildMetaDescription(input, material);
  return {
    seoTitle,
    metaDescription: metaDesc,
    imageAlt: buildImageAlt(name, material),
    ogTitle: clampWords(`${name} | ${SITE.name}`, 90),
    ogDescription: metaDesc,
    canonicalUrl: absoluteUrl(`/products/${slugify(input.slug || name)}`),
  };
}

/**
 * Effective SEO for a product: a persisted/override column wins; otherwise the
 * deterministic value. Empty columns => deterministic (the render-time fallback).
 */
export function resolveProductSeo(input: ProductSeoInput): ResolvedProductSeo {
  const det = deterministicSeo(input);
  const pick = (stored: string | null | undefined, fallback: string) => {
    const v = stored?.trim();
    return v ? v : fallback;
  };
  return {
    seoTitle: pick(input.seoTitle, det.seoTitle),
    metaDescription: pick(input.metaDescription, det.metaDescription),
    imageAlt: pick(input.imageAlt, det.imageAlt),
    ogTitle: pick(input.ogTitle, det.ogTitle),
    ogDescription: pick(input.ogDescription, det.ogDescription),
    canonicalUrl: pick(input.canonicalUrl, det.canonicalUrl),
  };
}

/**
 * Values to persist on save. Fields listed in `overrides` keep the admin's
 * value (taken from `current`); everything else is regenerated. Idempotent:
 * the same product + overrides always yields the same output.
 */
export function computeSeoForSave(
  input: ProductSeoInput,
  overrides: string[],
  current?: Partial<Record<SeoField, string | null | undefined>>
): Record<SeoField, string> {
  const det = deterministicSeo(input);
  const out = {} as Record<SeoField, string>;
  for (const field of SEO_STRING_FIELDS) {
    if (overrides.includes(field)) {
      const manual = current?.[field]?.toString().trim();
      out[field] = manual ? stripTumang(manual) : det[field];
    } else {
      out[field] = det[field];
    }
  }
  return out;
}

export function normalizeSeoStatus(value?: string | null): SeoStatus {
  return value === "draft" ? "draft" : "published";
}

/** Keep only valid, de-duplicated SEO field names as overrides. */
export function sanitizeOverrides(value?: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is SeoField => (SEO_STRING_FIELDS as readonly string[]).includes(v)))];
}

const CURRENCY_BY_TOKEN: Record<string, string> = {
  $: "USD", "us$": "USD", usd: "USD", rp: "IDR", idr: "IDR", "€": "EUR", eur: "EUR", "£": "GBP", gbp: "GBP",
};

/**
 * Parse a free-text price into a real amount + ISO currency, or null for
 * "contact for price" / "custom project" placeholders. Only a parseable price
 * yields an Offer; everything else stays quote-only.
 */
export function parsePublicPrice(raw?: string | null): { price: string; currency: string } | null {
  if (!raw) return null;
  const m = raw.trim().match(/(US\$|\$|Rp|IDR|USD|€|EUR|£|GBP)\s*([\d][\d.,\s]*)/i);
  if (!m) return null;
  const currency = CURRENCY_BY_TOKEN[m[1].toLowerCase()] ?? CURRENCY_BY_TOKEN[m[1]];
  if (!currency) return null;
  let num = m[2].replace(/\s/g, "");
  if (num.includes(",") && num.includes(".")) num = num.replace(/,/g, "");
  else if (num.includes(",")) num = /,\d{2}$/.test(num) ? num.replace(",", ".") : num.replace(/,/g, "");
  num = num.replace(/\.(?=\d{3}\b)/g, "");
  const value = Number(num);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { price: String(value), currency };
}

/** True when this product should emit Product + Offer (real public price). */
export function hasPublicOffer(input: ProductSeoInput): boolean {
  return parsePublicPrice(input.specifications?.price) !== null;
}

/**
 * Structured data for a product page.
 * - Real public price -> Product + Offer (+ BreadcrumbList).
 * - Quote-only        -> WebPage + BreadcrumbList (no incomplete Product node,
 *   which Google flags for missing offers/review/aggregateRating).
 */
export function buildProductJsonLd(input: ProductSeoInput): Record<string, unknown>[] {
  const slug = input.slug;
  const url = absoluteUrl(`/products/${slug}`);
  const category = categorizeProduct({ name: input.name, slug });
  const spec = input.specifications;
  const name = stripTumang(input.name);
  const description = input.description
    ? stripTumang(input.description)
    : `Handcrafted ${name} from ${ORIGIN}.`;

  const webPage = webPageStructuredData({
    type: "WebPage",
    path: `/products/${slug}`,
    name,
    description,
    parents: [
      { name: "Products", path: "/products" },
      { name: category.name, path: `/collections/${category.slug}` },
    ],
  });

  const priced = parsePublicPrice(spec?.price);
  if (!priced) return webPage; // [WebPage, BreadcrumbList]

  const breadcrumb = webPage[1];
  const additionalProperty = [
    spec?.size && { "@type": "PropertyValue", name: "Size", value: spec.size },
    spec?.finishing && { "@type": "PropertyValue", name: "Finishing", value: spec.finishing },
  ].filter(Boolean);
  const images = (input.images ?? []).slice(0, 6).map((img) => absoluteUrl(img.imageUrl));
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name,
      url,
      description,
      ...(images.length ? { image: images } : {}),
      ...(spec?.material ? { material: spec.material } : {}),
      ...(additionalProperty.length ? { additionalProperty } : {}),
      brand: { "@type": "Brand", name: SITE.name },
      manufacturer: { "@id": `${SITE_URL}/#organization` },
      countryOfOrigin: "ID",
      category: category.name,
      keywords: [name, ...category.keywords].join(", "),
      offers: {
        "@type": "Offer",
        url,
        price: priced.price,
        priceCurrency: priced.currency,
        availability: "https://schema.org/MadeToOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${SITE_URL}/#organization` },
      },
    },
    breadcrumb,
  ];
}
