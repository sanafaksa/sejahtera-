import { requireSuperadminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import AdminUsers from "@/components/admin/AdminUsers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AkunPage() {
  const session = await requireSuperadminPage();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="admin-rise space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-[#A8602A]" /> Akun admin
        </h1>
        <p className="text-stone-600 mt-1">Buat, atur role, reset password, atau hapus akun admin.</p>
      </div>

      <AdminUsers
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        currentUserId={session.user?.id}
      />
    </div>
  );
}
