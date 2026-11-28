import Link from "next/link";
import { ArrowRight, MessageCircle, ImageIcon } from "lucide-react";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";
import { SITE, pageMetadata, webPageStructuredData } from "@/lib/site";

// On-page H1 stays evocative; the <title>/meta stay keyword-rich for search.
const HERO_SUBTITLE =
  "Where over 30 years of Javanese heritage, raw fire, and human devotion transform solid metal into bespoke architectural art.";
const META_TITLE = "Handmade Copper & Brass Craftsmanship in Boyolali";
const META_DESCRIPTION =
  "Ilavioo hand-forges copper, brass and aluminium into bespoke bathtubs, lighting and architectural art in Boyolali, Central Java—made to order and exported worldwide.";

export const metadata = pageMetadata({
  title: META_TITLE,
  description: META_DESCRIPTION,
  path: "/craftsmanship",
  keywords: [
    "handmade copper craftsmanship",
    "hand-hammered copper",
    "handmade brass",
    "aluminium metal craft",
    "bespoke metalwork Indonesia",
    "repousse",
    "Nabawi mosque door replica",
    "Robyong chandelier",
    "traditional metalworking",
    "coppersmith Boyolali",
  ],
  images: [{ url: "/assets/copper-hero-craft.jpg", alt: "Hand-hammered copper and brass craftsmanship in Boyolali, Central Java" }],
});

const materials = [
  {
    name: "Copper",
    text: "Prized for its warm glow, natural durability, and rich patina—ideal for hand-hammered bathtubs, basins, sinks, and luxury décor.",
  },
  {
    name: "Brass",
    text: "Celebrated for its regal golden lustre and enduring strength—perfect for bespoke lighting, Nabawi and Mecca Mosque door replicas, and Javanese Robyong chandeliers.",
  },
  {
    name: "Aluminium",
    text: "Lightweight, versatile, and refined—hand-forged into sculptural wall décor, decorative bowls, vases, baskets, and artisanal tableware.",
  },
];

const steps = [
  {
    title: "Bespoke Design & Sizing",
    text: "Every commission begins with your vision. We translate custom sketches, exact dimensions, and interior concepts into hand-drawn patterns.",
  },
  {
    title: "Hand-Forming & Hammering",
    text: "Using traditional mallets and anvils, our craftsmen patiently beat, curve, and form the metal, building both structural strength and unmistakable hand-forged texture.",
  },
  {
    title: "Intricate Engraving & Detailing",
    text: "Fine motifs—from delicate floral carvings to sacred architectural patterns—are meticulously chiselled and embossed by hand.",
  },
  {
    title: "Artisanal Finishing",
    text: "Each piece is carefully polished, brushed, or oxidised to achieve your desired aesthetic, ranging from mirror-finish brass to antique hammered copper.",
  },
  {
    title: "Export-Grade Inspection & Packaging",
    text: "Before leaving Boyolali, every creation undergoes strict quality control and is secured in export-standard protective packaging for safe delivery across Asia, Europe, the Americas, Australia, Africa, and the Middle East.",
  },
];

/** Empty photo placeholder box — kept so images can be dropped in later. */
function PhotoBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-stone-100 border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 ${className}`}
    >
      <ImageIcon className="w-8 h-8 mb-1.5" />
      <span className="text-xs font-medium tracking-wide">Photo</span>
    </div>
  );
}

// HowTo rich result for the five-step process ("From Raw Sheet to Masterpiece").
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "From Raw Sheet to Masterpiece",
  description:
    "The five stages Ilavioo artisans follow to hand-forge a bespoke copper, brass or aluminium piece in Boyolali, Central Java.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export default function CraftsmanshipPage() {
  const whatsapp = `https://wa.me/${SITE.telephone.replace(/\D/g, "")}`;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <JsonLd
        data={webPageStructuredData({
          type: "WebPage",
          path: "/craftsmanship",
          name: META_TITLE,
          description: META_DESCRIPTION,
        })}
      />
      <JsonLd data={howToSchema} />
      <PageHero
        title="The Art of Handmade Metal"
        titleAccent="Craftsmanship"
        description={HERO_SUBTITLE}
        fadeTo="#faf8f5"
      />

      {/* Intro */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-stone-700 text-base sm:text-lg leading-relaxed">
          <p>
            At ilavioo, true craftsmanship cannot be rushed or replicated by
            machines. Every copper bathtub, brass luminaire, and architectural
            replica begins as a raw sheet of metal in our Boyolali workshop,
            Central Java. Guided by three decades of inherited skill, our master
            artisans shape each piece entirely by hand—giving every creation an
            organic soul that ensures no two pieces are ever identical.
          </p>
        </div>
      </section>

      {/* Our Noble Materials */}
      <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-3">
            Our Noble Materials
          </h2>
          <p className="text-stone-600 leading-relaxed max-w-2xl mb-10 sm:mb-14">
            Three metals, each chosen for the character it brings to a piece.
          </p>
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-3">
            {materials.map((m) => (
              <div key={m.name} className="flex flex-col">
                <PhotoBox className="aspect-[4/3] mb-5" />
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#17120d] mb-2">
                  {m.name}
                </h3>
                <p className="text-stone-600 leading-relaxed text-[15px]">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* From Raw Sheet to Masterpiece */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-10 sm:mb-14 max-w-3xl">
            From Raw Sheet to Masterpiece
          </h2>
          <ol className="space-y-14 sm:space-y-20">
            {steps.map((step, i) => (
              <li key={step.title} className="grid gap-6 lg:gap-12 lg:grid-cols-2 items-center">
                <PhotoBox
                  className={`h-64 sm:h-80 lg:h-[380px] ${i % 2 ? "lg:order-2" : ""}`}
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#A8602A] mb-2">
                    Step {i + 1}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#17120d] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Commission a Bespoke Piece (CTA) */}
      <section className="py-16 sm:py-20 bg-white border-t border-stone-200/70">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-3">
            Commission a Bespoke Piece
          </h2>
          <p className="text-stone-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Have a custom design or hospitality project in mind? Speak directly
            with our export team to discuss materials, finishes, and bespoke
            dimensions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full copper-metal text-white font-semibold relative overflow-hidden hover:brightness-[1.06] transition-[filter,box-shadow]"
            >
              Request a quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full leather-texture text-[#f3e3d2] font-semibold relative overflow-hidden ring-1 ring-black/30 hover:brightness-110 transition-[filter]"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
