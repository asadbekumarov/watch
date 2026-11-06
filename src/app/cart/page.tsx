"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/formatPrice";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Watch,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    clearCart,
  } = useCart();
  const { lang, t } = useTranslation();

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

          {items.length === 0 ? (
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
                {/* BTS Free Delivery Line */}
                <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3 text-zinc-300">
                    <Truck className="w-4 h-4 text-[#71717A]" />
                    <span>O&apos;zbekiston bo&apos;ylab BTS pochtalariga bepul yetkaziladi.</span>
                  </div>
                  <span className="text-zinc-300 text-[11px] font-medium">
                    0 UZS
                  </span>
                </div>

                {/* Items Container */}
                <div className="space-y-3">
                  {items.map((item) => (
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
                          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#71717A]">
                            {item.product.brand}
                          </span>
                          <Link
                            href={`/watch/${item.product.slug}`}
                            className="font-serif text-base text-[#FFFFFF] hover:text-zinc-300 transition-colors font-normal block"
                          >
                            {item.product.name}
                          </Link>

                          {item.customization?.strapName && (
                            <div className="text-[11px] font-mono text-[#71717A]">
                              • Remeshok: {item.customization.strapName}
                            </div>
                          )}

                          {item.customization?.engravingText && (
                            <div className="text-[11px] font-mono text-zinc-300">
                              • Gravirovka: &quot;{item.customization.engravingText}&quot;
                            </div>
                          )}

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
                            className="w-7 h-7 flex items-center justify-center text-[#71717A] hover:text-white"
                            aria-label="Kamaytirish"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-mono text-[#FFFFFF]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#71717A] hover:text-white"
                            aria-label="Ko'paytirish"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right sm:min-w-28 font-mono text-sm text-[#FFFFFF]">
                          {formatPrice(item.unitPrice * item.quantity, lang)}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-[#71717A] hover:text-white transition-colors"
                          aria-label="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                    className="text-zinc-300 hover:text-white underline underline-offset-4"
                  >
                    + Yana soat qo&apos;shish
                  </Link>
                </div>
              </div>

              {/* Order Summary Card (4 cols) */}
              <div className="lg:col-span-4 bg-[#111111] border border-white/[0.08] rounded-xl p-6 space-y-6 sticky top-28">
                <div className="font-serif text-lg text-[#FFFFFF] font-normal border-b border-white/[0.06] pb-4">
                  Savat Xulosasi
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Soatlar qiymati:</span>
                    <span>{formatPrice(totalAmount, lang)}</span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-300">
                    <span>BTS Yetkazish:</span>
                    <span className="text-white">BEPUL (0 UZS)</span>
                  </div>

                  <div className="flex justify-between text-[#71717A]">
                    <span>Kafolat va Servis:</span>
                    <span className="text-white">@soatsoz_uzb</span>
                  </div>

                  <div className="border-t border-white/[0.08] pt-4 flex justify-between items-baseline">
                    <span className="text-sm font-sans font-medium text-[#FFFFFF]">
                      Jami summa:
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-medium text-[#FFFFFF]">
                      {formatPrice(totalAmount, lang)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full min-h-[48px] bg-[#FFFFFF] hover:bg-zinc-200 text-[#090909] text-xs uppercase font-mono tracking-[0.14em] font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>{t.cart.proceedToCheckout}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="p-3 bg-[#090909] border border-white/[0.05] rounded-lg text-[11px] text-[#71717A] leading-relaxed">
                  Mahsulot yetib borganda to&apos;liq ochib, tekshirib olgandan so&apos;ng to&apos;lov qilasiz.
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
