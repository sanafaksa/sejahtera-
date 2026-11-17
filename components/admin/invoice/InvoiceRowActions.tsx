"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Files, Pencil, Trash2 } from "lucide-react";

export default function InvoiceRowActions({ id, number, token }: { id: number; number: string; token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function duplicate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menduplikat");
      router.push(`/ilv-studio/invoice/${data.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menduplikat");
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Hapus invoice ${number}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Gagal menghapus");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invoice/${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const btn = "p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40";
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/ilv-studio/invoice/${id}`} className={btn} aria-label={`Edit ${number}`} title="Edit">
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        type="button"
        onClick={copyLink}
        className={btn}
        aria-label={`Salin link ${number}`}
        title={copied ? "Tersalin" : "Salin link publik"}
      >
        <Copy className={`w-4 h-4 ${copied ? "text-[#1F6B45]" : ""}`} />
      </button>
      <button type="button" onClick={duplicate} disabled={busy} className={btn} aria-label={`Duplikat ${number}`} title="Duplikat">
        <Files className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className={`${btn} hover:text-red-600 hover:bg-red-50`}
        aria-label={`Hapus ${number}`}
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
