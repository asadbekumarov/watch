"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductStock } from "@/data/products";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice, formatInstallment } from "@/lib/formatPrice";
import {
  ShieldCheck,
  Package,
  Truck,
  RotateCcw,
  Send,
  Phone,
  Check,
  Maximize2,
  X,
  Sparkles,
} from "lucide-react";

interface WatchDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function WatchDetailClient({
  product,
  relatedProducts,
}: WatchDetailClientProps) {
  const { lang, t } = useTranslation();
  const { addItem, items } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Quick order state
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("+998 ");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null);
  const [quickError, setQuickError] = useState(false);

  const isSoldOut = product.stock === "sold_out";
  const isInCart = items.some((i) => i.product.id === product.id);

  const handleAddToCart = () => {
    if (isSoldOut) return;
    const ok = addItem(product);
    if (ok) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    }
  };

  const handlePhoneInput = (val: string) => {
    if (!val.startsWith("+998")) {
      setQuickPhone("+998 ");
      return;
    }
    setQuickPhone(val);
  };

  const handleQuickOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || quickPhone.replace(/[^0-9]/g, "").length < 12) {
      alert("Iltimos, ismingiz va to'liq telefon raqamingizni kiriting (+998 XX XXX XX XX)");
      return;
    }

    setQuickLoading(true);
    setQuickError(false);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: quickName,
          phone: quickPhone,
          isQuickOrder: true,
          items: [{ productId: product.id, quantity: 1 }],
          deliveryType: "pickup",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQuickSuccess(data.orderNumber);
      } else {
        setQuickError(true);
      }
    } catch {
      setQuickError(true);
    } finally {
      setQuickLoading(false);
    }
  };

  const tgUsername = storeData.telegram.replace("@", "");
  const tgMessage = `Assalomu alaykum! Men "${product.brand} ${product.model}" soatini xarid qilmoqchiman.`;
  const tgLink = `https://t.me/${tgUsername}?text=${encodeURIComponent(tgMessage)}`;
  const telLink = `tel:${storeData.phone.replace(/[^0-9+]/g, "")}`;



  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-32">
      {/* Breadcrumb */}
      <nav className="mb-8 text-xs font-mono text-[#B5B5B5] tracking-wider uppercase flex items-center space-x-2">
        <Link href="/" className="hover:text-[#F5ECD5] transition-colors">
          {t.storeName}
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-[#F5ECD5] transition-colors">
          {t.nav.catalog}
        </Link>
        <span>/</span>
        <span className="text-[#F5ECD5]">{product.brand}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Gallery (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full bg-[#0e0e0e] border border-white/20 overflow-hidden group flex items-center justify-center p-4">
            <Image
              src={product.images[activeImageIndex]}
              alt={`${product.brand} ${product.model} - view ${activeImageIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
            />

            {/* Click to Zoom Button */}
            <button
              onClick={() => setZoomOpen(true)}
              className="absolute top-4 right-4 min-w-[44px] min-h-[44px] bg-[#141414]/80 border border-white/20 text-[#F5ECD5] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#090909] transition-colors"
              aria-label="Rasmni kattalashtirish"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative aspect-square bg-[#0e0e0e] border transition-all overflow-hidden ${
                  activeImageIndex === idx
                    ? "border-[#D4AF37] ring-1 ring-[#D4AF37]"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.brand} ${product.model} thumbnail ${idx + 1}`}
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Information & Actions (5 columns) */}
        <div className="lg:col-span-5 space-y-8 bg-[#090909] lg:sticky lg:top-28">
          <div className="space-y-2 border-b border-white/20 pb-6">
            <div className="flex items-center justify-between text-xs font-mono text-[#D4AF37] tracking-wider uppercase">
              <span>{product.brand}</span>
              <span>{product.collection}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F5ECD5] font-medium tracking-tight">
              {product.model}
            </h1>

            {/* Price block */}
            <div className="pt-3 space-y-1">
              {product.priceHidden ? (
                <div className="text-2xl text-[#D4AF37] font-serif">
                  {t.product.askPrice}
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline space-x-3">
                    <span className="font-mono text-2xl sm:text-3xl font-medium text-[#F5ECD5]">
                      {formatPrice(product.price, lang)}
                    </span>
                    {product.oldPrice && (
                      <span className="font-mono text-base text-[#777] line-through">
                        {formatPrice(product.oldPrice, lang)}
                      </span>
                    )}
                  </div>
                  {storeData.installment.enabled && (
                    <div className="text-xs sm:text-[13px] text-[#A8A8A8] font-mono mt-1">
                      {formatInstallment(product.price, 12, lang)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
              {t.product.descriptionTitle}
            </span>
            <p className="text-base text-[#E8E2D0] font-normal leading-[1.7] max-w-[55ch]">
              {product.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {addedNotice && (
              <div className="p-3 bg-[#162916] border border-[#225522] text-[#6ee7b7] text-xs flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{t.product.addedToCart}</span>
              </div>
            )}

            {/* Primary Order Button */}
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`w-full min-h-[50px] px-8 text-sm uppercase tracking-[0.1em] font-medium transition-colors flex items-center justify-center space-x-2 ${
                isSoldOut
                  ? "bg-[#222] text-[#666] cursor-not-allowed border border-white/10"
                  : "bg-[#F5ECD5] text-[#090909] hover:bg-white"
              }`}
            >
              <span>
                {isSoldOut
                  ? t.stock.sold_out
                  : isInCart
                  ? t.product.inCart
                  : t.product.addToCart}
              </span>
            </button>

            {/* Secondary Buttons: Telegram & Call */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={tgLink}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-4 border border-white/20 text-[#E8E2D0] hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span className="truncate">{t.product.writeTelegram}</span>
              </a>
              <a
                href={telLink}
                className="min-h-[48px] px-4 border border-white/20 text-[#E8E2D0] hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span className="truncate">{t.product.callStore}</span>
              </a>
            </div>

            {/* Quick Order Trigger */}
            <button
              onClick={() => setQuickOrderOpen(true)}
              className="w-full min-h-[44px] py-2 text-xs font-mono uppercase tracking-[0.1em] text-[#D4AF37] hover:underline"
            >
              {t.product.quickOrder}
            </button>
          </div>

          {/* Guarantees Block directly from store.ts */}
          <div className="pt-6 border-t border-white/20 space-y-3 bg-[#0e0e0e] p-5">
            <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#F5ECD5] font-medium">
              {t.product.guaranteesTitle}
            </span>
            <ul className="text-xs sm:text-[13px] space-y-2.5 text-[#A8A8A8]">
              {storeData.guarantees.original && (
                <li className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-[#E8E2D0]">100% Original mahsulot kafolati</span>
                </li>
              )}
              {storeData.guarantees.warrantyMonths > 0 && (
                <li className="flex items-center space-x-2.5">
                  <RotateCcw className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-[#E8E2D0]">
                    {storeData.guarantees.warrantyMonths} oylik rasmiy servis kafolati
                  </span>
                </li>
              )}
              {storeData.guarantees.boxAndDocuments && (
                <li className="flex items-center space-x-2.5">
                  <Package className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-[#E8E2D0]">Asl quti va rasmiy hujjatlar to&apos;plami</span>
                </li>
              )}
              {storeData.guarantees.delivery && (
                <li className="flex items-center space-x-2.5">
                  <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-[#E8E2D0]">{storeData.guarantees.delivery}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Readable Specifications Table (15-16px) */}
      <div className="mt-20 pt-12 border-t border-white/20">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#F5ECD5] font-light mb-8">
          {t.product.specsTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
          {[
            { label: t.product.specBrand, value: product.brand },
            { label: t.product.specModel, value: product.model },
            { label: t.product.specCollection, value: product.collection },
            { label: t.product.specMovement, value: t.movement[product.movement] },
            { label: t.product.specCaseMaterial, value: product.caseMaterial },
            { label: t.product.specCaseSize, value: product.caseSize },
            { label: t.product.specGlass, value: product.glass },
            { label: t.product.specWaterResistance, value: product.waterResistance },
            { label: t.product.specStrap, value: product.strap },
            { label: t.product.specGender, value: t.gender[product.gender] },
            {
              label: t.product.specWarranty,
              value: `${product.warranty} ${t.product.warrantyMonths}`,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-3 border-b border-white/10 text-[15px] sm:text-[16px]"
            >
              <span className="text-[#B5B5B5] font-mono text-xs sm:text-[13px] uppercase">
                {row.label}
              </span>
              <span className="text-[#F5ECD5] font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related Watches (Max 4 items) */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-white/20">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#F5ECD5] font-light mb-8">
            {t.product.relatedTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/watch/${rel.slug}`}
                className="group bg-[#0e0e0e] border border-white/20 hover:border-[#D4AF37]/60 transition-all p-4 flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-[#121212] overflow-hidden mb-4">
                  <Image
                    src={rel.images[0]}
                    alt={`${rel.brand} ${rel.model}`}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#B5B5B5]">{rel.brand}</div>
                  <h3 className="font-serif text-lg text-[#F5ECD5] font-normal">
                    {rel.model}
                  </h3>
                  <div className="font-mono text-sm text-[#F5ECD5] font-medium pt-1">
                    {rel.priceHidden
                      ? t.product.askPrice
                      : formatPrice(rel.price, lang)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090909]/95 border-t border-white/20 p-3.5 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-[11px] font-mono text-[#B5B5B5] uppercase">
            {product.brand}
          </div>
          <div className="font-mono text-base font-medium text-[#F5ECD5]">
            {product.priceHidden
              ? t.product.askPrice
              : formatPrice(product.price, lang)}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className={`min-h-[46px] px-6 text-xs uppercase tracking-wider font-medium ${
            isSoldOut
              ? "bg-[#222] text-[#666] cursor-not-allowed"
              : "bg-[#F5ECD5] text-[#090909]"
          }`}
        >
          {isSoldOut ? t.stock.sold_out : t.product.addToCart}
        </button>
      </div>

      {/* Zoom Modal */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 min-w-[44px] min-h-[44px] text-white text-2xl"
            aria-label="Yopish"
          >
            ✕
          </button>
          <div className="relative w-full max-w-4xl aspect-square">
            <Image
              src={product.images[activeImageIndex]}
              alt={`${product.brand} ${product.model} zoomed`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Quick Order Modal */}
      {quickOrderOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/20 max-w-md w-full p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setQuickOrderOpen(false);
                setQuickSuccess(null);
              }}
              className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#B5B5B5] hover:text-white text-xl"
              aria-label="Yopish"
            >
              ✕
            </button>

            {quickSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#162916] border border-[#225522] flex items-center justify-center text-[#6ee7b7]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-[#F5ECD5]">
                  {t.confirmation.title}
                </h3>
                <p className="text-sm text-[#A8A8A8]">
                  {t.confirmation.subtitle}
                </p>
                <div className="p-3 bg-[#141414] border border-white/20 text-xs font-mono text-[#D4AF37]">
                  {t.confirmation.orderNumberLabel}: {quickSuccess}
                </div>
                <button
                  onClick={() => {
                    setQuickOrderOpen(false);
                    setQuickSuccess(null);
                  }}
                  className="min-h-[44px] px-6 bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium"
                >
                  OK
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-2xl text-[#F5ECD5] mb-2">
                  {t.product.quickOrder}
                </h3>
                <p className="text-xs text-[#A8A8A8] mb-6">
                  {t.product.quickOrderDesc}
                </p>

                <div className="mb-4 p-3 bg-[#141414] border border-white/10 text-xs font-mono text-[#F5ECD5]">
                  {product.brand} — {product.model}
                </div>

                {quickError && (
                  <div className="mb-4 p-3 bg-[#261616] border border-[#552222] text-[#fca5a5] text-xs">
                    {t.checkout.errorDesc}
                  </div>
                )}

                <form onSubmit={handleQuickOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#B5B5B5] mb-1">
                      {t.product.yourName}
                    </label>
                    <input
                      type="text"
                      required
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Ism Familiya"
                      className="min-h-[46px] w-full bg-[#141414] border border-white/20 text-sm text-[#F5ECD5] px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#B5B5B5] mb-1">
                      {t.product.yourPhone}
                    </label>
                    <input
                      type="tel"
                      required
                      value={quickPhone}
                      onChange={(e) => handlePhoneInput(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="min-h-[46px] w-full bg-[#141414] border border-white/20 text-sm text-[#F5ECD5] px-3.5 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={quickLoading}
                    className="min-h-[48px] w-full bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium hover:bg-white transition-colors"
                  >
                    {quickLoading
                      ? t.checkout.submitting
                      : t.product.submitQuickOrder}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

