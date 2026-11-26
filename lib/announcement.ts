import { z } from "zod";

/** Site-wide announcement bar (superadmin-managed). */
export const announcementSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(200),
  link: z.string().max(300),
  linkLabel: z.string().max(40),
  dismissible: z.boolean(),
});

export type Announcement = z.infer<typeof announcementSchema>;

export const DEFAULT_ANNOUNCEMENT: Announcement = {
  enabled: false,
  text: "",
  link: "",
  linkLabel: "",
  dismissible: true,
};

export const ANNOUNCEMENT_KEY = "announcement";
