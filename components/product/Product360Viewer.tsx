"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Rotate3d } from "lucide-react";

type Product360ViewerProps = {
  /** Folder that holds the frames, e.g. "/assets/360/copper-tub". */
  basePath: string;
  /** How many frames make one full turn. */
  frameCount: number;
  /** File extension without the dot. */
  ext?: string;
  /** Zero-padding width of the frame number (frame-001 -> 3). */
  pad?: number;
  /** Prefix before the number, so files are `${prefix}${n}.${ext}`. */
  prefix?: string;
  /** 1-based number of the first frame on disk. */
  startAt?: number;
  alt: string;
  /** Text shown as a watermark along the bottom. */
  watermark?: string;
  /** Spin on its own until the user grabs it. */
  autoSpin?: boolean;
  className?: string;
};

export default function Product360Viewer({
  basePath,
  frameCount,
  ext = "webp",
  pad = 3,
  prefix = "frame-",
  startAt = 1,
  alt,
  watermark = "ilavioo.com",
  autoSpin = true,
  className = "",
}: Product360ViewerProps) {
  const reduce = useReducedMotion();

  const frames = useMemo(
    () =>
      Array.from({ length: frameCount }, (_, i) => {
        const n = String(startAt + i).padStart(pad, "0");
        return `${basePath.replace(/\/$/, "")}/${prefix}${n}.${ext}`;
      }),
    [basePath, frameCount, ext, pad, prefix, startAt]
  );

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [dragging, setDragging] = useState(false);
  const ready = loaded >= frameCount;

  // Preload every frame so swapping src is instant (no flicker mid-spin).
  useEffect(() => {
    let alive = true;
    let done = 0;
    frames.forEach((src) => {
      const img = new window.Image();
      const tick = () => {
        if (!alive) return;
        done += 1;
        setLoaded(done);
      };
      img.onload = tick;
      img.onerror = tick;
      img.src = src;
    });
    return () => {
      alive = false;
    };
  }, [frames]);

  // Auto-spin until the user interacts, then stop.
  const userTouched = useRef(false);
  useEffect(() => {
    if (!autoSpin || reduce || !ready || dragging || userTouched.current) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const FPS = 14; // frames advanced per second
    const loop = (now: number) => {
      acc += (now - last) * (FPS / 1000);
      last = now;
      if (acc >= 1) {
        const step = Math.floor(acc);
        acc -= step;
        setIndex((i) => (i + step) % frameCount);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoSpin, reduce, ready, dragging, frameCount]);

  // Drag to rotate (mouse + touch via Pointer Events).
  const dragState = useRef<{ startX: number; startIndex: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return;
    userTouched.current = true;
    setDragging(true);
    dragState.current = { startX: e.clientX, startIndex: index };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current || !boxRef.current) return;
    const width = boxRef.current.offsetWidth || 1;
    // A full drag across the box = one full turn.
    const delta = (e.clientX - dragState.current.startX) / width;
    const next = Math.round(dragState.current.startIndex - delta * frameCount);
    setIndex(((next % frameCount) + frameCount) % frameCount);
  };
  const endDrag = () => {
    dragState.current = null;
    setDragging(false);
  };

  return (
    <div
      className={`relative w-full max-w-[560px] sm:max-w-[640px] lg:max-w-[700px] xl:max-w-[740px] aspect-[16/10] sm:aspect-[16/9.5] select-none ${className}`}
    >
      {/* Warm ambient backglow */}
      <div className="absolute inset-0 bg-gradient-radial from-[#d4af37]/25 via-[#b87333]/12 to-transparent blur-3xl pointer-events-none rounded-3xl" />

      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        role="img"
        aria-label={alt}
        className={`relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden border-2 border-white/80 bg-stone-100 shadow-[0_25px_60px_rgba(40,20,10,0.22)] touch-pan-y ${
          ready ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-wait"
        }`}
      >
        {/* Frames: all mounted once ready, only the active one shown — instant swap */}
        {ready &&
          frames.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              draggable={false}
              aria-hidden={i !== index}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ opacity: i === index ? 1 : 0 }}
            />
          ))}

        {/* Loading state */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400">
            <span className="w-8 h-8 rounded-full border-[3px] border-stone-300 border-t-[#b87333] animate-spin" />
            <span className="text-xs font-medium tabular-nums">
              Memuat 360° · {Math.round((loaded / frameCount) * 100)}%
            </span>
          </div>
        )}

        {/* Drag hint */}
        {ready && (
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-sm text-[11px] font-semibold text-[#17120d] pointer-events-none">
            <Rotate3d className="w-3.5 h-3.5 text-[#b87333]" />
            <span>Geser untuk memutar</span>
          </div>
        )}

        {/* Bottom gradient so the watermark reads over bright copper */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

        {/* Watermark */}
        {watermark && (
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <span className="text-xs font-semibold tracking-wide text-white/90 drop-shadow">
              {watermark}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
