import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, webPageStructuredData } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us: Bespoke Copper Commissions",
  description:
    "Contact Ilavioo for quotations, bespoke copper and brass commissions, export shipping or a workshop visit in Tumang, Boyolali, Central Java.",
  path: "/contact",
  keywords: ["copper bathtub quote","custom copper order","bespoke copper commission","copper supplier contact"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={webPageStructuredData({
          type: "ContactPage",
          path: "/contact",
          name: "Contact",
          description:
            "Request a quotation, discuss a bespoke commission or book a workshop visit in Tumang, Boyolali.",
        })}
      />
      {children}
    </>
  );
}
