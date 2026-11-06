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
  Truck,
  Wrench,
} from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const telClean = storeData.phone.replace(/[^0-9+]/g, "");
  const telSecClean = storeData.phoneSecondary.replace(/[^0-9+]/g, "");
  const tgUsername = storeData.telegram.replace("@", "");
  const igUsername = storeData.instagram.replace("@", "");

  return (
    <footer className="relative bg-[#090909] text-[#FFFFFF] border-t border-white/[0.07] pt-16 pb-12 z-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Col (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-[#111111] border border-white/[0.1] flex items-center justify-center text-white">
                <Watch className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-serif tracking-[0.16em] text-[#FFFFFF] uppercase font-normal">
                  ALFAJR
                </span>
                <span className="text-[9px] font-mono tracking-[0.25em] text-[#71717A] uppercase -mt-1">
                  Soatlar Olami
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#71717A] max-w-sm leading-relaxed">
              O&apos;zbekistonda 100% asl Al-Fajr azon soatlari, Tsar Bomba va brend xronometrlarning ishonchli do&apos;koni. Rasmiy kafolat va BTS Pochtasiga bepul yetkazish.
            </p>

            {/* Social Links */}
            <div className="pt-1 flex items-center space-x-2.5">
              <a
                href={`https://instagram.com/${igUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-[#71717A] hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-[#71717A] hover:text-white flex items-center justify-center transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-3.5 h-3.5" />
              </a>

              <a
                href={`tel:${telClean}`}
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-[#71717A] hover:text-white flex items-center justify-center transition-colors"
                aria-label="Call-Center"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="text-xs font-mono text-[#71717A]">
              235 000+ faol Instagram auditoriyasi
            </div>
          </div>

          {/* Locations & Call Center (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#71717A] font-mono font-medium flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Showroom & Ish Vaqti</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#111111] border border-white/[0.06] rounded-lg space-y-1">
                <div className="text-[#FFFFFF] font-medium">
                  {storeData.addresses[0].address}
                </div>
                <div className="text-[11px] text-[#71717A]">
                  {storeData.addresses[0].landmark}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-[#71717A] pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{storeData.workingHours}</span>
              </div>

              <div className="space-y-1 pt-1 font-mono text-xs">
                <div className="text-[#71717A]">Call-Center:</div>
                <div className="flex flex-col space-y-0.5">
                  <a href={`tel:${telClean}`} className="text-white hover:text-zinc-300 font-medium">
                    +998 71 200 83 00
                  </a>
                  <a href={`tel:${telSecClean}`} className="text-[#71717A] hover:text-white">
                    +998 99 831 00 99
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Service Center & Delivery (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#71717A] font-mono font-medium flex items-center space-x-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Rasmiy Servis Markazi</span>
            </div>

            <div className="p-4 bg-[#111111] border border-white/[0.06] rounded-xl space-y-2">
              <div className="text-xs font-serif text-[#FFFFFF]">
                {storeData.serviceCenter} (1 Yillik Rasmiy Kafolat)
              </div>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Professional soatsozlik servisi: o&apos;lchamni qisqartirish, batareya va suv himoyasini tekshirish, profilaktika xizmati.
              </p>
            </div>

            <div className="p-3.5 bg-[#111111] border border-white/[0.06] rounded-xl flex items-center space-x-3 text-xs font-mono">
              <Truck className="w-4 h-4 text-zinc-400 shrink-0" />
              <div>
                <span className="text-white block">
                  BTS Pochtasiga Bepul Dastavka
                </span>
                <span className="text-[11px] text-[#71717A]">
                  O&apos;zbekiston bo&apos;ylab 0 UZS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#71717A] font-mono gap-4">
          <div>
            © 2026 {storeData.name}. {t.footer.copyright}
          </div>
          <div className="flex items-center space-x-4">
            <span>BTS Express Bepul Yetkazish</span>
            <span>•</span>
            <span>@soatsoz_uzb Servis Kafolati</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
