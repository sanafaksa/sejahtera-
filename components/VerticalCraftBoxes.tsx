"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface CraftBox {
  id: number;
  src: string;
  title: string;
  tag: string;
  floatY: number[];
  floatDuration: number;
  floatDelay: number;
  defaultRotate: number;
}

const craftBoxes: CraftBox[] = [
  {
    id: 1,
    src: "/assets/products/showcase-1.jpg",
    title: "Nabawi Copper Doors",
    tag: "Hand-Carved Relief",
    floatY: [0, -7, 0],
    floatDuration: 5.2,
    floatDelay: 0,
    defaultRotate: -2,
  },
  {
    id: 2,
    src: "/assets/products/showcase-2.jpg",
    title: "Sunburst Copper Wall Art",
    tag: "Ornamental Panel",
    floatY: [0, 8, 0],
    floatDuration: 5.8,
    floatDelay: 0.8,
    defaultRotate: 2.5,
  },
  {
    id: 3,
    src: "/assets/products/showcase-3.jpg",
    title: "Luxury Hammered Bathtub",
    tag: "Bespoke Bathware",
    floatY: [0, -8, 0],
    floatDuration: 5.4,
    floatDelay: 1.5,
    defaultRotate: 1.5,
  },
  {
    id: 4,
    src: "/assets/products/showcase-4.jpg",
    title: "Tumang Artisan Doors",
    tag: "Heritage Architecture",
    floatY: [0, 7, 0],
    floatDuration: 6.0,
    floatDelay: 0.4,
    defaultRotate: -2,
  },
];

export default function VerticalCraftBoxes() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isContainerHovered, setIsContainerHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[530px] lg:max-w-[560px] mx-auto select-none py-4"
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => {
        setIsContainerHovered(false);
        setHoveredId(null);
      }}
    >
      {/* Animated Warm Copper Ambient Glow Aura (Breathing behind cards) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-br from-[#eed3bf]/60 via-[#dfb294]/30 to-transparent rounded-full blur-3xl pointer-events-none z-0"
      />

      {/* Decorative Floating Sparkle Particles */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          opacity: [0.4, 0.9, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-4 -right-4 text-[#b87333] pointer-events-none z-20"
      >
        <Sparkles className="w-5 h-5 drop-shadow-[0_0_8px_rgba(184,115,51,0.5)]" />
      </motion.div>

      <motion.div
        animate={{
          y: [8, -8, 8],
          opacity: [0.3, 0.7, 0.3],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-2 -left-4 text-[#b87333] pointer-events-none z-20"
      >
        <Sparkles className="w-4 h-4 drop-shadow-[0_0_8px_rgba(184,115,51,0.5)]" />
      </motion.div>

      {/* 2x2 Square Boxes Grid arranged Top & Bottom */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 relative z-10">
        {craftBoxes.map((box, index) => {
          const isCurrentHovered = hoveredId === box.id;
          const isOtherHovered = hoveredId !== null && !isCurrentHovered;

          // Determine vertical shift on hover (top boxes lift up, bottom boxes push down)
          const isTopRow = index < 2;
          const hoverY = isTopRow ? -14 : 14;

          return (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={
                isContainerHovered
                  ? {
                      opacity: isOtherHovered ? 0.88 : 1,
                      scale: isCurrentHovered ? 1.08 : isOtherHovered ? 0.96 : 1,
                      y: isCurrentHovered ? hoverY * 1.2 : hoverY * 0.7,
                      rotate: isCurrentHovered ? 0 : box.defaultRotate,
                    }
                  : {
                      opacity: 1,
                      scale: 1,
                      y: box.floatY,
                      rotate: box.defaultRotate,
                    }
              }
              transition={
                isContainerHovered
                  ? { type: "spring", stiffness: 280, damping: 22 }
                  : {
                      y: {
                        duration: box.floatDuration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: box.floatDelay,
                      },
                      scale: { duration: 0.35 },
                      opacity: { duration: 0.35 },
                    }
              }
              onMouseEnter={() => setHoveredId(box.id)}
              className={`relative aspect-square rounded-[26px] sm:rounded-[30px] overflow-hidden bg-white p-1.5 border-[5px] border-white group cursor-pointer transition-shadow duration-500 ${
                isTopRow && index === 1
                  ? "translate-y-2 sm:translate-y-3"
                  : !isTopRow && index === 2
                  ? "-translate-y-2 sm:-translate-y-3"
                  : ""
              } ${
                isCurrentHovered
                  ? "z-30 shadow-[0_28px_60px_-10px_rgba(184,115,51,0.48)] ring-2 ring-[#b87333]/40"
                  : "z-10 shadow-[0_15px_35px_-8px_rgba(30,15,5,0.22)]"
              }`}
            >
              <div className="relative w-full h-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-stone-100">
                <Image
                  src={box.src}
                  alt={box.title}
                  fill
                  className="object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 50vw, 30vw"
                />

                {/* Shimmer Light Sheen passing across image on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none" />

                {/* Dark Vignette Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Caption Title & Tag */}
                <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#eed3bf] block">
                      {box.tag}
                    </span>
                    <p className="text-xs font-bold leading-tight drop-shadow-md">
                      {box.title}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0 ml-2">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
