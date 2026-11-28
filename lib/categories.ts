/**
 * Product categories ("collections") for SEO landing pages at /collections/<slug>.
 *
 * Products have no category column; they are matched by keywords in the product
 * name (then slug), so new products added in the admin land in the right
 * collection automatically. The first matching category wins; anything that
 * matches nothing falls into "copper-decor".
 */

export interface CategoryQA {
  q: string;
  a: string;
}

export interface ProductCategory {
  slug: string;
  /** Short name for breadcrumbs, nav chips and the footer. */
  name: string;
  /** <title> (the site template appends " | Ilavioo"). */
  title: string;
  /** H1 on the page. */
  heading: string;
  /** Meta description, ~150 characters. */
  description: string;
  /** Keywords tested against the product name and slug. */
  match: RegExp;
  /** Search phrases for meta keywords and schema. */
  keywords: string[];
  /** Intro paragraphs (plain text). */
  intro: string[];
  /** Buying-guide section. */
  guideHeading: string;
  guide: { title: string; text: string }[];
  qa: CategoryQA[];
}

const SHARED_QA_SHIPPING: CategoryQA = {
  q: "Do you ship abroad and to Bali?",
  a: "Yes. We have exported to more than 16 countries and deliver throughout Indonesia, including Bali. Every piece is wrapped in high-density foam and crated (ISPM-15 fumigated wooden crates for export), with transit insurance from our workshop to your address. Shipping is stated in your quotation.",
};

const SHARED_QA_LEAD: CategoryQA = {
  q: "How long does production take?",
  a: "It depends on the type and size of the piece and on how much hand detail it has. We confirm the production time for your exact design in the quotation.",
};

