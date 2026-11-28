import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { PRODUCTS_TAG } from "@/lib/public-data";
import { cloudinary } from "@/lib/cloudinary";
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

type ProductUpdateBody = {
  name: string;
  slug: string;
  description?: string;
  details?: string;
  notes?: string;
  specifications?: SpecificationInput;
  highlights: HighlightInput[];
  images: ImageInput[];
} & SeoInput;

// ✅ FIXED: GET single product - params is now Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
        highlights: true,
        specifications: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ✅ FIXED: PUT update product - params is now Promise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ✅ await params
    const body = (await request.json()) as ProductUpdateBody;
    const {
      name,
      description,
      details,
      notes,
      specifications,
      highlights,
      images,
    } = body;

    const productId = parseInt(id);

    if (!name?.trim()) {
      return NextResponse.json({ message: "Product name is required" }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const slug = slugify(body.slug || name);
    if (!slug) {
      return NextResponse.json({ message: "Could not derive a valid slug" }, { status: 400 });
    }

    // Check if slug is taken by another product
    if (slug !== existingProduct.slug) {
      const slugTaken = await prisma.product.findUnique({
        where: { slug },
      });
      if (slugTaken) {
        return NextResponse.json(
          { message: "Product with this slug already exists" },
          { status: 400 }
        );
      }
      // Keep the old URL alive with a 301, and never redirect the new slug to itself.
      await prisma.productSlugHistory.upsert({
        where: { slug: existingProduct.slug },
        create: { slug: existingProduct.slug, productId },
        update: { productId },
      });
      await prisma.productSlugHistory.deleteMany({ where: { slug } });
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

    // Delete existing related data
    await prisma.productHighlight.deleteMany({
      where: { productId },
    });
    await prisma.productImage.deleteMany({
      where: { productId },
    });
    await prisma.productSpecification.deleteMany({
      where: { productId },
    });

    // Update product with new data
    const product = await prisma.product.update({
      where: { id: productId },
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
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ✅ FIXED: DELETE product - params is now Promise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ✅ await params
    const productId = parseInt(id);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Clean up images from Cloudinary if applicable
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.imageUrl.includes("res.cloudinary.com")) {
          try {
            const parts = img.imageUrl.split("/upload/");
            if (parts[1]) {
              const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
              const publicId = pathWithoutVersion.substring(
                0,
                pathWithoutVersion.lastIndexOf(".")
              );
              await cloudinary.uploader.destroy(publicId);
            }
          } catch (e) {
            console.warn("Cloudinary product image cleanup warning:", e);
          }
        }
      }
    }

    // Delete product (cascade will handle related data)
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidateTag(PRODUCTS_TAG);
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
