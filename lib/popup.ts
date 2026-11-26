import { z } from "zod";

/** Welcome popup shown on page open (superadmin-managed). */
export const popupSchema = z.object({
  enabled: z.boolean(),
  title: z.string().max(120),
  message: z.string().max(600),
  imageUrl: z.string().max(600),
  linkUrl: z.string().max(400),
  linkLabel: z.string().max(60),
  dismissible: z.boolean(),
});

export type PopupSettings = z.infer<typeof popupSchema>;

export const DEFAULT_POPUP: PopupSettings = {
  enabled: false,
  title: "",
  message: "",
  imageUrl: "",
  linkUrl: "",
  linkLabel: "",
  dismissible: true,
};

export const POPUP_KEY = "popup";
