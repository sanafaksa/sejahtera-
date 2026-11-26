import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { DEFAULT_POPUP, POPUP_KEY, popupSchema } from "@/lib/popup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public: the current welcome-popup configuration. */
export async function GET() {
  const p = await getSetting(POPUP_KEY, popupSchema, DEFAULT_POPUP);
  return NextResponse.json(p, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
