import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(5000),
  // Honeypot: real users leave this empty; bots fill every field.
  company: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { company, phone, ...data } = parsed.data;
  if (company) {
    // Honeypot tripped — pretend success, store nothing.
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.contactMessage.create({
      data: { ...data, phone: phone ? phone : null },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to store contact message:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
