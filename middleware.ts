import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  collectVisit,
  isHumanRequest,
  isTrackablePath,
  isTrackingEnabled,
  setVisitCookies,
} from "@/lib/analytics/collect";
import { TRACK_KEY_HEADER, trackingKey } from "@/lib/analytics/track-key";
import { clientIp, isBlockedBot, isRateLimited } from "@/lib/security";

const ADMIN_PREFIX = "/ilv-studio";
const ADMIN_LOGIN = "/ilv-studio/login";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  // Anti-scrape: block known AI crawlers / scraper libraries, then throttle
  // bursts from a single IP. Both run before anything else.
  const ua = req.headers.get("user-agent");
  if (isBlockedBot(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (isRateLimited(clientIp(req.headers))) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "retry-after": "60" },
    });
  }

  const { pathname } = req.nextUrl;
  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    return protectAdmin(req);
  }
  return trackPageLoad(req, event);
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
// Public pages: record full page loads without slowing the response.
// Client-side navigations are reported by <VisitTracker> via /api/track/nav.
// ---------------------------------------------------------------------------

/**
 * True for a real document load. Next strips its RSC/prefetch headers before
 * middleware runs, so we rely on what the browser sends: RSC fetches and
 * prefetches are `sec-fetch-dest: empty`, page loads are `document`.
 */
function isDocumentLoad(h: Headers): boolean {
  const dest = h.get("sec-fetch-dest");
  if (dest) return dest === "document";
  if (h.get("purpose") === "prefetch" || h.get("sec-purpose")?.includes("prefetch")) return false;
  return h.get("accept")?.includes("text/html") ?? false;
}

async function trackPageLoad(req: NextRequest, event: NextFetchEvent) {
  const res = NextResponse.next();
  const h = req.headers;
  if (
    req.method !== "GET" ||
    !isTrackablePath(req.nextUrl.pathname) ||
    !isTrackingEnabled(req.nextUrl.hostname) ||
    !isDocumentLoad(h) ||
    !isHumanRequest(h)
  ) {
    return res;
  }

  const key = await trackingKey();
  if (!key) return res;

  const { payload, session } = collectVisit({
    headers: h,
    cookies: req.cookies,
    host: req.nextUrl.hostname,
    path: req.nextUrl.pathname,
    params: req.nextUrl.searchParams,
    referrer: h.get("referer"),
  });
  setVisitCookies(res, payload.visitorId, session, req.nextUrl.protocol === "https:");

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
