"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { storeData } from "@/data/store";

interface NavbarProps {
  onOpenConcierge?: () => void;
}

export default function Navbar({ onOpenConcierge }: NavbarProps = {}) {
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
    { label: t.nav.catalog, href: "/catalog" },
    { label: t.nav.about, href: "/#about" },
    { label: t.nav.locations, href: "/#locations" },
    { label: t.nav.contacts, href: "/#contacts" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#090909]/95 border-b border-white/20 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          : "bg-[#090909]/80 md:bg-transparent border-b border-white/10 md:border-transparent py-4 md:py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link
          href="/"
          className="flex flex-col items-start group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-sm py-1"
        >
          <span className="text-xl sm:text-2xl font-serif tracking-[0.2em] text-[#F5ECD5] font-medium group-hover:text-white transition-colors">
            {storeData.name}
          </span>
          <span className="text-[12px] tracking-[0.1em] text-[#B5B5B5] uppercase">
            Toshkent · {storeData.since} yildan
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="min-h-[44px] inline-flex items-center text-sm lg:text-[15px] tracking-[0.05em] text-[#E8E2D0] hover:text-[#D4AF37] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] px-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Language switch + Cart */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Language Switch */}
          <div className="flex items-center border border-white/20 p-0.5 rounded-sm bg-[#141414]">
            <button
              onClick={() => setLang("uz")}
              className={`px-2.5 py-1 text-xs font-mono tracking-wider transition-colors min-h-[36px] ${
                lang === "uz"
                  ? "bg-[#F5ECD5] text-[#090909] font-medium"
                  : "text-[#B5B5B5] hover:text-white"
              }`}
              aria-label="O'zbekcha"
            >
              UZ
            </button>
            <button
              onClick={() => setLang("ru")}
              className={`px-2.5 py-1 text-xs font-mono tracking-wider transition-colors min-h-[36px] ${
                lang === "ru"
                  ? "bg-[#F5ECD5] text-[#090909] font-medium"
                  : "text-[#B5B5B5] hover:text-white"
              }`}
              aria-label="Русский"
            >
              RU
            </button>
          </div>

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center border border-white/20 text-[#F5ECD5] hover:border-[#D4AF37] hover:text-white transition-colors rounded-sm px-3"
            aria-label={`${t.nav.cart} (${totalCount})`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="ml-2 text-xs font-mono font-medium hidden sm:inline">
              {t.nav.cart}
            </span>
            {totalCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[11px] font-mono bg-[#D4AF37] text-[#090909] font-semibold rounded-full min-w-[18px] text-center">
                {totalCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#F5ECD5] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-sm"
            aria-label={mobileMenuOpen ? "Menyuni yopish" : "Menyuni ochish"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090909] border-b border-white/20 px-6 py-6 shadow-2xl">
          <div className="flex flex-col space-y-4">
            <div className="text-xs font-mono text-[#B5B5B5] pb-3 border-b border-white/20 flex justify-between">
              <span>{storeData.phone}</span>
              <span>{storeData.workingHours}</span>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center text-base tracking-[0.05em] text-[#E8E2D0] hover:text-[#D4AF37] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[48px] w-full py-3 text-center text-sm uppercase tracking-[0.08em] bg-[#F5ECD5] text-[#090909] font-medium hover:bg-white transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {t.nav.cart} ({totalCount})
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
