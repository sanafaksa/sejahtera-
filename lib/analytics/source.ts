/**
 * Decide where a visit came from ("Dibuka dari"). Pure function so the edge
 * middleware and the tests can share it.
 */

export const DIRECT_SOURCE = "Langsung";

export interface UtmParams {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export interface VisitSource extends UtmParams {
  source: string;
  referrerHost: string | null;
}

const HOST_LABELS: Array<[RegExp, string]> = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)yandex\./, "Yandex"],
  [/(^|\.)baidu\.com$/, "Baidu"],
  [/(^|\.)ecosia\.org$/, "Ecosia"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, "WhatsApp"],
  [/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/, "Pinterest"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)(t\.me|telegram\.org)$/, "Telegram"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)etsy\.com$/, "Etsy"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com)$/, "Email"],
];

const UTM_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  wa: "WhatsApp",
  instagram: "Instagram",
  ig: "Instagram",
  facebook: "Facebook",
  fb: "Facebook",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  google: "Google",
  email: "Email",
  newsletter: "Email",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  katalog: "Katalog",
  catalog: "Katalog",
  catalogue: "Katalog",
  qr: "QR code",
};

function clean(value: string | null | undefined, max = 100): string | null {
  const v = value?.trim();
  return v ? v.slice(0, max) : null;
}

export function readUtm(params: URLSearchParams): UtmParams {
  return {
    utmSource: clean(params.get("utm_source")),
    utmMedium: clean(params.get("utm_medium")),
    utmCampaign: clean(params.get("utm_campaign")),
  };
}

export function labelForHost(host: string): string {
  const h = host.toLowerCase().replace(/^www\./, "").replace(/^(l|lm|m|mobile)\./, "");
  for (const [pattern, label] of HOST_LABELS) {
    if (pattern.test(h)) return label;
  }
  return h.slice(0, 80);
}

export function labelForUtmSource(utmSource: string): string {
  const key = utmSource.toLowerCase().replace(/[^a-z]/g, "");
  return UTM_LABELS[key] ?? utmSource.slice(0, 80);
}

export function referrerHostOf(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * Work out the source of the current request.
 *
 * @param ownHost     host of the website itself (internal navigation is not a source)
 * @param sessionSource source remembered for this browsing session, if any
 * @param inApp       in-app browser detected from the user-agent
 */
export function resolveSource(input: {
  referrer: string | null | undefined;
  ownHost: string;
  params: URLSearchParams;
  inApp: string | null;
  sessionSource: VisitSource | null;
}): { visit: VisitSource; isNewSession: boolean } {
  const utm = readUtm(input.params);
  const host = referrerHostOf(input.referrer);
  const own = input.ownHost.toLowerCase().replace(/^www\./, "");
  const isInternal = host !== null && host.replace(/^www\./, "") === own;

  // 1. An explicit campaign link always wins.
  if (utm.utmSource) {
    return {
      visit: {
        ...utm,
        source: labelForUtmSource(utm.utmSource),
        referrerHost: isInternal ? null : host,
      },
      isNewSession: true,
    };
  }

  // 2. A new external referrer starts a new session source.
  if (host && !isInternal) {
    return {
      visit: { ...utm, source: labelForHost(host), referrerHost: host },
      isNewSession: true,
    };
  }

  // 3. Internal navigation or a reload: keep the session's original source.
  if (input.sessionSource) {
    return { visit: input.sessionSource, isNewSession: false };
  }

  // 4. Social in-app browsers often strip the referrer.
  if (input.inApp) {
    return {
      visit: { ...utm, source: input.inApp, referrerHost: null },
      isNewSession: true,
    };
  }

  return {
    visit: { ...utm, source: DIRECT_SOURCE, referrerHost: null },
    isNewSession: true,
  };
}
