"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Typing cadence. Kept a touch gentler so it reads as smooth on phones too.

const PHRASES = [
  "Global Artisanry",
  "Handcrafted Luxury",
  "Pure Artisanship",
  "PT ILAVIOO NUSANTARA SEJAHTERA",
  "Timeless Craftsmanship",
];

const TYPE_MS = 75; // per character while typing
const DELETE_MS = 38; // per character while deleting
const HOLD_MS = 1600; // pause on a finished phrase
const BETWEEN_MS = 350; // pause before typing the next phrase

/**
 * Hero headline typed out like a typewriter, cycling through phrases. A stable
 * sr-only title carries the accessible name / SEO text; the typed word is
 * decorative. Types smoothly on every screen (phones included); only the OS
 * "reduce motion" setting makes it stay static.
 */
export default function RotatingHeadline({ className = "" }: { className?: string }) {
  const [text, setText] = useState(PHRASES[0]);
  const reduce = useReducedMotion();
  const noAnim = !!reduce;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (noAnim) {
      setText(PHRASES[0]);
      return;
    }
    let i = 0;
    let pos = 0;
    let deleting = false;

    const step = () => {
      const full = PHRASES[i];
      if (!deleting) {
        pos += 1;
        setText(full.slice(0, pos));
        if (pos === full.length) {
          deleting = true;
          timer.current = setTimeout(step, HOLD_MS);
          return;
        }
        timer.current = setTimeout(step, TYPE_MS);
      } else {
        pos -= 1;
        setText(full.slice(0, pos));
        if (pos === 0) {
          deleting = false;
          i = (i + 1) % PHRASES.length;
          timer.current = setTimeout(step, BETWEEN_MS);
          return;
        }
        timer.current = setTimeout(step, DELETE_MS);
      }
    };

    timer.current = setTimeout(step, BETWEEN_MS);
    return () => clearTimeout(timer.current);
  }, [noAnim]);

  return (
    <h1 className={className}>
      <span className="sr-only">
        Ilavioo — handcrafted copper and brass from Tumang, Indonesia
      </span>
      <span aria-hidden="true">
        {text}
        {!noAnim && (
          <span className="caret-blink inline-block w-[0.06em] -mb-[0.06em] h-[0.78em] ml-[0.06em] bg-current align-baseline" />
        )}
      </span>
    </h1>
  );
}
