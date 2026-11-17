import { describe, expect, it } from "vitest";
import { isBot, parseUserAgent } from "@/lib/analytics/ua";
import { DIRECT_SOURCE, resolveSource } from "@/lib/analytics/source";
import { daily, inScope, overview, places, type VisitRow } from "@/lib/analytics/stats";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPHONE_INSTAGRAM =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 337.0.3.23.54 (iPhone14,5; iOS 17_5; en_US)";
const ANDROID_FB =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/466.0.0.48.110;]";
const ANDROID_TIKTOK =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36 musical_ly_2023405030 BytedanceWebview/d8a21c6";
const WIN_EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

describe("user agent", () => {
  it("detects devices, OS and browsers", () => {
    expect(parseUserAgent(IPHONE_SAFARI)).toEqual({ device: "mobile", os: "iOS", browser: "Safari", inApp: null });
    expect(parseUserAgent(WIN_EDGE)).toEqual({ device: "desktop", os: "Windows", browser: "Edge", inApp: null });
    expect(parseUserAgent(IPAD).device).toBe("tablet");
  });

  it("flags in-app browsers", () => {
    expect(parseUserAgent(IPHONE_INSTAGRAM).inApp).toBe("Instagram");
    expect(parseUserAgent(ANDROID_FB).inApp).toBe("Facebook");
    expect(parseUserAgent(ANDROID_TIKTOK).inApp).toBe("TikTok");
    expect(parseUserAgent(ANDROID_FB).browser).toBe("Facebook (in-app)");
  });

  it("ignores bots and crawlers", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBot("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)")).toBe(true);
    expect(isBot("WhatsApp/2.23.20.0 A")).toBe(true);
    expect(isBot("curl/8.4.0")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot(IPHONE_SAFARI)).toBe(false);
    expect(isBot(IPHONE_INSTAGRAM)).toBe(false);
  });
});

describe("visit source", () => {
  const base = { ownHost: "ilavioo.com", inApp: null, sessionSource: null };

  it("records no referrer as Langsung", () => {
    const r = resolveSource({ ...base, referrer: null, params: new URLSearchParams() });
    expect(r.visit.source).toBe(DIRECT_SOURCE);
  });

  it("labels known referrers", () => {
    const r = resolveSource({ ...base, referrer: "https://www.google.de/", params: new URLSearchParams() });
    expect(r.visit).toMatchObject({ source: "Google", referrerHost: "www.google.de" });
    expect(
      resolveSource({ ...base, referrer: "https://l.instagram.com/?u=x", params: new URLSearchParams() }).visit.source
    ).toBe("Instagram");
  });

  it("prefers UTM parameters", () => {
    const r = resolveSource({
      ...base,
      referrer: "https://www.google.com/",
      params: new URLSearchParams("utm_source=whatsapp&utm_medium=chat&utm_campaign=promo"),
    });
    expect(r.visit).toMatchObject({ source: "WhatsApp", utmMedium: "chat", utmCampaign: "promo" });
  });

  it("keeps the session source on internal navigation", () => {
    const session = { source: "Pinterest", referrerHost: "pinterest.com", utmSource: null, utmMedium: null, utmCampaign: null };
    const r = resolveSource({
      ...base,
      sessionSource: session,
      referrer: "https://www.ilavioo.com/products",
      params: new URLSearchParams(),
    });
    expect(r.visit).toEqual(session);
    expect(r.isNewSession).toBe(false);
  });

  it("uses the in-app browser when the referrer is stripped", () => {
    const r = resolveSource({ ...base, inApp: "Instagram", referrer: null, params: new URLSearchParams() });
    expect(r.visit.source).toBe("Instagram");
  });
});

function row(p: Partial<VisitRow>): VisitRow {
  return {
    createdAt: new Date("2026-03-10T05:00:00Z"),
    visitorId: "v1",
    path: "/",
    productSlug: null,
    country: "ID",
    region: "JT",
    city: "Boyolali",
    timezone: "Asia/Jakarta",
    device: "mobile",
    os: "Android",
    browser: "Chrome",
    inApp: null,
    source: DIRECT_SOURCE,
    ...p,
  };
}

describe("statistics", () => {
  const rows = [
    row({}),
    row({ visitorId: "v2" }),
    row({ visitorId: "v3", country: "DE", region: "BE", city: "Berlin", timezone: "Europe/Berlin", device: "desktop" }),
    row({ visitorId: "v3", country: "DE", region: "BE", city: "Berlin", device: "desktop" }),
    row({ visitorId: "v4", country: null, region: null, city: null }),
  ];

  it("summarises totals, unique visitors and foreign share", () => {
    const o = overview(rows, new Date("2026-03-10T10:00:00Z"));
    expect(o.total).toBe(5);
    expect(o.unique).toBe(4);
    expect(o.foreignShare).toBe(0.5); // 2 of the 4 rows with a known country
    expect(o.countryCount).toBe(2);
    expect(o.todayVisits).toBe(5);
  });

  it("groups days in WIB, not UTC", () => {
    // 18:30 UTC on 9 March is 01:30 WIB on 10 March.
    const late = [row({ createdAt: new Date("2026-03-09T18:30:00Z") })];
    const points = daily(late, 2, new Date("2026-03-10T10:00:00Z"));
    expect(points.map((p) => [p.date, p.indonesia])).toEqual([
      ["2026-03-09", 0],
      ["2026-03-10", 1],
    ]);
  });

  it("splits scopes and builds place tables", () => {
    expect(rows.filter((r) => inScope(r, "id"))).toHaveLength(2);
    expect(rows.filter((r) => inScope(r, "intl"))).toHaveLength(2);
    const t = places(rows.filter((r) => inScope(r, "intl")), (r) => r.country);
    expect(t[0]).toMatchObject({ code: "DE", visits: 2, unique: 1, topCity: "Berlin", topDevice: "desktop", share: 1 });
  });
});
