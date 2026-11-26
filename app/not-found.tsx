import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/products", label: "Products", text: "Bathtubs, basins, lighting, doors and decor" },
  { href: "/export", label: "International orders", text: "Handmade in Indonesia, shipped to 16+ countries" },
  { href: "/bali", label: "Bali villas & resorts", text: "Made to order and delivered to Bali" },
  { href: "/gallery", label: "Gallery", text: "Finished copper and brass projects" },
];

export default function NotFound() {
  const whatsapp = `https://wa.me/${SITE.telephone.replace(/\D/g, "")}`;

  return (
    <main className="relative overflow-hidden bg-[#faf6f1] text-[#17120d]">
      {/* Soft copper glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] max-w-[140vw] h-[420px] rounded-full bg-[#eed7c4]/60 blur-3xl" />

      <section className="relative container mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24 text-center">
        <p className="font-display text-[5.5rem] sm:text-[8rem] leading-none font-bold bg-gradient-to-b from-[#c8874f] to-[#7d441a] bg-clip-text text-transparent select-none">
          404
        </p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-4">
          This page could not be found
        </h1>
        <p className="max-w-xl mx-auto text-stone-600 text-base sm:text-lg leading-relaxed">
          The link may be old or mistyped. Our handcrafted copper and brass pieces are still here: start from the home
          page or one of the pages below.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full copper-metal text-white font-semibold relative overflow-hidden hover:brightness-[1.06] transition-[filter,box-shadow]"
          >
            <Home className="w-4 h-4" /> Back to home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full leather-texture text-[#f3e3d2] font-semibold relative overflow-hidden ring-1 ring-black/30 hover:brightness-110 transition-[filter]"
          >
            Contact us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto text-left">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group block h-full rounded-2xl bg-white p-5 ring-1 ring-stone-200/80 shadow-sm hover:ring-[#b87333]/60 hover:shadow-md transition"
              >
                <span className="flex items-center justify-between font-bold text-stone-900">
                  {link.label}
                  <ArrowRight className="w-4 h-4 text-[#A8602A] transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1.5 block text-sm text-stone-600 leading-relaxed">{link.text}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-stone-500">
          Looking for something specific?{" "}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#A8602A] hover:text-[#8a4e22]"
          >
            <MessageCircle className="w-4 h-4" /> Ask us on WhatsApp
          </a>
        </p>
      </section>
    </main>
  );
}
