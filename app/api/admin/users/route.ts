import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { denyIfNotSuperadmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

/** List admin users (no password hashes). */
export async function GET() {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

const createSchema = z.object({
  email: z.string().trim().email().max(160),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  password: z.string().min(8).max(200),
  role: z.enum(["admin", "superadmin"]),
});

/** Create a new admin / superadmin. */
export async function POST(request: Request) {
  const denied = await denyIfNotSuperadmin();
  if (denied) return denied;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });

  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { email, name: parsed.data.name || null, password, role: parsed.data.role },
  });
  return NextResponse.json({ ok: true });
}
