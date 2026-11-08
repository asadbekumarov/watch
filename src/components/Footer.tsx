"use client";

import React from "react";
import Link from "next/link";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import { Phone, Send, Clock, Building2, ExternalLink } from "lucide-react";

export default function Footer() {
  const { lang, t } = useTranslation();

  return (
    <footer className="relative bg-[#090909] text-[#FFFFFF] border-t border-white/[0.07] pt-16 pb-12 z-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Col (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex flex-col group">
              <span className="text-xl font-serif tracking-[0.2em] text-[#FFFFFF] uppercase font-normal">
                SWISSWATCH
              </span>
              <span className="text-[10px] font-mono tracking-[0.32em] text-[#D4AF37] uppercase font-medium">
                PREMIUM
              </span>
            </Link>

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              {lang === "ru" ? storeData.taglineRu : storeData.taglineUz}
            </p>

            {/* Social & Contact Links */}
            <div className="pt-2 flex items-center space-x-2.5">
              <a
                href={storeData.telegramManagerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors touch-manipulation"
                title="Telegram Menejer"
                aria-label="Telegram Menejer"
              >
                <Send className="w-4 h-4" />
              </a>

              <a
                href={storeData.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors touch-manipulation"
                title="Telegram Kanal"
                aria-label="Telegram Kanal"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={`tel:${storeData.phoneClean}`}
                className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors touch-manipulation"
                title="Telefon"
                aria-label="Telefon"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-1 text-[11px] font-mono text-zinc-400">
              Telegram: <a href={storeData.telegramManagerUrl} className="text-[#D4AF37] hover:underline">{storeData.telegramManager}</a>
            </div>
          </div>

          {/* Branch 1: Tashkent (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-mono font-medium flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Toshkent Filiali</span>
            </div>

            <div className="p-4 bg-[#111111] border border-white/[0.06] rounded-xl space-y-2 text-xs">
              <div className="text-white font-medium">
                {storeData.branches[0].address}
              </div>
              <div className="text-[11px] text-zinc-400">
                Mo&apos;ljal: {storeData.branches[0].landmark}
              </div>
              <div className="pt-1 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{lang === "ru" ? "График: " : "Ish vaqti: "}{lang === "ru" ? storeData.workingHoursRu : storeData.workingHoursUz}</span>
              </div>
            </div>
          </div>

          {/* Branch 2: Namangan (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-mono font-medium flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Namangan Filiali</span>
            </div>

            <div className="p-4 bg-[#111111] border border-white/[0.06] rounded-xl space-y-2 text-xs">
              <div className="text-white font-medium">
                {storeData.branches[1].address}
              </div>
              <div className="text-[11px] text-zinc-400">
                Mo&apos;ljal: {storeData.branches[1].landmark}
              </div>
              <div className="pt-1 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{lang === "ru" ? "График: " : "Ish vaqti: "}{lang === "ru" ? storeData.workingHoursRu : storeData.workingHoursUz}</span>
              </div>
            </div>

            <div className="pt-1 text-xs font-mono text-zinc-400">
              Aloqa: <a href={`tel:${storeData.phoneClean}`} className="text-white hover:underline">{storeData.phone}</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Demo Note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono gap-4">
          <div>
            © 2026 {storeData.displayName}. {t.footer.rights}
          </div>
          <div className="text-zinc-500 text-center sm:text-right">
            {t.footer.disclaimer}
          </div>
        </div>
      </div>
    </footer>
  );
}
