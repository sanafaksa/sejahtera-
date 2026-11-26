import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { ANNOUNCEMENT_KEY, DEFAULT_ANNOUNCEMENT, announcementSchema } from "@/lib/announcement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public: the current announcement bar configuration. */
export async function GET() {
  const a = await getSetting(ANNOUNCEMENT_KEY, announcementSchema, DEFAULT_ANNOUNCEMENT);
  return NextResponse.json(a, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
