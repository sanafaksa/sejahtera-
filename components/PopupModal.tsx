"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { DEFAULT_POPUP, type PopupSettings } from "@/lib/popup";

const KEY = "ilv_popup_seen";

// Short signature so a changed popup is shown again even after dismissal.
function sig(p: PopupSettings) {
  return [p.title, p.message, p.imageUrl, p.linkUrl].join("|");
}

/**
 * Welcome popup shown shortly after a page opens. Copper frosted glass. Content
 * and image are managed by a superadmin; dismissible popups are remembered
 * (and re-shown when their content changes).
 */
export default function PopupModal() {
  const [popup, setPopup] = useState<PopupSettings | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/popup")
      .then((r) => (r.ok ? r.json() : null))
      .then((p: PopupSettings | null) => {
        if (!alive || !p || !p.enabled) return;
        if (!p.title && !p.message && !p.imageUrl) return;
        try {
          if (p.dismissible && localStorage.getItem(KEY) === sig(p)) return;
        } catch {
          /* ignore */
        }
        setPopup(p);
        setTimeout(() => alive && setOpen(true), 800);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const close = () => {
    if (popup) {
      try {
        localStorage.setItem(KEY, sig(popup));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  };

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && popup?.dismissible && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, popup]);

  const p = popup ?? DEFAULT_POPUP;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => p.dismissible && close()}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#1a0f07]/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={p.title || "Pengumuman"}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#e5be9c]/40 bg-[#A8602A]/25 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(40,20,10,0.7)]"
          >
            {/* copper sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-10 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(245,210,168,0.4),transparent_65%)]"
            />

            {p.dismissible && (
              <button
                onClick={close}
                aria-label="Tutup"
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/25 text-white hover:bg-black/40 backdrop-blur-sm transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {p.imageUrl && (
              <div className="relative w-full aspect-[16/10] bg-black/10">
                <Image src={p.imageUrl} alt={p.title || ""} fill className="object-cover" sizes="(max-width:768px) 100vw, 448px" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2a160a]/60 to-transparent" />
              </div>
            )}

            <div className="relative p-6 text-white">
              {p.title && <h2 className="font-display text-2xl font-bold drop-shadow-sm">{p.title}</h2>}
              {p.message && (
                <p className="mt-2 text-sm leading-relaxed text-white/90 whitespace-pre-wrap drop-shadow-sm">
                  {p.message}
                </p>
              )}

              <div className="mt-5 flex items-center gap-3">
                {p.linkUrl && (
                  <Link
                    href={p.linkUrl}
                    target={p.linkUrl.startsWith("http") ? "_blank" : undefined}
                    onClick={close}
                    className="copper-metal inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold relative overflow-hidden hover:brightness-110 transition-[filter]"
                  >
                    {p.linkLabel || "Selengkapnya"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {p.dismissible && (
                  <button
                    onClick={close}
                    className="text-sm font-medium text-white/80 hover:text-white px-3 py-2 rounded-full hover:bg-white/10 transition"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
