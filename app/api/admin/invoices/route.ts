import { NextResponse } from "next/server";
import { denyIfNotAdmin } from "@/lib/admin-auth";
import { invoiceInputSchema } from "@/lib/invoice/schema";
import { createInvoice } from "@/lib/invoice/server";

export async function POST(request: Request) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const parsed = invoiceInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data invoice tidak valid" }, { status: 400 });
  }
  try {
    const invoice = await createInvoice(parsed.data);
    return NextResponse.json({ id: invoice.id, number: invoice.number }, { status: 201 });
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json({ error: "Gagal menyimpan invoice" }, { status: 500 });
  }
}
