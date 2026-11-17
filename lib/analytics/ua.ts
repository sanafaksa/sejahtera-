/**
 * Small, dependency-free user-agent parsing. Runs in the edge middleware, so
 * it must stay free of Node APIs.
 */

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface ParsedUserAgent {
  device: DeviceType;
  os: string | null;
  browser: string | null;
  /** In-app browser of a social app, e.g. "Instagram". */
  inApp: string | null;
}

const BOT_PATTERN =
  /bot\b|bot\/|crawl|spider|slurp|scrap|facebookexternalhit|facebookcatalog|meta-externalagent|embedly|preview|whatsapp\/|telegrambot|discordbot|skypeuripreview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|vercel|curl\/|wget\/|python|go-http|java\/|okhttp|axios|node-fetch|undici|postman|insomnia|httpclient|libwww|feedfetcher|mediapartners|adsbot|apis-google|google-inspectiontool|bingpreview|petalbot|semrush|ahrefs|mj12|dotbot|yandex|baiduspider|bytespider|gptbot|chatgpt|claudebot|anthropic|perplexity|ccbot|amazonbot|applebot/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  return BOT_PATTERN.test(userAgent);
}

function detectInApp(ua: string): string | null {
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua)) return "Facebook";
  if (/musical_ly|BytedanceWebview|TikTok|trill_/i.test(ua)) return "TikTok";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  if (/Pinterest/i.test(ua)) return "Pinterest";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/\bLine\//i.test(ua)) return "LINE";
  if (/Twitter|TwitterAndroid/i.test(ua)) return "X";
  return null;
}

function detectOs(ua: string): string | null {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/iPhone|iPod/i.test(ua)) return "iOS";
  if (/iPad/i.test(ua)) return "iPadOS";
  if (/Android/i.test(ua)) return "Android";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  // iPadOS 13+ in desktop mode reports itself as a Mac.
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return null;
}

function detectBrowser(ua: string, inApp: string | null): string | null {
  if (inApp) return `${inApp} (in-app)`;
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Edg(e|A|iOS)?\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/YaBrowser/i.test(ua)) return "Yandex";
  if (/UCBrowser/i.test(ua)) return "UC Browser";
  if (/Firefox|FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome|CriOS|Chromium/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua)) return "Safari";
  return null;
}

function detectDevice(ua: string): DeviceType {
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua)) return "tablet";
  // Android phones include "Mobile"; Android tablets usually do not.
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone|BlackBerry|Opera Mini/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export function parseUserAgent(userAgent: string | null | undefined): ParsedUserAgent {
  const ua = userAgent ?? "";
  const inApp = detectInApp(ua);
  return {
    device: detectDevice(ua),
    os: detectOs(ua),
    browser: detectBrowser(ua, inApp),
    inApp,
  };
}
