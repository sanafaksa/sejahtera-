import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isBot, parseUserAgent } from "@/lib/analytics/ua";
import { resolveSource, type VisitSource } from "@/lib/analytics/source";
import { TRACK_KEY_HEADER, trackingKey } from "@/lib/analytics/track-key";

const ADMIN_PREFIX = "/ilv-studio";
const ADMIN_LOGIN = "/ilv-studio/login";
const VISITOR_COOKIE = "ilv_vid";
const SESSION_COOKIE = "ilv_src";
const SESSION_SECONDS = 30 * 60;
const VISITOR_SECONDS = 365 * 24 * 60 * 60;

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    return protectAdmin(req);
  }
  return trackVisit(req, event);
}

// ---------------------------------------------------------------------------
// Admin: require a NextAuth session on the server, not only in the browser.
// ---------------------------------------------------------------------------
async function protectAdmin(req: NextRequest) {
  if (req.nextUrl.pathname === ADMIN_LOGIN) return NextResponse.next();

  const secret = process.env.NEXTAUTH_SECRET;
  // NextAuth prefixes the cookie with __Secure- only on https; accept either.
  const token =
    (await getToken({ req, secret, secureCookie: true })) ??
    (await getToken({ req, secret, secureCookie: false }));

  if (token) return NextResponse.next();

  const login = new URL(ADMIN_LOGIN, req.url);
  login.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(login);
}

// ---------------------------------------------------------------------------
// Public pages: record an anonymous visit without slowing the response.
// ---------------------------------------------------------------------------
function isPrefetch(h: Headers): boolean {
  return Boolean(
    h.get("next-router-prefetch") ||
      h.get("x-middleware-prefetch") ||
      h.get("purpose") === "prefetch" ||
      h.get("sec-purpose")?.includes("prefetch")
  );
}

function shouldTrack(req: NextRequest): boolean {
  if (req.method !== "GET") return false;
  if (process.env.VERCEL_ENV === "preview") return false;
  const host = req.nextUrl.hostname;
  if (
    (host === "localhost" || host === "127.0.0.1") &&
    process.env.ANALYTICS_TRACK_LOCAL !== "1"
  ) {
    // Local dev shares the production database; don't pollute the statistics.
    return false;
  }
  if (isPrefetch(req.headers)) return false;
  return !isBot(req.headers.get("user-agent"));
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

async function trackVisit(req: NextRequest, event: NextFetchEvent) {
  const res = NextResponse.next();
  if (!shouldTrack(req)) return res;

  const key = await trackingKey();
  if (!key) return res;

  const h = req.headers;
  const secure = req.nextUrl.protocol === "https:";
  const ua = parseUserAgent(h.get("user-agent"));

  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !/^[a-f0-9-]{36}$/.test(visitorId)) {
    visitorId = crypto.randomUUID();
  }

  const { visit } = resolveSource({
    referrer: h.get("referer"),
    ownHost: req.nextUrl.hostname,
    params: req.nextUrl.searchParams,
    inApp: ua.inApp,
    sessionSource: readSession(req.cookies.get(SESSION_COOKIE)?.value),
  });

  res.cookies.set(VISITOR_COOKIE, visitorId, {
    maxAge: VISITOR_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  // Rolling 30-minute session so internal clicks keep their original source.
  res.cookies.set(SESSION_COOKIE, JSON.stringify(visit), {
    maxAge: SESSION_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });

  const path = (req.nextUrl.pathname.replace(/\/+$/, "") || "/").slice(0, 512);
  const payload = {
    visitorId,
    path,
    country: h.get("x-vercel-ip-country"),
    region: h.get("x-vercel-ip-country-region"),
    city: decodeHeader(h.get("x-vercel-ip-city")),
    timezone: h.get("x-vercel-ip-timezone"),
    device: ua.device,
    os: ua.os,
    browser: ua.browser,
    inApp: ua.inApp,
    ...visit,
  };

  event.waitUntil(
    fetch(new URL("/api/track", req.nextUrl.origin), {
      method: "POST",
      headers: { "content-type": "application/json", [TRACK_KEY_HEADER]: key },
      body: JSON.stringify(payload),
    }).catch(() => undefined)
  );

  return res;
}

export const config = {
  // Skip API routes, Next internals and anything that looks like a file.
  matcher: [
    "/((?!api|_next/static|_next/image|_vercel|assets|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.[A-Za-z0-9]+$).*)",
  ],
};
