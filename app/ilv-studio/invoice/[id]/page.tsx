import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { getSetting } from "@/lib/settings";
import { clockSettingsSchema, DEFAULT_CLOCK_SETTINGS } from "@/lib/clock";
import { getInvoiceSettings, toView } from "@/lib/invoice/server";
import { loadCatalog } from "@/lib/invoice/catalog";
import InvoiceForm from "@/components/admin/invoice/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [invoice, settings, products, clock] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
    getInvoiceSettings(),
    loadCatalog(),
    getSetting("clock", clockSettingsSchema, DEFAULT_CLOCK_SETTINGS),
  ]);
  if (!invoice) notFound();

  return (
    <InvoiceForm
      key={invoice.updatedAt.toISOString()}
      initial={toView(invoice)}
      settings={settings}
      products={products}
      nextNumber={invoice.number}
      showBuyerTime={clock.showBuyerTimeOnInvoice}
    />
  );
}
