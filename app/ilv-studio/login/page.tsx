"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
// Card folds away, then the "opening" panel shows while the dashboard loads.
const EXIT_MS = 900;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // Card shakes on a failed attempt.
  const [cardRef, animateCard] = useAnimate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || leaving) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah. Coba lagi.");
        if (cardRef.current) animateCard(cardRef.current, { x: [0, -10, 9, -6, 4, 0] }, { duration: 0.45 });
        setLoading(false);
        return;
      }

      router.prefetch("/ilv-studio/dashboard");
      setLeaving(true);
      setTimeout(() => {
        router.push("/ilv-studio/dashboard");
        router.refresh();
      }, EXIT_MS);
    } catch {
      setError("Terjadi kesalahan. Coba lagi nanti.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell min-h-screen flex flex-col">
      <div className="admin-backdrop" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Top bar */}
      <header className="px-5 pt-5 sm:px-8 sm:pt-7">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-white/60 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke website
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          {!leaving ? (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="w-full max-w-4xl"
            >
              <div
                ref={cardRef}
                className="glass-strong rounded-[2rem] overflow-hidden grid md:grid-cols-[1.05fr_1fr]"
              >
                {/* Left: photo panel */}
                <div className="relative hidden md:block min-h-[560px] m-2.5 rounded-[1.5rem] overflow-hidden">
                  <Image
                    src="/assets/copper-showroom-gallery.jpg"
                    alt="Showroom tembaga dan kuningan Ilavioo di Tumang"
                    fill
                    priority
                    sizes="(min-width: 768px) 460px, 0px"
                    className="object-cover object-top scale-[1.12] origin-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a1a10]/90 via-[#2a1a10]/35 to-[#2a1a10]/10" />
                  <div className="absolute inset-x-0 bottom-0 p-7 admin-rise">
                    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3c9a3] mb-3">
                      <span className="admin-live w-1.5 h-1.5 rounded-full bg-[#f3c9a3] text-[#f3c9a3]" />
                      Ilavioo Studio
                    </p>
                    <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold leading-[1.08] text-white">
                      Kelola website
                      <br />
                      Ilavioo.
                    </h1>
                    <p className="mt-3 text-sm text-white/75 max-w-xs leading-relaxed">
                      Produk, galeri, invoice dan statistik pengunjung dalam satu tempat.
                    </p>
                  </div>
                </div>

                {/* Right: form */}
                <div className="p-7 sm:p-10 flex flex-col justify-center admin-rise">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="w-11 h-11 rounded-2xl bg-white/85 ring-1 ring-white shadow-sm flex items-center justify-center">
                      <Image src="/assets/ilavioo-emblem.png" alt="" width={26} height={28} className="object-contain" />
                    </span>
                    <span className="leading-tight">
                      <span className="block font-semibold text-stone-900">Ilavioo</span>
                      <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#9e5b24]">
                        Admin panel
                      </span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">Selamat datang</h2>
                  <p className="text-sm text-stone-500 mt-1.5 mb-7">Masuk untuk mengelola website.</p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        role="alert"
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2 p-3 mb-5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-sm font-medium">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                          <span>{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-stone-600 mb-1.5 ml-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          placeholder="nama@ilavioo.com"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/65 border border-white/90 text-stone-900 placeholder:text-stone-400 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 focus:border-[#b87333]/40 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-xs font-medium text-stone-600 mb-1.5 ml-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/65 border border-white/90 text-stone-900 placeholder:text-stone-400 outline-none focus:bg-white focus:ring-4 focus:ring-[#b87333]/15 focus:border-[#b87333]/40 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white/80 transition"
                          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="admin-chip admin-tile group w-full mt-3 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Memeriksa…
                        </>
                      ) : (
                        <>
                          Masuk
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-8 text-center text-xs text-stone-400">
                    © {new Date().getFullYear()} Ilavioo Nusantara Sejahtera
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="opening"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="glass-strong rounded-[1.75rem] px-10 py-8 text-center"
              role="status"
            >
              <Image
                src="/assets/ilavioo-emblem.png"
                alt=""
                width={36}
                height={40}
                className="object-contain mx-auto mb-4"
              />
              <span className="block w-8 h-8 mx-auto rounded-full border-[3px] border-[#b87333]/20 border-t-[#b87333] animate-spin" />
              <p className="mt-4 text-sm font-medium text-stone-600">Membuka dashboard…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
