import { prisma } from "@/lib/prisma";
import { parsePrice } from "@/lib/invoice/calc";
import type { CatalogProduct } from "@/components/admin/invoice/InvoiceForm";

export async function loadCatalog(): Promise<CatalogProduct[]> {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, description: true, specifications: { select: { price: true } } },
      orderBy: { name: "asc" },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceText: p.specifications?.price ?? null,
      price: parsePrice(p.specifications?.price),
    }));
  } catch (error) {
    console.warn("Failed to load catalog for invoices:", error);
    return [];
  }
}
