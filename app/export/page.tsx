import type { Metadata } from "next";
import Link from "next/link";
import MarketLandingPage from "@/components/MarketLandingPage";
import { pageMetadata } from "@/lib/site";

export const revalidate = 3600;

const DESCRIPTION =
  "Indonesian maker of handcrafted copper bathtubs, sinks, lighting and brass doors. Custom orders from your drawings, crated and exported to 16+ countries.";

export const metadata: Metadata = pageMetadata({
  title: "Copper Bathtub & Brass Door Manufacturer, Indonesia",
  description: DESCRIPTION,
  path: "/export",
  keywords: ["copper bathtub supplier","copper manufacturer Indonesia","brass door manufacturer","wholesale copper bathtubs","copper export Indonesia","hotel bathroom supplier","interior designer supplier"],
  images: [{ url: "/assets/copper-showroom-gallery.jpg", alt: "Handcrafted copper and brass pieces in the Ilavioo workshop showroom" }],
});

export default function ExportPage() {
  return (
    <MarketLandingPage
      path="/export"
      name="International Orders"
      heroTitle="Handcrafted Copper & Brass, Exported Worldwide"
      heroDescription={DESCRIPTION}
      intro={
        <>
          <p>
            Ilavioo (PT. Ilavioo Nusantara Sejahtera) is a copper and brass workshop in <strong>Boyolali, Central
            Java, Indonesia</strong>. We hand-make bathtubs, basins and sinks, pendant lights and chandeliers, carved brass
            doors, wall panels and decor for clients abroad, and have exported to <strong>more than 16 countries</strong>{" "}
            across North America, Europe, the Middle East and Asia.
          </p>
          <p>
            We work for <strong>architects, interior designers, hotels, resorts, places of worship and private homeowners</strong>.
            Most orders are bespoke: share sketches, elevations, 2D/3D CAD drawings or reference photos with dimensions, and
            our team checks sheet thickness, reinforcement and mounting before the coppersmiths start hammering. Every piece
            is made from solid copper or brass, not plated sheet.
          </p>
          <p>
            Browse the <Link href="/products">product catalog</Link>, see how pieces are made on{" "}
            <Link href="/craftsmanship">our craftsmanship page</Link>, or <Link href="/contact">request a quotation</Link>.
            Working on a project in Bali? See our{" "}
            <Link href="/bali">copper products for Bali villas and resorts</Link>.
          </p>
        </>
      }
      productsHeading="Pieces we export most"
      productSlugs={[
        "heritage-antique-copper-bathtub",
        "sovereign-brass-double-slipper-bathtub",
        "imperial-nabawi-brass-grand-entrance-door",
        "artisanal-copper-countertop-wash-basin",
        "moroccan-filigree-brass-chandelier",
        "tumang-hand-spun-copper-pendant-dome",
        "sculptural-kaligrafi-copper-wall-panel",
        "tumang-fluted-copper-urn-planter",
      ]}
      stepsHeading="How international orders work"
      steps={[
        {
          title: "Send your brief",
          text: "Share drawings or photos with dimensions, finish and quantity by email, WhatsApp or our contact form.",
        },
        {
          title: "Quotation",
          text: "We confirm the technical details and send a quotation with price, production time for that type of piece, and shipping to your country.",
        },
        {
          title: "Handmade production",
          text: "Your order is shaped, hammered and finished by hand in our Boyolali workshop in solid copper or brass.",
        },
        {
          title: "Crating and export",
          text: "Pieces are wrapped in high-density foam and packed in ISPM-15 certified fumigated wooden crates, insured from our workshop to your destination.",
        },
      ]}
      qa={[
        {
          q: "Which countries do you ship to?",
          a: "We ship worldwide and have exported to more than 16 countries across North America, Europe, the Middle East and Asia. Shipping cost and transit time depend on your destination and are confirmed in your quotation.",
        },
        {
          q: "How long does production take?",
          a: "It depends on the type of piece. Decor and lighting take less time than a bathtub, a carved entrance door or a large architectural commission. We confirm the production time for your design in the quotation.",
        },
        {
          q: "Can you produce from our architectural drawings?",
          a: "Yes. Most of our work is custom. Send elevations, CAD files or sketches with dimensions and we will advise on material thickness, internal reinforcement and mounting before production starts.",
        },
        {
          q: "Is there a minimum order quantity?",
          a: "No. We make single statement pieces for private homes as well as larger orders for hotels, resorts, commercial projects and places of worship.",
        },
        {
          q: "How are export shipments packed?",
          a: "Every piece is protected with multi-layer high-density foam and packed in custom ISPM-15 certified fumigated wooden crates, with transit insurance from our workshop to your destination.",
        },
        {
          q: "Who pays import duties and taxes?",
          a: "Unless agreed otherwise, import duties and local taxes in the destination country are paid by the buyer. Your quotation states exactly what is included.",
        },
      ]}
      ctaTitle="Sourcing handcrafted copper for a project abroad?"
      ctaText="Send us your drawings or ideas. We will reply with a quotation, including production and shipping to your country."
      serviceName="Handcrafted copper and brass manufacturing and export"
      areaServed={[{ "@type": "Place", name: "Worldwide" }]}
    />
  );
}
