import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  deterministicSeo,
  stripTumang,
  type ProductSeoInput,
  type ResolvedProductSeo,
} from "@/lib/product-seo";

/**
 * SEO preview for the admin dashboard.
 *
 * Always returns a deterministic baseline built from the product's real fields.
 * When `enhance` is requested AND ANTHROPIC_API_KEY is configured, it tries to
 * improve the copy with Claude server-side; any failure (no key, timeout, bad
 * output, a stray "Tumang") falls back to the deterministic values. Saving a
 * product never calls this route, so a product can always be saved.
 */

type Body = ProductSeoInput & { enhance?: boolean };

const AI_MODEL = "claude-haiku-5-5";

function valid(seo: Partial<ResolvedProductSeo>): seo is Pick<ResolvedProductSeo, "seoTitle" | "metaDescription" | "imageAlt" | "ogDescription"> {
  const okLen = (s: unknown, min: number, max: number) =>
    typeof s === "string" && s.trim().length >= min && s.trim().length <= max;
  const noTumang = (s: unknown) => typeof s === "string" && !/tumang/i.test(s);
  return (
    okLen(seo.seoTitle, 20, 60) &&
    okLen(seo.metaDescription, 80, 160) &&
    okLen(seo.imageAlt, 10, 125) &&
    okLen(seo.ogDescription, 80, 200) &&
    [seo.seoTitle, seo.metaDescription, seo.imageAlt, seo.ogDescription].every(noTumang)
  );
}

async function enhanceWithClaude(input: ProductSeoInput, base: ResolvedProductSeo): Promise<ResolvedProductSeo | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const facts = {
    name: stripTumang(input.name),
    material: input.specifications?.material ?? null,
    size: input.specifications?.size ?? null,
    finishing: input.specifications?.finishing ?? null,
    description: input.description ? stripTumang(input.description) : null,
  };
  const prompt = `You are an SEO copywriter for ilavioo, a maker of handcrafted copper and brass products in Boyolali, Indonesia, exported worldwide.
Using ONLY these facts (do not invent prices, reviews, ratings, awards, certifications, materials or dimensions), write SEO copy for one product.
Facts: ${JSON.stringify(facts)}
Rules: natural English, no keyword stuffing, never use the word "Tumang".
Return ONLY compact JSON with keys: seoTitle (50-60 chars), metaDescription (140-160 chars), imageAlt (<=125 chars, describe the object), ogDescription (120-180 chars).`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as Partial<ResolvedProductSeo>;
    if (!valid(parsed)) return null;
    return {
      seoTitle: parsed.seoTitle!.trim(),
      metaDescription: parsed.metaDescription!.trim(),
      imageAlt: parsed.imageAlt!.trim(),
      ogTitle: base.ogTitle,
      ogDescription: parsed.ogDescription!.trim(),
      canonicalUrl: base.canonicalUrl,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.name?.trim()) {
    return NextResponse.json({ message: "Product name is required" }, { status: 400 });
  }

  const baseline = deterministicSeo(body);
  let seo = baseline;
  let enhanced = false;
  if (body.enhance) {
    const ai = await enhanceWithClaude(body, baseline);
    if (ai) {
      seo = ai;
      enhanced = true;
    }
  }

  return NextResponse.json({
    seo,
    enhanced,
    aiAvailable: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
