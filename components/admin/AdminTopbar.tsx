"use client";

import { Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";

interface AdminTopbarProps {
  session: Session | null;
  onMenuClick: () => void;
}

const TITLES: [string, string][] = [
  ["/ilv-studio/dashboard", "Dashboard"],
  ["/ilv-studio/products", "Products"],
  ["/ilv-studio/gallery", "Gallery"],
  ["/ilv-studio/invoice", "Invoice"],
  ["/ilv-studio/statistik", "Statistik"],
  ["/ilv-studio/jam-wilayah", "Jam Wilayah"],
];

export default function AdminTopbar({ session, onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname() ?? "";
  const title = TITLES.find(([href]) => pathname.startsWith(href))?.[1] ?? "Studio";
  const name = session?.user?.name || "Admin";

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-3 pb-3">
      <div className="glass rounded-[1.5rem] px-3 sm:px-4 py-2.5 flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Buka menu"
          className="lg:hidden p-2 rounded-xl hover:bg-white/70 transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400 leading-none mb-1 hidden sm:block">
            Ilavioo Studio
          </p>
          <p className="font-semibold text-stone-900 leading-none truncate">{title}</p>
        </div>

        <div className="flex-1" />

        <label className="relative hidden md:block w-full max-w-xs">
          <span className="sr-only">Cari</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Cari produk, galeri…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/60 border border-white/80 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white/90 focus:ring-4 focus:ring-[#b87333]/15 transition"
          />
        </label>

        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l border-stone-900/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-stone-900 leading-tight">{name}</p>
            <p className="text-xs text-stone-500">Administrator</p>
          </div>
          <div className="relative">
            <div className="admin-chip w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
