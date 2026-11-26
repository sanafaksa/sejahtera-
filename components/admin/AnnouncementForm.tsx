"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import type { Announcement } from "@/lib/announcement";

export default function AnnouncementForm({ initial }: { initial: Announcement }) {
  const router = useRouter();
  const [a, setA] = useState<Announcement>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Announcement>(k: K, v: Announcement[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/announcement", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(a),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = (k: "enabled" | "dismissible", label: string, hint?: string) => (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-stone-900">{label}</span>
        {hint && <span className="block text-xs text-stone-500 mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={a[k]}
        onClick={() => set(k, !a[k])}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${a[k] ? "bg-[#A8602A]" : "bg-stone-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${a[k] ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="rounded-2xl overflow-hidden ring-1 ring-black/5">
        <div className="bg-[#A8602A] text-white text-[13px] font-medium h-10 px-5 flex items-center justify-center gap-3">
          {a.enabled && a.text.trim() ? (
            <>
              <span className="truncate">
                {a.text}
                {a.link && <span className="ml-2 underline font-semibold">{a.linkLabel || "Selengkapnya"}</span>}
              </span>
              {a.dismissible && <X className="w-3.5 h-3.5 shrink-0" />}
            </>
          ) : (
            <span className="text-white/60 text-xs">Pengumuman dimatikan / kosong</span>
          )}
        </div>
        <p className="text-xs text-stone-500 px-3 py-1.5 bg-white/60">Pratinjau</p>
      </div>

      <div className="glass rounded-2xl px-4 divide-y divide-white/70">
        {toggle("enabled", "Tampilkan pengumuman")}
        {toggle("dismissible", "Bisa ditutup pengunjung", "Pengunjung bisa menutup; muncul lagi jika teks diubah.")}
      </div>

      <div className="glass rounded-2xl p-4 space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-stone-600 mb-1.5">Teks pengumuman</span>
          <input
            value={a.text}
            onChange={(e) => set("text", e.target.value)}
            placeholder="mis. Libur Idul Fitri 1–5 April."
            className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-stone-600 mb-1.5">Link (opsional)</span>
            <input
              value={a.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="/contact atau https://…"
              className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-stone-600 mb-1.5">Teks link</span>
            <input
              value={a.linkLabel}
              onChange={(e) => set("linkLabel", e.target.value)}
              placeholder="Selengkapnya"
              className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="admin-chip inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Simpan
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Tersimpan ✓</span>}
      </div>
    </div>
  );
}
