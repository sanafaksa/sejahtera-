import Link from "next/link";
import { FileText, Plus, Search, Settings2 } from "lucide-react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/invoice/calc";
import { INVOICE_STATUSES, STATUS_LABELS_ADMIN, formatInvoiceDate, type InvoiceStatus } from "@/lib/invoice/i18n";
import { effectiveStatus } from "@/lib/invoice/view";
import { todayIso } from "@/lib/invoice/server";
import InvoiceRowActions from "@/components/admin/invoice/InvoiceRowActions";
import StatusBadge from "@/components/admin/invoice/StatusBadge";

export const dynamic = "force-dynamic";

const listSelect = {
  id: true,
  number: true,
  publicToken: true,
  status: true,
  customerName: true,
  customerCompany: true,
  issueDate: true,
  dueDate: true,
  currency: true,
  total: true,
} satisfies Prisma.InvoiceSelect;

type ListRow = Prisma.InvoiceGetPayload<{ select: typeof listSelect }>;

function buildWhere(query: string, status: InvoiceStatus | null, today: Date): Prisma.InvoiceWhereInput {
  const and: Prisma.InvoiceWhereInput[] = [];
  if (query) {
    and.push({
      OR: [
        { number: { contains: query, mode: "insensitive" } },
        { customerName: { contains: query, mode: "insensitive" } },
        { customerCompany: { contains: query, mode: "insensitive" } },
        { customerEmail: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  // A sent invoice past its due date is shown (and filtered) as "Jatuh tempo".
  if (status === "overdue") {
    and.push({ OR: [{ status: "overdue" }, { status: "sent", dueDate: { lt: today } }] });
  } else if (status === "sent") {
    and.push({ status: "sent", OR: [{ dueDate: null }, { dueDate: { gte: today } }] });
  } else if (status) {
    and.push({ status });
  }
  return { AND: and };
}

export default async function InvoiceListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdminPage();
  const { q = "", status = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const statusFilter = (INVOICE_STATUSES as readonly string[]).includes(status) ? (status as InvoiceStatus) : null;
  const today = todayIso();

  let invoices: ListRow[] = [];
  try {
    invoices = await prisma.invoice.findMany({
      where: buildWhere(query, statusFilter, new Date(`${today}T00:00:00Z`)),
      orderBy: [{ issueDate: "desc" }, { id: "desc" }],
      take: 300,
      select: listSelect,
    });
  } catch (error) {
    console.warn("Failed to load invoices:", error);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Invoice</h1>
          <p className="text-gray-600">Buat, kirim dan pantau invoice pelanggan.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/ilv-studio/invoice/pengaturan"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Settings2 className="w-4 h-4" /> Pengaturan
          </Link>
          <Link
            href="/ilv-studio/invoice/baru"
            className="inline-flex items-center gap-2 rounded-lg bg-[#A8602A] hover:bg-[#8f4f21] text-white px-4 py-2 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Invoice baru
          </Link>
        </div>
      </div>

      <form className="flex flex-col sm:flex-row gap-3" role="search">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Cari nomor, pelanggan, perusahaan, email…"
            aria-label="Cari invoice"
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40"
          />
        </div>
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          aria-label="Filter status"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Semua status</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS_ADMIN[s]}
            </option>
          ))}
        </select>
        <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Terapkan
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">{query || statusFilter ? "Tidak ada invoice yang cocok." : "Belum ada invoice."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-medium">Nomor</th>
                  <th className="px-3 py-3 font-medium">Pelanggan</th>
                  <th className="px-3 py-3 font-medium">Tanggal</th>
                  <th className="px-3 py-3 font-medium text-right">Total</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {invoices.map((inv) => {
                  const st = effectiveStatus(
                    { status: inv.status as InvoiceStatus, dueDate: inv.dueDate?.toISOString().slice(0, 10) ?? null },
                    today
                  );
                  return (
                    <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        <Link href={`/ilv-studio/invoice/${inv.id}`} className="hover:text-[#A8602A]">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-gray-900">{inv.customerName}</p>
                        {inv.customerCompany && <p className="text-xs text-gray-500">{inv.customerCompany}</p>}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{formatInvoiceDate(inv.issueDate.toISOString(), "id")}</td>
                      <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                        {formatMoney(inv.total.toNumber(), inv.currency, "id")}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={st} />
                      </td>
                      <td className="px-5 py-2">
                        <InvoiceRowActions id={inv.id} number={inv.number} token={inv.publicToken} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
