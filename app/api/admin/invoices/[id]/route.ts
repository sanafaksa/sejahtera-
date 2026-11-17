import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { denyIfNotAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { invoiceInputSchema } from "@/lib/invoice/schema";
import { updateInvoice } from "@/lib/invoice/server";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export async function PUT(request: Request, { params }: Params) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

  const parsed = invoiceInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data invoice tidak valid" }, { status: 400 });
  }
  try {
    const invoice = await updateInvoice(id, parsed.data);
    return NextResponse.json({ id: invoice.id, number: invoice.number });
  } catch (error) {
    if (isNotFound(error)) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    console.error("Failed to update invoice:", error);
    return NextResponse.json({ error: "Gagal menyimpan invoice" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  try {
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isNotFound(error)) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    console.error("Failed to delete invoice:", error);
    return NextResponse.json({ error: "Gagal menghapus invoice" }, { status: 500 });
  }
}
