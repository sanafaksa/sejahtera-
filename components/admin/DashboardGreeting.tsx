"use client";

import { CalendarDays, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useNow } from "@/components/admin/clock/useNow";
import { ADMIN_TZ, formatClock, zonedParts } from "@/lib/timezones";

/** Greeting by WIB hour: pagi 04-10, siang 11-14, sore 15-17, malam 18-03. */
export function greetingFor(hour: number) {
  if (hour >= 4 && hour < 11) return { text: "Selamat pagi", icon: Sunrise };
  if (hour >= 11 && hour < 15) return { text: "Selamat siang", icon: Sun };
  if (hour >= 15 && hour < 18) return { text: "Selamat sore", icon: Sunset };
  return { text: "Selamat malam", icon: Moon };
}

export default function DashboardGreeting({ name, initialNow }: { name: string; initialNow: number }) {
  const now = useNow(initialNow);
  const { hour } = zonedParts(now, ADMIN_TZ);
  const greeting = greetingFor(hour);
  const Icon = greeting.icon;
  const date = new Intl.DateTimeFormat("id-ID", {
    timeZone: ADMIN_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div
      className="w-full lg:w-auto flex items-center gap-3 sm:gap-4 bg-white/60 rounded-2xl border border-white/80 shadow-sm px-4 sm:px-5 py-4"
      suppressHydrationWarning
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full admin-chip flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 leading-snug">
          {greeting.text}, {name}
        </p>
        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{date}</span>
        </p>
      </div>
      <div className="pl-3 sm:pl-4 border-l border-stone-900/10 text-right shrink-0">
        <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums leading-none">{formatClock(now, ADMIN_TZ)}</p>
        <p className="text-xs text-gray-500 mt-1">WIB</p>
      </div>
    </div>
  );
}
