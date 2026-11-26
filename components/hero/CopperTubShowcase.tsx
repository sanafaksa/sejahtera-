"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Product360Viewer from "@/components/product/Product360Viewer";

// Frames in /public/assets/360/copper-tub (frame-001…). 0 = interactive tilt
// of the single cutout. Set NEXT_PUBLIC_COPPER_360_FRAMES to switch to 360°.
const FRAMES = Number(process.env.NEXT_PUBLIC_COPPER_360_FRAMES) || 0;
const EXT = process.env.NEXT_PUBLIC_COPPER_360_EXT || "webp";

/**
 * "Relax In Splendor" product showcase: keeps the warm organic blob and the
 * floating copper-tub cutout, but the tub now tilts in 3D toward the cursor
 * (touch too), floats, catches a moving glare, and carries an ilavioo.com
 * watermark. Swaps to a real 360° spinner once frames exist.
 */
export default function CopperTubShowcase() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 150, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [-16, 16]);
  const rotateX = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [12, -12]);
  const glareBg = useTransform(
    [sx, sy],
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${(gx + 0.5) * 100}% ${(gy + 0.5) * 100}%, rgba(255,255,255,0.5), transparent 45%)`
  );

  const [active, setActive] = useState(false);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    setActive(false);
    px.set(0);
    py.set(0);
  };

  if (FRAMES > 0) {
    return (
      <div className="relative z-10 w-full flex items-center justify-center">
        <Product360Viewer
          basePath="/assets/360/copper-tub"
          frameCount={FRAMES}
          ext={EXT}
          alt="100% solid red copper bathtub, 360° view"
          watermark="ilavioo.com"
        />
      </div>
    );
  }

  return (
    <div
      className="relative z-10 w-full max-w-[480px] h-[260px] sm:h-[320px] flex items-center justify-center"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={reset}
        animate={reduce ? undefined : { y: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <div className="relative w-full h-full" style={{ transform: "translateZ(30px)" }}>
          <Image
            src="/assets/hero-copper-bathtub.png"
            alt="Handcrafted luxury 100% solid red copper bathtub"
            fill
            className="object-contain filter drop-shadow-[0_20px_30px_rgba(40,20,10,0.22)]"
            sizes="(max-width: 768px) 95vw, 45vw"
          />
          {/* Moving glare clipped to the tub silhouette via mask */}
          <motion.div
            aria-hidden="true"
            style={{
              background: glareBg,
              opacity: active && !reduce ? 1 : 0,
              WebkitMaskImage: "url(/assets/hero-copper-bathtub.png)",
              maskImage: "url(/assets/hero-copper-bathtub.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
            className="absolute inset-0 pointer-events-none mix-blend-soft-light transition-opacity duration-300"
          />
        </div>

      </motion.div>
    </div>
  );
}
