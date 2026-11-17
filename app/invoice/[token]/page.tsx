import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { clockSettingsSchema, DEFAULT_CLOCK_SETTINGS } from "@/lib/clock";
import { getInvoiceSettings, toView, todayIso } from "@/lib/invoice/server";
import { INVOICE_TEXT } from "@/lib/invoice/i18n";
import { effectiveStatus } from "@/lib/invoice/view";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";
import PrintButton from "@/components/invoice/PrintButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { token } = await params;
  const { print } = await searchParams;
  // Tokens are 32 URL-safe characters; reject anything else without a query.
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) notFound();

  const invoice = await prisma.invoice
    .findUnique({ where: { publicToken: token }, include: { items: true } })
    .catch(() => null);
  if (!invoice) notFound();
  // Drafts are only visible to a signed-in admin (preview / PDF before sending).
  if (invoice.status === "draft" && !(await getServerSession(authOptions))) notFound();

  const [settings, clock] = await Promise.all([
    getInvoiceSettings(),
    getSetting("clock", clockSettingsSchema, DEFAULT_CLOCK_SETTINGS),
  ]);
  const view = toView(invoice);
  const t = INVOICE_TEXT[view.language];

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-6 sm:py-10 px-3 sm:px-6 print:p-0">
      <div className="max-w-[820px] mx-auto mb-4 flex justify-end print:hidden">
        <PrintButton label={t.download} autoPrint={print === "1"} accent={settings.accentColor} />
      </div>
      <InvoiceDocument
        invoice={view}
        settings={settings}
        showBuyerTime={clock.showBuyerTimeOnInvoice}
        status={effectiveStatus(view, todayIso())}
      />
    </div>
  );
}
