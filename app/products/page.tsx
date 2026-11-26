import { getProductList } from "@/lib/public-data";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import CollectionNav from "@/components/CollectionNav";
import { absoluteUrl, pageMetadata, webPageStructuredData } from "@/lib/site";
import ProductCard from "@/components/ProductCard";
import FadeInView from "@/components/animations/FadeInView";
import StaggerContainer, {
  StaggerItem,
} from "@/components/animations/StaggerContainer";
import ProductsFilter from "@/components/products/ProductsFilter";
import PageHero from "@/components/PageHero";
import { Suspense } from "react";
import { Package, Sparkles } from "lucide-react";
import Link from "next/link";
import HeroBackdrop from "@/components/HeroBackdrop";

// Dynamic because of searchParams; data itself comes from the tagged cache.
export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  sort?: string;
}

async function getProducts(searchParams: SearchParams) {
  try {
    return await getProductList(
      (searchParams.search ?? "").trim(),
      searchParams.sort ?? "newest"
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

const PRODUCTS_META = pageMetadata({
  title: "Handcrafted Copper & Brass Products",
  description:
    "Explore handcrafted copper and brass bathtubs, basins, lighting, doors and decor from Tumang, Indonesia. Bespoke sizes and worldwide shipping.",
  path: "/products",
  keywords: ["copper bathtubs","copper sinks","brass doors","copper lamps","copper home decor","buy handmade copper"],
});

// Search and sort views are thin duplicates of /products: keep them out of the index.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Boolean(params.search?.trim()) || Boolean(params.sort);
  return filtered ? { ...PRODUCTS_META, robots: { index: false, follow: true } } : PRODUCTS_META;
}

function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

async function ProductsList({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);

  if (products.length === 0) {
    const hasSearch = params.search;

    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
            {hasSearch ? "No Products Found" : "No Products Available Yet"}
          </h3>
          <p className="text-gray-600 mb-8">
            {hasSearch
              ? `We couldn't find any products matching "${params.search}". Try adjusting your search.`
              : "Stay tuned for our exquisite handcrafted copper pieces! We're preparing something special for you."}
          </p>
          {hasSearch ? (
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-[#b87333] hover:bg-[#a0632a] text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Products
            </Link>
          ) : (
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-[#b87333] hover:bg-[#a0632a] text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Request Custom Order
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard
            name={product.name}
            slug={product.slug}
            description={product.description}
            imageUrl={product.images[0]?.imageUrl || "/placeholder-product.jpg"}
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
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);
  const isFiltered = Boolean(params.search?.trim()) || Boolean(params.sort);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {!isFiltered && (
        <JsonLd
          data={webPageStructuredData({
            type: "CollectionPage",
            path: "/products",
            name: "Products",
            description:
              "Handcrafted copper and brass bathtubs, basins, lighting, doors and decor from Tumang, Indonesia.",
            extra: {
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: products.length,
                itemListElement: products.map((product, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: absoluteUrl(`/products/${product.slug}`),
                  name: product.name,
                })),
              },
            },
          })}
        />
      )}
      <PageHero
        title="Copper & Brass Products"
        description="Discover bespoke architectural fixtures, soaking tubs, chandeliers, and vessels forged by master artisans from Tumang, Boyolali."
        fadeTo="#faf8f5"
      >
        <ProductsFilter />
      </PageHero>

      <CollectionNav className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2" />

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense
            key={JSON.stringify(params)}
            fallback={<ProductsLoadingSkeleton />}
          >
            <ProductsList searchParams={searchParams} />
          </Suspense>

          {products.length > 0 && (
            <FadeInView direction="up" className="mt-16">
              <div className="bg-[#3E2723] rounded-3xl px-6 py-12 sm:p-12 text-white text-center relative overflow-hidden">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                  <HeroBackdrop />
                </div>
                <div className="relative z-10">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                    Can&apos;t Find What You&apos;re Looking For?
                  </h2>
                  <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                    We specialize in custom copper crafts tailored to your
                    unique specifications. Let&apos;s create something
                    extraordinary together.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-[#17120d] hover:bg-[#faf6f1] rounded-full font-semibold shadow-lg shadow-black/15 transition-colors duration-300"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Request Custom Design
                    </Link>
                    <Link
                      href="/gallery"
                      className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold transition-colors duration-300 ring-1 ring-white/35"
                    >
                      View Gallery
                    </Link>
                  </div>
                </div>
              </div>
            </FadeInView>
          )}
        </div>
      </section>
    </main>
  );
}
