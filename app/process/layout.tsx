import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Our Process: How Tumang Copper Is Handmade",
  description:
    "From raw copper sheet to hand-hammered masterpiece: see how Ilavioo artisans in Tumang shape, emboss, finish and pack every piece.",
  path: "/process",
});

export default function ProcessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
