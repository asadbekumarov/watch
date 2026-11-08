"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window === "undefined") return false;
    const lock = localStorage.getItem("swp_admin_lockout");
    if (!lock) return false;
    return Date.now() < parseInt(lock, 10);
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const lock = localStorage.getItem("swp_admin_lockout");
    if (lock) {
      const lockTime = parseInt(lock, 10);
      if (Date.now() < lockTime) {
        setIsLocked(true);
        const remainingMins = Math.ceil((lockTime - Date.now()) / 60000);
        setError(`Ko'p noto'g'ri urinish tufayli kirish bloklangan. ${remainingMins} daqiqadan so'ng urinib ko'ring.`);
        return;
      }
      localStorage.removeItem("swp_admin_lockout");
      localStorage.removeItem("swp_admin_attempts");
      setIsLocked(false);
    }

    setLoading(true);

    // Development instant access with configured demo credentials
    if (
      email.trim().toLowerCase() === "watch@gmail.com" &&
      password === "admin123"
    ) {
      document.cookie = "swp_dev_admin_session=owner; path=/; max-age=86400; SameSite=Lax";
      localStorage.removeItem("swp_admin_attempts");
      localStorage.removeItem("swp_admin_lockout");
      window.location.href = "/";
      return;
    }

    const supabase = createClient();

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        // Increment failed attempts
        const currentAttempts = parseInt(localStorage.getItem("swp_admin_attempts") || "0", 10) + 1;
        localStorage.setItem("swp_admin_attempts", currentAttempts.toString());

        if (currentAttempts >= MAX_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
          localStorage.setItem("swp_admin_lockout", lockTime.toString());
          setIsLocked(true);
          setError(`5 marta xato parol kiritildi. Tizim ${LOCKOUT_MINUTES} daqiqaga bloklandi.`);
        } else {
          setError(`Email yoki parol noto'g'ri. Qolgan urinishlar: ${MAX_ATTEMPTS - currentAttempts}`);
        }
        setLoading(false);
        return;
      }

      // Reset attempts on successful sign-in
      localStorage.removeItem("swp_admin_attempts");
      localStorage.removeItem("swp_admin_lockout");

      if (data.user) {
        // Fetch user profile to check must_change_password and role
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profile?.must_change_password) {
          router.push("/change-password");
          return;
        }

        window.location.href = "/";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tizimga kirishda xatolik yuz berdi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#13171d] border border-white/[0.08] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] mb-2 border border-[#D4AF37]/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-white">SwissWatch Premium</h1>
          <p className="text-xs text-zinc-400">Boshqaruv paneli (Faqat xodimlar uchun)</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Email manzil</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Parol</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full py-2.5 px-4 bg-[#D4AF37] hover:bg-[#c29f2f] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirish"}
          </button>
        </form>

        <div className="text-center">
          <span className="text-[11px] text-zinc-600">
            Toshkent & Namangan filiallari ichki boshqaruv tizimi
          </span>
        </div>
      </div>
    </div>
  );
}
