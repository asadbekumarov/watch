"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/formatPrice";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function FloatingCartBar() {
  const { totalCount, totalAmount } = useCart();
  const { lang, t } = useTranslation();

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-auto z-40 animate-in slide-in-from-bottom duration-300">
      <Link
        href="/cart"
        className="flex items-center justify-between gap-4 bg-[#111111]/95 hover:bg-[#161616] backdrop-blur-xl border border-[#D4AF37]/50 rounded-2xl p-3.5 sm:px-6 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-[#F8F8F8] group transition-all hover:scale-[1.02]"
        aria-label={`${t.nav.cart} (${totalCount})`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#090909]">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D4AF37] text-[#090909] text-[10px] font-mono font-bold rounded-full flex items-center justify-center border-2 border-[#111111]">
              {totalCount}
            </span>
          </div>

          <div className="text-left">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8E93]">
              Savatda {totalCount} ta soat
            </span>
            <span className="font-mono text-base font-bold text-[#D4AF37]">
              {formatPrice(totalAmount, lang)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md">
          <span>{t.cart.proceedToCheckout || "Buyurtma"}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </div>
  );
}
