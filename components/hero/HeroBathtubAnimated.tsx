"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroBathtubAnimated() {
  return (
    <div className="relative w-full max-w-[560px] sm:max-w-[640px] lg:max-w-[700px] xl:max-w-[740px] aspect-[16/10] sm:aspect-[16/9.5] lg:translate-y-4 xl:translate-y-6 group select-none">
      {/* 1. Warm Brass & Gold Ambient Backglow */}
      <motion.div
        animate={{
          opacity: [0.25, 0.45, 0.25],
          scale: [0.96, 1.04, 0.96],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-radial from-[#d4af37]/30 via-[#b87333]/15 to-transparent blur-3xl pointer-events-none rounded-3xl"
      />

      {/* 2. Floating Frame Container */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.025,
          transition: { duration: 0.35, ease: "easeOut" },
        }}
        className="relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_60px_rgba(40,20,10,0.22)] border-2 border-white/80 bg-stone-100 cursor-pointer"
      >
        <Image
          src="/assets/hero-luxury-bath-suite.jpg"
          alt="Handcrafted Luxury Polished Brass & Porcelain Bathtub Suite"
          fill
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
        />

        {/* Subtle Luxury Gradient Overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Floating Badge */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-md text-[11px] sm:text-xs font-semibold leading-none text-[#17120d] pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span>Polished Brass Masterpiece</span>
        </div>

      </motion.div>

      {/* Bottom subtle detail caption — outside the floating frame so it stays still */}
      <div className="absolute bottom-5 left-4 sm:bottom-7 sm:left-6 right-4 sm:right-6 z-10 text-white pointer-events-none">
        <p className="font-display text-sm sm:text-base font-semibold leading-tight drop-shadow-md">
          Freestanding Royal Brass Bathtub
        </p>
        <p className="mt-1 text-[11px] sm:text-xs font-medium leading-tight text-white/80 drop-shadow-sm">
          Mirror-finish Brass &amp; Pure White Enamel
        </p>
      </div>
    </div>
  );
}