export const CATEGORIES: ProductCategory[] = [
  {
    slug: "copper-bathtubs",
    keywords: ["copper bathtub", "handmade copper bathtub", "hammered copper bathtub", "freestanding copper tub", "brass bathtub", "copper soaking tub", "luxury copper bath", "copper bathtub for sale", "custom copper bathtub"],
    name: "Copper Bathtubs",
    title: "Handmade Copper & Brass Bathtubs",
    heading: "Handmade Copper & Brass Bathtubs",
    description:
      "Freestanding copper and brass bathtubs hand-hammered in Boyolali, Indonesia. Custom sizes and finishes, made to order and shipped worldwide and to Bali.",
    match: /bath\s?tub|\btub\b|soaking/i,
    intro: [
      "A copper bathtub is the centrepiece of a bathroom: warm to the eye, heavy and solid, and different in every light. Ilavioo bathtubs are shaped and hammered by hand by coppersmiths in Boyolali, a Central Java village with generations of metalworking behind it.",
      "We make freestanding tubs in solid copper and in brass, in classic roll-top, double-slipper and contemporary forms. Interiors can be left in metal or finished in white enamel, and the outside can be mirror-polished, hammered, antiqued or left to develop a natural patina.",
      "Every tub is made to order, so the length, width and depth can follow your bathroom and the way you like to bathe. Send us a reference photo, a sketch or your architect's drawing.",
    ],
    guideHeading: "Choosing a copper bathtub",
    guide: [
      {
        title: "Copper or brass",
        text: "Copper has a warm red-orange tone that deepens over time; brass is more golden and reads as more formal. Both are solid metal, not plated.",
      },
      {
        title: "Shape",
        text: "Roll-top and double-slipper tubs suit classic and resort bathrooms; straight-sided and oval tubs suit modern spaces. We can follow a shape from a photo or drawing.",
      },
      {
        title: "Finish",
        text: "Hammered, mirror-polished, antique or natural patina outside; metal or white enamel inside. A clear protective coating keeps the original colour if you prefer it.",
      },
      {
        title: "Size and placement",
        text: "Tell us the room size, the tub length you want and where the taps and drain will go, and we will advise on dimensions before production starts.",
      },
    ],
    qa: [
      {
        q: "Can you make a copper bathtub in a custom size?",
        a: "Yes. Every tub is made to order, so we can follow the length, width and depth you need. Send the dimensions or a drawing with your enquiry.",
      },
      {
        q: "How do I care for a copper bathtub?",
        a: "Wipe it with a soft, clean cloth and avoid abrasive cleaners. Coated tubs keep their colour; raw copper slowly develops a deeper patina. Care instructions come with every order.",
      },
      SHARED_QA_LEAD,
      SHARED_QA_SHIPPING,
    ],
  },
  {
    slug: "copper-sinks-basins",
    keywords: ["copper sink", "hammered copper sink", "copper vessel sink", "copper basin", "brass sink", "copper kitchen sink", "handmade copper wash basin", "copper bar sink"],
    name: "Sinks & Basins",
    title: "Hammered Copper Sinks & Basins",
    heading: "Hammered Copper Sinks & Basins",
    description:
      "Hand-hammered copper and brass sinks, vessel basins and wash basins from Boyolali, Indonesia. Custom sizes for homes, hotels and villas, shipped worldwide.",
    match: /basin|sink|wash\s?bowl|lavatory|vanity/i,
    intro: [
      "A hammered copper basin turns a washroom, powder room or outdoor shower into something people remember. Ilavioo sinks and basins are raised and hammered by hand in our workshop in Boyolali, Central Java.",
      "We make countertop vessel basins, under-mount and drop-in sinks, and larger kitchen and bar sinks in solid copper or brass. Finishes range from bright polished and hammered to antique and natural patina.",
      "Because every basin is made to order, the diameter, depth and drain position can match your vanity, stone top or tap, and we can make matching sets for hotels and villas.",
    ],
    guideHeading: "Choosing a copper sink or basin",
    guide: [
      {
        title: "Vessel or built-in",
        text: "Vessel basins sit on top of the counter and are the most decorative; under-mount and drop-in sinks are easier to keep clean around.",
      },
      {
        title: "Size and drain",
        text: "Tell us the counter size, the tap you will use and where the drain should be. We make the basin to fit.",
      },
      {
        title: "Finish",
        text: "Hammered textures hide water marks well. A clear coating keeps the original colour; raw copper develops a natural patina.",
      },
      {
        title: "Quantity",
        text: "There is no minimum order: one basin for a home renovation or a matching set for a hotel project.",
      },
    ],
    qa: [
      {
        q: "Can you make matching basins for a hotel or villa project?",
        a: "Yes. We make sets of identical basins to the same size and finish. Send the quantity and the drawing or reference with your enquiry.",
      },
      {
        q: "How do I care for a copper sink?",
        a: "Rinse and wipe dry after use and clean with a soft cloth and mild soap. Avoid abrasive pads and harsh chemicals. Care instructions come with every order.",
      },
      SHARED_QA_LEAD,
      SHARED_QA_SHIPPING,
    ],
  },
  {
    slug: "brass-doors-wall-panels",
    keywords: ["brass door", "brass entrance door", "copper door", "copper wall panel", "repousse copper art", "metal wall art", "brass calligraphy", "mosque door"],
    name: "Doors & Wall Panels",
    title: "Brass Doors & Copper Wall Panels",
    heading: "Brass Doors & Copper Wall Panels",
    description:
      "Hand-made brass entrance doors, repoussé copper wall panels and calligraphy art from Boyolali, Indonesia. Custom pieces for homes, hotels and mosques.",
    match: /door|gate|panel|kaligrafi|calligraph|relief|facade|façade/i,
    intro: [
      "Architectural metalwork is where Boyolali craftsmanship shows most: grand brass entrance doors, repoussé copper reliefs and calligraphy panels, made by hand for homes, hotels, villas and places of worship.",
      "Doors are built on a solid core, such as teak, and clad in brass or copper with hand-worked ornament. Wall panels are hammered from sheet in high relief and finished in polished, antique or oxidised tones.",
      "Nearly every architectural piece is a commission. We work from elevations, CAD drawings or reference photos, and our team checks size, sheet thickness, internal reinforcement and mounting before the coppersmiths start.",
    ],
    guideHeading: "Planning an architectural commission",
    guide: [
      {
        title: "Send your drawings",
        text: "Elevations, CAD files or sketches with dimensions let us advise on structure and mounting before quoting.",
      },
      {
        title: "Pattern and motif",
        text: "Floral, geometric, Islamic and calligraphy motifs can be adapted from your references or designed with you.",
      },
      {
        title: "Finish",
        text: "Mirror-polished brass, antique, oxidised or natural patina; accents can be highlighted by hand.",
      },
      {
        title: "Delivery and installation",
        text: "Large pieces are crated for transport and shipped with transit insurance. We provide the dimensions and mounting details your contractor needs.",
      },
    ],
    qa: [
      {
        q: "Can you make a brass door to our exact opening size?",
        a: "Yes. Doors and panels are made to measure from your drawings or site measurements.",
      },
      {
        q: "Do you make doors and panels for mosques?",
        a: "Yes. We make brass and copper doors, relief panels and calligraphy work for places of worship as well as homes, hotels and commercial buildings.",
      },
      SHARED_QA_LEAD,
      SHARED_QA_SHIPPING,
    ],
  },
  {
    slug: "copper-lighting",
    keywords: ["copper pendant light", "copper chandelier", "brass pendant lamp", "hammered copper lamp", "handmade copper lighting", "pierced copper lamp"],
    name: "Lighting",
    title: "Handmade Copper Pendant Lights & Chandeliers",
    heading: "Handmade Copper Pendant Lights & Chandeliers",
    description:
      "Hand-spun copper pendant lights and pierced brass chandeliers from Boyolali, Indonesia. Made to order for homes, restaurants and hotels, shipped worldwide.",
    match: /lamp|light|pendant|chandelier|lantern|sconce/i,
    intro: [
      "Copper and brass light fittings give a room a warm glow that glass and plastic cannot. Ilavioo pendants and chandeliers are spun, hammered and hand-pierced in our workshop in Boyolali.",
      "We make single pendant domes for kitchens and bars, clusters for restaurants, and pierced brass chandeliers that throw patterned light across walls and ceilings.",
      "Sizes, finishes and drop lengths are made to order, so a whole series can match across a hotel lobby, restaurant or villa.",
    ],
    guideHeading: "Choosing copper lighting",
    guide: [
      {
        title: "Pendant or chandelier",
        text: "Pendant domes give focused light over tables and counters; pierced chandeliers create patterned ambient light.",
      },
      {
        title: "Size and series",
        text: "We can make several pendants in matching or graduated sizes for one space.",
      },
      {
        title: "Finish",
        text: "Polished, burnished, antique or natural patina outside; the inside finish changes the colour of the light.",
      },
      {
        title: "Electrical fittings",
        text: "Tell us the destination country so we can discuss the electrical fittings with you before production.",
      },
    ],
    qa: [
      {
        q: "Can you make a set of matching pendant lights?",
        a: "Yes. We make series of pendants in the same or graduated sizes for kitchens, restaurants and hotel projects.",
      },
      {
        q: "Are the lights suitable for my country's electrical system?",
        a: "Tell us the destination country with your enquiry and we will discuss the fittings with you before production.",
      },
      SHARED_QA_LEAD,
      SHARED_QA_SHIPPING,
    ],
  },
  {
    slug: "copper-decor",
    keywords: ["copper vase", "copper planter", "copper decor", "brass decor", "handmade copper gifts", "hammered copper bowl"],
    name: "Decor & Planters",
    title: "Copper Vases, Planters & Decor",
    heading: "Copper Vases, Planters & Decor",
    description:
      "Hand-hammered copper and brass vases, urns, planters and decor from Boyolali, Indonesia. For homes, hotels and villas; made to order and shipped worldwide.",
    // Fallback category: anything not matched above lands here.
    match: /vase|urn|planter|pot\b|bowl|decor|tray|jug|vessel/i,
    intro: [
      "Copper and brass decor brings warmth to a room, a terrace or a hotel lobby. Ilavioo vases, urns, planters and vessels are hand-hammered in our workshop in Boyolali, Central Java.",
      "Pieces range from tabletop vases and bowls to large fluted urns and floor planters. Finishes include polished, hammered, antique and natural patina, which keeps developing over the years.",
      "Sizes and finishes are made to order, and we make matching sets for hotels, restaurants and villa projects as readily as a single piece for a home.",
    ],
    guideHeading: "Choosing copper decor",
    guide: [
      {
        title: "Indoor or outdoor",
        text: "Raw copper outdoors develops a natural patina; a clear coating keeps the original colour indoors or out.",
      },
      {
        title: "Planters",
        text: "For living plants, tell us whether you need a drainage hole or a liner and we will make the planter accordingly.",
      },
      {
        title: "Sets",
        text: "Graduated sizes and matching pairs work well in lobbies, entrances and along terraces.",
      },
      {
        title: "Finish",
        text: "Polished, hammered, antique or vintage patina; we can match an existing piece from a photo.",
      },
    ],
    qa: [
      {
        q: "Can copper planters be used outdoors?",
        a: "Yes. Outdoors, raw copper gradually develops a natural patina. If you want to keep the original colour, we can apply a protective clear coating.",
      },
      {
        q: "Can you make a set in different sizes?",
        a: "Yes. We make matching sets and graduated sizes for homes, hotels and villa projects.",
      },
      SHARED_QA_LEAD,
      SHARED_QA_SHIPPING,
    ],
  },
];

const FALLBACK_SLUG = "copper-decor";

export function getCategory(slug: string): ProductCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Category for a product, by keywords in its name first, then its slug. */
export function categorizeProduct(product: { name: string; slug?: string | null }): ProductCategory {
  for (const text of [product.name, product.slug ?? ""]) {
    const hit = CATEGORIES.find((c) => c.match.test(text));
    if (hit) return hit;
  }
  return getCategory(FALLBACK_SLUG)!;
}

export function productsInCategory<T extends { name: string; slug?: string | null }>(
  products: T[],
  slug: string
): T[] {
  return products.filter((p) => categorizeProduct(p).slug === slug);
}
