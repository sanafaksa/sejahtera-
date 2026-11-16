import { Metadata } from "next";
import FadeInView from "@/components/animations/FadeInView";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ModernMosaicGallery, { GalleryAssetItem } from "@/components/gallery/ModernMosaicGallery";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Gallery | Ilavio - Tumang Copper Crafts",
  description:
    "Explore our authentic copper and brass architectural, interior, and luxury bath masterpieces from Tumang, Boyolali.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const rawItems = await prisma.galleryAsset.findMany({
      orderBy: { createdAt: "desc" },
    });

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
      <PageHero
        title="Gallery"
        description="Explore our handcrafted copper and brass installations, showcasing decades of artisanal excellence and timeless design."
        fadeTo="#faf8f5"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8 sm:pt-12">
        {/* Modern Mosaic Gallery */}
        <ModernMosaicGallery initialItems={items} />

        {/* Refined Bespoke Custom Work CTA */}
        <div className="mt-20 pt-12 border-t border-stone-200/80">
          <FadeInView direction="up">
            <div className="bg-[#17120d] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div className="relative z-10 max-w-xl text-center md:text-left">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5be9c]">
                  Bespoke Architectural Craftsmanship
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-3">
                  Have a Custom Design in Mind?
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed">
                  Every piece in our gallery can be customized to your architectural drawings and specifications. Consult directly with our master copper smiths in Tumang, Boyolali.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3.5 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#b87333] hover:bg-[#a0632a] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire Custom Work</span>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
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
