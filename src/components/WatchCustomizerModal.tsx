"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product, SelectedCustomization, luxuryStrapOptions } from "@/data/products";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/lib/cart";
import { X, Check, Gift, Compass } from "lucide-react";

interface WatchCustomizerModalProps {
  product: Product;
  onClose: () => void;
  lang?: "uz" | "ru";
}

export default function WatchCustomizerModal({
  product,
  onClose,
  lang = "uz",
}: WatchCustomizerModalProps) {
  const { addItem } = useCart();

  const straps = product.availableStraps || luxuryStrapOptions;
  const [selectedStrap, setSelectedStrap] = useState(straps[0]);
  const [includeGiftBox, setIncludeGiftBox] = useState(true);
  const [engravingText, setEngravingText] = useState("");
  const [selectedCity, setSelectedCity] = useState("Toshkent");
  const [isAdded, setIsAdded] = useState(false);

  const giftBoxPrice = includeGiftBox ? 150000 : 0;
  const engravingPrice = engravingText.trim().length > 0 ? 80000 : 0;

  const unitPrice = product.price + selectedStrap.extraPrice + giftBoxPrice + engravingPrice;

  const cities = [
    "Toshkent",
    "Samarqand",
    "Buxoro",
    "Andijon",
    "Farg'ona",
    "Namangan",
    "Qarshi",
    "Termiz",
    "Urganch",
    "Nukus",
    "Navoiy",
    "Jizzax",
    "Guliston",
  ];

  const handleAddToCart = () => {
    const custom: SelectedCustomization = {
      strapId: selectedStrap.id,
      strapName: selectedStrap.name,
      giftBox: includeGiftBox,
      engravingText: engravingText.trim() ? `${engravingText.trim()} (${selectedCity})` : undefined,
    };

    addItem(product, 1, custom, unitPrice);
    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#111111] border-t sm:border border-white/[0.12] rounded-t-2xl sm:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90dvh] flex flex-col overflow-hidden text-[#FFFFFF] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Pill */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#141414]">
          <div className="w-10 h-1 bg-white/25 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="relative p-4 sm:p-6 border-b border-white/[0.06] flex items-start gap-3.5 sm:gap-4 bg-[#141414]">
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#090909] border border-white/[0.08] shrink-0">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#71717A]">
                {product.brand} · {product.specs?.caseDiameter || "40 mm"}
              </span>
            </div>
            <h2 className="font-serif text-base sm:text-lg font-normal text-[#FFFFFF] truncate mt-0.5">
              {product.name}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="font-mono text-sm sm:text-base font-medium text-white">
                {formatPrice(unitPrice, lang)}
              </span>
              <span className="text-[11px] text-[#71717A]">
                Ref. {product.referenceNumber}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-[#71717A] hover:text-[#FFFFFF] transition-colors touch-manipulation"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Islamic City Preset for Azan */}
          {product.islamicFeatures?.azanTimes && (
            <div className="space-y-2 p-3.5 bg-[#090909] border border-white/[0.06] rounded-xl">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-300">
                <Compass className="w-4 h-4 text-[#D4AF37]" />
                <span>Azon Vaqtini Sozlash (Shahar)</span>
              </div>
              <p className="text-[11px] text-[#71717A]">
                Soat yetkazilishidan oldin mutaxassislarimiz siz tanlagan shahar vaqti bilan to&apos;liq moslab beradi.
              </p>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#111111] border border-white/[0.08] rounded-lg text-xs font-mono text-[#FFFFFF] focus:border-[#D4AF37] outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-[#111111]">
                    {c} vaqti bilan sozlash
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1. Strap Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-mono uppercase tracking-[0.14em] text-[#71717A]">
              1. Braslet / Remeshok Turi
            </label>
            <div className="grid grid-cols-1 gap-2">
              {straps.map((s) => {
                const isSelected = selectedStrap.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStrap(s)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between text-xs font-mono transition-all ${
                      isSelected
                        ? "bg-white/[0.05] border-[#D4AF37]/50 text-[#FFFFFF]"
                        : "bg-[#090909] border-white/[0.06] text-[#71717A] hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-white bg-white" : "border-white/20"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-[#090909] stroke-[3]" />}
                      </div>
                      <span className="font-sans text-xs">{s.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-300">
                      {s.extraPrice === 0 ? "Standart" : `+${formatPrice(s.extraPrice, lang)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Personal Engraving */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-[0.14em] text-[#71717A]">
                2. Lazer Gravirovka (+80 000 UZS)
              </label>
              <span className="text-[10px] text-[#71717A] font-mono">Ixtiyoriy</span>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Orqa qopqoqqa ism yoki esdalik sana yozish imkoniyati.
            </p>
            <input
              type="text"
              maxLength={28}
              value={engravingText}
              onChange={(e) => setEngravingText(e.target.value)}
              placeholder="Masalan: Azizbekka esdalik · 2026"
              className="w-full px-3.5 py-2.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs font-mono text-[#FFFFFF] placeholder-[#71717A]/40 focus:border-[#D4AF37] outline-none"
            />
          </div>

          {/* 3. ALFAJR Gift Box */}
          <div className="p-3.5 bg-[#090909] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-sans text-[#FFFFFF]">
                  ALFAJR Sovg&apos;a Qutisi & Brend Paketi
                </div>
                <div className="text-[10px] text-[#71717A]">
                  Kafolat taloni bilan birga
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIncludeGiftBox(!includeGiftBox)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                includeGiftBox
                  ? "bg-white text-black font-medium"
                  : "bg-transparent border border-white/[0.08] text-[#71717A]"
              }`}
            >
              {includeGiftBox ? "+150 000 UZS" : "Qo'shish"}
            </button>
          </div>
        </div>

        {/* Modal Footer (with iOS Safe Area in Bottom Sheet mode) */}
        <div className="p-4 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] bg-[#141414] flex items-center justify-between gap-4">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Yakuniy narxi
            </span>
            <span className="font-mono text-base sm:text-lg font-medium text-[#FFFFFF]">
              {formatPrice(unitPrice, lang)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="min-h-[44px] px-6 sm:px-8 rounded-lg text-xs font-mono uppercase tracking-[0.14em] font-medium transition-all bg-white hover:bg-zinc-200 text-[#090909] flex items-center space-x-2 touch-manipulation shadow-lg"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Qo&apos;shildi</span>
              </>
            ) : (
              <span>Savatga Qo&apos;shish</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
