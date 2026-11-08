"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, Send } from "lucide-react";
import { useTranslation } from "@/i18n";
import { storeData } from "@/data/store";

interface HomeHeroProps {
  banner?: {
    title_line1_uz?: string;
    title_line2_uz?: string;
    title_line1_ru?: string;
    title_line2_ru?: string;
    subtitle_uz?: string;
    subtitle_ru?: string;
  } | null;
}

export default function HomeHero({ banner }: HomeHeroProps = {}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useTranslation();

  const title1 = lang === "ru" ? (banner?.title_line1_ru || t.hero.titleLine1) : (banner?.title_line1_uz || t.hero.titleLine1);
  const title2 = lang === "ru" ? (banner?.title_line2_ru || t.hero.titleLine2) : (banner?.title_line2_uz || t.hero.titleLine2);
  const subtitle = lang === "ru" ? (banner?.subtitle_ru || t.hero.subtitle) : (banner?.subtitle_uz || t.hero.subtitle);

  useEffect(() => {
    if (!heroRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-fade-in",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, stagger: 0.12, ease: "power3.out", delay: 0.1 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100svh] flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-20 pt-24 sm:pt-32 lg:pt-36 pb-8 sm:pb-12"
    >
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Typography, Badges & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-7 text-left relative z-10 bg-gradient-to-t from-[#090909]/95 via-[#090909]/75 to-transparent lg:bg-none p-4 sm:p-6 lg:p-0 rounded-2xl lg:rounded-none backdrop-blur-[2px] lg:backdrop-blur-none border border-white/[0.06] lg:border-none shadow-2xl lg:shadow-none">
          {/* Main Headline */}
          <div className="overflow-hidden">
            <h1 className="hero-fade-in font-serif text-[clamp(1.85rem,5.5vw,4rem)] font-normal text-[#FFFFFF] tracking-tight leading-[1.14]">
              {title1} <br className="hidden sm:inline" />
              <span className="italic font-normal text-zinc-300">{title2}</span>.
            </h1>
          </div>

          {/* Description */}
          <p className="hero-fade-in text-[14px] sm:text-[16px] text-zinc-300 sm:text-[#71717A] font-normal leading-[1.75] max-w-[54ch]">
            {subtitle}
          </p>

          {/* Value Badges (3 cols) */}
          <div className="hero-fade-in grid grid-cols-3 gap-2 sm:gap-3.5 pt-1 max-w-lg">
            <div className="bg-[#111111]/90 backdrop-blur-md border border-white/[0.08] hover:border-white/20 rounded-xl p-2.5 sm:p-3.5 text-left transition-all group">
              <div className="text-[10px] sm:text-[11px] font-mono text-[#FFFFFF] font-medium flex items-center space-x-1 sm:space-x-1.5 mb-0.5 sm:mb-1 truncate">
                <span className="w-1 h-1 rounded-full bg-[#D4AF37] shrink-0" />
                <span className="truncate">Toshkent & Namangan</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-[#71717A] truncate">2 ta ko&apos;rgazma zali</div>
            </div>

            <div className="bg-[#111111]/90 backdrop-blur-md border border-white/[0.08] hover:border-white/20 rounded-xl p-2.5 sm:p-3.5 text-left transition-all group">
              <div className="text-[10px] sm:text-[11px] font-mono text-[#FFFFFF] font-medium flex items-center space-x-1 sm:space-x-1.5 mb-0.5 sm:mb-1 truncate">
                <span className="w-1 h-1 rounded-full bg-[#D4AF37] shrink-0" />
                <span className="truncate">2 ta brend</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-[#71717A] truncate">West End · J. Philippe</div>
            </div>

            <div className="bg-[#111111]/90 backdrop-blur-md border border-white/[0.08] hover:border-white/20 rounded-xl p-2.5 sm:p-3.5 text-left transition-all group">
              <div className="text-[10px] sm:text-[11px] font-mono text-[#FFFFFF] font-medium flex items-center space-x-1 sm:space-x-1.5 mb-0.5 sm:mb-1 truncate">
                <span className="w-1 h-1 rounded-full bg-[#D4AF37] shrink-0" />
                <span className="truncate">{storeData.telegramManager}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-[#71717A] truncate">Tezkor konsultatsiya</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hero-fade-in flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href="#collection"
              className="w-full sm:w-auto min-h-[48px] px-8 bg-[#FFFFFF] hover:bg-zinc-200 text-[#090909] text-xs uppercase tracking-[0.14em] font-medium rounded-lg transition-all inline-flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>{t.hero.ctaCollection}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href={storeData.telegramManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[48px] px-6 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] hover:border-[#D4AF37]/50 text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg transition-all inline-flex items-center justify-center space-x-2 backdrop-blur-md"
            >
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.hero.ctaContact}</span>
            </a>
          </div>
        </div>

        {/* Right Column: Open canvas area */}
        <div className="lg:col-span-5 hidden lg:block pointer-events-none min-h-[300px]" />
      </div>

      {/* Demo site watermark */}
      <div className="w-full max-w-[1400px] mx-auto pt-6 text-left relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]/80 bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
          {t.demoNotice}
        </span>
      </div>
    </section>
  );
}
