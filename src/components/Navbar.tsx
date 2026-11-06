"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Watch } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";

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
    { label: "Kafolat & Servis", href: "/#services" },
    { label: t.nav.roastery || "Merosimiz", href: "/#heritage" },
    { label: t.nav.locations || "Showroom", href: "/#locations" },
    { label: t.nav.contacts || "Aloqa", href: "/#contacts" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#090909]/95 backdrop-blur-md border-b border-[#D4AF37]/20 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
          : "bg-[#090909]/80 md:bg-transparent border-b border-white/10 md:border-transparent py-4 md:py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link
          href="/"
          className="flex items-center space-x-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-sm py-1"
        >
          <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform">
            <Watch className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-serif tracking-[0.18em] text-[#F8F8F8] font-medium group-hover:text-white transition-colors uppercase">
              Chronos Genève
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-mono uppercase tracking-[0.14em] text-[#8E8E93] hover:text-[#D4AF37] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#D4AF37] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions (Language, VIP Phone & Cart) */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* VIP Hotline */}
          <a
            href="tel:+998712008800"
            className="hidden sm:inline-flex items-center space-x-2 text-xs font-mono text-[#8E8E93] hover:text-[#D4AF37] transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-[#D4AF37]/30"
          >
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>+998 71 200 88 00</span>
          </a>

          {/* Language Switcher */}
          <div className="flex items-center border border-white/10 bg-[#111111] rounded-lg p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setLang("uz")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === "uz"
                  ? "bg-[#D4AF37] text-[#090909] font-bold"
                  : "text-[#8E8E93] hover:text-[#F8F8F8]"
              }`}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => setLang("ru")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === "ru"
                  ? "bg-[#D4AF37] text-[#090909] font-bold"
                  : "text-[#8E8E93] hover:text-[#F8F8F8]"
              }`}
            >
              RU
            </button>
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative w-10 h-10 rounded-xl bg-[#111111] border border-[#D4AF37]/30 hover:border-[#D4AF37] flex items-center justify-center text-[#F8F8F8] hover:text-[#D4AF37] transition-colors group"
            aria-label={`${t.nav.cart} (${totalCount})`}
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D4AF37] text-[#090909] text-[10px] font-mono font-bold rounded-full flex items-center justify-center border-2 border-[#090909]">
                {totalCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-[#111111] border border-white/10 flex items-center justify-center text-[#F8F8F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            aria-label="Menyuni ochish"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#090909]/98 border-b border-[#D4AF37]/20 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-mono uppercase tracking-wider text-[#8E8E93] hover:text-[#D4AF37] py-2 border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2">
            <a
              href="tel:+998712008800"
              className="w-full min-h-[46px] bg-[#111111] border border-[#D4AF37]/30 text-xs font-mono uppercase tracking-wider text-[#D4AF37] rounded-xl flex items-center justify-center space-x-2"
            >
              <span>VIP Showroomga Qo&apos;ng&apos;iroq: +998 71 200 88 00</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
