"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Bath,
  Lightbulb,
  Flower2,
  UtensilsCrossed,
  Landmark,
  Award,
  Ruler,
  Sparkles,
  Globe,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import FadeInView from "@/components/animations/FadeInView";

const CATEGORIES = [
  {
    icon: Bath,
    title: "Luxury Bath & Sanctuary",
    desc: "Hand-hammered copper and brass bathtubs, artisanal basins, and bespoke sinks.",
  },
  {
    icon: Lightbulb,
    title: "Architectural & Ambient Lighting",
    desc: "Traditional Javanese Robyong chandeliers, Nabawi Mosque lamp replicas, pendant lights, and statement sconces.",
  },
  {
    icon: Flower2,
    title: "Home Décor & Living",
    desc: "Sculptural wall décor, hand-forged vases, decorative bowls, woven-effect metal baskets, and bespoke door handles.",
  },
  {
    icon: UtensilsCrossed,
    title: "Hospitality & Dining",
    desc: "Elegant chafing dishes, traditional teapots and tea glasses, and artisanal kitchenware.",
  },
  {
    icon: Landmark,
    title: "Sacred & Heritage Replicas",
    desc: "Meticulously detailed replicas of the Nabawi Mosque doors and the Grand Mosque of Mecca doors.",
  },
];

const STANDARD = [
  {
    icon: Award,
    title: "Over 30 Years of Mastery",
    desc: "Decades of inherited metalworking wisdom poured into every hammer stroke.",
  },
  {
    icon: Ruler,
    title: "100% Bespoke Design & Sizing",
    desc: "We collaborate closely with architects, interior designers, and international buyers to bring custom dimensions and concepts to life.",
  },
  {
    icon: Sparkles,
    title: "Truly One of a Kind",
    desc: "Authentic hand-forged character—subtle variations in texture and finish that celebrate genuine craftsmanship.",
  },
  {
    icon: Globe,
    title: "Trusted Worldwide",
    desc: "Proudly serving Indonesia and exporting to Asia, Europe, the Americas, Australia, Africa, and the Middle East.",
  },
];

export default function CraftsmanshipSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-20 sm:py-28 bg-[#f6f1eb] relative overflow-hidden border-t border-stone-200/60">
      <div className="container mx-auto px-5 sm:px-8 lg:px-12 max-w-6xl">
        <FadeInView direction="up">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#9e5b24] uppercase block mb-3">
              Our Portfolio
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#17120d] leading-[1.15] mb-4">
              Curated Craftsmanship for Distinguished Spaces
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Whether you are curating a boutique hotel, designing a private
              villa, or sourcing statement architectural pieces, our portfolio
              spans timeless functional art.
            </p>
          </div>
        </FadeInView>

        {/* Category cards (always visible, condensed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-10">
          {CATEGORIES.map((c, i) => (
            <FadeInView key={c.title} direction="up" delay={0.1 + i * 0.08}>
              <div className="h-full rounded-[22px] bg-[#f6f1eb] p-5 shadow-[8px_8px_20px_rgba(166,138,110,0.3),-8px_-8px_20px_rgba(255,255,255,0.9)] hover:shadow-[inset_5px_5px_12px_rgba(166,138,110,0.28),inset_-5px_-5px_12px_rgba(255,255,255,0.85)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#f6f1eb] shadow-[4px_4px_10px_rgba(166,138,110,0.3),-4px_-4px_10px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#b87333] mb-4">
                  <c.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#17120d] mb-1.5 leading-snug">
                  {c.title}
                </h3>
                <p className="text-[13px] text-stone-600 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </FadeInView>
          ))}
        </div>

        {/* Expandable "selengkapnya": philosophy + standard + CTA */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="more"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-12">
                <p className="max-w-3xl text-sm sm:text-base text-stone-600 leading-relaxed">
                  At ilavioo, every piece tells a story of patience, fire, and
                  devotion. Crafted entirely by hand in the cool highlands of
                  Boyolali, Central Java, our copper, brass, and aluminium works
                  are never mass-produced. Because each item is shaped by human
                  hands rather than machines, no two pieces are ever
                  identical—ensuring that every bathtub, luminaire, or
                  architectural accent you commission is genuinely one of a kind.
                </p>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#17120d] mt-12 mb-6">
                  The ilavioo Standard
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {STANDARD.map((s) => (
                    <div
                      key={s.title}
                      className="flex gap-4 rounded-[20px] bg-white/60 border border-stone-200/70 p-5"
                    >
                      <div className="shrink-0 w-11 h-11 rounded-xl copper-metal flex items-center justify-center text-white relative overflow-hidden">
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#17120d] mb-1">
                          {s.title}
                        </h4>
                        <p className="text-[13px] text-stone-600 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Closing CTA */}
                <div className="mt-12 rounded-[26px] bg-[#3E2723] text-white p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="max-w-xl">
                    <h3 className="font-display text-xl sm:text-2xl font-bold mb-2">
                      Bring Bespoke Indonesian Craftsmanship to Your Project
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Looking for a reliable export partner for custom metal
                      handicrafts? Let us discuss your vision, dimensions, and
                      shipping requirements.
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full copper-metal text-white text-xs font-bold uppercase tracking-wider relative overflow-hidden hover:brightness-[1.06] transition-[filter] self-start md:self-auto whitespace-nowrap"
                  >
                    <span>Start Your Commission</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#d9c3ad] bg-white/70 text-[#7d441a] text-sm font-semibold hover:bg-white transition-colors"
          >
            <span>{open ? "Tutup" : "Lihat selengkapnya"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
