"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

type Option = { value: string; label: string };

/** Narrows the stats below the chart to one province / country. */
export default function StatsRegionFilter({
  value,
  options,
  basePath,
  label,
}: {
  value: string;
  options: Option[];
  /** URL with range & tab already set, ending so `&region=` can be appended. */
  basePath: string;
  label: string;
}) {
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <MapPin className="w-4 h-4 text-[#A8602A] shrink-0" />
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v ? `${basePath}&region=${encodeURIComponent(v)}` : basePath);
        }}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40 max-w-56"
      >
        <option value="">{label}: semua</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
