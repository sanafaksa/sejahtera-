import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Process: How Tumang Copper Is Handmade",
  description:
    "From raw copper sheet to hand-hammered masterpiece: see how Ilavioo artisans in Tumang shape, emboss, finish and pack every piece.",
  alternates: { canonical: "/process" },
  openGraph: { url: "/process" },
};

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
