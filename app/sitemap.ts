import type { MetadataRoute } from "next";
import { getProductList } from "@/lib/public-data";
import { absoluteUrl } from "@/lib/site";

// Rebuilt hourly so new products appear without a redeploy.
export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/export", priority: 0.8, changeFrequency: "monthly" },
  { path: "/bali", priority: 0.8, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.7, changeFrequency: "monthly" },
  { path: "/process", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: absoluteUrl(p.path),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  try {
    const products = await getProductList("", "newest");
    for (const product of products) {
      entries.push({
        url: absoluteUrl(`/products/${product.slug}`),
        lastModified: product.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
        images: product.images.slice(0, 1).map((img) => absoluteUrl(img.imageUrl)),
      });
    }
  } catch (error) {
    // Database unreachable: still serve the static pages.
    console.error("sitemap: could not load products", error);
  }

  return entries;
}
