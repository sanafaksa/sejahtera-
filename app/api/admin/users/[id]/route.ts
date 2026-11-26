import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { denyIfNotSuperadmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().trim().max(120).optional(),
  role: z.enum(["admin", "superadmin"]).optional(),
  password: z.string().min(8).max(200).optional().or(z.literal("")),
});

/** Would this change leave zero superadmins? */
async function wouldOrphanSuperadmins(targetId: string, becomingNonSuper: boolean) {
  if (!becomingNonSuper) return false;
  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { role: true } });
  if (target?.role !== "superadmin") return false;
  const supers = await prisma.user.count({ where: { role: "superadmin" } });
  return supers <= 1;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const data: { name?: string | null; role?: string; password?: string } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name || null;
  if (parsed.data.role) {
    if (await wouldOrphanSuperadmins(id, parsed.data.role !== "superadmin")) {
      return NextResponse.json({ error: "Minimal satu superadmin harus tersisa" }, { status: 400 });
    }
    data.role = parsed.data.role;
  }
  if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;

  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.id === id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }
  if (await wouldOrphanSuperadmins(id, true)) {
    return NextResponse.json({ error: "Minimal satu superadmin harus tersisa" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
}
