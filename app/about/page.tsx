import Image from "next/image";
import { pageMetadata, webPageStructuredData } from "@/lib/site";
import Link from "next/link";
import HeroBackdrop from "@/components/HeroBackdrop";
import FadeInView from "@/components/animations/FadeInView";
import StaggerContainer, {
  StaggerItem,
} from "@/components/animations/StaggerContainer";
import CountUpNumber from "@/components/animations/CountUpNumber";
import ParallaxSection from "@/components/animations/ParallaxSection";
import {
  Award,
  Users,
  Globe,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";

// Hosted on Cloudinary (720p faststart). The local public/assets/by-aksa.mp4 is
// git-ignored (215 MB > GitHub limit) and does not exist on Vercel.
const HERITAGE_VIDEO_SRC =
  process.env.NEXT_PUBLIC_HERITAGE_VIDEO_URL ||
  "https://res.cloudinary.com/dqcdwv7du/video/upload/v1794803666/ilavioo/videos/by-aksa.mp4";

export const metadata = pageMetadata({
  title: "About Us: 30+ Years of Boyolali Copper Craft",
  description:
    "Learn about our 30+ years of heritage in handcrafted copper and brass artistry from Boyolali, Indonesia.",
  path: "/about",
  keywords: ["Indonesian artisans","Boyolali artisans","heritage metalwork","copper craft Central Java"],
  images: [{ url: "/assets/about.jpg", alt: "Ilavioo artisans in Boyolali" }],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-green-50">
      <JsonLd
        data={webPageStructuredData({
          type: "AboutPage",
          path: "/about",
          name: "About Us",
          description:
            "The story of Ilavioo and the copper and brass craft heritage of Boyolali, Indonesia.",
        })}
      />
      <PageHero
        title="Our Story"
        description="PT. Ilavioo Nusantara Sejahtera—widely known as ilavioo—where three decades of artisanal devotion meet global architectural excellence."
        fadeTo="#fdfcf9"
      />

      <section className="py-16 bg-gradient-to-br from-cream-50 via-white to-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView direction="up">
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    <CountUpNumber value={30} suffix="+" />
                  </div>
                  <p className="text-gray-600 font-medium">Years Experience</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-copper-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-copper-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    <CountUpNumber value={5000} suffix="+" />
                  </div>
                  <p className="text-gray-600 font-medium">Happy Clients</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    <CountUpNumber value={100} suffix="%" />
                  </div>
                  <p className="text-gray-600 font-medium">Handcrafted</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 text-center hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-copper-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-7 h-7 text-copper-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    <CountUpNumber value={16} suffix="+" />
                  </div>
                  <p className="text-gray-600 font-medium">Countries Served</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </FadeInView>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ParallaxSection offset={-96} className="lg:[&>*]:will-change-transform">
            <FadeInView direction="left">
              <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-[#17120d]">
                <video
                  poster="/assets/copper-hero-craft.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                >
                  <source src={HERITAGE_VIDEO_SRC} type="video/mp4" />
                </video>
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide border border-white/10 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#b87333] animate-pulse" />
                    Boyolali · Central Java
                  </span>
                </div>
              </div>
            </FadeInView>
            </ParallaxSection>

            <ParallaxSection offset={48}>
            <FadeInView direction="right">
              <div>
                <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                  Our Heritage
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Forged in the Highlands,{" "}
                  <span className="text-green-600">Cherished Across the World</span>
                </h2>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Our workshop is nestled in Boyolali, Central Java,
                    Indonesia—a serene highland town blessed with crisp, cool
                    mountain air at the foot of two iconic giants: the majestic,
                    active volcano Mount Merapi and the renowned trekking
                    sanctuary of Mount Merbabu. It is within this inspiring
                    landscape that our artisans channel the raw energy of fire
                    and metal, turning sheets of copper, brass, and aluminium
                    into enduring works of art.
                  </p>

                  <p>
                    ilavioo was built on the skill and passion of master
                    craftsmen with more than 30 years of hands-on experience.
                    For us, metalworking is not merely a manufacturing process;
                    it is an intimate dialogue between the artisan and the
                    material.
                  </p>

                  <p>
                    Every curve of a copper bathtub, every intricate engraving
                    on a Nabawi or Mecca mosque door replica, and every delicate
                    detail on a Javanese Robyong lamp is executed with an
                    artistic eye and genuine heart.
                  </p>
                </div>
              </div>
            </FadeInView>
            </ParallaxSection>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView direction="up" className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-copper-100 text-copper-700 rounded-full text-sm font-semibold mb-4">
              Our Craft
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              No Two Pieces Are Ever Alike
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              In an era of factory-made uniformity, we celebrate the soul of the
              handmade. Every ilavioo creation is crafted to custom designs and
              bespoke dimensions—individually shaped, hammered, and finished by
              hand.
            </p>
          </FadeInView>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Home Decor",
              "Hotel Interiors",
              "Restaurant Design",
              "Architectural Projects",
              "Vases & Ornaments",
              "Bathtubs & Cookware",
              "Calligraphy & Logos",
              "Chandeliers & Lighting",
              "Wall Reliefs",
            ].map((item, index) => (
              <StaggerItem key={index}>
                <div className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl hover:bg-green-50 transition-colors border border-gray-100">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="font-semibold text-gray-900">{item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInView direction="up" className="text-center mt-12">
            <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Because each piece is individually made, slight organic nuances
              make every creation completely unique. When you own an ilavioo
              piece, you own an unrepeatable work of art—crafted to
              international export standards and carrying Indonesia&apos;s
              cultural heritage into your space.
            </p>
          </FadeInView>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-50 to-copper-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <ParallaxSection offset={-56}>
            <FadeInView direction="left">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-100 h-full">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-3xl font-bold text-gray-900 mb-4">
                  From Central Java to the World
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  While we take immense pride in serving esteemed clients across
                  Indonesia, our craftsmanship knows no borders. Over the years,
                  ilavioo has successfully exported bespoke metalwork to Asia,
                  Europe, the Americas, Australia, Africa, and the Middle East.
                </p>
              </div>
            </FadeInView>
            </ParallaxSection>

            <ParallaxSection offset={56}>
            <FadeInView direction="right">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-copper-100 h-full">
                <div className="w-16 h-16 bg-copper-600 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-3xl font-bold text-gray-900 mb-4">
                  A Lasting Testament to Indonesian Artistry
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  From luxury resorts and private residences to grand mosques
                  and boutique hotels, our creations stand as lasting testaments
                  to Indonesian artistry—trusted by discerning projects around
                  the globe.
                </p>
              </div>
            </FadeInView>
            </ParallaxSection>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView direction="up">
            <div className="bg-[#3E2723] rounded-3xl px-6 py-12 sm:p-12 text-white text-center relative overflow-hidden">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                  <HeroBackdrop />
                </div>
              <div className="relative z-10">
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                  Let Us Craft Something Extraordinary Together
                </h2>
                <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Whether you are commissioning a single statement piece or
                  sourcing a full container for a hospitality project, our export
                  team is ready to assist you from initial concept to worldwide
                  delivery.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-8 py-3.5 copper-metal text-white rounded-full font-semibold relative overflow-hidden hover:brightness-[1.06] transition-[filter] duration-300"
                  >
                    Browse Products
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-3.5 leather-texture text-[#f3e3d2] rounded-full font-semibold relative overflow-hidden transition-[filter] duration-300 ring-1 ring-white/25 hover:brightness-110"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>
    </main>
  );
}
