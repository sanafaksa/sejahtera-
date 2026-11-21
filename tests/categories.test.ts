import { describe, expect, it } from "vitest";
import { CATEGORIES, categorizeProduct, getCategory, productsInCategory } from "@/lib/categories";

const cat = (name: string, slug?: string) => categorizeProduct({ name, slug }).slug;

describe("categorizeProduct", () => {
  it("files the current catalog into the expected collections", () => {
    expect(cat("Heritage Antique Copper Bathtub")).toBe("copper-bathtubs");
    expect(cat("Sovereign Brass Double-Slipper Bathtub")).toBe("copper-bathtubs");
    expect(cat("Artisanal Copper Countertop Wash Basin")).toBe("copper-sinks-basins");
    expect(cat("Imperial Nabawi Brass Grand Entrance Door")).toBe("brass-doors-wall-panels");
    expect(cat("Sculptural Kaligrafi Copper Wall Panel")).toBe("brass-doors-wall-panels");
    expect(cat("Tumang Hand-Spun Copper Pendant Dome")).toBe("copper-lighting");
    expect(cat("Moroccan Filigree Brass Chandelier")).toBe("copper-lighting");
    expect(cat("Tumang Fluted Copper Urn & Planter")).toBe("copper-decor");
    expect(cat("Elegant Copper Vase")).toBe("copper-decor");
  });

  it("falls back to the slug, then to decor", () => {
    expect(cat("Royal Piece", "royal-copper-bathtub")).toBe("copper-bathtubs");
    expect(cat("SSSS")).toBe("copper-decor");
  });

  it("does not confuse 'bath' words with basins or lights with 'lighting' false positives", () => {
    expect(cat("Hammered Copper Kitchen Sink")).toBe("copper-sinks-basins");
    expect(cat("Copper Soaking Tub")).toBe("copper-bathtubs");
  });
});

describe("categories data", () => {
  it("has unique slugs and complete SEO fields", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of CATEGORIES) {
      expect(c.description.length).toBeLessThanOrEqual(160);
      expect(c.intro.length).toBeGreaterThan(0);
      expect(c.qa.length).toBeGreaterThan(0);
      expect(getCategory(c.slug)).toBe(c);
    }
  });

  it("productsInCategory filters a list", () => {
    const list = [{ name: "Copper Bathtub" }, { name: "Copper Vase" }];
    expect(productsInCategory(list, "copper-bathtubs")).toEqual([{ name: "Copper Bathtub" }]);
  });
});
