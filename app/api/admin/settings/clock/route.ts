import { NextResponse } from "next/server";
import { denyIfNotAdmin } from "@/lib/admin-auth";
import { clockSettingsSchema, DEFAULT_CLOCK_SETTINGS } from "@/lib/clock";
import { getSetting, saveSetting } from "@/lib/settings";

export async function GET() {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  return NextResponse.json(await getSetting("clock", clockSettingsSchema, DEFAULT_CLOCK_SETTINGS));
}

export async function PUT(request: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const parsed = clockSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Pengaturan tidak valid" },
      { status: 400 }
    );
  }
  const ids = new Set(parsed.data.regions.map((r) => r.id));
  if (ids.size !== parsed.data.regions.length) {
    return NextResponse.json({ error: "Wilayah ganda" }, { status: 400 });
  }

  try {
    await saveSetting("clock", parsed.data);
    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("Failed to save clock settings:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
