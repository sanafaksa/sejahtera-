import { describe, expect, it } from "vitest";
import {
  busiestWindow,
  buildHeatmap,
  clockSettingsSchema,
  dayRelation,
  DEFAULT_CLOCK_SETTINGS,
  diffFromAdminMinutes,
  formatDiff,
  regionStatus,
  suggestHours,
} from "@/lib/clock";
import {
  addDays,
  dateKey,
  formatClock,
  formatOffset,
  offsetMinutes,
  startOfZonedDay,
  zonedParts,
} from "@/lib/timezones";

describe("offsets follow daylight saving time", () => {
  it("New York: EST in winter, EDT in summer", () => {
    expect(offsetMinutes("America/New_York", new Date("2026-01-15T12:00:00Z"))).toBe(-300);
    expect(offsetMinutes("America/New_York", new Date("2026-07-15T12:00:00Z"))).toBe(-240);
  });

  it("Berlin and London switch on the last Sunday of March (01:00 UTC)", () => {
    expect(offsetMinutes("Europe/Berlin", new Date("2026-03-29T00:59:00Z"))).toBe(60);
    expect(offsetMinutes("Europe/Berlin", new Date("2026-03-29T01:00:00Z"))).toBe(120);
    expect(offsetMinutes("Europe/London", new Date("2026-03-29T00:59:00Z"))).toBe(0);
    expect(offsetMinutes("Europe/London", new Date("2026-03-29T01:00:00Z"))).toBe(60);
  });

  it("Sydney is on daylight time in the southern summer", () => {
    expect(offsetMinutes("Australia/Sydney", new Date("2026-01-15T00:00:00Z"))).toBe(660);
    expect(offsetMinutes("Australia/Sydney", new Date("2026-07-15T00:00:00Z"))).toBe(600);
  });

  it("WIB, Tokyo and Singapore never change", () => {
    for (const d of ["2026-01-15T00:00:00Z", "2026-07-15T00:00:00Z"]) {
      expect(offsetMinutes("Asia/Jakarta", new Date(d))).toBe(420);
      expect(offsetMinutes("Asia/Tokyo", new Date(d))).toBe(540);
      expect(offsetMinutes("Asia/Singapore", new Date(d))).toBe(480);
    }
  });

  it("difference to WIB changes with DST", () => {
    expect(diffFromAdminMinutes("Europe/Berlin", new Date("2026-01-15T12:00:00Z"))).toBe(-360);
    expect(diffFromAdminMinutes("Europe/Berlin", new Date("2026-07-15T12:00:00Z"))).toBe(-300);
    expect(formatDiff(-300)).toBe("5 jam lebih lambat");
    expect(formatDiff(120)).toBe("2 jam lebih cepat");
    expect(formatDiff(0)).toBe("Sama dengan WIB");
    expect(formatDiff(-750)).toBe("12 jam 30 mnt lebih lambat");
  });

  it("formats offsets", () => {
    expect(formatOffset(420)).toBe("UTC+7");
    expect(formatOffset(-240)).toBe("UTC-4");
    expect(formatOffset(330)).toBe("UTC+5:30");
    expect(formatOffset(0)).toBe("UTC+0");
  });
});

describe("clock formatting", () => {
  const d = new Date("2026-07-15T13:05:00Z");
  it("shows 24h and 12h clocks", () => {
    expect(formatClock(d, "Asia/Jakarta")).toBe("20:05");
    expect(formatClock(d, "America/New_York")).toBe("09:05");
    expect(formatClock(d, "America/New_York", true)).toMatch(/^09:05\s?AM$/);
  });
});

describe("day relation to WIB", () => {
  it("labels yesterday / today / tomorrow", () => {
    // 02:00 WIB on 16 July = 15 July in New York, 16 July in Tokyo
    const d = new Date("2026-07-15T19:00:00Z");
    expect(dayRelation(d, "America/New_York")).toBe("Kemarin");
    expect(dayRelation(d, "Asia/Tokyo")).toBe("Hari ini");
    // 23:30 WIB on 15 July = 16 July 01:30 in Sydney (AEST)
    expect(dayRelation(new Date("2026-07-15T16:30:00Z"), "Australia/Sydney")).toBe("Besok");
  });
});

