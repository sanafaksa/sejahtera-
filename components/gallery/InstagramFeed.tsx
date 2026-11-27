"use client";

import { useEffect } from "react";

/**
 * Embeds an Instagram feed from a third-party widget (LightWidget, SnapWidget,
 * Behold, …). The widget is created by the account owner on the provider's site
 * (connecting @ilavioocopper_art there); we only render the iframe it gives.
 *
 * Configure via env (NEXT_PUBLIC_, so they're read in the browser):
 *   NEXT_PUBLIC_INSTAGRAM_EMBED_URL     the iframe `src` the provider gives you.
 *   NEXT_PUBLIC_INSTAGRAM_EMBED_SCRIPT  (optional) the provider's resize script,
 *                                       e.g. https://cdn.lightwidget.com/widgets/lightwidget.js
 *
 * When NEXT_PUBLIC_INSTAGRAM_EMBED_URL is unset the component renders nothing,
 * so the page can fall back to the database gallery.
 */
export const INSTAGRAM_EMBED_URL = process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_URL || "";
const EMBED_SCRIPT = process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_SCRIPT || "";

export default function InstagramFeed({ className = "" }: { className?: string }) {
  useEffect(() => {
    if (!INSTAGRAM_EMBED_URL || !EMBED_SCRIPT) return;
    // Load the provider's resize script once (it auto-sizes iframes it owns).
    if (document.querySelector(`script[src="${EMBED_SCRIPT}"]`)) return;
    const s = document.createElement("script");
    s.src = EMBED_SCRIPT;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  if (!INSTAGRAM_EMBED_URL) return null;

  return (
    <div className={className}>
      <iframe
        src={INSTAGRAM_EMBED_URL}
        title="Instagram @ilavioocopper_art"
        loading="lazy"
        scrolling="no"
        allowTransparency
        // `lightwidget-widget` lets LightWidget's script auto-resize this iframe;
        // it's harmless for other providers.
        className="lightwidget-widget w-full border-0 overflow-hidden"
        style={{ minHeight: 540 }}
      />
    </div>
  );
}
