import { NextResponse } from "next/server";
import { denyIfNotSuperadmin } from "@/lib/admin-auth";
import { saveSetting } from "@/lib/settings";
import { POPUP_KEY, popupSchema } from "@/lib/popup";

export const runtime = "nodejs";

/** Superadmin: save the welcome popup. */
export async function POST(request: Request) {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;

  const parsed = popupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  try {
    await saveSetting(POPUP_KEY, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save popup:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
