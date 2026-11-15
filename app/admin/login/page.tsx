"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username/email or password. Please try again.");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf6f0] via-[#f6ede3] to-[#ebd8c8] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background copper orbs */}
      <div className="absolute top-[-12%] left-[-8%] w-[500px] h-[500px] bg-gradient-to-br from-[#eec5a3]/50 to-[#d89f74]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-8%] w-[550px] h-[550px] bg-gradient-to-tl from-[#e0ad83]/45 to-[#ebd0bb]/35 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative smooth contour curves like in mockup */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100 800 C 350 750, 700 850, 950 450 C 1200 50, 1400 300, 1600 100"
            stroke="#b87333"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />
          <path
            d="M 200 -100 C 500 200, 800 150, 1100 600 C 1300 900, 1500 850, 1650 950"
            stroke="#9e5b24"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />
        </svg>
      </div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-[36px] sm:rounded-[44px] shadow-[0_28px_70px_-15px_rgba(184,115,51,0.25)] border border-[#ebd6c4] overflow-hidden relative z-10 my-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          {/* Left Side: Artistic Handcrafted Copper Photography */}
          <div className="md:col-span-5 relative min-h-[260px] md:min-h-full overflow-hidden bg-[#241710] flex items-center justify-center group">
            <Image
              src="/assets/products/copper-5.jpg"
              alt="Ilavioo Handcrafted Copper Art"
              fill
              className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out filter brightness-95"
              priority
            />
            {/* Soft inner copper gradient blend */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

            {/* Subtle Brand Tag */}
            <div className="absolute top-6 left-6 z-10 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-sm">
              <span className="text-[11px] font-medium tracking-widest uppercase text-[#edd3be]">
                Ilavioo Craft
              </span>
            </div>

            {/* Bottom Caption on Artwork */}
            <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
              <p className="font-display text-lg sm:text-xl font-bold leading-tight drop-shadow-md">
                Tumang Copper Heritage
              </p>
              <p className="text-xs text-[#eed3bf]/90 mt-1 font-light tracking-wide drop-shadow">
                Handcrafted timeless luxury
              </p>
            </div>
          </div>

          {/* Right Side: Clean Minimalist Sign In Form (Mockup Style) */}
          <div className="md:col-span-7 flex flex-col justify-center px-8 py-10 sm:px-14 sm:py-12 bg-white">
            <div className="w-full max-w-sm mx-auto">
              {/* Header Title & Subtitle */}
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#2c1d11] uppercase">
                  Sign In
                </h1>
                <p className="text-xs sm:text-[13px] text-[#9e5b24] font-medium tracking-widest lowercase italic mt-1">
                  to get inspired!
                </p>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200/90 rounded-2xl text-red-700 text-xs font-medium shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form with Pill Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* User Name / Email Pill Input */}
                <div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="User Name"
                    className="w-full px-6 py-3.5 rounded-full border border-[#e8d7c8] bg-[#fdfbf9] focus:bg-white focus:border-[#b87333] focus:ring-2 focus:ring-[#b87333]/20 text-stone-900 placeholder:text-stone-400 text-sm outline-none transition-all duration-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]"
                  />
                </div>

                {/* Password Pill Input */}
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    className="w-full pl-6 pr-12 py-3.5 rounded-full border border-[#e8d7c8] bg-[#fdfbf9] focus:bg-white focus:border-[#b87333] focus:ring-2 focus:ring-[#b87333]/20 text-stone-900 placeholder:text-stone-400 text-sm outline-none transition-all duration-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Options: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1 px-2 text-[12px]">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600 hover:text-stone-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-stone-300 text-[#9e5b24] focus:ring-[#b87333] accent-[#9e5b24] cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Default admin credentials:\nEmail: admin@ilavio.com\nPassword: admin123")
                    }
                    className="text-[#9e5b24] hover:text-[#7d441a] font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Pill Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-8 rounded-full bg-gradient-to-r from-[#b87333] via-[#a86529] to-[#8d4f1c] hover:from-[#c27c3a] hover:to-[#96541f] text-white font-bold text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-[0_12px_28px_-6px_rgba(184,115,51,0.45)] hover:shadow-[0_16px_34px_-6px_rgba(184,115,51,0.6)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>SIGN IN</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Bottom Note */}
              <div className="text-center mt-7 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/"
                    className="font-semibold text-[#9e5b24] hover:text-[#7d441a] transition-colors ml-1"
                  >
                    Back to Home
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <p className="text-center text-xs text-stone-500/80 mt-6 relative z-10 tracking-wide">
        © {new Date().getFullYear()} Ilavioo Nusantara Sejahtera · Admin Portal
      </p>
    </div>
  );
}
