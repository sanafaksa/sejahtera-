"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroBathtubAnimated() {
  return (
    <div className="relative w-full max-w-[560px] sm:max-w-[640px] lg:max-w-[700px] xl:max-w-[740px] aspect-[16/10] sm:aspect-[16/9.5] lg:-translate-y-4 xl:-translate-y-8 group select-none">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

        {/* Floating Badge */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200/90 shadow-lg text-[10px] sm:text-xs font-semibold text-[#17120d] flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
          <span>Polished Brass Masterpiece</span>
        </div>

        {/* Bottom subtle detail caption */}
        <div className="absolute bottom-4 left-5 sm:bottom-5 sm:left-6 text-white pointer-events-none">
          <p className="text-xs sm:text-sm font-bold tracking-wide drop-shadow-md">
            Freestanding Royal Brass Bathtub
          </p>
          <p className="text-[10px] sm:text-xs text-stone-200 drop-shadow-sm font-light">
            Mirror-finish Brass & Pure White Enamel
          </p>
        </div>
      </motion.div>
    </div>
  );
}
