import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";
import { CATEGORIES } from "@/lib/categories";
import { SITE, pageMetadata, webPageStructuredData } from "@/lib/site";

const TITLE = "Copper Craftsmanship: Handmade in Tumang, Indonesia";
const DESCRIPTION =
  "Hand-hammered copper and brass craftsmanship from Tumang, Indonesia's copper village. See how our artisans shape, emboss and finish every piece by hand.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/craftsmanship",
  keywords: ["handmade craftsmanship","hand-hammered copper","repousse","traditional metalworking","artisan made","coppersmith"],
  images: [{ url: "/assets/copper-hero-craft.jpg", alt: "Coppersmith hammering a copper piece in Tumang" }],
});

// Same Cloudinary video as the About page.
const HERITAGE_VIDEO_SRC =
  process.env.NEXT_PUBLIC_HERITAGE_VIDEO_URL ||
  "https://res.cloudinary.com/dqcdwv7du/video/upload/v1794803666/ilavioo/videos/by-aksa.mp4";

const steps = [
  {
    title: "Material selection",
    text: "Every piece starts as flat copper or brass sheet. We check each sheet for thickness and surface quality before it is cut, because the metal decides how well a piece can be hammered and how long it will last.",
    image:
      "https://images.unsplash.com/photo-1613218222987-f28e8cfb378f?auto=format&fit=crop&q=80&w=1200",
    alt: "Copper sheets ready for cutting",
  },
  {
    title: "Hand shaping and hammering",
    text: "Our coppersmiths raise the sheet into its form with hammers, stakes and anvils, heating the metal when it hardens so it can be worked again. A bathtub or a large basin takes many rounds of hammering; the marks it leaves are part of its character.",
    image:
      "https://images.unsplash.com/photo-1659682699444-9ebad278fbd3?auto=format&fit=crop&q=80&w=1200",
    alt: "Artisan hammering copper by hand",
  },
  {
    title: "Embossing and detail work",
    text: "Decorative pieces such as doors, wall panels and lamps are worked in repoussé: the pattern is pushed out from the back and refined from the front, by hand, until it stands in relief. Lamps are pierced by hand so the light falls in patterns.",
    image:
      "https://images.unsplash.com/photo-1598724168411-9ba1e003a7fe?auto=format&fit=crop&q=80&w=1200",
    alt: "Hand-embossed copper detail",
  },
  {
    title: "Finishing",
    text: "The surface is polished, antiqued, oxidised or left to develop a natural patina, depending on the design. A clear protective coating can keep the original colour. Bathtubs and basins can also have an enamelled interior.",
    image:
      "https://images.unsplash.com/photo-1737315551644-ef48f2ea8d40?auto=format&fit=crop&q=80&w=1200",
    alt: "Polished copper finish",
  },
  {
    title: "Inspection and packing",
    text: "Before a piece leaves the workshop we check the shape, joints, finish and size against the order. It is then wrapped and packed carefully for the trip to Bali or overseas.",
    image:
      "https://images.unsplash.com/photo-1650239116041-41e6091ee7ce?auto=format&fit=crop&q=80&w=1200",
    alt: "Finished copper piece checked before packing",
  },
];

const qa = [
  {
    q: "What makes Tumang copper craftsmanship special?",
    a: "Tumang, in Cepogo, Boyolali, Central Java, is a village where copper and brass have been worked by hand for generations. Skills such as raising, hammering and repoussé are passed from one craftsman to the next, which is why the village is known across Indonesia for metalwork.",
  },
  {
    q: "Is every Ilavioo piece really handmade?",
    a: "Yes. Pieces are shaped, hammered and finished by hand in our workshop in Tumang. Because of that, no two pieces are exactly the same: small variations in hammer marks and colour are a sign of handwork, not a defect.",
  },
  {
    q: "Can you make a custom design?",
    a: "Yes. Send a photo, sketch or technical drawing with the size you need. We make one-off pieces as well as matching sets for hotels, villas and restaurants.",
  },
  {
    q: "How long does a handmade piece take?",
    a: "It depends on the type of piece, its size and the amount of detail. We confirm the production time with your quotation.",
  },
  {
    q: "Do you ship outside Indonesia?",
    a: "Yes. We have made pieces for clients in more than 16 countries, and we deliver to villas and hotels in Bali.",
  },
];

export default function CraftsmanshipPage() {
  const whatsapp = `https://wa.me/${SITE.telephone.replace(/\D/g, "")}`;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <JsonLd
        data={webPageStructuredData({
          type: "WebPage",
          path: "/craftsmanship",
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <PageHero
        title="Copper Craftsmanship"
        titleAccent="from Tumang"
        description="Every Ilavioo piece is hammered, embossed and finished by hand by coppersmiths in Tumang, Indonesia's copper village."
        fadeTo="#faf8f5"
      />

      {/* Intro */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-stone-700 text-base sm:text-lg leading-relaxed space-y-4">
          <p>
            Handmade copper has a depth that machine-made metal does not. Each hammer blow leaves a small facet that
            catches the light, so a hand-hammered bathtub, basin or lamp looks different in the morning, in the evening
            and from every angle.
          </p>
          <p>
            Ilavioo works in Tumang, a village in Cepogo, Boyolali, Central Java, where copper and brass have been
            worked by hand for generations. Our craftsmen bring more than 30 years of experience to making
            bathtubs, sinks, doors, wall panels, lighting and decor for homes, hotels and villas in Bali and around the
            world.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-10 sm:mb-14 max-w-3xl">
            How a handcrafted copper piece is made
          </h2>
          <ol className="space-y-14 sm:space-y-20">
            {steps.map((step, i) => (
              <li key={step.title} className="grid gap-6 lg:gap-12 lg:grid-cols-2 items-center">
                <div className={`relative h-64 sm:h-80 lg:h-[380px] rounded-2xl overflow-hidden ${i % 2 ? "lg:order-2" : ""}`}>
                  <Image src={step.image} alt={step.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#A8602A] mb-2">Step {i + 1}</p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#17120d] mb-3">{step.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Video */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-3">
            See our craftsmen at work
          </h2>
          <p className="text-stone-600 mb-8">
            More videos from the workshop on{" "}
            <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className="text-[#A8602A] underline underline-offset-2">Instagram</a>{" "}
            and{" "}
            <a href={SITE.social.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#A8602A] underline underline-offset-2">TikTok</a>.
          </p>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-[#17120d]">
            <video
              poster="/assets/copper-hero-craft.jpg"
              controls
              muted
              playsInline
              preload="none"
              className="w-full h-full object-cover"
            >
              <source src={HERITAGE_VIDEO_SRC} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Q&A */}
      <section className="py-14 sm:py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17120d] mb-8">
            Questions about our craftsmanship
          </h2>
          <dl className="space-y-7">
            {qa.map((item) => (
              <div key={item.q}>
                <dt className="font-bold text-stone-900 text-lg mb-2">{item.q}</dt>
                <dd className="text-stone-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Collections + CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#17120d] mb-3">Explore our handmade collections</h2>
          <ul className="flex flex-wrap justify-center gap-2.5 mb-10">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 hover:ring-[#b87333]/60 hover:text-[#A8602A] transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#17120d] text-white font-semibold hover:bg-[#2a2018] transition-colors"
            >
              Request a quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-stone-900 font-semibold ring-1 ring-stone-300 hover:ring-[#A8602A] transition"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
