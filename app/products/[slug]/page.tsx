import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { SITE, SITE_URL, absoluteUrl, metaDescription, pageMetadata } from "@/lib/site";
import { getProductBySlug, getProductList } from "@/lib/public-data";
import { categorizeProduct } from "@/lib/categories";
import { notFound } from "next/navigation";
import Link from "next/link";
import FadeInView from "@/components/animations/FadeInView";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductTabs from "@/components/products/ProductTabs";
import RelatedProducts from "@/components/products/RelatedProducts";
import {
  ArrowLeft,
  Package,
  Ruler,
  Sparkles,
  Tag,
  Shield,
  Mail,
  Phone,
  CheckCircle,
} from "lucide-react";

async function getProduct(slug: string) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return product;
}

/** Up to 4 other products, same collection first, then the newest. */
async function getRelatedProducts(current: { id: number; name: string; slug: string }) {
  try {
    const all = (await getProductList("", "newest")).filter((p) => p.id !== current.id);
    const category = categorizeProduct(current).slug;
    const same = all.filter((p) => categorizeProduct(p).slug === category);
    const rest = all.filter((p) => categorizeProduct(p).slug !== category);
    return [...same, ...rest].slice(0, 4);
  } catch (error) {
    console.error("related products:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  const description = metaDescription(
    product.description || `Handcrafted ${product.name} from Tumang, Indonesia.`
  );
  const images = product.images.slice(0, 1).map((img) => ({
    url: img.imageUrl,
    alt: product.name,
  }));
  return pageMetadata({
    title: product.name,
    description,
    path: `/products/${product.slug}`,
    images,
    keywords: [product.name, ...categorizeProduct(product).keywords],
  });
}

type DetailProduct = Awaited<ReturnType<typeof getProduct>>;

/** schema.org Product + BreadcrumbList. Prices are quoted on request, so no Offer is emitted. */
function productStructuredData(product: DetailProduct) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const category = categorizeProduct(product);
  const spec = product.specifications;
  const additionalProperty = [
    spec?.size && { "@type": "PropertyValue", name: "Size", value: spec.size },
    spec?.finishing && { "@type": "PropertyValue", name: "Finishing", value: spec.finishing },
  ].filter(Boolean);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name: product.name,
      url,
      ...(product.description ? { description: product.description } : {}),
      ...(product.images.length
        ? { image: product.images.slice(0, 6).map((img) => absoluteUrl(img.imageUrl)) }
        : {}),
      ...(spec?.material ? { material: spec.material } : {}),
      ...(additionalProperty.length ? { additionalProperty } : {}),
      brand: { "@type": "Brand", name: SITE.name },
      manufacturer: { "@id": `${SITE_URL}/#organization` },
      countryOfOrigin: "ID",
      category: category.name,
      keywords: [product.name, ...category.keywords].join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/products") },
        { "@type": "ListItem", position: 3, name: category.name, item: absoluteUrl(`/collections/${category.slug}`) },
        { "@type": "ListItem", position: 4, name: product.name, item: url },
      ],
    },
  ];
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const relatedProducts = await getRelatedProducts(product);
  const category = categorizeProduct(product);

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50">
      <JsonLd data={productStructuredData(product)} />
      {/* Breadcrumb Section (top padding clears the fixed header) */}
      <section className="bg-white border-b border-gray-100 pt-16 md:pt-[78px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-2 text-sm text-gray-600">
                <Link
                  href="/"
                  className="hover:text-green-600 transition-colors"
                >
                  Home
                </Link>
                <span>/</span>
                <Link
                  href="/products"
                  className="hover:text-green-600 transition-colors"
                >
                  Products
                </Link>
                <span>/</span>
                <Link
                  href={`/collections/${category.slug}`}
                  className="hover:text-green-600 transition-colors whitespace-nowrap"
                >
                  {category.name}
                </Link>
                <span className="hidden sm:inline">/</span>
                <span className="hidden sm:inline text-gray-900 font-semibold line-clamp-1">
                  {product.name}
                </span>
              </nav>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#b87333] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Products</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Image Gallery */}
            <FadeInView direction="left">
              <ProductImageGallery
                images={product.images}
                productName={product.name}
              />
            </FadeInView>

            {/* Right Column - Product Info */}
            <FadeInView direction="right">
              <div className="lg:sticky lg:top-24">
                {/* Product Title */}
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Product Description */}
                {product.description && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Price Badge */}
                {product.specifications?.price && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#17120d] text-[#e5be9c] border border-[#b87333]/40 rounded-full shadow-sm">
                      <Tag className="w-4 h-4 text-[#e5be9c]" />
                      <span className="text-sm sm:text-base font-semibold tracking-wide">
                        {product.specifications.price}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 italic">
                      *Bespoke sizing available
                    </span>
                  </div>
                )}

                {/* Specifications Grid */}
                {product.specifications && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
                    {product.specifications.size && (
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Ruler className="w-5 h-5 text-[#b87333]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Size</p>
                          <p className="font-semibold text-gray-900 break-words">
                            {product.specifications.size}
                          </p>
                        </div>
                      </div>
                    )}

                    {product.specifications.finishing && (
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-[#b87333]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Finishing</p>
                          <p className="font-semibold text-gray-900 break-words">
                            {product.specifications.finishing}
                          </p>
                        </div>
                      </div>
                    )}

                    {product.specifications.material && (
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-[#b87333]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Material</p>
                          <p className="font-semibold text-gray-900 break-words">
                            {product.specifications.material}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Highlights */}
                {product.highlights && product.highlights.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#b87333]" />
                      Key Features
                    </h3>
                    <ul className="space-y-3">
                      {product.highlights.map((highlight) => (
                        <li
                          key={highlight.id}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="w-5 h-5 text-[#b87333] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {highlight.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 copper-metal text-white rounded-full font-semibold relative overflow-hidden transition-[filter] duration-300 hover:brightness-[1.06]"
                  >
                    <Mail className="w-5 h-5" />
                    Request Quote
                  </Link>
                  <a
                    href="tel:+6281213696772"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-stone-50 text-gray-900 border border-stone-300 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Phone className="w-5 h-5" />
                    Call Us
                  </a>
                </div>
              </div>
            </FadeInView>
          </div>

          {/* Product Tabs - Details, Notes, etc */}
          <FadeInView direction="up">
            <ProductTabs
              details={product.details}
              notes={product.notes}
              specifications={product.specifications}
            />
          </FadeInView>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInView direction="up">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                  You May Also Like
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Related Products
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Explore more exquisite copper pieces from our collection
                </p>
              </div>
            </FadeInView>

            <RelatedProducts products={relatedProducts} />
          </div>
        </section>
      )}
    </main>
  );
}
