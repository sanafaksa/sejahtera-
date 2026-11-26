import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEDUPE_SECONDS } from "@/lib/analytics/track-key";

const optionalText = (max: number) =>
  z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() ? v.trim().slice(0, max) : null));

/** Server-side validation of a visit, whichever endpoint it came through. */
export const visitSchema = z.object({
  visitorId: z.string().regex(/^[a-f0-9-]{36}$/),
  path: z.string().min(1).max(512).startsWith("/"),
  country: optionalText(2).refine((v) => v === null || /^[A-Z]{2}$/.test(v)),
  region: optionalText(16),
  city: optionalText(120),
  latitude: z.number().finite().gte(-90).lte(90).nullish().transform((v) => v ?? null),
  longitude: z.number().finite().gte(-180).lte(180).nullish().transform((v) => v ?? null),
  timezone: optionalText(64).refine((v) => v === null || /^[A-Za-z0-9_+\-/]+$/.test(v)),
  device: z.enum(["mobile", "tablet", "desktop"]),
  os: optionalText(40),
  browser: optionalText(40),
  inApp: optionalText(20),
  source: z.string().min(1).transform((v) => v.slice(0, 80)),
  referrerHost: optionalText(255),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(100),
});

function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/**
 * Store a visit unless the same visitor opened the same page within the
 * dedupe window (a refresh). Returns false when it was skipped.
 */
export async function recordVisit(input: unknown): Promise<"recorded" | "deduped" | "invalid"> {
  const parsed = visitSchema.safeParse(input);
  if (!parsed.success) return "invalid";
  const visit = parsed.data;

  const recent = await prisma.pageVisit.findFirst({
    where: {
      visitorId: visit.visitorId,
      path: visit.path,
      createdAt: { gte: new Date(Date.now() - DEDUPE_SECONDS * 1000) },
    },
    select: { id: true },
  });
  if (recent) return "deduped";

  const slug = /^\/products\/([^/]+)$/.exec(visit.path)?.[1] ?? null;
  await prisma.pageVisit.create({
    data: { ...visit, productSlug: slug ? safeDecode(slug).slice(0, 255) : null },
  });
  return "recorded";
}
