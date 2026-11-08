"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/formatPrice";
import { storeData } from "@/data/store";
import { computeEstimatedReadyDate } from "@/lib/delivery";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Send,
  Building2,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    clearCart,
    isLoaded,
  } = useCart();
  const { lang, t } = useTranslation();

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_usd: number;
  } | null>(null);

  const estimatedReady = computeEstimatedReadyDate(1, lang);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), subtotal: totalAmount }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedPromo({ code: data.code, discount_usd: data.discount_usd });
        setPromoInput("");
      } else {
        setPromoError(data.error || "Promokod yaroqsiz.");
      }
    } catch {
      setPromoError("Tarmoq xatosi.");
    } finally {
      setPromoLoading(false);
    }
  };

  const finalCartTotal = appliedPromo
    ? Math.max(0, totalAmount - appliedPromo.discount_usd)
    : totalAmount;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] text-[#FFFFFF] pt-28 pb-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
          {/* Header */}
          <div className="mb-8 space-y-2 border-b border-white/[0.07] pb-6">
            <div className="text-[11px] font-mono text-[#71717A] tracking-[0.16em] uppercase">
              <Link href="/" className="hover:text-white transition-colors">
                Bosh sahifa
              </Link>{" "}
              / <span className="text-white">{t.cart.title}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF] tracking-tight">
              {t.cart.title}
            </h1>
          </div>

          {!isLoaded ? (
            <div className="animate-pulse space-y-6">
              <div className="h-24 bg-[#111111] border border-white/[0.06] rounded-xl" />
              <div className="h-24 bg-[#111111] border border-white/[0.06] rounded-xl" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center space-y-6 bg-[#111111] border border-white/[0.07] rounded-2xl p-8 sm:p-12">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl text-[#FFFFFF] font-normal">
                {t.cart.empty}
              </h2>
              <p className="text-xs text-[#71717A] max-w-md mx-auto">
                {t.cart.emptyDesc}
              </p>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center space-x-2 min-h-[46px] px-8 bg-white hover:bg-zinc-200 text-[#090909] text-xs uppercase tracking-[0.14em] font-medium rounded-lg transition-all"
                >
                  <span>{t.cart.browseMenu}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Items List (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Branch Pickup Notice */}
                <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3 text-zinc-300">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Toshkent (Langar 12) yoki Namangan (Navoiy 42) filiallaridan olib ketish</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">
                    2 ta filial
                  </span>
                </div>

                {/* Items Container */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const hasPrice = item.unitPrice !== null && item.unitPrice > 0;
                    return (
                      <div
                        key={item.id}
                        className="bg-[#111111] border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#090909] border border-white/[0.06] shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#D4AF37]">
                              {item.product.brand} · {item.product.specs.caseDiameter}
                            </span>
                            <Link
                              href={`/watch/${item.product.slug}`}
                              className="font-serif text-base text-[#FFFFFF] hover:text-zinc-300 transition-colors font-normal block"
                            >
                              {lang === "ru" ? item.product.nameRu : item.product.name}
                            </Link>

                            <div className="text-xs font-mono text-white pt-0.5">
                              {formatPrice(item.unitPrice, lang)}
                            </div>
                          </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                          <div className="flex items-center border border-white/[0.08] rounded-md bg-[#090909] p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#71717A] hover:text-white"
                              aria-label="Kamaytirish"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono text-[#FFFFFF]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#71717A] hover:text-white"
                              aria-label="Ko'paytirish"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right sm:min-w-28 font-mono text-sm text-[#FFFFFF]">
                            {hasPrice
                              ? formatPrice(item.unitPrice! * item.quantity, lang)
                              : formatPrice(null, lang)}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#71717A] hover:text-red-400 transition-colors"
                            aria-label="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[#71717A] hover:text-white transition-colors"
                  >
                    Savatni tozalash
                  </button>
                  <Link
                    href="/catalog"
                    className="text-[#D4AF37] hover:underline"
                  >
                    + Boshqa modellarni ko&apos;rish
                  </Link>
                </div>
              </div>

              {/* Order Summary (4 cols) */}
              <div className="lg:col-span-4 bg-[#111111] border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-6">
                <h2 className="font-serif text-xl text-[#FFFFFF] font-normal pb-4 border-b border-white/[0.06]">
                  {t.checkout.title}
                </h2>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Soatlar soni:</span>
                    <span className="text-white">
                      {items.reduce((acc, curr) => acc + curr.quantity, 0)} dona
                    </span>
                  </div>

                  <div className="flex justify-between text-[#71717A]">
                    <span>Qabul qilish:</span>
                    <span className="text-white">Filialdan olib ketish</span>
                  </div>

                  <div className="flex items-center justify-between text-[#71717A] pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Tayyor bo&apos;lish:</span>
                    </span>
                    <span className="text-zinc-300 font-medium">{estimatedReady.formatted}</span>
                  </div>

                  {/* Promo Box in Cart */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    {appliedPromo ? (
                      <div className="flex justify-between items-center text-emerald-400 py-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Promokod ({appliedPromo.code}):</span>
                        </span>
                        <span>-${appliedPromo.discount_usd.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                            placeholder="Promokod"
                            className="flex-1 bg-[#0d0f12] border border-white/[0.1] rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={promoLoading || !promoInput.trim()}
                            className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-white text-[11px] rounded transition-colors"
                          >
                            {promoLoading ? "..." : "Qo'llash"}
                          </button>
                        </div>
                        {promoError && (
                          <p className="text-[10px] text-red-400">{promoError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/[0.06] pt-3 flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-[0.14em] text-[#71717A]">
                      Jami (hisoblangan):
                    </span>
                    <span className="font-mono text-lg font-medium text-white">
                      {finalCartTotal > 0 ? formatPrice(finalCartTotal, lang) : "Menejerdan so'raladi"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full min-h-[46px] bg-[#FFFFFF] hover:bg-zinc-200 text-[#090909] text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{t.cart.proceedToCheckout}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={storeData.telegramManagerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono uppercase tracking-[0.14em] rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.cart.askManager}</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
