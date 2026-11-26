"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Trash2 } from "lucide-react";

export default function MessageActions({ id, read }: { id: number; read: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const setRead = async (next: boolean) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ read: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Hapus pesan ini?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setRead(!read)}
        disabled={busy}
        title={read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
        className="p-2 rounded-xl text-stone-500 hover:text-[#9e5b24] hover:bg-white transition disabled:opacity-50"
      >
        {read ? <RotateCcw className="w-4 h-4" /> : <Check className="w-4 h-4" />}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        title="Hapus"
        className="p-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-white transition disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
