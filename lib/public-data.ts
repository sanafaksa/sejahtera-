import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Cached reads for the public website.
 *
 * The database is far from the visitor, so public pages read through Next's
 * data cache instead of hitting Postgres on every request. Admin API routes
 * call `revalidateTag(...)` after every create/update/delete, so changes show
 * up immediately; the time-based revalidate is only a safety net.
 *
 * Note: cached values are JSON-serialised, so Date fields come back as
 * strings. Public pages only use dates for ordering inside the query.
 */

export const PRODUCTS_TAG = "products";
export const GALLERY_TAG = "gallery";

const REVALIDATE_SECONDS = 3600;

const cardImages = {
  orderBy: [
    { isCatalog: "desc" as const },
    { isFeatured: "desc" as const },
    { id: "asc" as const },
  ],
  take: 1,
};

export type ProductSort = "newest" | "oldest" | "name-asc" | "name-desc";

function orderByFor(sort?: string) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "name-asc":
      return { name: "asc" as const };
    case "name-desc":
      return { name: "desc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}

export const getProductList = unstable_cache(
  async (search: string, sort: string) => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    return prisma.product.findMany({
      where,
      include: { images: cardImages, specifications: true },
      orderBy: orderByFor(sort),
    });
  },
  ["public-product-list"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE_SECONDS }
);

export const getFeaturedProducts = unstable_cache(
  async () =>
    prisma.product.findMany({
      take: 4,
      include: { images: cardImages, specifications: true },
      orderBy: { createdAt: "desc" },
    }),
  ["public-featured-products"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE_SECONDS }
);

export const getProductBySlug = unstable_cache(
  async (slug: string) =>
    prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { id: "asc" } },
        specifications: true,
        highlights: true,
      },
    }),
  ["public-product-by-slug"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE_SECONDS }
);

export const getRelatedProducts = unstable_cache(
  async (currentProductId: number) =>
    prisma.product.findMany({
      where: { NOT: { id: currentProductId } },
      take: 4,
      include: { images: cardImages, specifications: true },
      orderBy: { createdAt: "desc" },
    }),
  ["public-related-products"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE_SECONDS }
);

export const getGalleryAssets = unstable_cache(
  async () =>
    prisma.galleryAsset.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ["public-gallery-assets"],
  { tags: [GALLERY_TAG], revalidate: REVALIDATE_SECONDS }
);
