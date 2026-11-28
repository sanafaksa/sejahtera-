const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const gallerySeedData = [
  {
    title: "Hand-Hammered Brass Sovereign Bathtub",
    description: "Bespoke double-slipper bathtub with mirror polished gold brass interior and white matte exterior.",
    url: "/assets/hero-luxury-bath-suite.jpg",
    type: "image",
    category: "bath",
    tags: ["bathtub", "brass", "luxury", "bathroom"],
    isFeatured: true,
  },
  {
    title: "Monumental Nabawi Brass Clad Gate",
    description: "Precision floral repoussé with golden brass inserts and dark rustic timber backing.",
    url: "/assets/products/catalog-craft-63.jpg",
    type: "image",
    category: "architectural",
    tags: ["doors", "gate", "architectural", "nabawi"],
    isFeatured: true,
  },
  {
    title: "Imperial Moroccan Brass Chandelier",
    description: "Perforated filigree brass chandelier casting warm ambient geometric shadows.",
    url: "/assets/copper-lighting-showroom.jpg",
    type: "image",
    category: "lighting",
    tags: ["chandelier", "lighting", "brass", "filigree"],
    isFeatured: true,
  },
  {
    title: "Embossed Copper Grand Portal",
    description: "Hand-tooled copper relief doors crafted for prestigious luxury villas and resorts.",
    url: "/assets/products/catalog-craft-64.jpg",
    type: "image",
    category: "architectural",
    tags: ["doors", "copper", "embossed", "portal"],
    isFeatured: false,
  },
  {
    title: "Boyolali Master Coppersmith Craftsmanship",
    description: "Behind the scenes of our master artisans shaping raw metal with heat, anvil, and hammer.",
    url: "/assets/by-aksa.mp4",
    type: "video",
    category: "interior",
    tags: ["process", "artisan", "workshop", "video"],
    isFeatured: true,
  },
  {
    title: "Antique Copper Soaking Tub",
    description: "Traditional oval copper bathtub with rolled rim and warm rose gold natural patina.",
    url: "/assets/products/catalog-craft-31.jpg",
    type: "image",
    category: "bath",
    tags: ["bathtub", "copper", "soaking tub"],
    isFeatured: false,
  },
  {
    title: "Grand Kaligrafi Copper Wall Mural",
    description: "Hand-hammered continuous copper wall relief artwork for lobby focal points.",
    url: "/assets/products/catalog-craft-66.jpg",
    type: "image",
    category: "interior",
    tags: ["wall relief", "mural", "copper art", "kaligrafi"],
    isFeatured: true,
  },
  {
    title: "Bespoke Boyolali Dome Pendant Fixture",
    description: "Hand-spun copper dome lamp with antique burnished exterior.",
    url: "/assets/products/catalog-craft-69.jpg",
    type: "image",
    category: "lighting",
    tags: ["lighting", "pendant", "copper lamp"],
    isFeatured: false,
  },
  {
    title: "Curated Copper Showroom Suite",
    description: "Signature collection of sculptural copper vessels, urns, and decorative accents.",
    url: "/assets/copper-showroom-gallery.jpg",
    type: "image",
    category: "interior",
    tags: ["interior", "showroom", "sculpture"],
    isFeatured: false,
  },
  {
    title: "Sacred Geometric Copper Entrance Panel",
    description: "Heavy gauge embossed copper architectural facade panel with traditional motifs.",
    url: "/assets/products/catalog-craft-65.jpg",
    type: "image",
    category: "architectural",
    tags: ["architectural", "facade", "geometric"],
    isFeatured: false,
  },
  {
    title: "Royal Brass Vessel Basin Suite",
    description: "Solid brass countertop sink hand-hammered to perfection.",
    url: "/assets/products/catalog-craft-39.jpg",
    type: "image",
    category: "bath",
    tags: ["basin", "sink", "brass", "sanctuary"],
    isFeatured: false,
  },
  {
    title: "Cascading Geometric Brass Lanterns",
    description: "Artistic brass ceiling suspension lighting designed for boutique hospitality.",
    url: "/assets/products/catalog-craft-40.jpg",
    type: "image",
    category: "lighting",
    tags: ["lantern", "brass", "lighting"],
    isFeatured: false,
  },
];

async function seedGallery() {
  console.log("🌱 Seeding gallery assets to database...");

  const count = await prisma.galleryAsset.count();
  console.log(`Current gallery count: ${count}`);

  for (const item of gallerySeedData) {
    const created = await prisma.galleryAsset.create({
      data: item,
    });
    console.log(`✅ [${created.category}] ${created.title} (ID: ${created.id})`);
  }

  console.log("🎉 Gallery seeding completed successfully!");
}

seedGallery()
  .catch((e) => {
    console.error("❌ Gallery seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
