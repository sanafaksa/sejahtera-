import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us: Bespoke Copper Commissions",
  description:
    "Contact Ilavioo for quotations, bespoke copper and brass commissions, export shipping or a workshop visit in Tumang, Boyolali, Central Java.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
