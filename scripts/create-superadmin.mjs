// Create or update the developer superadmin account.
// Usage (PowerShell):
//   $env:SUPERADMIN_EMAIL="nafian@ilavioo.com"; $env:SUPERADMIN_PASSWORD="your-strong-password"; $env:SUPERADMIN_NAME="Nafian"; node scripts/create-superadmin.mjs
//
// The password is read from the environment and never written to the repo.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = (process.env.SUPERADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD || "";
const name = process.env.SUPERADMIN_NAME || "Superadmin";

if (!email || !password) {
  console.error("Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD env vars first.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("SUPERADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);

const user = await prisma.user.upsert({
  where: { email },
  update: { password: hash, role: "superadmin", name },
  create: { email, password: hash, role: "superadmin", name },
});

console.log(`Superadmin ready: ${user.email} (role=${user.role})`);
await prisma.$disconnect();
