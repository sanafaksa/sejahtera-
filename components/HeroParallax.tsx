"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Layered parallax backdrop for the page hero. Each layer moves at its own
 * speed as the hero scrolls out of view, so the scene reads with depth:
 * the gradient drifts slowest, the glows follow, the sparkles move most.
 * Respects prefers-reduced-motion (everything holds still).
 */
export default function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Each layer travels a different distance (px) over the scroll — larger =
  // nearer the viewer, so it moves more. 0 when reduced motion is requested.
  const d = (depth: number) => (reduce ? 0 : depth);
  const yGradient = useTransform(scrollYProgress, [0, 1], [0, d(70)]);
  const yGlowA = useTransform(scrollYProgress, [0, 1], [0, d(150)]);
  const yGlowB = useTransform(scrollYProgress, [0, 1], [0, d(-120)]);
  const yGlowC = useTransform(scrollYProgress, [0, 1], [0, d(240)]);
  const yDots = useTransform(scrollYProgress, [0, 1], [0, d(360)]);
  const scaleGradient = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.2]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        style={{ y: yGradient, scale: scaleGradient }}
        className="hero-gradient absolute -inset-y-24 inset-x-0 bg-gradient-to-br from-[#3E2723] via-[#5f8579] to-[#A0522D]"
      />
      <motion.div
        style={{ y: yGlowA }}
        className="hero-glow-a absolute top-0 left-1/3 w-96 h-96 rounded-full bg-[#A0522D]/30 blur-[120px]"
      />
      <motion.div
        style={{ y: yGlowB }}
        className="hero-glow-b absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-[#2b1b16]/40 blur-[100px]"
      />
      <motion.div
        style={{ y: yGlowC }}
        className="hero-glow-c absolute top-[calc(50%-300px)] left-[calc(50%-300px)] w-[600px] h-[600px] rounded-full bg-[#e2b078]/15 blur-[150px]"
      />
      <div className="hero-sheen absolute inset-0" />

      <motion.div style={{ y: yDots }} className="absolute inset-0">
        <div className="hero-dot absolute top-[22%] right-[12%] w-3 h-3 rounded-full bg-white/30" />
        <div className="hero-dot hero-dot-2 absolute bottom-[18%] left-[8%] w-2 h-2 rounded-full bg-white/25" />
        <div className="hero-dot hero-dot-3 absolute top-1/3 right-[6%] w-2 h-2 rounded-full bg-white/25" />
        <div className="hero-dot hero-dot-4 absolute top-[38%] left-[16%] w-1.5 h-1.5 rounded-full bg-[#f3d2a8]/40" />
        <div className="hero-dot hero-dot-5 absolute bottom-[30%] right-[22%] w-1.5 h-1.5 rounded-full bg-white/30" />
      </motion.div>
    </div>
  );
}
