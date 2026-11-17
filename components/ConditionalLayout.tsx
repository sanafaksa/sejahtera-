"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitTracker from "@/components/VisitTracker";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current path is admin route
  const isAdminRoute = pathname?.startsWith("/ilv-studio");

  // If it's an admin route, render children without Header/Footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Otherwise, render with Header/Footer (client layout)
  return (
    <>
      <VisitTracker />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
