"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Update Supabase Auth user password
      const { error: updateAuthError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateAuthError) {
        throw updateAuthError;
      }

      // 2. Mark must_change_password = false in profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ must_change_password: false, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Parolni yangilashda xatolik yuz berdi.";
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
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-white">Xavfsizlik talabi</h1>
          <p className="text-xs text-zinc-400">
            Dastlabki tizimga kirish uchun yangi shaxsiy parol belgilashingiz shart.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Yangi parol (kamida 8 belgi)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#090b0e] border border-white/[0.08] rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Yangi parolni tasdiqlang</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#090b0e] border border-white/[0.08] rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#D4AF37] hover:bg-[#c29f2f] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Parolni saqlash va davom etish"}
          </button>
        </form>
      </div>
    </div>
  );
}
