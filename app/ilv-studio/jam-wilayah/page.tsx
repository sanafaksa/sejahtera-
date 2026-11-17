import { Lightbulb, MessageCircle, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { getSetting } from "@/lib/settings";
import {
  buildHeatmap,
  clockSettingsSchema,
  DEFAULT_CLOCK_SETTINGS,
  hourLabel,
  suggestHours,
} from "@/lib/clock";
import { ADMIN_TZ, addDays, dateKey, startOfZonedDay } from "@/lib/timezones";
import RegionClockBoard from "@/components/admin/clock/RegionClockBoard";
import VisitHeatmap from "@/components/admin/clock/VisitHeatmap";

export const dynamic = "force-dynamic";

async function loadVisits() {
  const since = startOfZonedDay(addDays(dateKey(new Date(), ADMIN_TZ), -29), ADMIN_TZ);
  try {
    return await prisma.pageVisit.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, country: true, timezone: true },
      take: 200_000,
    });
  } catch (error) {
    console.warn("Failed to load visits for clocks:", error);
    return [];
  }
}

export default async function JamWilayahPage() {
  await requireAdminPage();
  const [settings, visits] = await Promise.all([
    getSetting("clock", clockSettingsSchema, DEFAULT_CLOCK_SETTINGS),
    loadVisits(),
  ]);

  const counts: Record<string, number> = {};
  for (const v of visits) if (v.country) counts[v.country] = (counts[v.country] ?? 0) + 1;
  const known = Object.values(counts).reduce((a, b) => a + b, 0);
  const shares = Object.fromEntries(Object.entries(counts).map(([k, n]) => [k, known ? n / known : 0]));

  const heat = buildHeatmap(visits);
  const suggestions = suggestHours(visits);
  const h = (n: number) => hourLabel(n, settings.hour12);

  return (
    <div className="space-y-6 max-w-7xl">
      <RegionClockBoard initialNow={Date.now()} initialSettings={settings} shares={shares} />

      <VisitHeatmap rows={heat} hour12={settings.hour12} />

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-[#A8602A]" />
          <h2 className="font-semibold text-gray-900">Saran jam</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {suggestions.map((s) => {
            const postAt = (s.start + 23) % 24;
            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900">{s.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {s.fromData
                    ? `Berdasarkan ${s.visits} kunjungan pada jam teramai`
                    : "Belum ada data; perkiraan dari jam santai malam setempat"}
                </p>
                <p className="mt-4 text-xs text-gray-500">Paling aktif</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {h(s.start)}–{h(s.end)} <span className="text-base font-semibold text-gray-500">WIB</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <Send className="w-4 h-4 text-[#A8602A] shrink-0 mt-0.5" />
                    <span>
                      Posting sekitar <strong className="tabular-nums">{h(postAt)} WIB</strong>, satu jam sebelum ramai.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <MessageCircle className="w-4 h-4 text-[#A8602A] shrink-0 mt-0.5" />
                    <span>
                      Balas pesan antara <strong className="tabular-nums">{h(s.start)}–{h(s.end)} WIB</strong> agar
                      dibaca saat mereka online.
                    </span>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
