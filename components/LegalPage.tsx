import type { ReactNode } from "react";
import PageHero from "@/components/PageHero";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Shared layout for the Privacy Policy and Terms of Service pages. */
export default function LegalPage({
  title,
  description,
  updated,
  intro,
  sections,
}: {
  title: string;
  description: string;
  /** e.g. "21 November 2026" */
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero title={title} description={description} fadeTo="#faf8f5" />

      <section className="bg-[#faf8f5] pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-14 pt-6">
          {/* Table of contents */}
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">On this page</p>
              <ol className="space-y-2 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-stone-600 hover:text-[#A8602A] transition-colors">
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="min-w-0 max-w-3xl text-stone-700 leading-relaxed text-[15px] sm:text-base">
            <p className="text-sm text-stone-500 mb-6">Last updated: {updated}</p>
            <div className="space-y-4 mb-10">{intro}</div>

            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-28">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#17120d] mb-3">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#A8602A] [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-stone-900">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
