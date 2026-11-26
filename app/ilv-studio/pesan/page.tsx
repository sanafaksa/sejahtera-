import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { Mail, Phone, Tag } from "lucide-react";
import MessageActions from "@/components/admin/MessageActions";
import { ADMIN_TZ, formatDateTime } from "@/lib/timezones";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  } catch (error) {
    console.warn("Failed to load messages:", error);
    return [];
  }
}

export default async function PesanPage() {
  await requireAdminPage();
  const messages = await getMessages();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-rise space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Pesan masuk</h1>
        <p className="text-stone-600 mt-1">
          Kiriman dari form kontak website.{" "}
          {unread > 0 && (
            <span className="font-medium text-[#9e5b24]">{unread} belum dibaca.</span>
          )}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="glass rounded-[1.5rem] p-10 text-center">
          <Mail className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-600">Belum ada pesan masuk.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`glass rounded-[1.25rem] p-4 sm:p-5 ${
                m.read ? "" : "ring-1 ring-[#A8602A]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!m.read && (
                      <span className="w-2 h-2 rounded-full bg-[#A8602A] shrink-0" aria-label="Belum dibaca" />
                    )}
                    <span className="font-semibold text-stone-900">{m.name}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-stone-500 bg-white/70 rounded-full px-2 py-0.5">
                      <Tag className="w-3 h-3" /> {m.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-stone-500 flex-wrap">
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-[#9e5b24]">
                      <Mail className="w-3.5 h-3.5" /> {m.email}
                    </a>
                    {m.phone && (
                      <a
                        href={`https://wa.me/${m.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#9e5b24]"
                      >
                        <Phone className="w-3.5 h-3.5" /> {m.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-stone-400 whitespace-nowrap tabular-nums">
                    {formatDateTime(m.createdAt, ADMIN_TZ, false)}
                  </span>
                  <MessageActions id={m.id} read={m.read} />
                </div>
              </div>
              <p className="mt-3 text-stone-700 text-sm whitespace-pre-wrap leading-relaxed border-t border-white/70 pt-3">
                {m.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
