/**
 * Anti-scrape helpers for the middleware. These only raise the bar against
 * automated bulk scraping and known AI crawlers — a public site can never be
 * made fully un-scrapable. Search engines and link-preview bots are NOT listed
 * here, so SEO and social sharing keep working.
 */

// AI crawlers + generic HTTP client / scraper libraries we block at the edge.
// NOTE: curl/wget are included, so simple uptime checks using those UAs are
// blocked too — swap them out here if you rely on such a monitor.
export const BLOCKED_BOT_UA =
  /(GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-Web|anthropic-ai|CCBot|Google-Extended|PerplexityBot|Perplexity-User|Bytespider|Amazonbot|Applebot-Extended|Meta-ExternalAgent|FacebookBot|Diffbot|Omgili(bot)?|ImagesiftBot|cohere-ai|YouBot|DataForSeoBot|Scrapy|python-requests|python-httpx|aiohttp|node-fetch|axios\/|Go-http-client|libwww-perl|okhttp|Apache-HttpClient|Java\/[0-9]|HTTrack|Wget|curl\/)/i;

export function isBlockedBot(userAgent: string | null): boolean {
  if (!userAgent) return false; // real browsers always send a UA; don't block empty to spare odd health checks
  return BLOCKED_BOT_UA.test(userAgent);
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

// Best-effort in-memory sliding-window limiter. On Vercel Edge the state lives
// per isolate (not shared globally), so this adds friction but is not a hard
// guarantee — use Vercel Firewall / a KV store for strict limits.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 100; // requests per IP per window (page + RSC loads)
const hits = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  if (ip === "unknown") return false;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Bound memory: occasionally drop IPs with no recent hits.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > RATE_MAX;
}
