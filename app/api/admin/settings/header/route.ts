import { NextResponse } from "next/server";
import { denyIfNotSuperadmin } from "@/lib/admin-auth";
import { saveSetting } from "@/lib/settings";
import { HEADER_SETTING_KEY, headerSettingsSchema } from "@/lib/header-settings";

export const runtime = "nodejs";

/** Superadmin: save the contact bar configuration. */
export async function POST(request: Request) {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;

  const parsed = headerSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  try {
    await saveSetting(HEADER_SETTING_KEY, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save header settings:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
