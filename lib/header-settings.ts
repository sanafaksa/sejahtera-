import { z } from "zod";
import { SITE } from "@/lib/site";

/** Editable contact bar above the site header (superadmin-managed). */
export const headerSettingsSchema = z.object({
  enabled: z.boolean(),
  /** When set, the bar shows this text instead of the default contact info. */
  customText: z.string().max(200),
  /** Scroll the bar content as running text instead of the static layout. */
  marquee: z.boolean(),
  // Fixed contact info (not editable from the UI) used for the default view.
  phone: z.string().max(40),
  email: z.string().max(160),
  hours: z.string().max(80),
  tzLabel: z.string().max(20),
  showHours: z.boolean(),
});

export type HeaderSettings = z.infer<typeof headerSettingsSchema>;

export const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
  enabled: true,
  customText: "",
  marquee: false,
  phone: "+62 8121-3696-772",
  email: SITE.email,
  hours: "Mon – Fri: 08:00 – 17:00",
  tzLabel: "GMT+7",
  showHours: true,
};

export const HEADER_SETTING_KEY = "header";
