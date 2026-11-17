import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { SiInstagram, SiThreads, SiTiktok } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About Us", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const productCategories = [
    { name: "Decorative Items", href: "/products?category=decorative" },
    { name: "Kitchenware", href: "/products?category=kitchenware" },
    { name: "Lighting", href: "/products?category=lighting" },
    { name: "Custom Orders", href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://instagram.com/ilavioocopper_art",
      icon: SiInstagram,
      hoverClass: "hover:bg-gradient-to-tr hover:from-amber-600 hover:to-pink-600 hover:border-pink-500",
    },
    {
      name: "Threads",
      href: "https://www.threads.net/@ilavioocopper_art",
      icon: SiThreads,
      hoverClass: "hover:bg-stone-800 hover:border-amber-600",
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@ilavioocopper",
      icon: SiTiktok,
      hoverClass: "hover:bg-black hover:border-cyan-400",
    },
  ];

  return (
    <footer className="relative bg-[#140b06] text-[#d4b59c] border-t border-[#3d2719]/80 overflow-hidden">
      {/* Semi-transparent background showing authentic copper crafts in showroom */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/assets/copper-showroom-gallery.jpg"
          alt="Tumang Copper Showroom Gallery"
          fill
          className="object-cover object-center opacity-65 sm:opacity-70 filter saturate-125 contrast-105"
          sizes="100vw"
        />
        {/* Balanced dark translucent glass overlay so copper craft products are clearly visible while text is crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#140b06]/86 via-[#1a0f08]/64 to-[#0d0704]/92 backdrop-blur-[0.5px]" />
        {/* Subtle warm copper ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#b87333]/25 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6 group">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Image
                    src="/assets/logo.png"
                    alt="Ilavio Logo"
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#cb8962] transition-colors drop-shadow-sm">
                    Ilavioo
                  </h3>
                  <p className="text-xs text-[#a88267]">
                    PT. Ilavioo Nusantara Sejahtera
                  </p>
                </div>
              </div>
            </Link>
            <p className="text-[#c7ad99] leading-relaxed mb-6 font-medium drop-shadow-xs">
              Preserving the heritage of Tumang copper craftsmanship through
              generations of skilled artisans creating timeless pieces.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-[#2a1a12]/80 backdrop-blur-md border border-[#4a2e1e] text-[#eed3bf] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-white shadow-md ${social.hoverClass}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2 drop-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#b87333]"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-[#c7ad99] hover:text-[#e8b58f] transition-colors duration-300 font-medium group"
                  >
                    <ArrowRight className="w-4 h-4 text-[#b87333] group-hover:text-[#e8b58f] group-hover:translate-x-1 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2 drop-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#b87333]"></span>
              Our Products
            </h4>
            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.href}>
                  <Link
                    href={category.href}
                    className="flex items-center gap-2 text-[#c7ad99] hover:text-[#e8b58f] transition-colors duration-300 font-medium group"
                  >
                    <ArrowRight className="w-4 h-4 text-[#b87333] group-hover:text-[#e8b58f] group-hover:translate-x-1 transition-all" />
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2 drop-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#b87333]"></span>
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-[#c7ad99] hover:text-[#e8b58f] transition-colors duration-300 font-medium"
                >
                  <MapPin className="w-5 h-5 text-[#b87333] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Tumang, Boyolali
                    <br />
                    Central Java, Indonesia
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+6281213696772"
                  className="flex items-center gap-3 text-[#c7ad99] hover:text-[#e8b58f] transition-colors duration-300 font-medium"
                >
                  <Phone className="w-5 h-5 text-[#b87333] flex-shrink-0" />
                  <span>+62 8121-3696-772</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:marketing@ilavioo.com"
                  className="flex items-center gap-3 text-[#c7ad99] hover:text-[#e8b58f] transition-colors duration-300 font-medium"
                >
                  <Mail className="w-5 h-5 text-[#b87333] flex-shrink-0" />
                  <span>marketing@ilavioo.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#3d2719]/80 bg-[#0d0704]/85 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#a88267]">
            <p>
              © {currentYear}{" "}
              <span className="text-[#df9b64] font-semibold">Ilavioo</span>. All
              rights reserved.
              <span className="block text-xs text-[#8a6a54] mt-1">
                This site uses anonymous visit data (no IP addresses) to improve our service.
              </span>
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-[#df9b64] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-[#df9b64] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
