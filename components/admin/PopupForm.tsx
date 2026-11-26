"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Upload, Trash2 } from "lucide-react";
import type { PopupSettings } from "@/lib/popup";

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-stone-900">{label}</span>
        {hint && <span className="block text-xs text-stone-500 mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-[#A8602A]" : "bg-stone-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

export default function PopupForm({ initial }: { initial: PopupSettings }) {
  const router = useRouter();
  const [p, setP] = useState<PopupSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof PopupSettings>(k: K, v: PopupSettings[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const upload = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/settings/popup/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErr(data?.error || "Upload gagal");
      else set("imageUrl", data.url);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/popup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(p),
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

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl px-4 divide-y divide-white/70">
        <Toggle label="Tampilkan pop-up saat halaman dibuka" checked={p.enabled} onChange={(v) => set("enabled", v)} />
        <Toggle
          label="Bisa ditutup pengunjung"
          hint="Muncul lagi bila isinya diubah."
          checked={p.dismissible}
          onChange={(v) => set("dismissible", v)}
        />
      </div>

      {/* Image upload */}
      <div className="glass rounded-2xl p-4">
        <span className="block text-xs font-medium text-stone-600 mb-2">Gambar (opsional)</span>
        {p.imageUrl ? (
          <div className="relative w-full max-w-xs aspect-[16/10] rounded-xl overflow-hidden ring-1 ring-black/10">
            <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="320px" />
            <button
              onClick={() => set("imageUrl", "")}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition"
              title="Hapus gambar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 border border-white/90 text-sm font-medium text-stone-700 hover:bg-white transition disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Mengunggah…" : "Unggah gambar"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
        <p className="text-xs text-stone-500 mt-2">PNG/JPG/WebP, maks 4 MB.</p>

        <div className="mt-3 pt-3 border-t border-white/70">
          <label className="block">
            <span className="block text-xs font-medium text-stone-600 mb-1.5">atau tempel URL gambar</span>
            <input
              value={p.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition"
            />
          </label>
        </div>
      </div>

      {/* Text + link */}
      <div className="glass rounded-2xl p-4 space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-stone-600 mb-1.5">Judul</span>
          <input
            value={p.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="mis. Promo Spesial!"
            className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-stone-600 mb-1.5">Pesan</span>
          <textarea
            value={p.message}
            onChange={(e) => set("message", e.target.value)}
            rows={3}
            placeholder="Isi informasi pop-up…"
            className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition resize-none"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-stone-600 mb-1.5">Link tombol (opsional)</span>
            <input
              value={p.linkUrl}
              onChange={(e) => set("linkUrl", e.target.value)}
              placeholder="/products atau https://…"
              className="w-full rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 transition"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-stone-600 mb-1.5">Teks tombol</span>
            <input
              value={p.linkLabel}
              onChange={(e) => set("linkLabel", e.target.value)}
              placeholder="Lihat sekarang"
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
