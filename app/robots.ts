import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// AI crawlers / scrapers we ask to stay out (compliant ones obey robots.txt).
// Search engines (Googlebot, Bingbot, …) are intentionally NOT listed so SEO
// and link previews keep working.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "FacebookBot",
  "Diffbot",
  "Omgilibot",
  "Omgili",
  "ImagesiftBot",
  "cohere-ai",
  "YouBot",
  "DataForSeoBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/ilv-studio", "/api/", "/invoice/"],
      },
      {
        userAgent: AI_CRAWLERS,
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
