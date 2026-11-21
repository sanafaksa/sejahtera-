import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import CollectionNav from "@/components/CollectionNav";
import JsonLd from "@/components/JsonLd";
import { getProductList } from "@/lib/public-data";
import { CATEGORIES, getCategory, productsInCategory } from "@/lib/categories";
import { SITE, absoluteUrl, pageMetadata, webPageStructuredData } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return {};
  return pageMetadata({ title: c.title, description: c.description, path: `/collections/${c.slug}`, keywords: c.keywords });
}

export default async function CollectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();

  let products: Awaited<ReturnType<typeof getProductList>> = [];
  try {
    products = productsInCategory(await getProductList("", "newest"), c.slug);
  } catch (error) {
    console.error(`/collections/${c.slug}: could not load products`, error);
  }

  const path = `/collections/${c.slug}`;
  const whatsapp = `https://wa.me/${SITE.telephone.replace(/\D/g, "")}`;
  const others = CATEGORIES.filter((o) => o.slug !== c.slug);

  const structuredData = webPageStructuredData({
    type: "CollectionPage",
    path,
    name: c.name,
    description: c.description,
    parents: [{ name: "Products", path: "/products" }],
    extra: {
      keywords: c.keywords.join(", "),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(`/products/${p.slug}`),
          name: p.name,
        })),
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <JsonLd data={structuredData} />
      <PageHero title={c.heading} description={c.description} fadeTo="#faf8f5">
        <CollectionNav active={c.slug} />
      </PageHero>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-5 sm:px-8 lg:px-12 pt-2 pb-6 text-sm text-stone-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-[#A8602A]">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/products" className="hover:text-[#A8602A]">Products</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-stone-800 font-medium" aria-current="page">{c.name}</li>
        </ol>
      </nav>

      {/* Intro */}
      <section className="pb-10 sm:pb-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-stone-700 text-base sm:text-lg leading-relaxed space-y-4">
          {c.intro.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-12 sm:py-16 bg-white border-y border-stone-200/70">
        <div className="container mx-auto px-5 sm:px-8 lg:px-12">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8">
            {c.name} in our catalog
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  slug={product.slug}
                  description={product.description}
                  imageUrl={product.images[0]?.imageUrl || "/assets/copper-showroom-gallery.jpg"}
                  specifications={product.specifications}
                />
              ))}
              <Link
                href="/contact"
                className="group flex flex-col justify-center rounded-2xl border-2 border-dashed border-[#b87333]/40 bg-[#fdf6ee] p-6 text-center hover:border-[#b87333] transition-colors min-h-[220px]"
              >
                <span className="font-display text-xl font-bold text-[#17120d] mb-2">Need a different design?</span>
                <span className="text-sm text-stone-600 mb-4">
                  Send a photo, sketch or drawing and we will make it to your size.
                </span>
                <span className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#A8602A]">
                  Request a custom piece <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          ) : (
            <p className="text-stone-600">
              Pieces in this collection are made to order. <Link href="/contact" className="text-[#A8602A] underline underline-offset-2">Tell us what you need</Link> and we will send ideas and a quotation.
            </p>
          )}
        </div>
      </section>

      {/* Buying guide */}
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-5 sm:px-8 lg:px-12">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8 sm:mb-10 max-w-3xl">
            {c.guideHeading}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.guide.map((g) => (
              <div key={g.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
                <h3 className="font-bold text-stone-900 mb-2">{g.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Q&A: always-visible text */}
      <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8">
            {c.name}: questions we often hear
          </h2>
          <dl className="space-y-7">
            {c.qa.map((item) => (
              <div key={item.q}>
                <dt className="font-bold text-stone-900 text-lg mb-2">{item.q}</dt>
                <dd className="text-stone-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Other collections + CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#17120d] mb-3">Planning a project?</h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-8">
            We make pieces for homes, hotels and villas in Bali and in{" "}
            <Link href="/export" className="text-[#A8602A] underline underline-offset-2">more than 16 countries</Link>. Tell us
            what you need and we will reply with a quotation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#17120d] text-white font-semibold hover:bg-[#2a2018] transition-colors"
            >
              Request a quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-stone-900 font-semibold ring-1 ring-stone-300 hover:ring-[#A8602A] transition"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp us
            </a>
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">Other collections</h3>
          <ul className="flex flex-wrap justify-center gap-2.5">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/collections/${o.slug}`}
                  className="inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 hover:ring-[#b87333]/60 hover:text-[#A8602A] transition-colors"
                >
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
