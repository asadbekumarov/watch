"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Watch, Phone } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { storeData } from "@/data/store";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const { totalCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.menu || "Kolleksiya", href: "/catalog" },
    { label: "BTS Yetkazish", href: "/#delivery" },
    { label: "Kafolat & Servis", href: "/#service" },
    { label: "Showroom", href: "/#locations" },
    { label: "Aloqa", href: "/#contacts" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Main Navbar */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-[#090909]/95 backdrop-blur-md border-b border-white/[0.08] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-[#090909]/80 md:bg-transparent border-b border-white/[0.05] md:border-transparent py-3.5 md:py-4"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <Link
            href="/"
            className="flex items-center space-x-3 group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#111111] border border-white/[0.1] flex items-center justify-center text-white group-hover:border-[#D4AF37]/40 transition-colors">
              <Watch className="w-4 h-4 text-zinc-300 group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-serif tracking-[0.18em] text-[#FFFFFF] font-normal group-hover:text-white transition-colors uppercase">
                ALFAJR
              </span>
              <span className="text-[9px] font-mono tracking-[0.25em] text-[#71717A] uppercase -mt-0.5">
                Soatlar Olami
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

          {/* Right: Actions (Call Center, Language, Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Call Center Button */}
            <a
              href="tel:+998712008300"
              className="hidden sm:inline-flex items-center space-x-2 text-xs font-mono text-zinc-300 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-[#D4AF37]/50 transition-colors px-3 py-1.5 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>71 200 83 00</span>
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
              aria-label="Savat"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
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

          <div className="pt-2 space-y-3 text-xs font-mono">
            <a
              href="tel:+998712008300"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white active:bg-white/[0.1] touch-manipulation"
            >
              <Phone className="w-4 h-4 text-zinc-400" />
              <span>Call-Center: 71 200 83 00</span>
            </a>

            <div className="text-center text-[#71717A] text-[11px] font-sans">
              Toshkent sh., Kichik Xalqa Yo&apos;li, 19 (09:00 - 21:00)
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
