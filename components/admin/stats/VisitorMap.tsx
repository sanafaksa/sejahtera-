"use client";

import { useEffect, useRef } from "react";
import type { GeoPoint } from "@/lib/analytics/stats";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// Minimal shape of the globals we use from the CDN build.
type LeafletMap = { setView: (c: [number, number], z: number) => LeafletMap; remove: () => void; fitBounds: (b: [number, number][], o?: unknown) => void };
type Leaflet = {
  map: (el: HTMLElement, opts?: unknown) => LeafletMap;
  tileLayer: (url: string, opts?: unknown) => { addTo: (m: LeafletMap) => void };
  circleMarker: (c: [number, number], opts?: unknown) => { addTo: (m: LeafletMap) => { bindPopup: (html: string) => void } };
};

function loadLeaflet(): Promise<Leaflet> {
  const w = window as unknown as { L?: Leaflet };
  if (w.L) return Promise.resolve(w.L);
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => w.L && resolve(w.L));
      existing.addEventListener("error", reject);
      if (w.L) resolve(w.L);
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => (w.L ? resolve(w.L) : reject(new Error("Leaflet missing")));
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/** Interactive map of visitor locations: copper = approximate (IP), red = precise (GPS). */
export default function VisitorMap({ points }: { points: GeoPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!ref.current || points.length === 0) return;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !ref.current || mapRef.current) return;
        const map = L.map(ref.current, { scrollWheelZoom: false });
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(map);

        const max = Math.max(...points.map((p) => p.count));
        for (const p of points) {
          const radius = 6 + Math.round((p.count / max) * 14);
          const color = p.precise ? "#dc2626" : "#A8602A";
          const marker = L.circleMarker([p.lat, p.lng], {
            radius,
            color,
            weight: 2,
            fillColor: color,
            fillOpacity: 0.35,
          }).addTo(map);
          marker.bindPopup(
            `<strong>${p.label}</strong><br/>${p.count} kunjungan · ${
              p.precise ? "lokasi presisi" : "perkiraan (IP)"
            }`
          );
        }

        const bounds = points.map((p) => [p.lat, p.lng] as [number, number]);
        if (bounds.length === 1) map.setView(bounds[0], 11);
        else map.fitBounds(bounds, { padding: [30, 30] });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <p className="text-sm text-gray-500 px-5 sm:px-6 py-6">
        Belum ada kunjungan dengan koordinat pada rentang ini.
      </p>
    );
  }

  return <div ref={ref} className="h-[420px] w-full rounded-b-xl overflow-hidden z-0" />;
}
