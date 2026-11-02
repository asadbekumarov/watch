"use client";

import React, { useState } from "react";
import Link from "next/link";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import { Send, Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  const tgUsername = storeData.telegram.replace("@", "");
  const igUsername = storeData.instagram.replace("@", "");
  const telClean = storeData.phone.replace(/[^0-9+]/g, "");

  return (
    <footer id="contacts" className="relative bg-[#090909] border-t border-white/20 text-[#E8E2D0] pt-20 pb-16 z-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-white/20">
          {/* Brand Col (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.15em] text-[#F5ECD5] font-medium">
                {storeData.name.toUpperCase()}
              </span>
              <span className="block text-xs tracking-[0.1em] text-[#B5B5B5] uppercase mt-1">
                Toshkent · {storeData.since} yildan buyon
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#E8E2D0] font-normal leading-[1.7] max-w-[55ch]">
              Erkaklar va ayollar uchun original qo&apos;l soatlari saloni.
              Barcha soatlarga 24 oylik rasmiy kafolat, zavod qutisi va sertifikat beriladi.
            </p>

            <div className="flex items-center space-x-4 pt-2">
              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/20 hover:border-[#D4AF37] text-[#E8E2D0] hover:text-[#D4AF37] transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={`https://instagram.com/${igUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/20 hover:border-[#D4AF37] text-[#E8E2D0] hover:text-[#D4AF37] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href={`tel:${telClean}`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/20 hover:border-[#D4AF37] text-[#E8E2D0] hover:text-[#D4AF37] transition-colors"
                aria-label="Telefon"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Locations (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-xs sm:text-[13px] uppercase tracking-[0.1em] text-[#F5ECD5] font-mono font-medium">
              {t.store.locationsTitle}
            </div>
            <ul className="text-sm space-y-3 font-normal text-[#E8E2D0]">
              {storeData.addresses.map((loc) => (
                <li key={loc.address} className="space-y-1">
                  <div className="text-[#F5ECD5] font-medium flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="text-xs text-[#A8A8A8] pl-6">
                    {loc.type} · {storeData.workingHours}
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <a
                href={storeData.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#D4AF37] hover:underline"
              >
                <span>{t.store.openMap}</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Navigation & Newsletter (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-xs sm:text-[13px] uppercase tracking-[0.1em] text-[#F5ECD5] font-mono font-medium">
              {t.nav.catalog}
            </div>
            <ul className="text-sm space-y-1 font-normal">
              <li>
                <Link href="/catalog" className="min-h-[40px] inline-flex items-center text-[#E8E2D0] hover:text-[#D4AF37] transition-colors">
                  Barcha modellar
                </Link>
              </li>
              <li>
                <Link href="/catalog?movement=avtomat" className="min-h-[40px] inline-flex items-center text-[#E8E2D0] hover:text-[#D4AF37] transition-colors">
                  Avtomatik soatlar
                </Link>
              </li>
              <li>
                <Link href="/catalog?gender=ayollar" className="min-h-[40px] inline-flex items-center text-[#E8E2D0] hover:text-[#D4AF37] transition-colors">
                  Ayollar soatlari
                </Link>
              </li>
              <li>
                <Link href="/cart" className="min-h-[40px] inline-flex items-center text-[#E8E2D0] hover:text-[#D4AF37] transition-colors">
                  {t.nav.cart}
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <div className="text-xs text-[#B5B5B5] font-mono mb-2">
                Telefon: {storeData.phone}
              </div>
              <div className="text-xs text-[#B5B5B5] font-mono">
                Telegram: {storeData.telegram}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-[13px] text-[#B5B5B5] font-mono gap-4">
          <div>
            © {storeData.since}–2026 {storeData.name}. {t.footer.copyright}
          </div>
          <div>
            {t.footer.disclaimer}
          </div>
        </div>
      </div>
    </footer>
  );
}
