import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEDUPE_SECONDS, TRACK_KEY_HEADER, trackingKey } from "@/lib/analytics/track-key";

export const runtime = "nodejs";

const optionalText = (max: number) =>
  z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() ? v.trim().slice(0, max) : null));

const visitSchema = z.object({
  visitorId: z.string().regex(/^[a-f0-9-]{36}$/),
  path: z.string().min(1).max(512).startsWith("/"),
  country: optionalText(2).refine((v) => v === null || /^[A-Z]{2}$/.test(v)),
  region: optionalText(16),
  city: optionalText(120),
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

function keyMatches(given: string | null, expected: string): boolean {
  if (!given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(request: Request) {
  const expected = await trackingKey();
  if (!expected || !keyMatches(request.headers.get(TRACK_KEY_HEADER), expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = visitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid visit" }, { status: 400 });
  }
  const visit = parsed.data;

  try {
    const recent = await prisma.pageVisit.findFirst({
      where: {
        visitorId: visit.visitorId,
        path: visit.path,
        createdAt: { gte: new Date(Date.now() - DEDUPE_SECONDS * 1000) },
      },
      select: { id: true },
    });
    if (recent) return NextResponse.json({ ok: true, deduped: true });

    const productSlug = /^\/products\/([^/]+)$/.exec(visit.path)?.[1] ?? null;

    await prisma.pageVisit.create({
      data: { ...visit, productSlug: productSlug ? safeDecode(productSlug).slice(0, 255) : null },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to record visit:", error);
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
