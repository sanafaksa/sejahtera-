import type { Metadata } from "next";
import Link from "next/link";
import MarketLandingPage from "@/components/MarketLandingPage";
import { pageMetadata } from "@/lib/site";

export const revalidate = 3600;

const DESCRIPTION =
  "Handcrafted copper bathtubs, basins, lighting and brass doors for Bali villas, resorts and homes. Made to order in Tumang, Java and delivered to Bali.";

export const metadata: Metadata = pageMetadata({
  title: "Copper Bathtubs & Brass Doors for Bali Villas",
  description: DESCRIPTION,
  path: "/bali",
  keywords: ["Bali villa bathtub","Bali hotel interior","copper bathtub Bali","brass door Bali","Bali villa design","Bali resort supplier"],
  images: [{ url: "/assets/hero-luxury-bath-suite.jpg", alt: "Handcrafted copper bathtub for a Bali villa bathroom" }],
});

export default function BaliPage() {
  return (
    <MarketLandingPage
      path="/bali"
      name="Bali"
      heroTitle="Handcrafted Copper for Bali Villas & Resorts"
      heroDescription={DESCRIPTION}
      intro={
        <>
          <p>
            Ilavioo makes copper and brass pieces by hand in <strong>Tumang, Boyolali (Central Java)</strong>, a village
            known for generations of coppersmiths. For villa owners, resort and hotel developers, interior designers and
            architects in <strong>Bali</strong>, we produce statement pieces that suit tropical, open-air living: freestanding
            copper bathtubs, hammered basins and sinks, pendant lights and chandeliers, carved brass entrance doors and
            decorative wall panels.
          </p>
          <p>
            Every piece is <strong>made to order</strong>. Send us a photo, sketch or architectural drawing with the size you
            need, and our workshop builds it in solid copper or brass. There is no minimum order: we make a single bathtub
            for a private villa as readily as a full set of fixtures for a resort.
          </p>
          <p>
            Finished pieces are packed in protective foam and wooden crates and delivered from our workshop in Java to your
            project in Bali, insured door to door. See our <Link href="/products">full catalog</Link> or{" "}
            <Link href="/gallery">past work</Link> for ideas.
          </p>
        </>
      }
      productsHeading="Popular for Bali villas and resorts"
      productSlugs={[
        "heritage-antique-copper-bathtub",
        "sovereign-brass-double-slipper-bathtub",
        "artisanal-copper-countertop-wash-basin",
        "imperial-nabawi-brass-grand-entrance-door",
        "tumang-hand-spun-copper-pendant-dome",
        "moroccan-filigree-brass-chandelier",
        "sculptural-kaligrafi-copper-wall-panel",
        "tumang-fluted-copper-urn-planter",
      ]}
      stepsHeading="How ordering for a Bali project works"
      steps={[
        {
          title: "Share your design",
          text: "Send photos, sketches or drawings with sizes, finish and quantity by WhatsApp, email or our contact form.",
        },
        {
          title: "Receive a quotation",
          text: "We review the design and send a quotation with price, production time for that type of piece, and delivery to your Bali address.",
        },
        {
          title: "Hand-made in Tumang",
          text: "Our coppersmiths shape, hammer and finish your piece by hand in solid copper or brass.",
        },
        {
          title: "Crated and delivered",
          text: "Each piece is wrapped, crated and sent to your villa, hotel or construction site in Bali, insured from our workshop to your door.",
        },
      ]}
      qa={[
        {
          q: "Do you deliver to Bali?",
          a: "Yes. We send handcrafted pieces throughout Indonesia, including Bali. Delivery is arranged from our workshop in Tumang, Central Java to your address, with protective crating and transit insurance. The delivery cost is stated in your quotation.",
        },
        {
          q: "How long does production take?",
          a: "It depends on the type of piece. Small decor and lighting are quicker than a large bathtub, a carved entrance door or a set of fixtures for a resort. We confirm the production time for your exact design in the quotation.",
        },
        {
          q: "Can you make custom sizes for my villa or resort?",
          a: "Yes. Most of our work is made to measure. Send the dimensions, a reference photo or your architect's drawing and we will build it to fit your space.",
        },
        {
          q: "How does copper hold up in Bali's tropical climate?",
          a: "Copper and brass naturally develop a patina over time, and this happens faster in a humid or coastal climate. We can apply a protective clear coating to keep the original colour, or leave the metal raw if you prefer the patina to develop. Care instructions come with every order.",
        },
        {
          q: "Is there a minimum order?",
          a: "No. We work with private villa owners ordering a single piece as well as hotels, resorts and developers ordering larger quantities.",
        },
        {
          q: "Can I see the workshop?",
          a: "Yes, you are welcome to visit our workshop in Tumang, Boyolali, Central Java by appointment. Please contact us before you travel so our team can prepare for your visit.",
        },
      ]}
      ctaTitle="Planning a villa, resort or renovation in Bali?"
      ctaText="Tell us what you have in mind. We will reply with ideas, a quotation and delivery to your project in Bali."
      serviceName="Handcrafted copper and brass fixtures for Bali villas, hotels and resorts"
      areaServed={{ "@type": "AdministrativeArea", name: "Bali, Indonesia" }}
    />
  );
}
