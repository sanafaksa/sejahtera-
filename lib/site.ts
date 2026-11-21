import type { Metadata } from "next";

/**
 * Public site identity used for SEO: canonical URLs, Open Graph, sitemap and
 * structured data (JSON-LD).
 *
 * The official domain is www.ilavioo.com (ilavioo.com redirects to it; the property registered in Google
 * Search Console). NEXT_PUBLIC_SITE_URL can override it, e.g. for staging.
 */
const OFFICIAL_SITE_URL = "https://www.ilavioo.com";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (explicit || OFFICIAL_SITE_URL).replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();

export const SITE = {
  name: "Ilavioo",
  legalName: "PT. Ilavioo Nusantara Sejahtera",
  tagline: "Handcrafted Copper & Brass from Tumang",
  description:
    "Handcrafted copper and brass bathtubs, basins, lighting and doors, hand-hammered by artisans in Tumang, Indonesia. Bespoke orders and worldwide export.",
  email: "marketing@ilavioo.com",
  /** Official profiles (same as the footer). Used for links and schema sameAs. */
  social: {
    instagram: "https://www.instagram.com/ilavioocopper_art",
    threads: "https://www.threads.net/@ilavioocopper_art",
    tiktok: "https://www.tiktok.com/@ilavioocopper",
  },
  /** E.164, same number as the footer / contact page and WhatsApp. */
  telephone: "+6281213696772",
  logo: "/assets/ilavioo-logo-horizontal.png",
  ogImage: "/assets/hero-luxury-bath-suite.jpg",
  address: {
    locality: "Tumang, Cepogo, Boyolali",
    region: "Central Java",
    country: "ID",
  },
} as const;

export const DEFAULT_TITLE = `${SITE.name} | ${SITE.tagline}`;

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

type SocialImage = { url: string; alt?: string };

/**
 * Full per-page metadata. Next.js replaces (rather than merges) the parent's
 * openGraph/twitter objects, so every page gets the complete set here.
 * Pass `title: null` for the home page to keep the root default title.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string | null;
  description: string;
  path: string;
  images?: SocialImage[];
}): Metadata {
  const socialTitle = title ? `${title} | ${SITE.name}` : DEFAULT_TITLE;
  const ogImages = images?.length
    ? images
    : [{ url: SITE.ogImage, alt: "Handcrafted copper bathtub by Ilavioo, Tumang" }];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_US",
      url: path,
      title: socialTitle,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}

const ORG_ID = () => `${SITE_URL}/#organization`;
const WEBSITE_ID = () => `${SITE_URL}/#website`;

/**
 * schema.org WebPage subtype (AboutPage, ContactPage, CollectionPage, …) plus a
 * Home › page breadcrumb, linked to the site-wide Organization and WebSite nodes.
 */
export function webPageStructuredData({
  type,
  path,
  name,
  description,
  extra,
}: {
  type: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  path: string;
  name: string;
  description: string;
  extra?: Record<string, unknown>;
}): Record<string, unknown>[] {
  const url = absoluteUrl(path);
  return [
    {
      "@context": "https://schema.org",
      "@type": type,
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID() },
      about: { "@id": ORG_ID() },
      ...extra,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name, item: url },
      ],
    },
  ];
}
