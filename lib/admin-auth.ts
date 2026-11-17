import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/** For admin server pages: redirect to the login page when signed out. */
export async function requireAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/ilv-studio/login");
  return session;
}

/**
 * For admin API routes. Returns a 401 response when signed out, otherwise null.
 *
 *   const denied = await denyIfNotAdmin(); if (denied) return denied;
 */
export async function denyIfNotAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
