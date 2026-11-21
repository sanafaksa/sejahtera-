/**
 * Public site identity used for SEO: canonical URLs, Open Graph, sitemap and
 * structured data (JSON-LD).
 *
 * The base URL comes from NEXT_PUBLIC_SITE_URL when set (use this once the
 * custom domain is live), otherwise from the production domain Vercel exposes
 * at build time, and finally the current Vercel address.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "https://sejahtera-one.vercel.app";
}

export const SITE_URL = resolveSiteUrl();

export const SITE = {
  name: "Ilavioo",
  legalName: "PT. Ilavioo Nusantara Sejahtera",
  tagline: "Handcrafted Copper & Brass from Tumang",
  description:
    "Handcrafted copper and brass bathtubs, basins, lighting, doors and decor, hand-hammered by artisans in Tumang, Boyolali, Indonesia. Bespoke commissions and worldwide export.",
  email: "marketing@ilavioo.com",
  logo: "/assets/ilavioo-logo-horizontal.png",
  ogImage: "/assets/hero-luxury-bath-suite.jpg",
  address: {
    locality: "Tumang, Cepogo, Boyolali",
    region: "Central Java",
    country: "ID",
  },
} as const;

/** Turns a site-relative path ("/assets/x.jpg") into an absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Cuts text to a meta-description length on a word boundary. */
export function metaDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:\s]+$/, "")}…`;
}