describe("region status", () => {
  // Wednesday 15 July 2026
  it("working hours on weekdays", () => {
    expect(regionStatus(new Date("2026-07-15T13:00:00Z"), "America/New_York")).toBe("work"); // 09:00 EDT
    expect(regionStatus(new Date("2026-07-15T21:59:00Z"), "America/New_York")).toBe("work"); // 17:59
    expect(regionStatus(new Date("2026-07-15T22:00:00Z"), "America/New_York")).toBe("edge"); // 18:00
  });

  it("morning/evening and sleep", () => {
    expect(regionStatus(new Date("2026-07-15T04:30:00Z"), "Europe/Berlin")).toBe("edge"); // 06:30 CEST
    expect(regionStatus(new Date("2026-07-15T03:59:00Z"), "Europe/Berlin")).toBe("sleep"); // 05:59
    expect(regionStatus(new Date("2026-07-15T20:00:00Z"), "Europe/Berlin")).toBe("sleep"); // 22:00
  });

  it("weekends use the local day", () => {
    // Friday 17 July 20:00 UTC = Saturday 06:00 in Sydney, Friday 16:00 in New York
    const d = new Date("2026-07-17T20:00:00Z");
    expect(regionStatus(d, "Australia/Sydney")).toBe("weekend");
    expect(regionStatus(d, "America/New_York")).toBe("work");
  });

  it("follows the DST shift: 08:30 UTC is 09:30 in London summer, 08:30 in winter", () => {
    expect(regionStatus(new Date("2026-07-15T08:30:00Z"), "Europe/London")).toBe("work");
    expect(regionStatus(new Date("2026-01-14T08:30:00Z"), "Europe/London")).toBe("edge");
  });
});

describe("zoned days", () => {
  it("finds the UTC start of a local day, also on DST days", () => {
    expect(startOfZonedDay("2026-11-17", "Asia/Jakarta").toISOString()).toBe("2026-11-16T17:00:00.000Z");
    expect(startOfZonedDay("2026-03-29", "Europe/Berlin").toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(startOfZonedDay("2026-03-30", "Europe/Berlin").toISOString()).toBe("2026-03-29T22:00:00.000Z");
    expect(dateKey(new Date("2026-11-16T17:00:00Z"), "Asia/Jakarta")).toBe("2026-11-17");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(zonedParts(new Date("2026-11-17T00:00:00Z"), "Asia/Jakarta").weekday).toBe(2);
  });
});

describe("heatmap and suggestions", () => {
  const at = (iso: string, country: string, timezone: string) => ({ createdAt: new Date(iso), country, timezone });

  it("buckets visits by WIB hour and local hour", () => {
    const rows = buildHeatmap([
      at("2026-07-15T13:10:00Z", "US", "America/New_York"), // 20 WIB, 09 local
      at("2026-07-15T13:40:00Z", "US", "America/New_York"),
      at("2026-07-15T08:00:00Z", "DE", "Europe/Berlin"), // 15 WIB, 10 local
    ]);
    expect(rows[0].country).toBe("US");
    expect(rows[0].wib[20]).toBe(2);
    expect(rows[0].local[9]).toBe(2);
    expect(rows[1].local[10]).toBe(1);
  });

  it("finds the busiest 3-hour window, wrapping past midnight", () => {
    const hours = Array(24).fill(0);
    hours[23] = 4;
    hours[0] = 5;
    hours[1] = 3;
    hours[12] = 6;
    expect(busiestWindow(hours)).toEqual({ start: 23, end: 2, visits: 12 });
    expect(busiestWindow(Array(24).fill(0))).toBeNull();
  });

  it("suggests from data per region group and falls back without data", () => {
    const visits = [
      at("2026-07-15T13:10:00Z", "US", "America/New_York"),
      at("2026-07-15T14:10:00Z", "US", "America/Chicago"),
      at("2026-07-15T02:00:00Z", "ID", "Asia/Jakarta"), // ignored (domestic)
    ];
    const [americas, europe, apac] = suggestHours(visits, new Date("2026-07-15T00:00:00Z"));
    expect(americas).toMatchObject({ fromData: true, visits: 2 });
    expect(americas.start).toBeLessThanOrEqual(20);
    expect(europe.fromData).toBe(false);
    // 19:00 in Berlin (CEST, WIB-5) = 00:00 WIB
    expect(europe.start).toBe(0);
    // 19:00 in Sydney (AEST, WIB+3) = 16:00 WIB
    expect(apac.start).toBe(16);
  });
});

describe("settings", () => {
  it("ships nine default regions with valid zones", () => {
    const parsed = clockSettingsSchema.parse(DEFAULT_CLOCK_SETTINGS);
    expect(parsed.regions).toHaveLength(9);
  });

  it("rejects unknown time zones and bad country codes", () => {
    const bad = { ...DEFAULT_CLOCK_SETTINGS, regions: [{ id: "x", country: "FR", city: "Paris", timeZone: "Mars/Olympus", enabled: true }] };
    expect(clockSettingsSchema.safeParse(bad).success).toBe(false);
    const badCountry = { ...DEFAULT_CLOCK_SETTINGS, regions: [{ id: "x", country: "FRA", city: "Paris", timeZone: "Europe/Paris", enabled: true }] };
    expect(clockSettingsSchema.safeParse(badCountry).success).toBe(false);
  });
});
