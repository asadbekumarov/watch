"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/formatPrice";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function FloatingCartBar() {
  const { totalCount, totalAmount, isLoaded } = useCart();
  const { lang, t } = useTranslation();

  if (!isLoaded || totalCount === 0) return null;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-3.5 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-auto z-40 animate-in slide-in-from-bottom-5 duration-300">
      <Link
        href="/cart"
        className="flex items-center justify-between gap-4 sm:gap-6 bg-[#090909]/95 hover:bg-[#141414] active:scale-[0.98] backdrop-blur-2xl border border-white/[0.15] rounded-xl p-3 sm:px-6 shadow-[0_12px_45px_rgba(0,0,0,0.95)] text-[#FFFFFF] group transition-all touch-manipulation"
        aria-label={`${t.nav.cart} (${totalCount})`}
      >
        <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0">
          <div className="relative w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.12] flex items-center justify-center text-white shrink-0">
            <ShoppingBag className="w-4 h-4 text-zinc-300" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-[#090909] text-[9px] font-mono font-bold rounded-full flex items-center justify-center border border-[#090909]">
              {totalCount}
            </span>
          </div>

          <div className="text-left truncate">
            <span className="block text-[10px] font-mono uppercase tracking-[0.14em] text-[#71717A] truncate">
              Savatda {totalCount} ta soat
            </span>
            <span className="font-mono text-sm sm:text-base font-medium text-white truncate">
              {formatPrice(totalAmount, lang)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-white hover:bg-zinc-200 text-[#090909] text-xs font-mono uppercase tracking-[0.14em] font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0">
          <span>{t.cart.proceedToCheckout || "Buyurtma"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </div>
  );
}
