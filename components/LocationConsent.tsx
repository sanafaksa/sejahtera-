"use client";

import { useEffect } from "react";

// Only attempt the native prompt once per browser; after that we rely on the
// granted/denied permission state (no repeat prompting).
const ASKED = "ilv_geo_asked";

function send(pos: GeolocationPosition) {
  fetch("/api/track/geo", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }),
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * Headless precise-location capture. If the browser already has location
 * permission granted, coordinates are sent silently; otherwise the browser's
 * own permission prompt is shown once. Consent stays with the browser — we
 * never bypass it, and we never ask twice.
 */
export default function LocationConsent() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    let cancelled = false;

    const get = () =>
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) send(pos);
        },
        () => undefined,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      );

    const askedBefore = () => {
      try {
        if (localStorage.getItem(ASKED)) return true;
        localStorage.setItem(ASKED, String(Date.now()));
        return false;
      } catch {
        return false;
      }
    };

    const perms = navigator.permissions;
    if (perms?.query) {
      perms
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          if (status.state === "denied") return; // respect a prior refusal
          if (status.state === "granted") {
            get(); // already active → send silently
          } else if (!askedBefore()) {
            get(); // "prompt": trigger the browser's own prompt, once
          }
        })
        .catch(() => {
          if (!askedBefore()) get();
        });
    } else if (!askedBefore()) {
      get();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
