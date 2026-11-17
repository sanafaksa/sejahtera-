import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  collectVisit,
  isHumanRequest,
  isTrackablePath,
  isTrackingEnabled,
  setVisitCookies,
} from "@/lib/analytics/collect";
import { recordVisit } from "@/lib/analytics/record";

export const runtime = "nodejs";

/**
 * Client-side navigations (Next <Link>) never reach the middleware as page
 * loads, so the browser pings this endpoint with the new path. Location,
 * device and source are still derived here on the server from the request.
 */
const bodySchema = z.object({
  path: z.string().min(1).max(512),
  search: z.string().max(1024).optional(),
});

export async function POST(request: NextRequest) {
  const done = NextResponse.json({ ok: true });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isTrackablePath(parsed.data.path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (!isTrackingEnabled(request.nextUrl.hostname) || !isHumanRequest(request.headers)) {
    return done;
  }
  // Only accept pings sent by our own pages.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { payload, session } = collectVisit({
    headers: request.headers,
    cookies: request.cookies,
    host: request.nextUrl.hostname,
    path: parsed.data.path,
    params: new URLSearchParams(parsed.data.search ?? ""),
    referrer: request.headers.get("referer"),
  });

  try {
    await recordVisit(payload);
  } catch (error) {
    console.error("Failed to record navigation:", error);
  }
  setVisitCookies(done, payload.visitorId, session, request.nextUrl.protocol === "https:");
  return done;
}
