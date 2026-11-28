"use client";

import { useState } from "react";
import { Plus, Minus, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import FadeInView from "./animations/FadeInView";

interface FaqItem {
  category: string;
  question: string;
  answer: string;
  highlightNote?: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: "Bespoke & Custom Orders",
    question: "Does Ilavioo accept custom commissions based on architectural drawings?",
    answer:
      "Yes, absolutely. The majority of our creations are tailored custom commissions (bespoke). You can share rough sketches, architectural elevations, 2D/3D CAD blueprints, or reference imagery with specific dimensions. Our technical team and master coppersmiths in Boyolali carefully assess sheet thickness, internal steel reinforcement, and on-site mounting practicalities before hand-hammering commences.",
  },
  {
    category: "Materials & Purity",
    question: "What metals and material standards does Ilavioo use?",
    answer:
      "We forge exclusively with 100% pure solid red copper (99.9% purity grade) and premium solid naval brass. We never utilize plated sheet-metal substitutes, zinc blends, or imitation spray coats. As a result, each piece offers generational durability, natural corrosion resistance, superior thermal retention, and irreplaceable tactile beauty.",
  },
  {
    category: "Production Lead Times",
    question: "What is the estimated production timeframe for handcrafted pieces?",
    answer:
      "Production time depends on the type of piece. Smaller decor, tableware and pendant lamps are quicker; large pieces such as bathtubs, carved entrance doors, domes and full project orders take longer. We confirm the production time for your exact design in the quotation.",
  },
  {
    category: "Shipping & Global Export",
    question: "How do you handle domestic shipping and international export freight?",
    answer:
      "We have extensive experience dispatching handcrafted pieces throughout Indonesia and exporting to over 16 countries across North America, Europe, the Middle East, and Asia. Every item is protected with multi-layered high-density foam, heavy cushioning, and custom ISPM-15 certified fumigated wooden crates, fully backed by door-to-door transit insurance from our Boyolali workshop directly to your project destination.",
  },
  {
    category: "Care & Maintenance",
    question: "How should handcrafted copper and brass pieces be cared for?",
    answer:
      "For interior pieces treated with our protective clear coating, maintenance is effortless: simply wipe with a soft, clean microfiber cloth without abrasive chemical cleaners. For items with natural raw finishes or living fire patinas, the metal will age with organic grace over time, developing richer amber tones with age. Complete care instructions are provided with every order.",
  },
  {
    category: "Minimum Order Quantity",
    question: "Is there a Minimum Order Quantity (MOQ)?",
    answer:
      "There is no minimum order requirement. We cater to private residential homeowners ordering a single signature statement piece (1 item), as well as commercial procurement contracts for 5-star boutique hotels, luxury resorts, commercial properties, and places of worship.",
  },
  {
    category: "Workshop Visits & Gallery",
    question: "Can I visit your artisan workshop and showroom in Boyolali?",
    answer:
      "Yes, we warmly welcome architects, interior designers, and collectors to experience our heritage forging process firsthand at our workshop in Boyolali, Central Java. However, to ensure that our master craftsmen and architectural consultants are available to guide you and prepare relevant material samples, workshop visits are by appointment only. Please contact us in advance to schedule your visit before traveling.",
    highlightNote:
      "Notice: Workshop visits are strictly by appointment only. Please contact us via WhatsApp or email prior to your visit so our team can prepare to welcome you.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 sm:py-28 bg-[#faf6f1] relative overflow-hidden border-t border-stone-200/60">
      {/* Ambient background soft warm radial light */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#eed7c4]/45 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <FadeInView direction="up">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#17120d] leading-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
              Explore essential details regarding bespoke commissions, 100% solid copper materials, production timelines, workshop visits, and insured global freight.
            </p>
          </FadeInView>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <FadeInView key={index} direction="up" delay={0.06 * index}>
                <div
                  className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                    isOpen
                      ? "bg-white border-[#b87333]/50 shadow-md ring-1 ring-[#b87333]/20"
                      : "bg-white/80 hover:bg-white border-stone-200/90 shadow-xs hover:border-stone-300"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="w-full text-left px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                          isOpen
                            ? "bg-[#17120d] text-white"
                            : "bg-[#f5ece4] text-[#7d441a]"
                        }`}
                      >
                        0{index + 1}
                      </span>
                      <h3
                        className={`text-base sm:text-lg font-bold transition-colors ${
                          isOpen ? "text-[#17120d]" : "text-stone-800"
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "bg-[#b87333] text-white rotate-180"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Answers stay in the HTML even when collapsed, so search engines and AI crawlers can read every one. */}
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={false}
                    animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                    aria-hidden={!isOpen}
                  >
                    <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-1 border-t border-stone-100 text-stone-600 text-sm sm:text-base leading-relaxed font-light pl-16 sm:pl-19 space-y-3">
                      <p>{faq.answer}</p>

                      {/* Highlight alert if present (Workshop visit reminder) */}
                      {faq.highlightNote && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#fdf6ee] border border-[#ecd2ba] text-[#7d441a] text-xs sm:text-sm font-medium">
                          <CalendarClock className="w-4 h-4 text-[#b87333] shrink-0 mt-0.5" />
                          <p>{faq.highlightNote}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}
