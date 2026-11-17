import type { Count } from "@/lib/analytics/stats";

/** A titled list of labelled horizontal bars (single series, copper). */
export default function BarList({
  title,
  items,
  empty = "Belum ada data.",
}: {
  title: string;
  items: Count[];
  empty?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.label} title={`${item.label}: ${item.count} kunjungan`}>
              <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
                <span className="text-gray-700 truncate">{item.label}</span>
                <span className="text-gray-500 tabular-nums shrink-0">
                  {item.count} · {Math.round(item.share * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#A8602A]"
                  style={{ width: `${Math.max(2, item.share * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
