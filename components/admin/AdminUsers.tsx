"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Plus, ShieldCheck, Trash2, UserPlus } from "lucide-react";

type Row = { id: string; email: string; name: string | null; role: string; createdAt: string };

export default function AdminUsers({ users, currentUserId }: { users: Row[]; currentUserId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "admin" });

  const create = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Gagal membuat akun");
        return;
      }
      setForm({ email: "", name: "", password: "", role: "admin" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data?.error || "Gagal");
    else router.refresh();
  };

  const resetPassword = (id: string, email: string) => {
    const pw = prompt(`Password baru untuk ${email} (min. 8 karakter):`);
    if (!pw) return;
    if (pw.length < 8) return alert("Minimal 8 karakter.");
    patch(id, { password: pw });
  };

  const remove = async (id: string, email: string) => {
    if (!confirm(`Hapus akun ${email}?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data?.error || "Gagal menghapus");
    else router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="glass rounded-2xl p-4 sm:p-5">
        <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#A8602A]" /> Tambah akun
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15"
          />
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama"
            className="rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15"
          />
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            placeholder="Password (min. 8)"
            className="rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-xl bg-white/70 border border-white/90 px-3 py-2 text-sm text-stone-900 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15"
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
        <button
          onClick={create}
          disabled={busy || !form.email || form.password.length < 8}
          className="admin-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mt-3 disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Buat akun
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="glass rounded-2xl p-3 sm:p-4 flex items-center gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-900 truncate flex items-center gap-2">
                {u.name || u.email}
                {u.role === "superadmin" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9e5b24] bg-white/70 rounded-full px-2 py-0.5">
                    <ShieldCheck className="w-3 h-3" /> Superadmin
                  </span>
                )}
                {u.id === currentUserId && <span className="text-[11px] text-stone-400">(kamu)</span>}
              </p>
              <p className="text-sm text-stone-500 truncate">{u.email}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => patch(u.id, { role: e.target.value })}
              className="rounded-lg bg-white/70 border border-white/90 px-2 py-1.5 text-xs text-stone-900 outline-none"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <button
              onClick={() => resetPassword(u.id, u.email)}
              title="Reset password"
              className="p-2 rounded-xl text-stone-500 hover:text-[#9e5b24] hover:bg-white transition"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={() => remove(u.id, u.email)}
              disabled={u.id === currentUserId}
              title={u.id === currentUserId ? "Tidak bisa hapus diri sendiri" : "Hapus"}
              className="p-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-white transition disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
