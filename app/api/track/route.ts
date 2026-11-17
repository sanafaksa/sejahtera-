import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { recordVisit } from "@/lib/analytics/record";
import { TRACK_KEY_HEADER, trackingKey } from "@/lib/analytics/track-key";

export const runtime = "nodejs";

/** Receives full page loads from the middleware (signed with the tracking key). */

function keyMatches(given: string | null, expected: string): boolean {
  if (!given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(request: Request) {
  const expected = await trackingKey();
  if (!expected || !keyMatches(request.headers.get(TRACK_KEY_HEADER), expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await recordVisit(await request.json().catch(() => null));
    if (result === "invalid") return NextResponse.json({ error: "Invalid visit" }, { status: 400 });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Failed to record visit:", error);
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
