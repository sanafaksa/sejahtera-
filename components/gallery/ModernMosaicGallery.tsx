"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  LayoutGrid,
  DoorClosed,
  Bath,
  Sparkles,
  Layers,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type GalleryAssetItem = {
  id: number;
  title: string | null;
  description: string | null;
  url: string;
  type: "image" | "video";
  category: string | null;
  tags: string[];
  isFeatured: boolean;
};

interface Props {
  initialItems?: GalleryAssetItem[];
}

const CATEGORIES = [
  { id: "all", label: "ALL COLLECTIONS", icon: LayoutGrid },
  { id: "architectural", label: "ARCHITECTURAL & DOORS", icon: DoorClosed },
  { id: "bath", label: "LUXURY BATH & SANCTUARY", icon: Bath },
  { id: "lighting", label: "LIGHTING & CHANDELIERS", icon: Sparkles },
  { id: "interior", label: "INTERIOR & WALL RELIEF", icon: Layers },
];

// Predefined mosaic spans matching the reference layout
const MOSAIC_SLOTS = [
  // Row 1 & 2
  { id: 1, span: "col-span-12 md:col-span-5 row-span-2 aspect-[4/5] md:aspect-[3/4]" },
  { id: 2, span: "col-span-12 md:col-span-4 aspect-[16/10]" },
  { id: 3, span: "col-span-6 md:col-span-3 aspect-square" },
  { id: 4, span: "col-span-6 md:col-span-2 aspect-square" },
  { id: 5, span: "col-span-12 md:col-span-2 aspect-square" },
  { id: 6, span: "col-span-12 md:col-span-3 aspect-[4/5]" },
  // Row 3 & 4
  { id: 7, span: "col-span-6 md:col-span-2 aspect-square" },
  { id: 8, span: "col-span-6 md:col-span-2 aspect-square" },
  { id: 9, span: "col-span-12 md:col-span-3 aspect-[4/3]" },
  { id: 10, span: "col-span-12 md:col-span-5 aspect-[4/5] md:aspect-[3/4]" },
];

export default function ModernMosaicGallery({ initialItems = [] }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const safeItems = Array.isArray(initialItems) ? initialItems : [];

  // Filter items by category
  const filteredItems = safeItems.filter((item) => {
    if (!item) return false;
    if (activeCategory === "all") return true;
    if (!item.category) return false;
    return item.category.toLowerCase().includes(activeCategory);
  });

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto";
    }
  };

  const nextItem = () => {
    if (selectedIndex !== null && selectedIndex < filteredItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const prevItem = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  return (
    <div className="w-full">
      {/* =========================================================================
          2. CATEGORY TABS
          ========================================================================= */}
      <div className="border-b border-stone-200 mb-10 sm:mb-14 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-start md:justify-center gap-6 sm:gap-10 min-w-max px-4">
          {CATEGORIES.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`relative pb-3.5 pt-2 flex items-center gap-2.5 text-xs font-bold tracking-[0.12em] transition-colors cursor-pointer select-none ${
                  isActive
                    ? "text-[#17120d]"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#b87333]" : "text-stone-400"}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#17120d] rounded-full animate-in fade-in duration-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. MOSAIC GRID (Forms automatically when images are uploaded)
          ========================================================================= */}
      {filteredItems.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-stone-400 text-sm font-light tracking-wide">
            No gallery items available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          {filteredItems.map((item, index) => {
            const slot = MOSAIC_SLOTS[index % MOSAIC_SLOTS.length];
            return (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className={`${slot.span} group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer`}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={item.title || "Gallery copper craft"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={`${item.url}#t=0.5`}
                      preload="metadata"
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 text-[#17120d] ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Hover overlay with title & zoom icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-base font-bold text-white">
                        {item.title || "Handcrafted Masterpiece"}
                      </h4>
                      <p className="text-xs text-stone-300 line-clamp-1">
                        {item.description || "Authentic Tumang Copper Craft"}
                      </p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          4. LIGHTBOX MODAL FOR OPENING UPLOADED IMAGES
          ========================================================================= */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation buttons */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevItem();
                  }}
                  disabled={selectedIndex === 0}
                  className="absolute left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-colors z-20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextItem();
                  }}
                  disabled={selectedIndex === filteredItems.length - 1}
                  className="absolute right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-colors z-20"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Media Content */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
            >
              {selectedItem.type === "image" ? (
                <div className="relative w-full h-[75vh]">
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.title || "Gallery preview"}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>
              ) : (
                <div className="w-full max-h-[75vh] flex items-center justify-center">
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="max-h-[75vh] max-w-full rounded-xl"
                  />
                </div>
              )}

              {/* Title & Description Caption */}
              <div className="mt-4 text-center text-white max-w-xl">
                <h3 className="font-display text-lg sm:text-xl font-bold">
                  {selectedItem.title || "Handcrafted Masterpiece"}
                </h3>
                {selectedItem.description && (
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 font-light">
                    {selectedItem.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
