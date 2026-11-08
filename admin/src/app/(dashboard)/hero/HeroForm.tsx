"use client";

import React, { useState, useTransition } from "react";
import { updateHeroBanner } from "@/app/actions/heroActions";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import type { Database } from "@shared/types/database.types";

type HeroBannerRow = Database["public"]["Tables"]["hero_banners"]["Row"];

export default function HeroForm({ hero }: { hero: HeroBannerRow | null }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateHeroBanner(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Hero matnlari yangilandi va saytda qayta revalidatsiya qilindi.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      <input type="hidden" name="id" value={hero?.id || 1} />

      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">O&apos;zbekcha sarlavhalar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">1-qator (Masalan: WEST END WATCH)</label>
            <input
              type="text"
              name="title_line1_uz"
              required
              defaultValue={hero?.title_line1_uz || "WEST END WATCH"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">2-qator kursiv (Masalan: Benuqson Mahorat)</label>
            <input
              type="text"
              name="title_line2_uz"
              required
              defaultValue={hero?.title_line2_uz || "Benuqson Mahorat"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Izoh tavsifi (Subtitle Uz)</label>
            <textarea
              name="subtitle_uz"
              required
              rows={2}
              defaultValue={hero?.subtitle_uz || "Toshkent va Namangandagi ko'rgazma zallarimizda..."}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">Ruscha sarlavhalar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">1-qator (Masalan: Швейцарские традиции.)</label>
            <input
              type="text"
              name="title_line1_ru"
              required
              defaultValue={hero?.title_line1_ru || "Швейцарские традиции."}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">2-qator kursiv (Masalan: Безупречное мастерство)</label>
            <input
              type="text"
              name="title_line2_ru"
              required
              defaultValue={hero?.title_line2_ru || "Безупречное мастерство"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Izoh tavsifi (Subtitle Ru)</label>
            <textarea
              name="subtitle_ru"
              required
              rows={2}
              defaultValue={hero?.subtitle_ru || "Ознакомьтесь с коллекциями часов..."}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Hero matnlarini saqlash</span>
        </button>
      </div>
    </form>
  );
}
