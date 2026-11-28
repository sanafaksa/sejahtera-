import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Home, Check, Bath, Droplet, DoorOpen, Sparkles } from "lucide-react";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";
import ProductCard from "@/components/ProductCard";
import ExportEnquiryForms from "@/components/export/ExportEnquiryForms";
import { SITE, absoluteUrl, pageMetadata, webPageStructuredData } from "@/lib/site";
import { getProductList } from "@/lib/public-data";
import { categorizeProduct, productsInCategory } from "@/lib/categories";

export const revalidate = 3600;

const DESCRIPTION =
  "Handcrafted copper and brass bathtubs, basins, doors and architectural metalwork, made to order in Indonesia for hotels, resorts, designers and private homes worldwide.";

export const metadata: Metadata = pageMetadata({
  title: "Custom Copper Products Manufacturer in Indonesia",
  description: DESCRIPTION,
  path: "/export",
  keywords: [
    "custom copper products manufacturer Indonesia",
    "architectural metalwork Indonesia",
    "copper products for hotels and resorts",
    "custom copper products for hospitality projects",
    "brass doors and wall panels manufacturer",
    "copper bathtub supplier for hotels",
    "handcrafted metalwork for architects",
    "handcrafted copper bathtubs Indonesia",
    "custom copper wash basins",
    "copper bathroom products for luxury homes",
    "handmade copper products for interiors",
    "premium copper home decor",
    "handcrafted brass interior products",
  ],
  images: [{ url: SITE.ogImage, alt: "Handcrafted copper and brass pieces by Ilavioo, made in Indonesia" }],
});

const PROCESS = [
  "Choose a product or describe the project",
  "Share dimensions, quantity and reference images",
  "Discuss material, finish and technical requirements",
  "Review the quotation and specifications",
  "Confirm the next production step after approval",
];

const FAQ_B2B = [
  {
    q: "Can architects submit drawings and product schedules?",
    a: "Yes. Send elevations, CAD files, sketches or reference images with dimensions and a product schedule, and we will advise on material, finish and mounting before production begins.",
  },
  {
    q: "Can Ilavioo support multi-product hospitality projects?",
    a: "Yes. A single project can combine bathtubs, basins, brass doors, wall panels and lighting, produced to one shared set of specifications.",
  },
  {
    q: "Can product dimensions and finishes be customized?",
    a: "Yes. Almost everything is made to order in your chosen size and finish, from polished and brushed to hammered or an antique patina.",
  },
  {
    q: "What information is needed for a trade quotation?",
    a: "Product categories, quantities, dimensions and preferred finishes, plus any drawings or reference images. Telling us your procurement requirements helps us match your process.",
  },
  {
    q: "Can a project include bathtubs, basins and architectural metalwork?",
    a: "Yes. We regularly combine sanitaryware with architectural metalwork such as doors, wall panels and cladding within one order.",
  },
];

const FAQ_B2C = [
  {
    q: "Can I request a custom-size copper bathtub?",
    a: "Yes. Copper and brass bathtubs are made to order in the length, depth, shape and finish you specify.",
  },
  {
    q: "Which copper basin is suitable for a premium bathroom?",
    a: "We make countertop and undermount copper and brass basins. Tell us your vanity size and style and we will recommend options that suit the space.",
  },
  {
    q: "Can I choose a different finish?",
    a: "Yes. You can choose polished, brushed or hammered copper and brass, an antique patina, or a protective clear coat that holds the original colour.",
  },
  {
    q: "What information should I include in my enquiry?",
    a: "The product you want, quantity, dimensions, preferred finish, your room or project context, and any reference images.",
  },
  {
    q: "Can I request a product for a residential interior project?",
    a: "Yes. We make individual statement pieces for private homes as readily as larger orders for designers and developers.",
  },
];

type CardProduct = Awaited<ReturnType<typeof getProductList>>[number];

function ProductRow({ products }: { products: CardProduct[] }) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          name={p.name}
          slug={p.slug}
          description={p.description}
          imageUrl={p.images[0]?.imageUrl || "/assets/copper-showroom-gallery.jpg"}
          specifications={p.specifications}
        />
      ))}
    </div>
  );
}

