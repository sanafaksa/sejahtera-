import { requireSuperadminPage } from "@/lib/admin-auth";
import { getSetting } from "@/lib/settings";
import {
  DEFAULT_HEADER_SETTINGS,
  HEADER_SETTING_KEY,
  headerSettingsSchema,
} from "@/lib/header-settings";
import {
  ANNOUNCEMENT_KEY,
  DEFAULT_ANNOUNCEMENT,
  announcementSchema,
} from "@/lib/announcement";
import { DEFAULT_POPUP, POPUP_KEY, popupSchema } from "@/lib/popup";
import { Megaphone, MonitorPlay, ShieldCheck } from "lucide-react";
import HeaderSettingsForm from "@/components/admin/HeaderSettingsForm";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import PopupForm from "@/components/admin/PopupForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PengaturanPage() {
  await requireSuperadminPage();
  const [header, announcement, popup] = await Promise.all([
    getSetting(HEADER_SETTING_KEY, headerSettingsSchema, DEFAULT_HEADER_SETTINGS),
    getSetting(ANNOUNCEMENT_KEY, announcementSchema, DEFAULT_ANNOUNCEMENT),
    getSetting(POPUP_KEY, popupSchema, DEFAULT_POPUP),
  ]);

  return (
    <div className="admin-rise space-y-6 max-w-3xl">
      <div>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9e5b24] mb-2">
          <ShieldCheck className="w-4 h-4" /> Superadmin
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Pengaturan situs</h1>
        <p className="text-stone-600 mt-1">Atur contact bar di atas header website, termasuk mode running text.</p>
      </div>

      <section className="glass rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Contact bar</h2>
        <HeaderSettingsForm initial={header} />
      </section>

      <section className="glass rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#A8602A]" /> Banner pengumuman
        </h2>
        <AnnouncementForm initial={announcement} />
      </section>

      <section className="glass rounded-[1.5rem] p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-[#A8602A]" /> Pop-up saat halaman dibuka
        </h2>
        <PopupForm initial={popup} />
      </section>
    </div>
  );
}
