import { requireAdminPage } from "@/lib/admin-auth";
import { getInvoiceSettings, todayIso } from "@/lib/invoice/server";
import InvoiceSettingsForm from "@/components/admin/invoice/InvoiceSettingsForm";

export const dynamic = "force-dynamic";

export default async function InvoiceSettingsPage() {
  await requireAdminPage();
  const settings = await getInvoiceSettings();
  return <InvoiceSettingsForm initial={settings} year={Number(todayIso().slice(0, 4))} />;
}