export default async function ExportPage() {
  let all: CardProduct[] = [];
  try {
    all = await getProductList("", "newest");
  } catch (error) {
    console.error("/export: could not load products", error);
  }
  const inCat = (slug: string) => productsInCategory(all, slug).slice(0, 4);
  const mainSlugs = ["copper-bathtubs", "copper-sinks-basins", "brass-doors-wall-panels"];
  const sections = [
    {
      icon: Bath,
      title: "Handcrafted Copper Bathtubs",
      href: "/collections/copper-bathtubs",
      anchor: "copper bathtub collection",
      b2b: "For hotels and resorts: freestanding statement bathtubs produced to repeatable specifications across multiple rooms.",
      b2c: "For private homes: a made-to-measure copper or brass bathtub as the centrepiece of a premium bathroom.",
      products: inCat("copper-bathtubs"),
    },
    {
      icon: Droplet,
      title: "Custom Copper Wash Basins",
      href: "/collections/copper-sinks-basins",
      anchor: "copper wash basin collection",
      b2b: "For design professionals: countertop and undermount basins matched to vanity drawings and project finishes.",
      b2c: "For your home: a hand-hammered basin sized to your vanity, in the finish you choose.",
      products: inCat("copper-sinks-basins"),
    },
    {
      icon: DoorOpen,
      title: "Brass Doors and Wall Panels",
      href: "/collections/brass-doors-wall-panels",
      anchor: "brass doors and wall panels collection",
      b2b: "For architectural projects: carved brass entrance doors, feature panels and cladding built to opening and wall dimensions.",
      b2c: "For interiors: a carved brass door or decorative wall panel made to fit your entrance or feature wall.",
      products: inCat("brass-doors-wall-panels"),
    },
    {
      icon: Sparkles,
      title: "Other Copper and Brass Interior Products",
      href: "/products",
      anchor: "full product catalogue",
      b2b: "For hospitality interiors: lighting, décor and accent pieces to complete a scheme alongside the core products.",
      b2c: "For your home: lighting and décor pieces that complement your bathroom and living spaces.",
      products: all.filter((p) => !mainSlugs.includes(categorizeProduct(p).slug)).slice(0, 4),
    },
  ];

  const structuredData = [
    ...webPageStructuredData({
      type: "WebPage",
      path: "/export",
      // Breadcrumb label for this page: a clear "Export", matching the visible crumb.
      name: "Export",
      description: DESCRIPTION,
    }),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${absoluteUrl("/export")}#faq`,
      mainEntity: [...FAQ_B2B, ...FAQ_B2C].map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <JsonLd data={structuredData} />
      <PageHero
        crumb="Export"
        title="Handcrafted Copper and Brass Products for International Projects"
        description="Custom copper and brass, hand-made to order in Boyolali, Indonesia — for architects, hospitality projects and premium homes worldwide."
        fadeTo="#faf8f5"
      />

      {/* Intro */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-stone-700 text-base sm:text-lg leading-relaxed space-y-4 [&_strong]:text-stone-900 [&_a]:text-[#A8602A] [&_a]:underline [&_a]:underline-offset-2">
          <p>
            Ilavioo (PT. Ilavioo Nusantara Sejahtera) is a copper and brass manufacturer in{" "}
            <strong>Boyolali, Central Java, Indonesia</strong>. We hand-make bathtubs, basins, carved brass doors,
            wall panels and décor to order for clients worldwide — from <strong>hotels, resorts and design studios</strong>{" "}
            to <strong>private homeowners</strong>.
          </p>
          <p>
            Explore our <Link href="/collections/copper-bathtubs">copper bathtub collection</Link>,{" "}
            <Link href="/collections/copper-sinks-basins">copper wash basin collection</Link> and{" "}
            <Link href="/collections/brass-doors-wall-panels">brass doors and wall panels collection</Link>, see{" "}
            <Link href="/craftsmanship">how our pieces are made</Link>, or{" "}
            <Link href="/contact">contact our team</Link>.
          </p>
        </div>
      </section>

      {/* Two paths */}
      <section className="py-12 sm:py-16 bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid gap-6 lg:grid-cols-2">
          {/* B2B */}
          <div className="rounded-2xl bg-[#17120d] text-[#f3e3d2] p-7 sm:p-9">
            <div className="inline-flex items-center gap-2 text-[#e5be9c] text-sm font-semibold mb-3">
              <Building2 className="w-5 h-5" /> Trade &amp; hospitality
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              For Hotels, Resorts and Design Professionals
            </h2>
            <ul className="space-y-2.5 text-[#e9d9c7] text-[15px] mb-7">
              {[
                "Custom project requirements",
                "Quantities and dimensions",
                "Finish discussions",
                "Drawings and reference images",
                "Multi-product projects",
                "Quotation and specification review",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#e5be9c] mt-1 flex-shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <a
              href="#enquiry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full copper-metal text-white font-semibold relative overflow-hidden hover:brightness-[1.06] transition-[filter]"
            >
              Discuss a Trade or Hospitality Project <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* B2C */}
          <div className="rounded-2xl bg-[#faf6f1] ring-1 ring-stone-200 p-7 sm:p-9">
            <div className="inline-flex items-center gap-2 text-[#A8602A] text-sm font-semibold mb-3">
              <Home className="w-5 h-5" /> Private home
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#17120d] mb-4">
              For Private Homes and Premium Interiors
            </h2>
            <ul className="space-y-2.5 text-stone-700 text-[15px] mb-7">
              {[
                "Statement bathroom pieces",
                "Custom bathtub and basin options",
                "Material and finish selection",
                "Room dimensions",
                "Individual project consultation",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#A8602A] mt-1 flex-shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <a
              href="#enquiry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full leather-texture text-[#f3e3d2] font-semibold relative overflow-hidden ring-1 ring-black/30 hover:brightness-110 transition-[filter]"
            >
              Find a Product for Your Home <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Product sections */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-14 sm:space-y-20">
          {sections.map((s) => (
            <div key={s.title}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#17120d] text-[#e5be9c] flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#17120d]">{s.title}</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-[15px]">
                    <p className="text-stone-700">
                      <span className="font-semibold text-[#17120d]">Trade &amp; hospitality:</span> {s.b2b}
                    </p>
                    <p className="text-stone-700">
                      <span className="font-semibold text-[#17120d]">Private home:</span> {s.b2c}
                    </p>
                  </div>
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#A8602A] hover:text-[#8a4e22]"
                  >
                    Browse the {s.anchor} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <ProductRow products={s.products} />
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry process */}
      <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8 sm:mb-10 max-w-3xl">
            The project enquiry process
          </h2>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((step, i) => (
              <li key={step} className="rounded-2xl bg-[#faf8f5] p-6 ring-1 ring-stone-200/80">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#17120d] text-[#e5be9c] text-sm font-bold mb-4">
                  {i + 1}
                </span>
                <p className="text-stone-700 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Enquiry forms */}
      <section id="enquiry" className="py-14 sm:py-20 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-3">
            Start your enquiry
          </h2>
          <p className="text-stone-600 leading-relaxed max-w-2xl mb-8">
            Choose the path that fits your project. We reply with a quotation and specifications based on the details you share.
          </p>
          <ExportEnquiryForms />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8">
            Questions from trade and hospitality buyers
          </h2>
          <dl className="space-y-7 mb-14">
            {FAQ_B2B.map((item) => (
              <div key={item.q}>
                <dt className="font-bold text-stone-900 text-lg mb-2">
                  <h3>{item.q}</h3>
                </dt>
                <dd className="text-stone-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8">
            Questions from private home buyers
          </h2>
          <dl className="space-y-7">
            {FAQ_B2C.map((item) => (
              <div key={item.q}>
                <dt className="font-bold text-stone-900 text-lg mb-2">
                  <h3>{item.q}</h3>
                </dt>
                <dd className="text-stone-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-4">
            Ready to start a project?
          </h2>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-8">
            Send your drawings, reference images or product list and our team will reply with a quotation and specifications.
          </p>
          <a
            href="#enquiry"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full copper-metal text-white font-semibold relative overflow-hidden hover:brightness-[1.06] transition-[filter]"
          >
            Start your enquiry <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-5 text-sm text-stone-500">
            Or email{" "}
            <a href={`mailto:${SITE.email}`} className="text-[#A8602A] underline underline-offset-2">
              {SITE.email}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
