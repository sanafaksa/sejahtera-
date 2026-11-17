"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Reports client-side navigations so they count as page views. The first
 * render is skipped: full page loads are already recorded by the middleware.
 * Only the path is sent; everything else is read on the server.
 */
export default function VisitTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    fetch("/api/track/nav", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname, search: window.location.search }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
