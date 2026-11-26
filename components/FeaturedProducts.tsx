import { getFeaturedProducts as getFeaturedProductsCached } from "@/lib/public-data";
import ProductCard from "./ProductCard";
import Link from "next/link";
import StaggerContainer, { StaggerItem } from "./animations/StaggerContainer";
import { ChevronRight } from "lucide-react";

async function getFeaturedProducts() {
  try {
    return await getFeaturedProductsCached();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <StaggerItem key={product.id}>
            <ProductCard
              name={product.name}
              slug={product.slug}
              description={product.description}
              imageUrl={
                product.images[0]?.imageUrl || "/placeholder-product.jpg"
              }
              specifications={
                product.specifications
                  ? {
                      size: product.specifications.size,
                      finishing: product.specifications.finishing,
                      material: product.specifications.material,
                      price: product.specifications.price,
                    }
                  : null
              }
            />
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="text-center">
        <Link
          href="/products"
          className="inline-flex items-center px-8 py-4 copper-metal text-white rounded-full font-semibold relative overflow-hidden transition-[filter] duration-300 hover:brightness-[1.06]"
        >
          View All Products
          <ChevronRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </>
  );
}
