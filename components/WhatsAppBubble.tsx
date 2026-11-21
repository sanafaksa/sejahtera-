import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { SITE } from "@/lib/site";

/** "+6281213696772" -> "+62 812-1369-6772" */
function formatPhone(e164: string) {
  const m = e164.match(/^\+62(\d{3})(\d{4})(\d+)$/);
  return m ? `+62 ${m[1]}-${m[2]}-${m[3]}` : e164;
}

/** Floating WhatsApp chat button, bottom-right on every public page. */
export default function WhatsAppBubble() {
  const href = `https://wa.me/${SITE.telephone.replace(/\D/g, "")}`;
  const phone = formatPhone(SITE.telephone);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp, ${phone}`}
      className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 rounded-full bg-white pl-1.5 pr-4 py-1.5 shadow-lg ring-1 ring-stone-200 hover:shadow-xl hover:ring-[#25D366]/60 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
        <WhatsAppIcon className="h-6 w-6" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] font-medium text-stone-500">Chat on WhatsApp</span>
        <span className="text-sm font-semibold text-stone-900 tabular-nums">{phone}</span>
      </span>
    </a>
  );
}
