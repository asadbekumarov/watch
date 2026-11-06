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
  ShieldCheck,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    clearCart,
    recommendedUpsells,
  } = useCart();
  const { lang, t } = useTranslation();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] text-[#F8F8F8] pt-28 pb-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
          {/* Header */}
          <div className="mb-10 space-y-2 border-b border-[#D4AF37]/20 pb-6">
            <div className="text-xs font-mono text-[#8E8E93] tracking-wider uppercase">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">
                {t.storeName}
              </Link>{" "}
              / <span className="text-[#F8F8F8]">{t.cart.title}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F8F8F8] tracking-tight">
              {t.cart.title}
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center space-y-6 bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#161616] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#F8F8F8] font-normal">
                {t.cart.empty}
              </h2>
              <p className="text-sm text-[#8E8E93] max-w-md mx-auto">
                {t.cart.emptyDesc}
              </p>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center space-x-2 min-h-[48px] px-8 bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-md"
                >
                  <span>{t.cart.browseMenu}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Items List (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Complimentary VIP Delivery Banner */}
                <div className="bg-[#111111] border border-[#D4AF37]/25 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3 text-[#F8F8F8]">
                    <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#D4AF37]">
                        Bepul VIP Zirhli Inkassatsiya Yetkazishi 🛡️
                      </div>
                      <div className="text-[11px] text-[#8E8E93]">
                        Barcha buyurtmalar to&apos;liq sug&apos;urtalangan va bepul yetkaziladi
                      </div>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                    Bepul
                  </span>
                </div>

                {/* Items Container */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                    >
                      {/* Product details */}
                      <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#161616] border border-white/5 shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                            {item.product.brand}
                          </span>
                          <h3 className="font-serif text-base sm:text-lg text-[#F8F8F8] font-normal">
                            {item.product.name}
                          </h3>

                          {/* Customization Details */}
                          {item.customization && (
                            <div className="text-[11px] text-[#8E8E93] space-y-0.5">
                              {item.customization.strapName && (
                                <div>Braslet: {item.customization.strapName}</div>
                              )}
                              {item.customization.engravingText && (
                                <div className="text-[#D4AF37]">
                                  Gravirovka: &quot;{item.customization.engravingText}&quot;
                                </div>
                              )}
                              {item.customization.giftBox && (
                                <div>VIP Sovg&apos;a Qutisi & Lentalari</div>
                              )}
                            </div>
                          )}

                          <div className="font-mono text-xs text-[#D4AF37] pt-1">
                            {formatPrice(item.unitPrice, lang)} / dona
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="flex items-center border border-white/10 bg-[#161616] rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#8E8E93] hover:text-[#F8F8F8]"
                            aria-label="Kamaytirish"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-bold text-[#F8F8F8]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#8E8E93] hover:text-[#F8F8F8]"
                            aria-label="Ko'paytirish"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-mono text-sm sm:text-base font-bold text-[#F8F8F8]">
                            {formatPrice(item.unitPrice * item.quantity, lang)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[11px] font-mono text-[#8E8E93] hover:text-red-400 mt-1 flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.cart.remove}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                <div className="flex justify-between items-center text-xs font-mono pt-2">
                  <Link href="/catalog" className="text-[#D4AF37] hover:underline">
                    ← Katalogga qaytish
                  </Link>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[#8E8E93] hover:text-red-400 transition-colors"
                  >
                    Savatni tozalash
                  </button>
                </div>

                {/* Complementary Horology Recommendations */}
                {recommendedUpsells.length > 0 && (
                  <div className="mt-12 bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg text-[#F8F8F8]">
                        {t.cart.upsellTitle}
                      </h3>
                      <p className="text-xs text-[#8E8E93]">
                        {t.cart.upsellSubtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {recommendedUpsells.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[#161616] border border-white/5 rounded-xl p-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#111111] mb-2">
                              <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="text-[10px] font-mono text-[#D4AF37] uppercase">{p.brand}</div>
                            <div className="font-serif text-xs text-[#F8F8F8] line-clamp-1">{p.name}</div>
                            <div className="font-mono text-xs text-[#8E8E93] mt-1">{formatPrice(p.price, lang)}</div>
                          </div>
                          <Link
                            href={`/watch/${p.slug}`}
                            className="mt-3 w-full py-1.5 bg-[#111111] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#090909] text-[11px] font-mono uppercase tracking-wider rounded-lg border border-[#D4AF37]/30 transition-colors text-center block"
                          >
                            Ko&apos;rish
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary & Checkout CTA (4 cols) */}
              <div className="lg:col-span-4 bg-[#111111] border border-[#D4AF37]/25 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-xl">
                <h2 className="font-serif text-xl text-[#F8F8F8] font-normal border-b border-white/10 pb-4">
                  Xarid hisob-kitobi
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#8E8E93]">
                    <span>Soatlar qiymati:</span>
                    <span className="font-mono text-[#F8F8F8]">
                      {formatPrice(totalAmount, lang)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#8E8E93]">
                    <span>VIP Zirhli Yetkazish:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      Mutlaqo Bepul
                    </span>
                  </div>

                  <div className="text-xs text-[#8E8E93] bg-[#161616] p-3.5 rounded-xl leading-relaxed border border-white/5 space-y-1">
                    <div className="text-[#D4AF37] font-semibold flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>100% Xavfsiz Shartnoma</span>
                    </div>
                    <div>
                      Toshkent va viloyatlarga rasmiy inkassatsiya xizmati orqali yetkaziladi.
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-base font-semibold text-[#F8F8F8]">
                    Jami to&apos;lov:
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-[#D4AF37]">
                      {formatPrice(totalAmount, lang)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full min-h-[52px] bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs uppercase tracking-[0.12em] font-bold rounded-2xl transition-all shadow-[0_8px_24px_rgba(212,175,55,0.35)] flex items-center justify-center space-x-2"
                >
                  <span>{t.cart.proceedToCheckout}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-[#8E8E93] text-center leading-relaxed">
                  Qabul qilganda naqd pul (USD/UZS) yoki bank kartasi orqali to&apos;lash mumkin.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
