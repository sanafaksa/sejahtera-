import { Metadata } from "next";
import { pageMetadata, webPageStructuredData } from "@/lib/site";
import FadeInView from "@/components/animations/FadeInView";
import Link from "next/link";
import { getGalleryAssets } from "@/lib/public-data";
import ModernMosaicGallery, { GalleryAssetItem } from "@/components/gallery/ModernMosaicGallery";
import InstagramFeed, { INSTAGRAM_EMBED_URL } from "@/components/gallery/InstagramFeed";
import { ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import HeroBackdrop from "@/components/HeroBackdrop";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Gallery: Copper & Brass Projects",
  description:
    "Explore our authentic copper and brass architectural, interior, and luxury bath masterpieces from Tumang, Boyolali.",
  path: "/gallery",
  keywords: ["copper bathroom ideas","copper interior design","brass door design","copper project gallery"],
  images: [{ url: "/assets/copper-showroom-gallery.jpg", alt: "Ilavioo copper showroom gallery" }],
});

async function getGalleryItems(): Promise<GalleryAssetItem[]> {
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    if (
      !dbUrl ||
      dbUrl.includes("[YOUR-PROJECT-REF]") ||
      dbUrl.includes("[YOUR-PASSWORD]")
    ) {
      return [];
    }

    const rawItems = await getGalleryAssets();

    return rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      type: (item.type === "video" ? "video" : "image") as "image" | "video",
      category: item.category,
      tags: item.tags || [],
      isFeatured: Boolean(item.isFeatured),
    }));
  } catch (error) {
    console.warn("Gallery assets fetch:", error);
    return [];
  }
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="bg-[#faf8f5] pb-24">
      <JsonLd
        data={webPageStructuredData({
          type: "CollectionPage",
          path: "/gallery",
          name: "Gallery",
          description:
            "Photos of handcrafted copper and brass architectural, interior and bath pieces made in Tumang, Indonesia.",
        })}
      />
      <PageHero
        title="Gallery"
        description="Explore our handcrafted copper and brass installations, showcasing decades of artisanal excellence and timeless design."
        fadeTo="#faf8f5"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8 sm:pt-12">
        {INSTAGRAM_EMBED_URL ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-copper-600">
                  Live from Instagram
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2c1609] mt-1">
                  Our Latest Work
                </h2>
              </div>
              <a
                href="https://www.instagram.com/ilavioocopper_art/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full copper-metal text-white text-xs font-bold uppercase tracking-wider relative overflow-hidden hover:brightness-[1.06] transition-[filter] self-start sm:self-auto"
              >
                <Instagram className="w-4 h-4" />
                <span>@ilavioocopper_art</span>
              </a>
            </div>
            <InstagramFeed />
          </>
        ) : (
          /* Modern Mosaic Gallery (database) — fallback until the IG widget is configured */
          <ModernMosaicGallery initialItems={items} />
        )}

        {/* Refined Bespoke Custom Work CTA */}
        <div className="mt-20 pt-12 border-t border-stone-200/80">
          <FadeInView direction="up">
            <div className="bg-[#3E2723] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <HeroBackdrop />
              </div>
              <div className="relative z-10 max-w-xl text-center md:text-left">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5be9c]">
                  Bespoke Architectural Craftsmanship
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-3">
                  Have a Custom Design in Mind?
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Every piece in our gallery can be customized to your architectural drawings and specifications. Consult directly with our master copper smiths in Tumang, Boyolali.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3.5 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full copper-metal text-white text-xs font-bold uppercase tracking-wider relative overflow-hidden hover:brightness-[1.06] transition-[filter]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire Custom Work</span>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full leather-texture text-[#f3e3d2] text-xs font-bold uppercase tracking-wider relative overflow-hidden transition-[filter] ring-1 ring-white/25 hover:brightness-110"
                >
                  <span>Explore Catalog</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </div>
  );
}
