"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice, getTelegramInquiryUrl } from "@/lib/formatPrice";
import FloatingCartBar from "@/components/FloatingCartBar";
import QuickBuyModal from "@/components/QuickBuyModal";
import {
  Building2,
  ShoppingBag,
  Send,
  Zap,
  Info,
} from "lucide-react";

interface WatchDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function WatchDetailClient({
  product,
}: WatchDetailClientProps) {
  const { lang } = useTranslation();
  const { addItem } = useCart();

  const [quantity] = useState(1);
  const [isAddedNotice, setIsAddedNotice] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  const hasPrice = product.price !== null && product.price > 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAddedNotice(true);
    setTimeout(() => setIsAddedNotice(false), 3000);
  };

  const tgUrl = getTelegramInquiryUrl(product.name, storeData.telegramManager, lang);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-32 text-[#FFFFFF]">
      {/* Breadcrumb */}
      <nav className="mb-8 text-[11px] font-mono text-[#71717A] tracking-[0.16em] uppercase flex items-center space-x-2">
        <Link href="/" className="hover:text-white transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-white transition-colors">
          Kolleksiya
        </Link>
        <span>/</span>
        <span className="text-white">{product.brand}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#111111] border border-white/[0.08] shadow-2xl">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.isBestseller && (
              <div className="absolute top-4 left-4">
                <span className="text-xs font-mono uppercase tracking-[0.14em] bg-[#D4AF37] text-black font-semibold px-3 py-1 rounded-md shadow-md">
                  Bestseller
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header */}
          <div className="space-y-2 border-b border-white/[0.08] pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
                {product.brand}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                O&apos;lcham: {product.specs.caseDiameter}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal tracking-tight">
              {lang === "ru" ? product.nameRu : product.name}
            </h1>

            {/* Price Row */}
            <div className="pt-2 flex items-baseline gap-4">
              <div className="text-2xl sm:text-3xl font-mono font-medium text-white">
                {formatPrice(product.price, lang)}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
            {lang === "ru" ? product.descriptionRu : product.descriptionUz}
          </p>

          {/* Store-specific notes disclaimer */}
          {product.specs.notes && product.specs.notes.length > 0 && (
            <div className="p-4 bg-[#141414] border border-white/[0.08] rounded-xl space-y-1.5">
              <div className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Do&apos;kon tomonidan berilgan ma&apos;lumot:</span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1">
                {product.specs.notes.map((note, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-white">
              Xususiyatlari
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 bg-[#111111] rounded-lg border border-white/[0.05]">
                <span className="text-[#71717A] block text-[10px] uppercase">Mexanizm</span>
                <span className="text-white font-medium">{product.specs.movement}</span>
              </div>
              <div className="p-3 bg-[#111111] rounded-lg border border-white/[0.05]">
                <span className="text-[#71717A] block text-[10px] uppercase">Korpus diametri</span>
                <span className="text-white font-medium">{product.specs.caseDiameter}</span>
              </div>
              {product.specs.dialColor && (
                <div className="p-3 bg-[#111111] rounded-lg border border-white/[0.05]">
                  <span className="text-[#71717A] block text-[10px] uppercase">Siferblat rangi</span>
                  <span className="text-white font-medium">{product.specs.dialColor}</span>
                </div>
              )}
              {product.specs.waterResistance && (
                <div className="p-3 bg-[#111111] rounded-lg border border-white/[0.05]">
                  <span className="text-[#71717A] block text-[10px] uppercase">Suvga chidamlilik</span>
                  <span className="text-white font-medium">{product.specs.waterResistance}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            {hasPrice ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 min-h-[48px] bg-white hover:bg-zinc-200 text-[#090909] text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAddedNotice ? "Savatga qo'shildi!" : "Savatga qo'shish"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQuickBuy(true)}
                  className="min-h-[48px] px-6 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span>Tezkor band qilish</span>
                </button>
              </div>
            ) : null}

            {/* Telegram Manager Inquiry Button (Always available, primary when price is null) */}
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full min-h-[48px] font-mono text-xs uppercase tracking-[0.14em] font-medium rounded-lg transition-all flex items-center justify-center space-x-2 ${
                hasPrice
                  ? "bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#D4AF37]"
                  : "bg-[#D4AF37] hover:bg-[#c49f27] text-black shadow-lg"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {lang === "ru"
                  ? "Уточнить цену и наличие в Telegram"
                  : "Menejerdan narx va mavjudlikni so'rash"}
              </span>
            </a>

            {/* Branch Availability Note */}
            <div className="pt-2 text-[11px] font-mono text-[#71717A] flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                Toshkent (Langar 12) va Namangan (Navoiy 42) filiallarida ko&apos;rish mumkin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Buy Modal */}
      {showQuickBuy && (
        <QuickBuyModal
          product={product}
          onClose={() => setShowQuickBuy(false)}
          lang={lang}
        />
      )}

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar />
    </div>
  );
}
