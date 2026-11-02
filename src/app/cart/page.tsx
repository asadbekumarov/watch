"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/formatPrice";
import { Trash2, Plus, Minus, ArrowRight, AlertCircle, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const { lang, t } = useTranslation();

  const hasOnOrderItem = items.some((i) => i.product.stock === "on_order");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#090909] pt-28 pb-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
          {/* Header */}
          <div className="mb-10 space-y-2 border-b border-white/20 pb-6">
            <div className="text-xs font-mono text-[#B5B5B5] tracking-wider uppercase">
              <Link href="/" className="hover:text-[#F5ECD5] transition-colors">
                {t.storeName}
              </Link>{" "}
              / <span className="text-[#F5ECD5]">{t.cart.title}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#F5ECD5] tracking-tight">
              {t.cart.title}
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center space-y-6 bg-[#0e0e0e] border border-white/20 p-8 sm:p-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#141414] border border-white/10 flex items-center justify-center text-[#B5B5B5]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl text-[#F5ECD5] font-light">
                {t.cart.empty}
              </h2>
              <p className="text-sm text-[#A8A8A8] max-w-md mx-auto">
                {t.cart.emptyDesc}
              </p>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center space-x-2 min-h-[48px] px-8 bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium hover:bg-white transition-colors"
                >
                  <span>{t.cart.browseCatalog}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Items List (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {hasOnOrderItem && (
                  <div className="p-4 bg-[#2a2414] border border-[#6b5410] text-[#fde047] text-xs sm:text-[13px] flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{t.cart.onOrderWarning}</span>
                  </div>
                )}

                <div className="divide-y divide-white/10 border-y border-white/20 bg-[#0e0e0e]">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Image & Title */}
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/watch/${item.product.slug}`}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#141414] border border-white/10 shrink-0 overflow-hidden"
                        >
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.model}
                            fill
                            sizes="100px"
                            className="object-cover"
                          />
                        </Link>

                        <div className="space-y-1">
                          <span className="text-xs font-mono text-[#D4AF37] uppercase">
                            {item.product.brand}
                          </span>
                          <Link
                            href={`/watch/${item.product.slug}`}
                            className="block font-serif text-lg sm:text-xl text-[#F5ECD5] hover:text-white transition-colors"
                          >
                            {item.product.model}
                          </Link>
                          <div className="text-xs text-[#A8A8A8]">
                            {item.product.caseSize} · {item.product.caseMaterial}
                          </div>
                          {item.product.stock === "on_order" && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase bg-[#2a2414] text-[#fde047] border border-[#6b5410]">
                              {t.stock.on_order}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Price Controls */}
                      <div className="w-full sm:w-auto flex items-center justify-between sm:space-x-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-white/20 bg-[#141414]">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-9 h-9 flex items-center justify-center text-[#B5B5B5] hover:text-white transition-colors"
                            aria-label="Kamaytirish"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-mono text-[#F5ECD5]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="w-9 h-9 flex items-center justify-center text-[#B5B5B5] hover:text-white transition-colors"
                            aria-label="Ko'paytirish"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-mono text-base sm:text-lg font-medium text-[#F5ECD5]">
                            {item.product.priceHidden
                              ? t.product.askPrice
                              : formatPrice(item.product.price * item.quantity, lang)}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#888] hover:text-[#fca5a5] transition-colors"
                          aria-label={t.cart.remove}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Link
                    href="/catalog"
                    className="text-xs font-mono text-[#D4AF37] hover:underline"
                  >
                    ← {t.cart.browseCatalog}
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-xs font-mono text-[#888] hover:text-[#fca5a5] transition-colors"
                  >
                    {t.cart.remove} (barchasini)
                  </button>
                </div>
              </div>

              {/* Order Summary & Checkout CTA (4 cols) */}
              <div className="lg:col-span-4 bg-[#0e0e0e] border border-white/20 p-6 space-y-6 sticky top-28">
                <h2 className="font-serif text-xl text-[#F5ECD5] font-light border-b border-white/20 pb-4">
                  {t.checkout.orderSummary}
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#B5B5B5]">
                    <span>{t.checkout.itemsTotal}:</span>
                    <span className="font-mono text-[#F5ECD5]">
                      {formatPrice(totalAmount, lang)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#B5B5B5]">
                    <span>{t.checkout.shipping}:</span>
                    <span className="font-mono text-[#6ee7b7]">{t.checkout.free}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20 flex justify-between items-baseline">
                  <span className="text-sm font-medium text-[#F5ECD5]">
                    {t.cart.total}:
                  </span>
                  <span className="font-serif text-2xl text-[#F5ECD5] font-light font-mono">
                    {formatPrice(totalAmount, lang)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full min-h-[50px] bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-[0.1em] font-medium hover:bg-white transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{t.cart.proceedToCheckout}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-[#888] text-center leading-relaxed">
                  {t.checkout.paymentNote}
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

