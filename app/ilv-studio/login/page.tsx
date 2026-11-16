"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EASE_DOOR = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Roll-up door exit: slats appear → small unlock dip → door rolls up into the housing
const EXIT_MS = 1600;
const SLATS_S = 0.35;

// Horizontal steel slats of a rolling shutter, laid over the login screen
const SHUTTER_BG = [
  // slat grooves (shadow + highlight every 26px)
  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, rgba(255,255,255,0) 2px, rgba(255,255,255,0) 22px, rgba(0,0,0,0.38) 23px, rgba(0,0,0,0.38) 25px, rgba(0,0,0,0) 26px)",
  // brushed copper-steel tint
  "linear-gradient(to right, rgba(74,54,40,0.55), rgba(120,92,70,0.45) 50%, rgba(74,54,40,0.55))",
].join(", ");

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [rollDistance, setRollDistance] = useState(1000);

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
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Success: roll the screen up like a shutter, then enter the dashboard
      router.prefetch("/ilv-studio/dashboard");
      setRollDistance(window.innerHeight + 80);
      setLeaving(true);
      setTimeout(() => {
        router.push("/ilv-studio/dashboard");
        router.refresh();
      }, EXIT_MS);
    } catch {
      setError("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    // Same background as the admin dashboard, revealed when the screen slides up
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Revealed under the sliding screen while the dashboard loads */}
      {leaving && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <Image
            src="/assets/ilavioo-emblem.png"
            alt=""
            width={44}
            height={48}
            className="object-contain"
          />
          <span className="w-7 h-7 rounded-full border-[3px] border-[#b87333]/20 border-t-[#b87333] animate-spin" />
          <p className="text-sm font-medium text-stone-500">Opening dashboard…</p>
        </div>
      )}

      {/* Shutter housing (the drum box the door rolls into) */}
      <AnimatePresence>
        {leaving && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            transition={{ duration: SLATS_S, ease: EASE_OUT }}
            className="absolute top-0 inset-x-0 z-40 h-10 sm:h-12 bg-gradient-to-b from-[#1c130c] via-[#3a2a1e] to-[#5a4636] border-b border-black/40 shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
          >
            <div className="absolute inset-x-0 bottom-1.5 h-px bg-white/15" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Full-screen stage (becomes the rolling door on exit) ---------- */}
      <motion.div
        initial={{ clipPath: "inset(0% 50% 0% 50%)", opacity: 0.6, y: 0 }}
        animate={
          leaving
            ? {
                // Keep the entrance end-state; values omitted here would
                // animate back to `initial` (the closed centre slit).
                clipPath: "inset(0% 0% 0% 0%)",
                opacity: 1,
                // hold while slats appear → unlock dip → roll up into the housing
                y: [0, 0, 16, -rollDistance],
                transition: {
                  default: { duration: 0 },
                  y: {
                    duration: EXIT_MS / 1000,
                    times: [0, 0.22, 0.34, 1],
                    ease: ["linear", "easeOut", [0.55, 0, 0.35, 1]],
                  },
                },
              }
            : {
                clipPath: "inset(0% 0% 0% 0%)",
                opacity: 1,
                transition: { duration: 0.9, ease: EASE_DOOR },
                transitionEnd: { clipPath: "none" },
              }
        }
        className="relative z-30 min-h-screen bg-[#2a1a10]"
      >
        {/* Rolling-door slats + bottom bar, shown once sign-in succeeds */}
        <motion.div
          initial={false}
          animate={{ opacity: leaving ? 1 : 0 }}
          transition={{ duration: SLATS_S }}
          className="pointer-events-none absolute inset-0 z-30"
          style={{ backgroundImage: SHUTTER_BG }}
        >
          <div className="absolute bottom-0 inset-x-0 h-7 bg-gradient-to-b from-[#9a8270] via-[#5d4838] to-[#2b1f16] border-t border-white/20 shadow-[0_-4px_10px_rgba(0,0,0,0.35)]">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-2.5 rounded-full bg-[#1f160f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.2)]" />
          </div>
        </motion.div>

        {/* Background photo (zoomed from top to crop the camera watermark) */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/copper-showroom-gallery.jpg"
            alt="Ilavioo copper & brass showroom in Tumang"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top scale-[1.12] origin-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a1a10]/90 via-[#3E2723]/65 to-[#3E2723]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a1a10]/70 via-transparent to-[#2a1a10]/30" />
        </div>

        {/* Logo bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE_OUT }}
          className="relative z-10 mx-auto max-w-7xl px-6 pt-6 sm:px-10 sm:pt-8 lg:px-14"
        >
          <Link href="/" className="flex items-center gap-3 w-fit">
            <span className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center shadow-sm">
              <Image
                src="/assets/ilavioo-emblem.png"
                alt=""
                width={28}
                height={30}
                className="object-contain"
              />
            </span>
            <span className="leading-none">
              <span className="block font-display text-xl font-bold text-white">
                Ilavioo
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70 mt-1">
                Nusantara Sejahtera
              </span>
            </span>
          </Link>
        </motion.header>

        {/* Two balanced columns, vertically centred in the remaining height */}
        <div className="relative mx-auto grid max-w-7xl min-h-[calc(100vh-88px)] items-center gap-10 px-6 pb-16 pt-8 sm:px-10 md:grid-cols-2 lg:gap-16 lg:px-14">
          {/* ---------- Left: headline (slides in from the left) ---------- */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.7, ease: EASE_OUT }}
            className="relative hidden md:block"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e9a878] mb-5">
              Admin Portal
            </p>
            <h1 className="font-display font-extrabold text-[#f3d9c4] text-5xl lg:text-7xl leading-[1.05]">
              Crafting
              <br />
              Copper
              <br />
              Heritage
              <span className="inline-block w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full bg-[#008236] ml-2 align-baseline" />
            </h1>
            <p className="mt-6 text-base text-white/70 max-w-sm leading-relaxed">
              Manage the Ilavioo catalogue and gallery, handcrafted in Tumang,
              Boyolali.
            </p>

            {/* Decorative ring + dot */}
            <div className="mt-10 flex items-center gap-4">
              <span className="w-11 h-11 rounded-full border-[6px] border-[#b87333]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#e9a878]" />
            </div>
          </motion.div>

          {/* ---------- Right: sign-in card (slides in from the right) ---------- */}
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.7, ease: EASE_OUT }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative w-full max-w-[480px]">
              {/* Ring overlapping the card's left edge */}
              <span className="hidden md:block absolute top-[18%] -left-10 w-16 h-16 rounded-full border-[8px] border-[#b87333] z-20" />

              <div className="relative w-full bg-white rounded-[28px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)] overflow-hidden">
                {/* Tab header */}
                <div className="relative h-14 bg-white">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-[#b87333] rounded-br-[32px] flex items-center justify-center">
                    <span className="text-sm font-bold tracking-wide text-white">
                      Sign In
                    </span>
                  </div>
                </div>

                <div className="relative px-8 pt-8 pb-10 sm:px-12 sm:pt-10 sm:pb-12">
                  {/* Faint ring inside the card */}
                  <span className="pointer-events-none absolute -bottom-12 -right-12 w-40 h-40 rounded-full border-[16px] border-[#b87333]/[0.07]" />

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2c1d11]">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-stone-500 mt-2 mb-8">
                    Sign in to the Ilavioo admin panel.
                  </p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        role="alert"
                        className="flex items-start gap-2 p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="Email"
                        className="w-full px-1 py-3 bg-transparent border-0 border-b-2 border-stone-200 focus:border-[#b87333] focus:ring-0 outline-none text-base text-stone-900 placeholder:text-stone-400 transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label htmlFor="password" className="sr-only">
                        Password
                      </label>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Password"
                        className="w-full pl-1 pr-10 py-3 bg-transparent border-0 border-b-2 border-stone-200 focus:border-[#b87333] focus:ring-0 outline-none text-base text-stone-900 placeholder:text-stone-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || leaving}
                      className="w-full mt-4 py-4 rounded-full bg-[#b87333] hover:bg-[#a0632a] text-white text-sm font-bold tracking-[0.18em] uppercase shadow-[0_12px_28px_-8px_rgba(184,115,51,0.7)] transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {leaving ? "Opening Dashboard..." : "Signing In..."}
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#9e5b24] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to website
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="absolute bottom-4 inset-x-0 text-center text-[11px] text-white/50 tracking-wide">
          &copy; {new Date().getFullYear()} Ilavioo Nusantara Sejahtera · Admin Portal
        </p>
      </motion.div>
    </div>
  );
}
