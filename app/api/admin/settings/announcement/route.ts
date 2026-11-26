import { NextResponse } from "next/server";
import { denyIfNotSuperadmin } from "@/lib/admin-auth";
import { saveSetting } from "@/lib/settings";
import { ANNOUNCEMENT_KEY, announcementSchema } from "@/lib/announcement";

export const runtime = "nodejs";

/** Superadmin: save the announcement bar. */
export async function POST(request: Request) {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;

  const parsed = announcementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  try {
    await saveSetting(ANNOUNCEMENT_KEY, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save announcement:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
