import { NextResponse } from "next/server";
import { denyIfNotAdmin } from "@/lib/admin-auth";
import { duplicateInvoice } from "@/lib/invoice/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }
  try {
    const copy = await duplicateInvoice(id);
    if (!copy) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ id: copy.id, number: copy.number }, { status: 201 });
  } catch (error) {
    console.error("Failed to duplicate invoice:", error);
    return NextResponse.json({ error: "Gagal menduplikat invoice" }, { status: 500 });
  }
}
