import { requireAdminPage } from "@/lib/admin-auth";
import { getSetting } from "@/lib/settings";
import { clockSettingsSchema, DEFAULT_CLOCK_SETTINGS } from "@/lib/clock";
import { blankInvoice, getInvoiceSettings, peekNextNumber } from "@/lib/invoice/server";
import { loadCatalog } from "@/lib/invoice/catalog";
import InvoiceForm from "@/components/admin/invoice/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  await requireAdminPage();
  const [settings, products, clock] = await Promise.all([
    getInvoiceSettings(),
    loadCatalog(),
    getSetting("clock", clockSettingsSchema, DEFAULT_CLOCK_SETTINGS),
  ]);
  const initial = blankInvoice(settings);
  const nextNumber = await peekNextNumber(settings, Number(initial.issueDate.slice(0, 4)));

  return (
    <InvoiceForm
      initial={initial}
      settings={settings}
      products={products}
      nextNumber={nextNumber}
      showBuyerTime={clock.showBuyerTimeOnInvoice}
    />
  );
}
