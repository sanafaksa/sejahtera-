import type { Metadata } from "next";
import Link from "next/link";
import MarketLandingPage from "@/components/MarketLandingPage";
import { pageMetadata } from "@/lib/site";

export const revalidate = 3600;

const DESCRIPTION =
  "Handcrafted copper bathtubs, wash basins, brass doors and metalwork for Bali villas, hotels and resorts. Custom sizes and finishes, made in Indonesia.";

export const metadata: Metadata = pageMetadata({
  title: "Custom Copper Bathtubs for Bali Villas & Resorts",
  description: DESCRIPTION,
  path: "/bali",
  keywords: [
    "custom copper bathtubs for Bali villas",
    "handmade copper bathtubs Indonesia",
    "copper bathtubs for hotels and resorts",
    "custom copper wash basins Bali",
    "architectural metalwork Indonesia",
    "brass doors for Bali villas",
    "copper products for hospitality projects",
  ],
  images: [{ url: "/assets/hero-luxury-bath-suite.jpg", alt: "Handcrafted copper bathtub in a Bali villa bathroom" }],
});

/** Product categories shown as a breakdown for Bali projects, each linking to its collection. */
const CATEGORIES = [
  {
    title: "Copper Bathtubs",
    href: "/collections/copper-bathtubs",
    text: "Freestanding, hand-hammered copper and brass bathtubs that become the centrepiece of a villa suite or resort bathroom. Made to your chosen length, depth and finish—from bright polished copper to a deep antique patina.",
    cta: "View copper bathtubs",
  },
  {
    title: "Copper Wash Basins",
    href: "/collections/copper-sinks-basins",
    text: "Countertop and undermount wash basins in solid copper and brass, shaped and engraved by hand. Ideal for powder rooms, ensuites and open-air bathrooms where a single basin sets the tone for the whole space.",
    cta: "View copper basins",
  },
  {
    title: "Brass Doors",
    href: "/collections/brass-doors-wall-panels",
    text: "Carved brass and copper entrance doors with bespoke motifs, built to your opening size. A striking, durable welcome for villa entrances, lobbies and private suites.",
    cta: "View brass doors",
  },
  {
    title: "Wall Panels & Metalwork",
    href: "/collections/brass-doors-wall-panels",
    text: "Sculptural copper and brass wall panels, cladding and architectural metalwork for feature walls, reception areas and spa interiors—finished to match your design scheme.",
    cta: "View wall panels",
  },
];

/** Reasons an international buyer should commission Ilavioo. No invented awards, reviews or numbers. */
const REASONS = [
  {
    title: "Straight from the makers",
    text: "You work directly with our workshop in Boyolali, Central Java—not a reseller. Pricing, specifications and custom requests go straight to the artisans who build your piece.",
  },
  {
    title: "Made to your measurements",
    text: "Nearly everything is made to order. Send the dimensions of your bathroom, suite or entrance and we build each piece to fit the space precisely.",
  },
  {
    title: "Custom finishes",
    text: "Choose polished, brushed or hammered copper and brass, an antique patina, or a protective clear coat to hold the original colour in a humid climate.",
  },
  {
    title: "Solid copper and brass",
    text: "Every piece is formed from solid metal, not plated sheet, so it wears, patinas and lasts the way real copper and brass should.",
  },
  {
    title: "Built for hospitality projects",
    text: "From a single statement bathtub for a private villa to a full set of fixtures for a resort or boutique hotel, we scale to the project with no minimum order.",
  },
  {
    title: "Delivered and export-ready",
    text: "Pieces are wrapped in protective foam, crated and shipped to your Bali address or internationally, insured from our workshop to your door.",
  },
];

