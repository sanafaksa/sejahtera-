import { NextResponse } from "next/server";
import { denyIfNotAdmin } from "@/lib/admin-auth";
import { invoiceSettingsSchema } from "@/lib/invoice/schema";
import { saveSetting } from "@/lib/settings";

export async function PUT(request: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const parsed = invoiceSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue?.message ?? "Pengaturan tidak valid" }, { status: 400 });
  }
  const ids = new Set(parsed.data.paymentMethods.map((m) => m.id));
  if (ids.size !== parsed.data.paymentMethods.length) {
    return NextResponse.json({ error: "Metode pembayaran ganda" }, { status: 400 });
  }
  try {
    await saveSetting("invoice", parsed.data);
    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("Failed to save invoice settings:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
