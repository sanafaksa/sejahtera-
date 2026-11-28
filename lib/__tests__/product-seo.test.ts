import { describe, it, expect } from "vitest";
import {
  stripTumang,
  slugify,
  deterministicSeo,
  resolveProductSeo,
  computeSeoForSave,
  parsePublicPrice,
  buildProductJsonLd,
  hasPublicOffer,
  normalizeSeoStatus,
  sanitizeOverrides,
  SEO_STRING_FIELDS,
  type ProductSeoInput,
} from "@/lib/product-seo";

const bathtub: ProductSeoInput = {
  name: "Heritage Antique Copper Bathtub",
  slug: "heritage-antique-copper-bathtub",
  description:
    "A freestanding copper bathtub hand-hammered by master artisans, finished with a warm antique patina for luxury villas and resorts.",
  specifications: { size: "170 x 80 cm", finishing: "Antique patina", material: "Copper", price: "Contact for Price" },
  images: [{ imageUrl: "/assets/products/heritage.jpg" }],
};

describe("stripTumang / slugify", () => {
  it("removes the word Tumang in several shapes", () => {
    expect(stripTumang("from Tumang, Boyolali").toLowerCase()).not.toContain("tumang");
    expect(stripTumang("A masterpiece of Tumang metal art").toLowerCase()).not.toContain("tumang");
    expect(stripTumang("Hand-spun on wooden lathes in Tumang").toLowerCase()).not.toContain("tumang");
  });
  it("builds a clean slug and never contains tumang", () => {
    expect(slugify("Tumang Fluted Copper Urn & Planter")).toBe("fluted-copper-urn-planter");
    expect(slugify("  Elegant   Copper Vase!! ")).toBe("elegant-copper-vase");
  });
});

describe("deterministicSeo", () => {
  const seo = deterministicSeo(bathtub);
  it("title is within ~60 chars and includes the product name", () => {
    expect(seo.seoTitle.length).toBeLessThanOrEqual(60);
    expect(seo.seoTitle).toContain("Heritage Antique Copper Bathtub");
  });
  it("meta description is within 160 chars", () => {
    expect(seo.metaDescription.length).toBeLessThanOrEqual(160);
    expect(seo.metaDescription.length).toBeGreaterThan(80);
  });
  it("canonical url is absolute", () => {
    expect(seo.canonicalUrl).toMatch(/^https?:\/\/.+\/products\/heritage-antique-copper-bathtub$/);
  });
  it("never emits the word Tumang even when the source has it", () => {
    const dirty = deterministicSeo({
      ...bathtub,
      name: "Tumang Copper Vase",
      slug: "tumang-copper-vase",
      description: "Handmade in Tumang, Boyolali with fine detail and premium quality copper for interiors.",
    });
    for (const f of SEO_STRING_FIELDS) expect(dirty[f].toLowerCase()).not.toContain("tumang");
  });
});

describe("resolveProductSeo (override precedence / fallback)", () => {
  it("falls back to deterministic when columns are empty", () => {
    const resolved = resolveProductSeo(bathtub);
    expect(resolved.seoTitle).toBe(deterministicSeo(bathtub).seoTitle);
  });
  it("prefers a persisted/override column when present", () => {
    const resolved = resolveProductSeo({ ...bathtub, seoTitle: "My Custom Title" });
    expect(resolved.seoTitle).toBe("My Custom Title");
  });
});

describe("computeSeoForSave (idempotent, override-safe)", () => {
  it("regenerates non-override fields and keeps override fields", () => {
    const current = { seoTitle: "Admin Chosen Title", metaDescription: "ignored because not overridden" };
    const out = computeSeoForSave(bathtub, ["seoTitle"], current);
    expect(out.seoTitle).toBe("Admin Chosen Title");
    expect(out.metaDescription).toBe(deterministicSeo(bathtub).metaDescription);
  });
  it("is idempotent", () => {
    const a = computeSeoForSave(bathtub, [], undefined);
    const b = computeSeoForSave(bathtub, [], undefined);
    expect(a).toEqual(b);
  });
  it("strips Tumang from a manual override", () => {
    const out = computeSeoForSave(bathtub, ["seoTitle"], { seoTitle: "Tumang Copper Bathtub" });
    expect(out.seoTitle.toLowerCase()).not.toContain("tumang");
  });
});

describe("parsePublicPrice", () => {
  it("returns null for quote-only placeholders", () => {
    expect(parsePublicPrice("Contact for Price")).toBeNull();
    expect(parsePublicPrice("Custom Project")).toBeNull();
    expect(parsePublicPrice(null)).toBeNull();
    expect(parsePublicPrice("")).toBeNull();
  });
  it("parses real prices with currency", () => {
    expect(parsePublicPrice("$1,200")).toEqual({ price: "1200", currency: "USD" });
    expect(parsePublicPrice("USD 2500")).toEqual({ price: "2500", currency: "USD" });
    expect(parsePublicPrice("Rp 5.000.000")).toEqual({ price: "5000000", currency: "IDR" });
  });
});

describe("buildProductJsonLd", () => {
  it("quote-only product -> WebPage + BreadcrumbList, no offers", () => {
    const nodes = buildProductJsonLd(bathtub);
    const types = nodes.map((n) => n["@type"]);
    expect(types).toContain("WebPage");
    expect(types).toContain("BreadcrumbList");
    expect(types).not.toContain("Product");
    expect(JSON.stringify(nodes)).not.toContain("offers");
    const breadcrumb = nodes.find((n) => n["@type"] === "BreadcrumbList") as {
      itemListElement: { name: string; item: string }[];
    };
    for (const item of breadcrumb.itemListElement) {
      expect(item.name).toBeTruthy();
      expect(item.item).toMatch(/^https?:\/\//);
    }
  });
  it("priced product -> Product + Offer", () => {
    const priced = { ...bathtub, specifications: { ...bathtub.specifications, price: "$1,200" } };
    expect(hasPublicOffer(priced)).toBe(true);
    const nodes = buildProductJsonLd(priced);
    const product = nodes.find((n) => n["@type"] === "Product") as { offers?: { price: string; priceCurrency: string } };
    expect(product).toBeTruthy();
    expect(product.offers?.price).toBe("1200");
    expect(product.offers?.priceCurrency).toBe("USD");
  });
});

describe("status + overrides helpers", () => {
  it("normalizes status", () => {
    expect(normalizeSeoStatus("draft")).toBe("draft");
    expect(normalizeSeoStatus("published")).toBe("published");
    expect(normalizeSeoStatus(undefined)).toBe("published");
    expect(normalizeSeoStatus("whatever")).toBe("published");
  });
  it("sanitizes overrides to known fields only", () => {
    expect(sanitizeOverrides(["seoTitle", "seoTitle", "bogus", 5])).toEqual(["seoTitle"]);
    expect(sanitizeOverrides("nope")).toEqual([]);
  });
});
