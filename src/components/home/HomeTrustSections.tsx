"use client";

import React, { useState } from "react";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import { Send, Building2, ExternalLink } from "lucide-react";

export default function HomeTrustSections() {
  const { lang, t } = useTranslation();
  const [activeBranchId, setActiveBranchId] = useState<string>("tashkent");

  const activeBranch =
    storeData.branches.find((b) => b.id === activeBranchId) || storeData.branches[0];

  return (
    <>
      {/* ═══════════════════════ SECTION: SHOWROOM BRANCHES (WITH SELECTOR) ═══════════════════════ */}
      <section id="branches" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
              SwissWatch Premium
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#FFFFFF] font-normal tracking-tight">
              {t.branches.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {t.branches.subtitle}
            </p>
          </div>

          {/* Branch Selector Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-[#111111] border border-white/[0.08] rounded-xl text-xs font-mono">
              {storeData.branches.map((b) => {
                const isActive = activeBranchId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBranchId(b.id)}
                    className={`min-h-[44px] px-6 py-2.5 rounded-lg transition-all flex items-center space-x-2 ${
                      isActive
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-[#71717A] hover:text-white"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{lang === "ru" ? b.cityRu : b.city}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Branch Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Active Branch Display */}
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-medium">
                    {lang === "ru" ? activeBranch.cityRu : activeBranch.city}
                  </span>
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20 uppercase tracking-wider">
                    Ko&apos;rgazma Zali
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl text-white font-normal">
                    {lang === "ru" ? activeBranch.addressRu : activeBranch.address}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t.branches.landmarkLabel}:{" "}
                    <span className="text-zinc-200">
                      {lang === "ru" ? activeBranch.landmarkRu : activeBranch.landmark}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.06] text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>{t.branches.workingHoursLabel}:</span>
                  <span className="text-zinc-200">
                    {lang === "ru" ? storeData.workingHoursRu : storeData.workingHoursUz}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>{t.branches.phoneLabel}:</span>
                  <a href={`tel:${storeData.phoneClean}`} className="text-white hover:text-[#D4AF37] transition-colors">
                    {storeData.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Xarita / Lokatsiya:</span>
                  <a
                    href={storeData.telegramManagerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D4AF37] hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>{t.branches.mapLink}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Visit & Telegram Consultation Card */}
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl text-white font-normal">
                    {lang === "ru" ? "Связь через Telegram" : "Telegram orqali bog'lanish"}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {lang === "ru"
                      ? "Чтобы уточнить наличие и стоимость моделей, забронировать часы или получить точную геолокацию филиала, напишите администратору."
                      : "Do'kondagi modellar narxi va mavjudligini aniqlash, soatni band qilish yoki manzil bo'yicha yo'nalish olish uchun administratorga to'g'ridan-to'g'ri yozing."}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <a
                  href={storeData.telegramManagerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[46px] bg-[#D4AF37] hover:bg-[#c49f27] text-black font-mono text-xs uppercase tracking-[0.14em] font-medium rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Menejer: {storeData.telegramManager}</span>
                </a>

                <a
                  href={storeData.telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.1] text-white font-mono text-xs uppercase tracking-[0.14em] rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Telegram kanal</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION: ABOUT STORE ═══════════════════════ */}
      <section id="about" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto bg-[#111111] border border-white/[0.08] rounded-2xl p-8 sm:p-12 space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]">
              SwissWatch Premium
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              {lang === "ru" ? "О магазине" : "Do'kon haqida"}
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {lang === "ru" ? storeData.aboutRu : storeData.aboutUz}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06] text-xs font-mono">
            <div className="p-4 bg-[#090909] rounded-xl border border-white/[0.05] space-y-1">
              <span className="text-white block font-medium">West End Watch</span>
              <span className="text-zinc-400 text-[11px]">Avtomatik mexanika modellari</span>
            </div>
            <div className="p-4 bg-[#090909] rounded-xl border border-white/[0.05] space-y-1">
              <span className="text-white block font-medium">Jacques Philippe</span>
              <span className="text-zinc-400 text-[11px]">Kvars mexanizmli modellar</span>
            </div>
            <div className="p-4 bg-[#090909] rounded-xl border border-white/[0.05] space-y-1">
              <span className="text-white block font-medium">Toshkent & Namangan</span>
              <span className="text-zinc-400 text-[11px]">2 ta shahar ko&apos;rgazma zali</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
