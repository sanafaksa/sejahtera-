import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { VISITOR_COOKIE } from "@/lib/analytics/collect";

export const runtime = "nodejs";

const VISITOR_ID = /^[a-f0-9-]{36}$/;
// Attach the precise fix to this visitor's views from the current session.
const WINDOW_MS = 60 * 60 * 1000;

const bodySchema = z.object({
  latitude: z.number().finite().gte(-90).lte(90),
  longitude: z.number().finite().gte(-180).lte(180),
  accuracy: z.number().finite().positive().max(100000).nullish(),
});

/**
 * Receives a precise GPS fix that the visitor explicitly consented to share.
 * The visitor id comes from the httpOnly cookie (not the body), so a caller
 * can only update their own recent visits.
 */
export async function POST(request: Request) {
  const jar = await cookies();
  const visitorId = jar.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !VISITOR_ID.test(visitorId)) {
    return NextResponse.json({ error: "No visitor" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  const { latitude, longitude, accuracy } = parsed.data;

  try {
    const result = await prisma.pageVisit.updateMany({
      where: { visitorId, createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
      data: {
        latitude,
        longitude,
        geoPrecise: true,
        accuracyM: accuracy != null ? Math.round(accuracy) : null,
      },
    });
    return NextResponse.json({ ok: true, updated: result.count });
  } catch (error) {
    console.error("Failed to store precise location:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
