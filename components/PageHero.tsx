import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import FadeInView from "@/components/animations/FadeInView";
import HeroParallax from "@/components/HeroParallax";

type PageHeroProps = {
  icon?: LucideIcon;
  /** Breadcrumb label for the current page (after "Home /"). */
  crumb?: string;
  eyebrow?: string;
  title: string;
  /** Optional second heading line, rendered in italic. */
  titleAccent?: string;
  description: string;
  /** Page background the hero fades into at the bottom. */
  fadeTo?: string;
  /** Extra content under the description (e.g. search & filters). */
  children?: ReactNode;
};

export default function PageHero({
  icon: Icon,
  crumb,
  eyebrow,
  title,
  titleAccent,
  description,
  fadeTo = "#faf8f5",
  children,
}: PageHeroProps) {
  return (
    // Not overflow-hidden: dropdowns inside `children` must be able to overlap
    // the content below. Decorations are clipped in their own layer instead.
    <section className="relative z-10 bg-[#3E2723]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <HeroParallax />

        {/* Soft fade into the page background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: `linear-gradient(to bottom, transparent, ${fadeTo})` }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 sm:pt-40 pb-20 sm:pb-24">
        <FadeInView direction="up">
          <div className="text-center max-w-3xl mx-auto">
            {Icon && (
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
            )}

            {crumb && (
              <nav
                aria-label="Breadcrumb"
                className="flex items-center justify-center gap-2 text-sm text-white/60 mb-4"
              >
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span className="text-white/40">/</span>
                <span className="text-white">{crumb}</span>
              </nav>
            )}

            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-3 font-medium">
                {eyebrow}
              </p>
            )}

            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-white leading-tight">
              {title}
              {titleAccent && (
                <span className="block italic mt-1">{titleAccent}</span>
              )}
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {children && <div className="max-w-5xl mx-auto mt-10">{children}</div>}
        </FadeInView>
      </div>
    </section>
  );
}
