"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Phone, Send } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { storeData } from "@/data/store";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const { totalCount, isLoaded } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.collection, href: "/catalog" },
    { label: t.nav.branches, href: "/#branches" },
    { label: t.nav.about, href: "/#about" },
    { label: t.nav.contacts, href: "/#contacts" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Test Mode / Sandbox Banner */}
      <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 text-[10px] sm:text-xs font-mono text-[#D4AF37] px-4 py-1 text-center flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
        <span>DEMO / TEST REJIMI — Sayt ko&apos;rgazmali sinov rejimida ishlamoqda. Haqiqiy to&apos;lov yechilmaydi.</span>
      </div>

      {/* Main Navbar */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-[#090909]/95 backdrop-blur-md border-b border-white/[0.08] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-[#090909]/80 md:bg-transparent border-b border-white/[0.05] md:border-transparent py-3.5 md:py-4"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between">
          {/* Left: Brand Typography Mark */}
          <Link
            href="/"
            className="flex items-center space-x-3 group focus-visible:outline-none"
            aria-label="SwissWatch Premium"
          >
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-serif tracking-[0.2em] text-[#FFFFFF] font-normal group-hover:text-white transition-colors uppercase">
                SWISSWATCH
              </span>
              <span className="text-[9px] font-mono tracking-[0.32em] text-[#D4AF37] uppercase -mt-0.5 font-medium">
                PREMIUM
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-mono uppercase tracking-[0.16em] text-[#71717A] hover:text-[#FFFFFF] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions (Phone, Telegram, Language, Cart) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Phone */}
            <a
              href={`tel:${storeData.phoneClean}`}
              className="hidden sm:inline-flex items-center space-x-2 text-xs font-mono text-zinc-300 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-[#D4AF37]/50 transition-colors px-3 py-1.5 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>{storeData.phone}</span>
            </a>

            {/* Telegram manager link */}
            <a
              href={storeData.telegramManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center space-x-1.5 text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-colors px-2.5 py-1.5 rounded-lg"
            >
              <Send className="w-3 h-3" />
              <span>{storeData.telegramManager}</span>
            </a>

            {/* Language Switcher */}
            <div className="flex items-center border border-white/[0.08] bg-[#111111] rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setLang("uz")}
                className={`px-2 py-1 rounded transition-colors ${
                  lang === "uz"
                    ? "bg-white text-[#090909] font-semibold"
                    : "text-[#71717A] hover:text-[#FFFFFF]"
                }`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={`px-2 py-1 rounded transition-colors ${
                  lang === "ru"
                    ? "bg-white text-[#090909] font-semibold"
                    : "text-[#71717A] hover:text-[#FFFFFF]"
                }`}
              >
                RU
              </button>
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center focus-visible:outline-none"
              aria-label={t.nav.cart}
            >
              <ShoppingBag className="w-4 h-4" />
              {isLoaded && totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-[#090909] text-[9px] font-mono font-bold flex items-center justify-center border border-[#090909]">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-h-[40px] min-w-[40px] p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center touch-manipulation"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#090909]/98 border-b border-white/[0.08] px-5 sm:px-6 py-6 space-y-4 backdrop-blur-2xl animate-in slide-in-from-top-3 duration-200 shadow-2xl">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-300 hover:text-white min-h-[44px] flex items-center border-b border-white/[0.05] touch-manipulation"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 space-y-2.5 text-xs font-mono">
            <a
              href={`tel:${storeData.phoneClean}`}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white active:bg-white/[0.1] touch-manipulation"
            >
              <Phone className="w-4 h-4 text-zinc-400" />
              <span>{storeData.phone}</span>
            </a>

            <a
              href={storeData.telegramManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] active:bg-[#D4AF37]/25 touch-manipulation"
            >
              <Send className="w-4 h-4" />
              <span>Telegram: {storeData.telegramManager}</span>
            </a>

            <div className="text-center text-[#71717A] text-[11px] font-sans pt-1">
              Toshkent (Langar ko&apos;chasi) · Namangan (A. Navoiy ko&apos;chasi)
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
