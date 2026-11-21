import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us: Bespoke Copper Commissions",
  description:
    "Contact Ilavioo for quotations, bespoke copper and brass commissions, export shipping or a workshop visit in Tumang, Boyolali, Central Java.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
