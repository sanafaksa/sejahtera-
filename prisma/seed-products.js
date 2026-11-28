const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const productsData = [
  {
    name: "Sovereign Brass Double-Slipper Bathtub",
    slug: "sovereign-brass-double-slipper-bathtub",
    description:
      "Handcrafted from solid heavy-gauge brass with a mirror-polished interior and matte exterior. Engineered for regal comfort and timeless luxury.",
    details:
      "Every curve of the Sovereign Bathtub is hand-formed by our master artisans in Boyolali. The brass interior reflects candlelight beautifully, creating an unmatched tranquil sanctuary experience for luxury villas and upscale residences.",
    notes: "Custom dimensions and alternative finishes (polished brass, antiqued bronze, satin nickel) are available upon request.",
    specifications: {
      size: "175 x 78 x 72 cm",
      finishing: "High-Gloss Mirror Interior / Matte Pearl Exterior",
      material: "Pure Architectural Brass",
      price: "Contact for Price",
    },
    highlights: [
      { icon: "👑", text: "100% Hand-forged by Boyolali master smiths" },
      { icon: "✨", text: "Exceptional thermal heat retention" },
      { icon: "🛡️", text: "Anti-corrosion protective marine seal" },
      { icon: "✈️", text: "Export-grade timber crating worldwide" },
    ],
    images: [
      {
        imageUrl: "/assets/hero-luxury-bath-suite.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/hero-brass-bathtub.png",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
  {
    name: "Heritage Antique Copper Bathtub",
    slug: "heritage-antique-copper-bathtub",
    description:
      "Classic roll-top soaking bathtub hand-hammered with a rustic scorched fire patina. An iconic centerpiece for luxury resort villas.",
    details:
      "Formed from heavy 16-gauge virgin copper sheet with thousands of manual hammer strikes. Copper naturally regulates water temperature longer than acrylic and possesses self-sanitizing antimicrobial properties.",
    notes: "Easy to clean with mild soap and water. Never requires harsh chemical polishes.",
    specifications: {
      size: "180 x 80 x 70 cm",
      finishing: "Antique Hammered Fire Patina",
      material: "Virgin Red Copper 99.9%",
      price: "Contact for Price",
    },
    highlights: [
      { icon: "🌿", text: "Naturally antimicrobial and hygienic" },
      { icon: "🔨", text: "Over 50,000 hand-hammer strikes" },
      { icon: "🛁", text: "Ergonomic deep soak double slipper" },
      { icon: "⭐", text: "Sustainable heirloom piece that lasts generations" },
    ],
    images: [
      {
        imageUrl: "/assets/products/catalog-craft-31.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/products/catalog-craft-32.jpg",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
  {
    name: "Moroccan Filigree Brass Chandelier",
    slug: "moroccan-filigree-brass-chandelier",
    description:
      "Intricately hand-pierced brass chandelier projecting mesmerizing geometric shadow patterns across walls and ceilings.",
    details:
      "Designed for high-ceiling entry halls, dining spaces, and boutique hotel lobbies. Each tiny opening is pierced by hand with traditional chisels to cast enchanting ambient illumination.",
    notes: "Compatible with E27/E26 standard LED bulbs and dimmable systems.",
    specifications: {
      size: "Diameter 90 cm x Height 120 cm",
      finishing: "Antique Brushed Brass",
      material: "Solid Architectural Brass",
      price: "Contact for Price",
    },
    highlights: [
      { icon: "💡", text: "Casts breathtaking 360° ambient shadow art" },
      { icon: "⚡", text: "Pre-wired to international electrical standards" },
      { icon: "⛓️", text: "Includes matching solid brass chain & canopy" },
      { icon: "🎨", text: "Custom sizes from 60cm to 200cm available" },
    ],
    images: [
      {
        imageUrl: "/assets/copper-lighting-showroom.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/products/catalog-craft-40.jpg",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
  {
    name: "Imperial Nabawi Brass Grand Entrance Door",
    slug: "imperial-nabawi-brass-grand-entrance-door",
    description:
      "Monumental luxury door featuring heavy repoussé brass floral medallions, solid teak foundation, and golden polished highlights.",
    details:
      "An awe-inspiring architectural statement. We engineer these monumental doors with reinforced internal steel bracing wrapped in aged Indonesian teakwood and clad in high-gauge embossed brass.",
    notes: "Custom designed to architectural blueprints. On-site installation support available.",
    specifications: {
      size: "Custom Architectural Sizing",
      finishing: "Mirror Polished Brass with Patina Accents",
      material: "Solid Brass & Teak Wood",
      price: "Custom Project",
    },
    highlights: [
      { icon: "🏛️", text: "Prestigious architectural statement piece" },
      { icon: "🔒", text: "Compatible with modern high-security smart locks" },
      { icon: "🌧️", text: "Weatherproofed with multi-layer UV seal" },
      { icon: "📐", text: "Built to your exact CAD/architectural specs" },
    ],
    images: [
      {
        imageUrl: "/assets/products/catalog-craft-63.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/products/catalog-craft-64.jpg",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
  {
    name: "Boyolali Hand-Spun Copper Pendant Dome",
    slug: "tumang-hand-spun-copper-pendant-dome",
    description:
      "Minimalist industrial dome pendant hand-beaten on a traditional wooden spinning lathe with warm radiant interior glow.",
    details:
      "Ideal in clusters above kitchen islands, bar counters, or luxury dining tables. The warm copper tones enrich interior ambient lighting and create an inviting, sophisticated mood.",
    notes: "Shipped fully assembled with woven fabric cord and ceiling rose.",
    specifications: {
      size: "Diameter 45 cm x Height 30 cm",
      finishing: "Burnished Exterior / Bright Polished Interior",
      material: "Pure Spun Copper",
      price: "Contact for Price",
    },
    highlights: [
      { icon: "✨", text: "Hand-spun on wooden lathes in Boyolali" },
      { icon: "🔌", text: "2-meter adjustable woven fabric cable" },
      { icon: "🛡️", text: "Treated with anti-tarnish protective lacquer" },
    ],
    images: [
      {
        imageUrl: "/assets/products/catalog-craft-69.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/products/catalog-craft-70.jpg",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
  {
    name: "Artisanal Copper Countertop Wash Basin",
    slug: "artisanal-copper-countertop-wash-basin",
    description:
      "Round vessel sink with continuous ball-peen hammer texture. Develops an organic, living character over decades.",
    details:
      "Seamless single-piece copper sink designed for above-counter installation. Pairs beautifully with marble, granite, or live-edge wooden vanity tops.",
    notes: "Standard 1.5 inch drain cutout. Faucet and pop-up drain sold separately.",
    specifications: {
      size: "Diameter 42 cm x Depth 15 cm",
      finishing: "Natural Fire-Treated Patina",
      material: "Heavy 16-Gauge Copper",
      price: "Contact for Price",
    },
    highlights: [
      { icon: "💧", text: "Seamless leak-proof single piece construction" },
      { icon: "🧼", text: "Naturally antibacterial hygienic surface" },
      { icon: "🪵", text: "Stunning contrast on wooden or stone countertops" },
    ],
    images: [
      {
        imageUrl: "/assets/products/catalog-craft-39.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/products/catalog-craft-38.jpg",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
  {
    name: "Sculptural Kaligrafi Copper Wall Panel",
    slug: "sculptural-kaligrafi-copper-wall-panel",
    description:
      "High-relief repoussé wall art meticulously hammered from the reverse side to create deep three-dimensional calligraphy.",
    details:
      "A masterpiece of Boyolali metal art. Master calligraphers and coppersmiths collaborate over several weeks to shape pure copper plate into spiritual and artistic three-dimensional relief.",
    notes: "Includes reinforced aluminum subframe for safe wall hanging.",
    specifications: {
      size: "240 x 120 cm",
      finishing: "Oxidized Black Background / Bright Polished Lettering",
      material: "0.8mm Pure Copper Plate",
      price: "Custom Project",
    },
    highlights: [
      { icon: "🎨", text: "Unique museum-quality three-dimensional relief" },
      { icon: "🔨", text: "Pure traditional repoussé craft" },
      { icon: "🖼️", text: "Reinforced mounting system included" },
    ],
    images: [
      {
        imageUrl: "/assets/products/catalog-craft-66.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/products/catalog-craft-65.jpg",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
  {
    name: "Boyolali Fluted Copper Urn & Planter",
    slug: "tumang-fluted-copper-urn-planter",
    description:
      "Grand ornamental copper urn suitable for upscale hotel foyers, terrace landscapes, and architectural courtyards.",
    details:
      "Features traditional fluted hammering that accentuates sunlight and shadows. Built to withstand both indoor and outdoor atmospheric conditions.",
    notes: "Internal drainage hole can be plugged or left open based on your planting needs.",
    specifications: {
      size: "Height 95 cm x Diameter 60 cm",
      finishing: "Vintage Verdigris & Polished Copper",
      material: "High-Purity Red Copper",
      price: "Contact for Price",
    },
    highlights: [
      { icon: "🌿", text: "Suitable for indoor luxury foliage or exterior gardens" },
      { icon: "☀️", text: "Weather-resistant marine protective finish" },
      { icon: "🏺", text: "Classic timeless classical proportions" },
    ],
    images: [
      {
        imageUrl: "/assets/copper-showroom-gallery.jpg",
        isFeatured: true,
        isCatalog: true,
      },
      {
        imageUrl: "/assets/products/catalog-craft-1.jpg",
        isFeatured: false,
        isCatalog: false,
      },
    ],
  },
];

async function seedProducts() {
  console.log("🌱 Seeding realistic Ilavioo products to database...");

  for (const item of productsData) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      console.log(`⚠️ Product already exists: ${item.name}, skipping.`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        details: item.details,
        notes: item.notes,
        specifications: {
          create: item.specifications,
        },
        highlights: {
          create: item.highlights,
        },
        images: {
          create: item.images,
        },
      },
    });

    console.log(`✅ Created product: ${product.name} (ID: ${product.id})`);
  }

  console.log("🎉 Products seeding completed successfully!");
}

seedProducts()
  .catch((e) => {
    console.error("❌ Products seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
