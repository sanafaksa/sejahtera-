import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { PRODUCTS_TAG } from "@/lib/public-data";
import { computeSeoForSave, normalizeSeoStatus, sanitizeOverrides, slugify } from "@/lib/product-seo";

// Define types for request body
type HighlightInput = {
  icon: string;
  text: string;
};

type ImageInput = {
  url: string;
  isFeatured: boolean;
  isCatalog: boolean;
};

type SpecificationInput = {
  size?: string;
  finishing?: string;
  material?: string;
  price?: string;
};

type SeoInput = {
  seoTitle?: string;
  metaDescription?: string;
  imageAlt?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  seoStatus?: string;
  seoOverrides?: string[];
};

type ProductCreateBody = {
  name: string;
  slug: string;
  description?: string;
  details?: string;
  notes?: string;
  specifications?: SpecificationInput;
  highlights: HighlightInput[];
  images: ImageInput[];
} & SeoInput;

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        highlights: true,
        specifications: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ProductCreateBody;
    const {
      name,
      description,
      details,
      notes,
      specifications,
      highlights,
      images,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: "Product name is required" }, { status: 400 });
    }

    // Normalise the slug server-side (SEO-friendly, never contains "Tumang").
    const slug = slugify(body.slug || name);
    if (!slug) {
      return NextResponse.json({ message: "Could not derive a valid slug" }, { status: 400 });
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    // Auto-generate SEO; admin-overridden fields keep their submitted value.
    const overrides = sanitizeOverrides(body.seoOverrides);
    const seoStatus = normalizeSeoStatus(body.seoStatus);
    const seo = computeSeoForSave(
      { name, slug, description, specifications },
      overrides,
      {
        seoTitle: body.seoTitle,
        metaDescription: body.metaDescription,
        imageAlt: body.imageAlt,
        ogTitle: body.ogTitle,
        ogDescription: body.ogDescription,
        canonicalUrl: body.canonicalUrl,
      }
    );

    // Create product with all related data
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        details,
        notes,
        seoTitle: seo.seoTitle,
        metaDescription: seo.metaDescription,
        imageAlt: seo.imageAlt,
        ogTitle: seo.ogTitle,
        ogDescription: seo.ogDescription,
        canonicalUrl: seo.canonicalUrl,
        seoStatus,
        seoOverrides: overrides,
        specifications:
          specifications &&
          (specifications.size ||
            specifications.finishing ||
            specifications.material ||
            specifications.price)
            ? {
                create: {
                  size: specifications.size,
                  finishing: specifications.finishing,
                  material: specifications.material,
                  price: specifications.price,
                },
              }
            : undefined,
        highlights: {
          create: highlights.map((h: HighlightInput) => ({
            icon: h.icon,
            text: h.text,
          })),
        },
        images: {
          create: images.map((img: ImageInput) => ({
            imageUrl: img.url,
            isFeatured: img.isFeatured,
            isCatalog: img.isCatalog,
          })),
        },
      },
      include: {
        specifications: true,
        highlights: true,
        images: true,
      },
    });

    revalidateTag(PRODUCTS_TAG);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
