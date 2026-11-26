"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gallery page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#faf8f5] px-4 py-20">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-stone-200/90 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-[#17120d] mb-2">
          Gallery Unavailable
        </h2>
        <p className="text-stone-500 text-sm mb-6 leading-relaxed">
          We encountered a temporary issue while loading the gallery. Please try refreshing or return to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full copper-metal text-white text-xs font-bold uppercase tracking-wider relative overflow-hidden hover:brightness-[1.06] transition-[filter]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

