import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import {
  DEFAULT_HEADER_SETTINGS,
  HEADER_SETTING_KEY,
  headerSettingsSchema,
} from "@/lib/header-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public: the current contact bar configuration for the site header. */
export async function GET() {
  const settings = await getSetting(HEADER_SETTING_KEY, headerSettingsSchema, DEFAULT_HEADER_SETTINGS);
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
