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
    // Collapsed to just the WhatsApp logo; expands to reveal the number on
    // hover / focus / tap (focus-within covers touch).
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp, ${phone}`}
      className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center rounded-full p-1 bg-transparent ring-0 shadow-none transition-all duration-300 hover:bg-white hover:shadow-xl hover:ring-1 hover:ring-[#25D366]/50 focus-within:bg-white focus-within:shadow-xl focus-within:ring-1 focus-within:ring-[#25D366]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-shadow group-hover:shadow-none group-focus-within:shadow-none">
        <WhatsAppIcon className="h-6 w-6" />
      </span>
      <span className="grid grid-cols-[0fr] opacity-0 transition-all duration-300 group-hover:grid-cols-[1fr] group-hover:opacity-100 group-hover:ml-2.5 group-hover:mr-3 group-focus-within:grid-cols-[1fr] group-focus-within:opacity-100 group-focus-within:ml-2.5 group-focus-within:mr-3">
        <span className="overflow-hidden whitespace-nowrap flex flex-col leading-tight">
          <span className="text-[11px] font-medium text-stone-500">Chat on WhatsApp</span>
          <span className="text-sm font-semibold text-stone-900 tabular-nums">{phone}</span>
        </span>
      </span>
    </a>
  );
}
