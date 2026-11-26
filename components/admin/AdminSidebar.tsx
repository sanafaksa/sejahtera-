"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ImageIcon,
  LogOut,
  X,
  ExternalLink,
  BarChart3,
  Clock3,
  FileText,
  Mail,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const sections = [
  {
    label: "Kelola website",
    items: [
      { name: "Dashboard", href: "/ilv-studio/dashboard", icon: LayoutDashboard },
      { name: "Products", href: "/ilv-studio/products", icon: Package },
      { name: "Gallery", href: "/ilv-studio/gallery", icon: ImageIcon },
      { name: "Pesan", href: "/ilv-studio/pesan", icon: Mail, badge: true },
      { name: "Invoice", href: "/ilv-studio/invoice", icon: FileText },
    ],
  },
  {
    label: "Insight",
    items: [
      { name: "Statistik", href: "/ilv-studio/statistik", icon: BarChart3 },
      { name: "Jam Wilayah", href: "/ilv-studio/jam-wilayah", icon: Clock3 },
    ],
  },
];

// Shown only to superadmins.
const superadminSection = {
  label: "Superadmin",
  items: [
    { name: "Pengaturan", href: "/ilv-studio/pengaturan", icon: Settings },
    { name: "Akun admin", href: "/ilv-studio/pengaturan/akun", icon: Users },
  ],
};

interface AdminSidebarProps {
  /** Mobile drawer open. */
  isOpen: boolean;
  onClose: () => void;
  /** Desktop: folded to an icon rail. Ignored on phones, where the drawer is always full width. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function AdminSidebar({ isOpen, onClose, collapsed, onToggleCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperadmin = session?.user?.role === "superadmin";
  const navSections = isSuperadmin ? [...sections, superadminSection] : sections;
  // Desktop-only hide for labels when folded.
  const label = collapsed ? "lg:hidden" : "";

  // Unread contact messages, refreshed on navigation.
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/messages")
      .then((r) => (r.ok ? r.json() : { unread: 0 }))
      .then((d) => alive && setUnread(Number(d?.unread) || 0))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <aside
      className={`fixed z-50 top-0 left-0 h-screen w-[17rem] p-3 transition-[transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${collapsed ? "lg:w-[6rem]" : ""}`}
    >
      <div className="glass-strong h-full rounded-[1.75rem] flex flex-col overflow-hidden">
        {/* Brand + fold toggle */}
        <div
          className={`flex items-center justify-between gap-2 px-5 pt-5 pb-4 ${
            collapsed ? "lg:flex-col lg:px-3 lg:gap-3" : ""
          }`}
        >
          <Link href="/ilv-studio/dashboard" className="flex items-center gap-3 group min-w-0" title="Dashboard">
            <span className="relative w-10 h-10 shrink-0 rounded-2xl bg-white/80 ring-1 ring-white shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105">
              <Image src="/assets/logo.png" alt="Ilavioo logo" width={28} height={28} className="w-7 h-7 object-contain" />
            </span>
            <span className={`min-w-0 ${label}`}>
              <span className="block font-semibold text-stone-900 leading-tight">Ilavioo</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#9e5b24]">Studio</span>
            </span>
          </Link>

          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            className="hidden lg:flex p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-white/70 transition-colors"
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="lg:hidden p-2 rounded-xl hover:bg-white/70 transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 space-y-5 ${collapsed ? "lg:space-y-3" : ""}`}>
          {navSections.map((section) => (
            <div key={section.label}>
              <p
                className={`px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 whitespace-nowrap ${label}`}
              >
                {section.label}
              </p>
              {collapsed && <div className="hidden lg:block mx-auto mb-3 h-px w-8 bg-stone-900/10" aria-hidden="true" />}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;
                  const count = "badge" in item && item.badge ? unread : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={collapsed ? item.name : undefined}
                        title={collapsed ? item.name : undefined}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-colors duration-300 group ${
                          collapsed ? "lg:justify-center lg:px-0" : ""
                        } ${isActive ? "text-white font-semibold" : "text-stone-600 hover:text-stone-900 hover:bg-white/60"}`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="admin-active-nav"
                            className="absolute inset-0 rounded-2xl admin-chip"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <Icon
                          className={`relative w-[18px] h-[18px] shrink-0 transition-transform duration-300 ${
                            isActive ? "" : "group-hover:scale-110 group-hover:-rotate-6"
                          }`}
                        />
                        <span className={`relative whitespace-nowrap ${label}`}>{item.name}</span>
                        {count > 0 && (
                          <span
                            className={`relative ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center tabular-nums ${
                              isActive ? "bg-white/25 text-white" : "bg-[#A8602A] text-white"
                            } ${collapsed ? "lg:absolute lg:top-1 lg:right-1 lg:ml-0" : ""}`}
                          >
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/70 space-y-1">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "Lihat website" : undefined}
            aria-label={collapsed ? "Lihat website" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-stone-600 hover:text-stone-900 hover:bg-white/60 transition-colors ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <ExternalLink className="w-[18px] h-[18px] shrink-0" />
            <span className={`whitespace-nowrap ${label}`}>Lihat website</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/ilv-studio/login" })}
            title={collapsed ? "Logout" : undefined}
            aria-label={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-red-600 hover:bg-red-50/80 transition-colors ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span className={`whitespace-nowrap ${label}`}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
