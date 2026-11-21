import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import { getProductList } from "@/lib/public-data";
import { SITE, SITE_URL, absoluteUrl, webPageStructuredData } from "@/lib/site";

export interface LandingQA {
  q: string;
  a: string;
}

export interface LandingStep {
  title: string;
  text: string;
}

/**
 * Shared layout for market landing pages (/bali, /export): intro copy, real
 * products from the catalog, ordering steps, always-visible Q&A and a CTA.
 */
export default async function MarketLandingPage({
  path,
  name,
  heroTitle,
  heroDescription,
  intro,
  productsHeading,
  productSlugs,
  stepsHeading,
  steps,
  qa,
  ctaTitle,
  ctaText,
  serviceName,
  areaServed,
}: {
  path: string;
  /** Short page name used in breadcrumbs and schema. */
  name: string;
  heroTitle: string;
  heroDescription: string;
  intro: ReactNode;
  productsHeading: string;
  /** Preferred products, shown first; the rest of the grid is filled from the catalog. */
  productSlugs: string[];
  stepsHeading: string;
  steps: LandingStep[];
  qa: LandingQA[];
  ctaTitle: string;
  ctaText: string;
  serviceName: string;
  areaServed: Record<string, unknown>[] | Record<string, unknown>;
}) {
  let products: Awaited<ReturnType<typeof getProductList>> = [];
  try {
    const all = await getProductList("", "newest");
    const preferred = productSlugs
      .map((slug) => all.find((p) => p.slug === slug))
      .filter((p): p is (typeof all)[number] => Boolean(p));
    products = preferred.length >= 4 ? preferred.slice(0, 8) : [...preferred, ...all.filter((p) => !preferred.includes(p))].slice(0, 4);
  } catch (error) {
    console.error(`${path}: could not load products`, error);
  }

  const whatsapp = `https://wa.me/${SITE.telephone.replace(/\D/g, "")}`;

  const structuredData = [
    ...webPageStructuredData({ type: "WebPage", path, name, description: heroDescription }),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${absoluteUrl(path)}#service`,
      name: serviceName,
      serviceType: "Handcrafted copper and brass fixtures made to order",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed,
      url: absoluteUrl(path),
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <JsonLd data={structuredData} />
      <PageHero title={heroTitle} description={heroDescription} fadeTo="#faf8f5" />

      {/* Intro */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-stone-700 text-base sm:text-lg leading-relaxed space-y-4 [&_strong]:text-stone-900 [&_a]:text-[#A8602A] [&_a]:underline [&_a]:underline-offset-2">
          {intro}
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section className="py-12 sm:py-16 bg-white border-y border-stone-200/70">
          <div className="container mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d]">{productsHeading}</h2>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#A8602A] hover:text-[#8a4e22]"
              >
                View all products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
            </div>
          </div>
        </section>
      )}

      {/* How ordering works */}
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-5 sm:px-8 lg:px-12">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8 sm:mb-10 max-w-3xl">
            {stepsHeading}
          </h2>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200/80">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#17120d] text-[#e5be9c] text-sm font-bold mb-4">
                  {i + 1}
                </span>
                <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Q&A: plain, always-visible text so search engines and AI assistants can read every answer */}
      <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8">
            Questions we often hear
          </h2>
          <dl className="space-y-7">
            {qa.map((item) => (
              <div key={item.q}>
                <dt className="font-bold text-stone-900 text-lg mb-2">{item.q}</dt>
                <dd className="text-stone-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-4">{ctaTitle}</h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-8">{ctaText}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
          <p className="mt-5 text-sm text-stone-500">
            Or email <a href={`mailto:${SITE.email}`} className="text-[#A8602A] underline underline-offset-2">{SITE.email}</a>
          </p>
        </div>
      </section>
    </main>
  );
}
