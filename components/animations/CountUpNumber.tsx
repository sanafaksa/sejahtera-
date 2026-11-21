"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";

interface CountUpNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export default function CountUpNumber({
  value,
  suffix = "",
  prefix = "",
}: CountUpNumberProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Start at the final value so the server HTML (what search engines and AI
  // crawlers read) contains the real number, not "0".
  const spring = useSpring(value, {
    damping: 30,
    stiffness: 100,
  });

  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString("en-US")
  );

  // In the browser, reset to 0 before paint so the count-up still plays.
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) spring.jump(0);
  }, [spring]);

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <motion.span ref={ref}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}
