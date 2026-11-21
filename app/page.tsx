import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import FadeInView from "@/components/animations/FadeInView";
import StaggerContainer, {
  StaggerItem,
} from "@/components/animations/StaggerContainer";
import CountUpNumber from "@/components/animations/CountUpNumber";
import {
  ArrowUpRight,
  Armchair,
  Hammer,
  Shield,
  Sparkles,
  Award,
  Users,
  Leaf,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  SiTiktok,
  SiInstagram,
  SiThreads,
} from "react-icons/si";
import { getProductList } from "@/lib/public-data";
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";
import { SITE, SITE_URL, absoluteUrl, pageMetadata } from "@/lib/site";
import HeroBathtubAnimated from "@/components/hero/HeroBathtubAnimated";

// Cards in the "Modern Copper For Stylish Interiors" banner.
const HERITAGE_CARDS = [
  {
    tag: "Artisan Tableware",
    title: "Hand-Hammered Copper Decor",
    image: "/assets/products/copper-1.jpg",
    alt: "Handcrafted Copper Credenza & Tableware",
  },
  {
    tag: "Living Accents",
    title: "Tumang Heritage Sculptures",
    image: "/assets/products/copper-5.jpg",
    alt: "Handcrafted Copper Living Furniture",
  },
  {
    tag: "Architectural",
    title: "Bespoke Hammered Basins",
    image: "/assets/products/copper-3.jpg",
    alt: "Handcrafted Copper Luxury Bath & Basin",
  },
];

// Decorative finish dots per card position (copper / brass tones).
const CARD_DOTS = [
  ["#b87333", "#e5be9c", "#5a341a"],
  ["#d4af37", "#b87333", "#2c1d11"],
  ["#b87333", "#8a5732", "#3a2213"],
  ["#d4af37", "#1c1c1c", "#b87333"],
];

// Products shown first on the home page, in this order (by slug).
export const metadata: Metadata = pageMetadata({
  title: null,
  description: SITE.description,
  path: "/",
});

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE_URL,
  logo: absoluteUrl(SITE.logo),
  email: SITE.email,
  telephone: SITE.telephone,
  sameAs: [SITE.social.instagram, SITE.social.threads, SITE.social.tiktok],
  description: SITE.description,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: SITE.email,
    telephone: SITE.telephone,
    availableLanguage: ["en", "id"],
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.country,
  },
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE.name,
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const HOME_FEATURED_SLUGS = [
  "imperial-nabawi-brass-grand-entrance-door",
  "tumang-fluted-copper-urn-planter",
  "sculptural-kaligrafi-copper-wall-panel",
  "artisanal-copper-countertop-wash-basin",
];
const HOME_CARD_COUNT = 4;

/**
 * Four product cards with the same data (images, names, prices) as the Products
 * page. The chosen slugs come first; missing ones are filled with the newest
 * products that have specifications, so unfinished test entries never show.
 */
async function getBestSellingProducts() {
  try {
    const all = await getProductList("", "newest");
    const bySlug = new Map(all.map((p) => [p.slug, p]));
    const picked = HOME_FEATURED_SLUGS.flatMap((slug) => bySlug.get(slug) ?? []);
    for (const p of all) {
      if (picked.length >= HOME_CARD_COUNT) break;
      if (p.specifications && !picked.includes(p)) picked.push(p);
    }
    return picked.slice(0, HOME_CARD_COUNT).map((p, i) => ({
      id: p.id,
      href: `/products/${p.slug}`,
      tag: p.specifications?.material || "Handcrafted Copper",
      colors: CARD_DOTS[i % CARD_DOTS.length],
      title: p.name,
      price: p.specifications?.price || "Made to Order",
      image: p.images[0]?.imageUrl ?? null,
    }));
  } catch (error) {
    console.warn("Failed to load best-selling products:", error);
    return [];
  }
}

