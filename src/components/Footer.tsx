"use client";

import React from "react";
import Link from "next/link";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import {
  Watch,
  Phone,
  Send,
  MapPin,
  Clock,
  Award,
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const telClean = storeData.phone.replace(/[^0-9+]/g, "");
  const tgUsername = storeData.telegram.replace("@", "");

  return (
    <footer className="relative bg-[#090909] text-[#F8F8F8] border-t border-[#D4AF37]/20 pt-16 pb-12 z-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shadow-md">
                <Watch className="w-5 h-5" />
              </div>
              <span className="text-xl font-serif tracking-[0.16em] text-[#F8F8F8] uppercase font-medium">
                {storeData.name.split("|")[0]}
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#8E8E93] max-w-sm leading-relaxed">
              {storeData.tagline}. Dunyoning eng sara manufakturalarining afsonaviy xronometrlari va to&apos;liq rasmiy xalqaro kafolat.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#111111] border border-white/10 hover:border-[#D4AF37] text-[#8E8E93] hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>

              <a
                href={`https://instagram.com/${storeData.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#111111] border border-white/10 hover:border-[#D4AF37] text-[#8E8E93] hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href={`tel:${telClean}`}
                className="w-9 h-9 rounded-xl bg-[#111111] border border-white/10 hover:border-[#D4AF37] text-[#8E8E93] hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                aria-label="Telefon"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Locations (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="text-xs uppercase tracking-[0.12em] text-[#D4AF37] font-mono font-semibold">
              VIP Showroomlar & Xizmat Markazi
            </div>
            <ul className="space-y-3 text-xs sm:text-sm">
              {storeData.addresses.map((loc) => (
                <li key={loc.address} className="space-y-1">
                  <div className="text-[#F8F8F8] font-medium flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="text-xs text-[#8E8E93] pl-6">
                    {loc.type} · {loc.landmark}
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-1 flex items-center space-x-2 text-xs text-[#8E8E93]">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{storeData.workingHours}</span>
            </div>
          </div>

          {/* Guarantee & Services (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-xs uppercase tracking-[0.12em] text-[#D4AF37] font-mono font-semibold">
              Xalqaro Kafolat
            </div>
            <div className="text-xs text-[#8E8E93] space-y-2 leading-relaxed">
              <div className="flex items-center space-x-2 text-[#F8F8F8]">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>COSC Sertifikati & Pasport</span>
              </div>
              <p className="text-[#8E8E93]">
                Har bir soatga 5 yillik rasmiy ishlab chiqaruvchi kafolati va bepul servis xizmati taqdim etiladi.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#090909] bg-[#D4AF37] hover:bg-[#E5C158] font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md"
              >
                <span>Kolleksiyaga o&apos;tish</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E8E93] font-mono gap-4">
          <div>
            © {storeData.since}–2026 Chronos Genève. {t.footer.copyright}
          </div>
          <div className="text-center sm:text-right">
            {t.footer.disclaimer}
          </div>
        </div>
      </div>
    </footer>
  );
}
