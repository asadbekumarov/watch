"use client";

import React, { useState, useTransition } from "react";
import { updateSiteSettings } from "@/app/actions/settingsActions";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import type { Database } from "@shared/types/database.types";

type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

export default function SettingsForm({ settings }: { settings: SiteSettingsRow | null }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateSiteSettings(formData);
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
          <span>Sozlamalar muvaffaqiyatli saqlandi va saytda yangilandi.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Currency Exchange Rate Section */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-white">Valyuta kursi (USD &rarr; UZS)</h2>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
            Faqat Owner
          </span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Ushbu kurs onlayn to&apos;lovlar (Payme / Click) hamda so&apos;mda hisob-kitob qilishda ishlatiladi.
          Agar kurs bo&apos;sh qoldirilsa (NULL), saytda so&apos;mda to&apos;lovlar xavfsizlik maqsadida o&apos;chiriladi.
        </p>

        <div className="max-w-xs space-y-1.5">
          <label className="text-xs text-zinc-300">1 USD necha UZS?</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              name="usd_to_uzs_rate"
              defaultValue={settings?.usd_to_uzs_rate !== null ? settings?.usd_to_uzs_rate : ""}
              placeholder="Bo'sh (NULL — o'chirilgan)"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="max-w-xs space-y-1.5 pt-2">
          <label className="text-xs text-zinc-300">Standart tayyorlash muddati (kun)</label>
          <input
            type="number"
            min={1}
            name="default_prep_days"
            defaultValue={settings?.default_prep_days ?? 1}
            className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Store Identifiers & Phones */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">Do&apos;kon nomi va aloqa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Do&apos;kon nomi</label>
            <input
              type="text"
              name="store_name"
              required
              defaultValue={settings?.store_name || "SwissWatch_premium"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Ko&apos;rinadigan brend nomi</label>
            <input
              type="text"
              name="display_name"
              required
              defaultValue={settings?.display_name || "SwissWatch Premium"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Telefon raqam</label>
            <input
              type="text"
              name="phone"
              required
              defaultValue={settings?.phone || "+998 88 500 70 00"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Telegram kanal havolasi</label>
            <input
              type="text"
              name="telegram_channel"
              required
              defaultValue={settings?.telegram_channel || "https://t.me/swisswatch_premium"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Telegram menejer foydalanuvchi nomi</label>
            <input
              type="text"
              name="telegram_manager"
              required
              defaultValue={settings?.telegram_manager || "@swissWatch_admin"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Telegram menejer to&apos;liq havolasi</label>
            <input
              type="text"
              name="telegram_manager_url"
              required
              defaultValue={settings?.telegram_manager_url || "https://t.me/swissWatch_admin"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Instagram foydalanuvchi nomi</label>
            <input
              type="text"
              name="instagram_handle"
              defaultValue={settings?.instagram_handle || ""}
              placeholder="Hali do'kon tomonidan tasdiqlanmagan (ixtiyoriy)"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Working Hours & Descriptions */}
      <div className="p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
        <h2 className="text-sm font-medium text-white">Ish vaqti va Do&apos;kon tavsiflari</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Ish vaqti (O&apos;zbekcha)</label>
            <input
              type="text"
              name="working_hours_uz"
              required
              defaultValue={settings?.working_hours_uz || "Ish vaqtini menejerdan so'rang"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Ish vaqti (Ruscha)</label>
            <input
              type="text"
              name="working_hours_ru"
              required
              defaultValue={settings?.working_hours_ru || "Уточняйте график у менеджера"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Shior (O&apos;zbekcha)</label>
            <input
              type="text"
              name="tagline_uz"
              required
              defaultValue={settings?.tagline_uz || ""}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300">Shior (Ruscha)</label>
            <input
              type="text"
              name="tagline_ru"
              required
              defaultValue={settings?.tagline_ru || ""}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Biz haqimizda (O&apos;zbekcha)</label>
            <textarea
              name="about_uz"
              rows={2}
              required
              defaultValue={settings?.about_uz || ""}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Biz haqimizda (Ruscha)</label>
            <textarea
              name="about_ru"
              rows={2}
              required
              defaultValue={settings?.about_ru || ""}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Yetkazib berish sharti (O&apos;zbekcha)</label>
            <input
              type="text"
              name="delivery_info_uz"
              required
              defaultValue={settings?.delivery_info_uz || "Yetkazib berish shartlari menejer bilan kelishiladi"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-zinc-300">Yetkazib berish sharti (Ruscha)</label>
            <input
              type="text"
              name="delivery_info_ru"
              required
              defaultValue={settings?.delivery_info_ru || "Условия доставки согласовываются с менеджером"}
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Sozlamalarni saqlash</span>
        </button>
      </div>
    </form>
  );
}
