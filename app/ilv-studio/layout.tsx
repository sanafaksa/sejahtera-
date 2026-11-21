"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { motion, AnimatePresence } from "framer-motion";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/ilv-studio/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Desktop sidebar folded to icons; remembered per browser.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("ilv-sidebar-collapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem("ilv-sidebar-collapsed", c ? "0" : "1");
      return !c;
    });
  };

  useEffect(() => {
    // Redirect to login if not authenticated and not on login page
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/ilv-studio/login");
    }
    // Redirect to dashboard if authenticated and on login page
    if (status === "authenticated" && isLoginPage) {
      router.push("/ilv-studio/dashboard");
    }
  }, [status, router, isLoginPage]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="admin-shell min-h-screen flex items-center justify-center">
        <div className="admin-backdrop" aria-hidden="true"><span /><span /><span /></div>
        <div className="glass rounded-3xl px-10 py-8 text-center">
          <div className="w-12 h-12 border-[3px] border-[#b87333]/20 border-t-[#b87333] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium">Memuat studio…</p>
        </div>
      </div>
    );
  }

  // Show login page without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell min-h-screen">
      <div className="admin-backdrop" aria-hidden="true"><span /><span /><span /></div>

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <div
        className={`min-h-screen flex flex-col transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          collapsed ? "lg:pl-[6.5rem]" : "lg:pl-[18rem]"
        }`}
      >
        <AdminTopbar session={session} onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 px-4 pb-6 pt-2 sm:px-6 lg:px-8 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="px-4 sm:px-6 lg:px-8 pb-5">
          <p className="text-xs text-stone-500 text-center sm:text-left">
            © {new Date().getFullYear()} Ilavioo Studio
          </p>
        </footer>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-[#2a1a0e]/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