export default function BaliPage() {
  return (
    <MarketLandingPage
      path="/bali"
      name="Bali Villas & Resorts"
      heroTitle="Handcrafted Copper & Brass for Bali Villas, Hotels & Resorts"
      heroDescription={DESCRIPTION}
      intro={
        <>
          <p>
            Ilavioo hand-makes copper and brass pieces in <strong>Boyolali, Central Java</strong>, a region known for
            generations of coppersmiths. For <strong>villa owners, boutique hotels, resorts, architects and interior
            designers</strong> in <strong>Bali</strong>, we create statement pieces made for tropical, open-air living:
            freestanding copper bathtubs, hand-hammered wash basins, carved brass doors, and copper and brass wall panels.
          </p>
          <p>
            Every piece is <strong>made to order</strong> in custom sizes and finishes. Send a photo, sketch or architectural
            drawing with the dimensions you need, and our workshop builds it in solid copper or brass. There is no minimum
            order—we make a single bathtub for a private villa as readily as a full fit-out for a hospitality project.
          </p>
          <p>
            Browse our <Link href="/collections/copper-bathtubs">copper bathtubs</Link>,{" "}
            <Link href="/collections/copper-sinks-basins">copper basins</Link> and{" "}
            <Link href="/collections/brass-doors-wall-panels">brass doors</Link>, see the full{" "}
            <Link href="/products">catalogue</Link> and our <Link href="/export">international orders</Link> page, or{" "}
            <Link href="/contact">request a project quote</Link>.
          </p>
        </>
      }
      productsHeading="Popular for Bali villas and resorts"
      productSlugs={[
        "heritage-antique-copper-bathtub",
        "sovereign-brass-double-slipper-bathtub",
        "artisanal-copper-countertop-wash-basin",
        "imperial-nabawi-brass-grand-entrance-door",
        "sculptural-kaligrafi-copper-wall-panel",
        "moroccan-filigree-brass-chandelier",
      ]}
      extraContent={
        <>
          {/* Custom copper & brass product breakdown */}
          <section className="py-14 sm:py-20">
            <div className="max-w-5xl mx-auto px-5 sm:px-8">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-3">
                Custom copper and brass for your Bali project
              </h2>
              <p className="text-stone-600 leading-relaxed max-w-2xl mb-10 sm:mb-12 text-base sm:text-lg">
                Four things we make most often for villas, resorts and hospitality interiors in Bali—each one built to your
                drawings, dimensions and finish.
              </p>
              <div className="grid gap-6 sm:gap-8 sm:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <div key={c.title} className="rounded-2xl bg-white p-6 sm:p-7 shadow-sm ring-1 ring-stone-200/80">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#17120d] mb-2">{c.title}</h3>
                    <p className="text-stone-600 leading-relaxed text-[15px] mb-4">{c.text}</p>
                    <Link
                      href={c.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A8602A] hover:text-[#8a4e22]"
                    >
                      {c.cta} →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why international buyers choose Ilavioo */}
          <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
            <div className="max-w-5xl mx-auto px-5 sm:px-8">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-3">
                Why villa owners and hospitality teams choose Ilavioo
              </h2>
              <p className="text-stone-600 leading-relaxed max-w-2xl mb-10 sm:mb-12 text-base sm:text-lg">
                Buyers in Australia, the United States, India and across the English-speaking world commission us for the same
                reasons.
              </p>
              <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {REASONS.map((r) => (
                  <div key={r.title}>
                    <h3 className="font-bold text-stone-900 text-lg mb-2">{r.title}</h3>
                    <p className="text-stone-600 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      }
      stepsHeading="How a Bali project works, step by step"
      steps={[
        {
          title: "Share your design",
          text: "Send photos, sketches or your architect's drawings with sizes, finish and quantity by WhatsApp, email or our contact form.",
        },
        {
          title: "Receive a project quote",
          text: "We review the design and send a quote with price, production time for that type of piece, and delivery to your Bali address.",
        },
        {
          title: "Hand-made in Boyolali",
          text: "Our coppersmiths shape, hammer, engrave and finish your piece by hand in solid copper or brass.",
        },
        {
          title: "Crated and delivered",
          text: "Each piece is wrapped, crated and sent to your villa, hotel or construction site, insured from our workshop to your door.",
        },
      ]}
      qa={[
        {
          q: "Do you make custom copper bathtubs for Bali villas?",
          a: "Yes. Freestanding copper and brass bathtubs are one of our most-requested pieces for Bali villas and resorts. Each one is made to order in the length, depth, shape and finish you specify—send a reference photo or your dimensions and we build it to fit the bathroom.",
        },
        {
          q: "Can you deliver to Bali and ship internationally?",
          a: "Yes. We deliver throughout Indonesia, including Bali, from our workshop in Boyolali, Central Java, and we also export worldwide for buyers in Australia, the United States, India and other countries. Pieces are crated, protected and insured, and the cost is confirmed in your project quote.",
        },
        {
          q: "Can I choose custom sizes and finishes?",
          a: "Yes. Almost all of our work is made to measure. You can specify exact dimensions and choose the finish—polished, brushed or hammered copper and brass, an antique patina, or a protective clear coat that holds the original colour.",
        },
        {
          q: "How does copper hold up in Bali's tropical, coastal climate?",
          a: "Copper and brass naturally develop a patina over time, and this happens faster in a humid or coastal climate. We can apply a protective clear coating to keep the original colour, or leave the metal raw if you prefer the patina to develop. Care instructions come with every order.",
        },
        {
          q: "Do you supply copper and brass for hotels and resorts?",
          a: "Yes. We work with boutique hotels, resorts, developers and hospitality designers as well as private villa owners. There is no minimum order, so we can make a single statement piece or a full set of bathtubs, basins, doors and panels for a project.",
        },
        {
          q: "Can you produce from an architect's or interior designer's drawings?",
          a: "Yes. Most of our work is built from client drawings. Send elevations, CAD files, sketches or reference photos with dimensions and we will advise on material, finish and mounting before production starts.",
        },
      ]}
      ctaTitle="Planning a villa, resort or renovation in Bali?"
      ctaText="Tell us what you have in mind. We will reply with ideas, a project quote and delivery to your project in Bali or internationally."
      ctaButtonLabel="Request a Project Quote"
      serviceName="Handcrafted copper and brass fixtures for Bali villas, hotels and resorts"
      areaServed={{ "@type": "AdministrativeArea", name: "Bali, Indonesia" }}
    />
  );
}
