"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, Grid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Craftsmanship", href: "/craftsmanship" },
    { name: "Products", href: "/products" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs ${
        isScrolled ? "py-2.5 sm:py-3 shadow-sm" : "py-3 sm:py-4"
      }`}
    >
      <nav className="container mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Left: Official Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative z-50 select-none"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <Image
                src="/assets/logo.png"
                alt="Ilavioo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#008236] group-hover:text-[#006b2c] transition-colors leading-none">
                Ilavioo
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-stone-500 font-medium mt-0.5">
                PT. Ilavioo Nusantara Sejahtera
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Like Mockup: Home About Services Products Blog Vendors) */}
          <div className="hidden md:flex items-center gap-7 lg:gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-xs sm:text-sm font-medium tracking-wide transition-colors duration-200 py-1 ${
                  isActive(link.href)
                    ? "text-[#17120d] font-semibold"
                    : "text-stone-600 hover:text-[#17120d]"
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[#17120d] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right: Pill Button + 3x3 Dot Grid Icon (Exact Mockup Match) */}
          <div className="hidden md:flex items-center gap-3.5">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-white hover:bg-stone-50 text-[#17120d] border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-300 group"
            >
              <span className="text-xs sm:text-sm font-semibold tracking-wide">
                Contact Us
              </span>
              <span className="w-8 h-8 rounded-full bg-[#17120d] text-white flex items-center justify-center group-hover:bg-[#b87333] transition-colors">
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </Link>

            {/* 3x3 Dot Grid Menu Icon (Exact Mockup Detail) */}
            <a
              href="/catalog/Catalog-of-Product-Ilavioo-Nusantara-Sejahtera.pdf"
              download="Catalog-Ilavioo.pdf"
              title="Download Full Catalog"
              className="w-10 h-10 rounded-full flex items-center justify-center text-stone-600 hover:text-[#17120d] hover:bg-white/70 border border-transparent hover:border-stone-200/80 transition-all"
            >
              <Grid className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-[60] p-2 text-stone-800 hover:text-[#b87333] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-[55]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-[#fcf9f5] border-l border-stone-200 shadow-2xl md:hidden overflow-y-auto z-[60] p-6 flex flex-col justify-between"
              style={{ height: "100vh" }}
            >
              <div>
                <div className="flex items-center gap-3 pb-6 border-b border-stone-200">
                  <div className="w-10 h-10 flex-shrink-0">
                    <Image
                      src="/assets/logo.png"
                      alt="Ilavioo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#008236]">
                      Ilavioo
                    </h3>
                    <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">
                      PT. Ilavioo Nusantara Sejahtera
                    </p>
                  </div>
                </div>

                <nav className="mt-6 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-stone-200/70 text-[#17120d] font-semibold"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-stone-200 space-y-3">
                <Link
                  href="/contact"
                  className="flex items-center justify-between w-full px-5 py-3 rounded-full bg-[#17120d] text-white text-xs uppercase tracking-wider font-semibold shadow-md"
                >
                  <span>Contact Us</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href="/catalog/Catalog-of-Product-Ilavioo-Nusantara-Sejahtera.pdf"
                  download="Catalog-Ilavioo.pdf"
                  className="block text-center w-full py-2.5 rounded-full border border-stone-300 text-xs font-semibold text-stone-700"
                >
                  Download Catalog
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