export default async function Home() {
  const bestSellingProducts = await getBestSellingProducts();

  return (
    <main className="min-h-screen bg-[#faf6f1] text-[#1a120b]">
      <JsonLd data={[ORGANIZATION_LD, WEBSITE_LD]} />
      {/* =========================================================================
          HERO SECTION - EXACT MATCH TO REFERENCE MOCKUP
          ========================================================================= */}
      <section className="relative overflow-hidden bg-[#faf6f1] pt-24 sm:pt-28 lg:pt-32">
        {/* Semi-transparent showroom background image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=60"
            alt="Modern Showroom Living Interior Background"
            fill
            className="object-cover object-center opacity-22 filter saturate-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf6f1]/80 via-[#f8f2ea]/88 to-[#f3e7dc]/95 backdrop-blur-[0.5px]" />
          <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-gradient-to-br from-[#f8e6d5]/55 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Floating Vertical Social Media Dock on the far right edge */}
        <div className="hidden xl:flex flex-col items-center gap-3.5 absolute right-5 top-44 z-30">
          <a
            href={SITE.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-sm hover:shadow-md flex items-center justify-center text-stone-700 hover:text-[#b87333] transition-all hover:scale-110"
          >
            <SiTiktok className="w-3.5 h-3.5" />
          </a>
          <a
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-sm hover:shadow-md flex items-center justify-center text-stone-700 hover:text-[#b87333] transition-all hover:scale-110"
          >
            <SiInstagram className="w-3.5 h-3.5" />
          </a>
          <a
            href={SITE.social.threads}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Threads"
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-sm hover:shadow-md flex items-center justify-center text-stone-700 hover:text-[#b87333] transition-all hover:scale-110"
          >
            <SiThreads className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="container mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          {/* 1. Giant Bold Text Across The Top */}
          <FadeInView direction="up" delay={0.05}>
            <div className="overflow-visible mb-2 sm:mb-4">
              <h1 className="font-extrabold uppercase tracking-tight text-[#16120e] text-[12vw] sm:text-[10.5vw] lg:text-[7.2rem] xl:text-[8.4rem] leading-[0.88] select-none text-left font-display">
                CRAFTED LUXURY
                <span className="sr-only">: handcrafted copper and brass from Tumang, Indonesia</span>
              </h1>
            </div>
          </FadeInView>

          {/* 2. Middle Grid: Left Info & Right Majestic Copper Bathtub Asset */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-1 sm:pt-2">
            {/* Left Column: Avatars, Subheading, Description & Pill CTA */}
            <div className="lg:col-span-6 xl:col-span-5 text-left relative z-20">
              <FadeInView direction="up" delay={0.15}>
                <div className="flex items-center gap-3.5 mb-5 sm:mb-6">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    <img
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                      decoding="async"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="Customer 1"
                    />
                    <img
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                      decoding="async"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt="Customer 2"
                    />
                    <img
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm"
                      loading="lazy"
                      decoding="async"
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                      alt="Customer 3"
                    />
                  </div>
                  <div>
                    <span className="font-display font-bold text-stone-900 text-sm sm:text-base block leading-none">
                      125+
                    </span>
                    <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
                      Happy customers worldwide
                    </span>
                  </div>
                </div>
              </FadeInView>

              <FadeInView direction="up" delay={0.25}>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1a120b] leading-[1.12] mb-4">
                  Premium Copper Designed For Everyday Living
                </h2>
              </FadeInView>

              <FadeInView direction="up" delay={0.35}>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-8 max-w-lg">
                  Discover stylish copper pieces crafted for comfort, beauty, and durability. From bespoke bathtubs to modern fixtures, every piece is designed to elevate your home with timeless charm and practical function.
                </p>
              </FadeInView>

              <FadeInView direction="up" delay={0.45}>
                <div className="flex items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-3.5 pl-6 pr-2 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-300 group"
                  >
                    <span className="text-sm font-semibold text-stone-900 group-hover:text-[#b87333] transition-colors">
                      Contact Us
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#18100a] group-hover:bg-[#b87333] text-white flex items-center justify-center transition-colors shadow-sm">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </Link>

                  <Link
                    href="/products"
                    className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#b87333] underline-offset-4 hover:underline transition-colors px-2 py-2"
                  >
                    Browse Catalog
                  </Link>
                </div>
              </FadeInView>
            </div>

            {/* Right Column: User's Hero Asset #2 (Luxurious Handcrafted Copper Bathtub Cutout with Ambient Animation) */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center lg:justify-end overflow-visible pt-4 lg:pt-0">
              <FadeInView
                direction="up"
                delay={0.25}
                className="w-full flex justify-center lg:justify-end items-center relative z-20"
              >
                <HeroBathtubAnimated />
              </FadeInView>
            </div>
          </div>
        </div>

        {/* 3. Bottom Overlapping Dark Banner Card: rises into view on scroll */}
        <FadeInView direction="up" duration={0.9} className="relative z-20 mt-10 sm:mt-14 lg:mt-16">
          <div className="relative overflow-hidden bg-white text-[#1a120b] rounded-t-[38px] sm:rounded-t-[52px] lg:rounded-t-[60px] pt-14 sm:pt-18 lg:pt-20 pb-14 sm:pb-20 px-6 sm:px-10 lg:px-14 shadow-[0_-20px_50px_rgba(60,35,15,0.12)]">
            {/* Frosted white glass: faint copper/sage light behind a translucent pane */}
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              <div className="hero-glow-a absolute -top-24 left-[6%] w-[460px] h-[460px] rounded-full bg-[#e9b98a]/35 blur-[90px]" />
              <div className="hero-glow-b absolute -bottom-28 right-[8%] w-[520px] h-[520px] rounded-full bg-[#a9c7bc]/35 blur-[100px]" />
              <div className="hero-glow-c absolute top-[15%] left-[42%] w-[360px] h-[360px] rounded-full bg-[#f3d9a8]/30 blur-[90px]" />
              <div className="absolute inset-0 bg-[#f6f1eb]/90 backdrop-blur-2xl rounded-t-[38px] sm:rounded-t-[52px] lg:rounded-t-[60px] border-t border-x border-[#ebd7c6]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#f6ece1]/40" />
            </div>
            <div className="container mx-auto relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <FadeInView
                  direction="up"
                  delay={0.2}
                  className="lg:col-span-4 xl:col-span-4 flex flex-col justify-between space-y-6"
                >
                  <div>
                    <span className="text-[11px] font-semibold tracking-widest text-[#9e5b24] uppercase block mb-3">
                      Tumang Craft Heritage
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#17120d] leading-tight">
                      Modern Copper For Stylish Interiors
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#f6f1eb] shadow-[5px_5px_12px_rgba(166,138,110,0.35),-5px_-5px_12px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#b87333]">
                      <Armchair className="w-7 h-7 text-[#b87333]" />
                    </div>
                    <div>
                      <div className="font-display text-2xl sm:text-3xl font-bold text-[#17120d]">
                        150+
                      </div>
                      <div className="text-xs text-stone-500 font-medium">
                        Luxury items in stock
                      </div>
                    </div>
                  </div>
                </FadeInView>

                <div className="lg:col-span-8 xl:col-span-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                    {HERITAGE_CARDS.map((card, i) => (
                      <FadeInView key={card.title} direction="up" delay={0.35 + i * 0.15} className="h-full">
                        <div className="h-full rounded-[26px] bg-[#f6f1eb] p-4 text-[#1a120b] shadow-[10px_10px_24px_rgba(166,138,110,0.35),-10px_-10px_24px_rgba(255,255,255,0.95)] hover:shadow-[inset_6px_6px_14px_rgba(166,138,110,0.3),inset_-6px_-6px_14px_rgba(255,255,255,0.9)] transition-all duration-300 group flex flex-col justify-between">
                          <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-stone-100 mb-3 shadow-[inset_3px_3px_8px_rgba(166,138,110,0.3),inset_-3px_-3px_8px_rgba(255,255,255,0.8)]">
                            <Image
                              src={card.image}
                              alt={card.alt}
                              fill
                              className="object-cover group-hover:scale-108 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9e5b24] block mb-0.5">
                              {card.tag}
                            </span>
                            <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#b87333] transition-colors leading-snug">
                              {card.title}
                            </h4>
                          </div>
                        </div>
                      </FadeInView>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInView>

      </section>

      {/* =========================================================================
          SECTION 1 (FROM UPLOADED REFERENCE):
          "Relax In Style With Premium Seating"
          Adapted for Ilavioo: "Relax In Splendor With Artisanal Living"
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#faf6f1] relative overflow-hidden border-t border-stone-200/50">
        <div className="container mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Organic Warm Blob Shape with Floating Copper Product (Exact Mockup Match) */}
            <div className="lg:col-span-6 relative flex items-center justify-center w-full min-h-[340px] sm:min-h-[400px]">
              {/* Organic warm blob shape behind the product (Exact Mockup Match) */}
              <div className="absolute w-[90%] max-w-[440px] h-[280px] sm:h-[340px] bg-[#ecd8c7] rounded-[55%_45%_65%_35%/40%_60%_40%_60%] blur-[1px] -rotate-3 transition-transform duration-700 hover:rotate-0 shadow-sm" />

              {/* Main Product Cutout Container */}
              <div className="relative z-10 w-full max-w-[480px] h-[260px] sm:h-[320px] flex items-center justify-center p-2 group">
                <Image
                  src="/assets/hero-copper-bathtub.png"
                  alt="Handcrafted Luxury Copper Bath"
                  fill
                  className="object-contain filter drop-shadow-[0_20px_30px_rgba(40,20,10,0.22)] transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 95vw, 45vw"
                />

                {/* Floating Artisan Quality Badge (Exact Mockup Style) */}
                <div className="absolute bottom-1 right-2 sm:right-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200 shadow-md flex items-center gap-2 text-[11px] font-semibold text-stone-800">
                  <span className="w-2 h-2 rounded-full bg-[#b87333] animate-pulse" />
                  <span>100% Solid Red Copper</span>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Subtitle & Pill Button */}
            <div className="lg:col-span-6 text-left">
              <FadeInView direction="left" delay={0.25}>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#17120d] leading-tight mb-4">
                  Relax In Splendor With <br className="hidden sm:inline" />
                  Artisanal Living
                </h2>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
                  Experience timeless luxury and ergonomic warmth with our bespoke selection of hand-hammered copper bathtubs, sculpted basins, and refined accents. Elegant materials, organic patinas, and enduring quality built for modern sanctuaries.
                </p>
                <div>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-3.5 pl-6 pr-2 py-2 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-300 group"
                  >
                    <span className="text-sm font-semibold text-stone-900 group-hover:text-[#b87333] transition-colors">
                      Explore Living
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#18100a] group-hover:bg-[#b87333] text-white flex items-center justify-center transition-colors shadow-sm">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </Link>
                </div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 (FROM UPLOADED REFERENCE):
          "Best Selling Handcrafted Collection"
          Transparent Dark Luxury Background with Real Copper Craft Products in One Room
          ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#090705] text-white relative overflow-hidden">
        {/* Authentic showroom gallery background filled with copper craft products in one room */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/assets/copper-showroom-gallery.jpg"
            alt="Showroom Kerajinan Tembaga & Kuningan Ilavioo"
            fill
            className="object-cover object-center opacity-70 sm:opacity-75 filter saturate-125 contrast-105"
            sizes="100vw"
          />
          {/* Lighter, balanced dark translucent glass overlay so the room and products are vividly visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090705]/82 via-[#0a0705]/58 to-[#090705]/85 backdrop-blur-[0.5px]" />
          {/* Warm copper ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-[#b87333]/25 via-[#e2b078]/18 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
            <FadeInView direction="up">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                Best Selling Handcrafted Collection
              </h2>
              <p className="text-stone-200 text-xs sm:text-sm tracking-wide font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Exquisite hand-hammered copper and brass designs crafted to elevate residences, luxury villas, and sacred architecture.
              </p>
            </FadeInView>
          </div>

          {/* 4 Cards Grid (Exact Mockup Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12">
            {bestSellingProducts.map((product, idx) => (
              <FadeInView key={product.id} direction="up" delay={0.1 * idx}>
                <Link
                  href={product.href}
                  aria-label={`View ${product.title}`}
                  className="rounded-[28px] bg-[#fbf6f0]/95 p-4 sm:p-5 text-[#1a120b] shadow-[0_20px_45px_rgba(0,0,0,0.45)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.65)] backdrop-blur-md transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between border border-white/40 group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5be9c]"
                >
                  <div>
                    {/* Top Tag & Color Finish Dots */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#9e5b24] bg-white/80 px-2.5 py-1 rounded-full border border-[#ebd7c6]/80 line-clamp-1">
                        {product.tag}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {product.colors.map((color, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product Image Frame */}
                    <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-white/70 mb-4 flex items-center justify-center p-2">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-108 transition-transform duration-500 rounded-xl"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <span className="text-xs text-stone-400">No image</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-base font-bold text-[#17120d] group-hover:text-[#b87333] transition-colors leading-snug mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-4 mt-3 border-t border-[#f0e4d7] flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700 line-clamp-1">
                      {product.price}
                    </span>
                    <span
                      aria-hidden
                      className="w-8 h-8 rounded-full bg-[#17120d] group-hover:bg-[#b87333] text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </FadeInView>
            ))}
          </div>

          {/* Bottom Center Pill CTA (Exact Mockup Match) */}
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white hover:bg-stone-50 text-[#17120d] border border-stone-200 shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <span className="text-xs sm:text-sm font-semibold tracking-wide">
                View All Collections
              </span>
              <span className="w-8 h-8 rounded-full bg-[#18100a] group-hover:bg-[#b87333] text-white flex items-center justify-center transition-colors shadow-sm">
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 (FROM UPLOADED REFERENCE):
          "Beautiful Spaces Begin With Better Furniture"
          Adapted for Ilavioo: "Beautiful Spaces Begin With Master Copper Craft"
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#faf6f1] relative overflow-hidden border-t border-stone-200/50">
        <div className="container mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Large Showcase Photo of Luxury Interior Living */}
            <div className="lg:col-span-5">
              <FadeInView direction="right" delay={0.15}>
                <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border border-stone-200/80">
                  <Image
                    src="/assets/hero.jpg"
                    alt="Luxury Interior with Handcrafted Copper Craft"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#eed3bf] block mb-1">
                      Curated Ambience
                    </span>
                    <p className="font-display text-lg font-bold">
                      Bespoke Copper Installations for Private Estates
                    </p>
                  </div>
                </div>
              </FadeInView>
            </div>

            {/* Right Column: Title, Subtitle, Pill Button & Horizontal Living Ensemble */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <FadeInView direction="left" delay={0.25}>
                <div className="mb-8">
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#17120d] leading-tight mb-4">
                    Beautiful Spaces Begin With <br className="hidden sm:inline" />
                    Master Copper Craft
                  </h2>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                    Transform your sanctuary with statement pieces that carry generations of Javanese metalcraft heritage. Every hammer strike creates living organic texture and iridescent light reflection that no factory machine can ever replicate.
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-3.5 pl-6 pr-2 py-2 rounded-full bg-[#17120d] hover:bg-[#b87333] text-white transition-all duration-300 group shadow-md"
                  >
                    <span className="text-sm font-semibold tracking-wide">
                      Our Craftsmanship
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white text-[#17120d] flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </Link>
                </div>

                {/* Bottom Cutout of Living Copper Furniture Ensemble (Exact Mockup Match) */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden mt-4 group">
                  <Image
                    src="/assets/copper-hero-craft.jpg"
                    alt="Handcrafted Copper Living Furniture & Decor Ensemble"
                    fill
                    className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-lg"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl" />
                </div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 (FROM UPLOADED REFERENCE):
          "Bring Comfort And Elegance Into Your Home..."
          Dark Background with 3 Tall Column Editorial Cards
          ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0c0a08] text-white relative overflow-hidden border-t border-white/10">
        {/* Semi-transparent background showing copper craft workshop & creations */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/assets/about.jpg"
            alt="Artisanal Workshop & Copper Crafts"
            fill
            className="object-cover object-center opacity-22 filter saturate-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a08]/95 via-[#0c0a08]/80 to-[#0c0a08]/96" />
        </div>

        <div className="container mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          {/* Centered Large Headline (Exact Mockup Match) */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <FadeInView direction="up">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-relaxed">
                Bring Comfort And Elegance Into Your Home With Beautifully Crafted Copper Designed For Modern Lifestyles And Timeless Interiors.
              </h2>
            </FadeInView>
          </div>

          {/* 3 Large Column Editorial Cards (Exact Mockup Match) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {/* Card 1: Living & Garden Accents */}
            <FadeInView direction="up" delay={0.1}>
              <div className="flex flex-col group">
                <div className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-white/10 mb-4 shadow-xl">
                  <Image
                    src="/assets/products/copper-5.jpg"
                    alt="Hand-hammered copper planter with a monstera"
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-white group-hover:text-[#e2b078] transition-colors mb-2">
                  Living & Garden Accents
                </h3>
                <p className="text-sm sm:text-[15px] text-stone-300 leading-relaxed max-w-sm">
                  Hand-hammered copper planters and vessels that bring warmth and a living patina to homes, terraces and hotel lobbies.
                </p>
              </div>
            </FadeInView>

            {/* Card 2: Decor & Tableware */}
            <FadeInView direction="up" delay={0.2}>
              <div className="flex flex-col group">
                <div className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-white/10 mb-4 shadow-xl">
                  <Image
                    src="/assets/hero-2.jpg"
                    alt="Copper and brass decor, bowls and vessels in the Ilavioo showroom"
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-white group-hover:text-[#e2b078] transition-colors mb-2">
                  Decor & Tableware
                </h3>
                <p className="text-sm sm:text-[15px] text-stone-300 leading-relaxed max-w-sm">
                  Wall art, mirrors, bowls and serving pieces in copper and brass, each finished by hand to make a room feel welcoming.
                </p>
              </div>
            </FadeInView>

            {/* Card 3: Made by Tumang Artisans */}
            <FadeInView direction="up" delay={0.3}>
              <div className="flex flex-col group">
                <div className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-white/10 mb-4 shadow-xl">
                  <Image
                    src="/assets/products/copper-3.jpg"
                    alt="A Tumang artisan hand-hammering a copper vessel"
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-white group-hover:text-[#e2b078] transition-colors mb-2">
                  Made by Tumang Artisans
                </h3>
                <p className="text-sm sm:text-[15px] text-stone-300 leading-relaxed max-w-sm">
                  Every piece is shaped in our Boyolali workshop by coppersmiths using techniques passed down through generations.
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ SECTION (FREQUENTLY ASKED QUESTIONS - PERTANYAAN YANG SERING DIAJUKAN)
          ========================================================================= */}
      <FaqSection />
    </main>
  );
}
