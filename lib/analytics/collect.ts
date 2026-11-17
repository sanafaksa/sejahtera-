/**
 * Builds a visit record from an incoming request. Edge-safe (no Node APIs), so
 * it is shared by the middleware (full page loads) and /api/track/nav
 * (client-side navigations).
 */
import type { NextResponse } from "next/server";
import { isBot, parseUserAgent } from "@/lib/analytics/ua";
import { resolveSource, type VisitSource } from "@/lib/analytics/source";

export const VISITOR_COOKIE = "ilv_vid";
export const SESSION_COOKIE = "ilv_src";
const SESSION_SECONDS = 30 * 60;
const VISITOR_SECONDS = 365 * 24 * 60 * 60;
const VISITOR_ID = /^[a-f0-9-]{36}$/;

export interface VisitPayload extends VisitSource {
  visitorId: string;
  path: string;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  device: "mobile" | "tablet" | "desktop";
  os: string | null;
  browser: string | null;
  inApp: string | null;
}

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

/** Public, non-admin page paths only. */
export function isTrackablePath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("/ilv-studio") &&
    !path.startsWith("/api") &&
    !path.startsWith("/invoice/") &&
    !path.startsWith("/_next") &&
    !/\.[A-Za-z0-9]+$/.test(path)
  );
}

/** Whether visits should be recorded at all for this host/environment. */
export function isTrackingEnabled(host: string): boolean {
  if (process.env.VERCEL_ENV === "preview") return false;
  if ((host === "localhost" || host === "127.0.0.1") && process.env.ANALYTICS_TRACK_LOCAL !== "1") {
    // Local dev shares the production database; don't pollute the statistics.
    return false;
  }
  return true;
}

export function isHumanRequest(headers: Headers): boolean {
  return !isBot(headers.get("user-agent"));
}

export function normalizePath(path: string): string {
  return (path.replace(/\/+$/, "") || "/").slice(0, 512);
}

function readSession(raw: string | undefined): VisitSource | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<VisitSource>;
    if (typeof v.source !== "string" || !v.source) return null;
    const str = (x: unknown) => (typeof x === "string" && x ? x.slice(0, 100) : null);
    return {
      source: v.source.slice(0, 80),
      referrerHost: str(v.referrerHost),
      utmSource: str(v.utmSource),
      utmMedium: str(v.utmMedium),
      utmCampaign: str(v.utmCampaign),
    };
  } catch {
    return null;
  }
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function collectVisit(input: {
  headers: Headers;
  cookies: CookieReader;
  /** Host of the website, used to recognise internal referrers. */
  host: string;
  path: string;
  params: URLSearchParams;
  /** Referrer of the page view (document.referrer or the Referer header). */
  referrer: string | null;
}): { payload: VisitPayload; session: VisitSource } {
  const h = input.headers;
  const ua = parseUserAgent(h.get("user-agent"));

  let visitorId = input.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !VISITOR_ID.test(visitorId)) visitorId = crypto.randomUUID();

  const { visit } = resolveSource({
    referrer: input.referrer,
    ownHost: input.host,
    params: input.params,
    inApp: ua.inApp,
    sessionSource: readSession(input.cookies.get(SESSION_COOKIE)?.value),
  });

  return {
    session: visit,
    payload: {
      visitorId,
      path: normalizePath(input.path),
      country: h.get("x-vercel-ip-country"),
      region: h.get("x-vercel-ip-country-region"),
      city: decodeHeader(h.get("x-vercel-ip-city")),
      timezone: h.get("x-vercel-ip-timezone"),
      device: ua.device,
      os: ua.os,
      browser: ua.browser,
      inApp: ua.inApp,
      ...visit,
    },
  };
}

/** Persist the anonymous visitor id and the rolling 30-minute session source. */
export function setVisitCookies(
  res: NextResponse,
  visitorId: string,
  session: VisitSource,
  secure: boolean
) {
  const base = { httpOnly: true, sameSite: "lax" as const, secure, path: "/" };
  res.cookies.set(VISITOR_COOKIE, visitorId, { ...base, maxAge: VISITOR_SECONDS });
  res.cookies.set(SESSION_COOKIE, JSON.stringify(session), { ...base, maxAge: SESSION_SECONDS });
}
