"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product, SelectedCustomization, luxuryStrapOptions } from "@/data/products";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/lib/cart";
import { X, Check, ShieldCheck, Gift, Clock, Sparkles } from "lucide-react";

interface CoffeeCustomizerModalProps {
  product: Product;
  onClose: () => void;
  lang?: "uz" | "ru";
}

export default function CoffeeCustomizerModal({
  product,
  onClose,
  lang = "uz",
}: CoffeeCustomizerModalProps) {
  const { addItem } = useCart();

  const straps = product.availableStraps || luxuryStrapOptions;
  const [selectedStrap, setSelectedStrap] = useState(straps[0]);
  const [includeGiftBox, setIncludeGiftBox] = useState(true);
  const [engravingText, setEngravingText] = useState("");
  const [quantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const giftBoxPrice = includeGiftBox ? 1500000 : 0;
  const engravingPrice = engravingText.trim().length > 0 ? 800000 : 0;

  const unitPrice = product.price + selectedStrap.extraPrice + giftBoxPrice + engravingPrice;
  const totalSum = unitPrice * quantity;

  const handleAddToCart = () => {
    const custom: SelectedCustomization = {
      strapId: selectedStrap.id,
      strapName: selectedStrap.name,
      giftBox: includeGiftBox,
      engravingText: engravingText.trim() || undefined,
    };

    addItem(product, quantity, custom, unitPrice);
    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full max-w-xl bg-[#111111] border border-[#D4AF37]/30 rounded-t-3xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col overflow-hidden text-[#F8F8F8] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b border-[#D4AF37]/15 flex items-start gap-4 bg-[#141414]">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#161616] border border-[#D4AF37]/25 shrink-0">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
              {product.brand} · {product.specs?.caseDiameter || "41 mm"}
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-normal text-[#F8F8F8] truncate mt-0.5">
              {product.name}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="font-mono text-base font-bold text-[#D4AF37]">
                {formatPrice(unitPrice, lang)}
              </span>
              <span className="text-xs text-[#8E8E93]">
                Ref. {product.referenceNumber}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1e1e1e] border border-white/10 hover:border-[#D4AF37]/50 flex items-center justify-center text-[#8E8E93] hover:text-[#F8F8F8] transition-colors"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. Strap Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
              1. Remeshok / Braslet Konfiguratsiyasi
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {straps.map((strap) => {
                const isSelected = selectedStrap.id === strap.id;
                return (
                  <button
                    key={strap.id}
                    type="button"
                    onClick={() => setSelectedStrap(strap)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                        : "border-white/10 bg-[#161616] text-[#8E8E93] hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-[#F8F8F8]">
                        {strap.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#8E8E93] mt-0.5">
                        {strap.id === "oem" ? "Zavod Shveytsariya komplektatsiyasi" : "Eksklyuziv almashtirish opsiyasi"}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-[#D4AF37] font-semibold">
                        {strap.extraPrice > 0 ? `+${formatPrice(strap.extraPrice, lang)}` : "Standart"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Custom Case Back Engraving */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                2. Korpus orqasiga Shaxsiy Gravirovka (+800 000 so&apos;m)
              </label>
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <input
              type="text"
              value={engravingText}
              onChange={(e) => setEngravingText(e.target.value.slice(0, 30))}
              placeholder="Masalan: A.K. 2026 yoki Initials"
              className="w-full min-h-[46px] px-4 bg-[#161616] border border-white/10 focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#F8F8F8] placeholder-[#8E8E93]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
            />
            <p className="text-[11px] text-[#8E8E93]">
              Lazerli mikrogravirovka Shveytsariya sertifikatlangan ustaxonamizda bajariladi (maksimum 30 belgi).
            </p>
          </div>

          {/* 3. Luxury Gift Box Option */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
              3. VIP Sovg&apos;a Qutisi & Brend Lentalari
            </label>
            <div
              onClick={() => setIncludeGiftBox(!includeGiftBox)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                includeGiftBox
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                  : "border-white/10 bg-[#161616] text-[#8E8E93]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-[#F8F8F8]">
                    Qimmatbaho Yog&apos;och Quti & Rasmiy Muhrlangan Konvert
                  </div>
                  <div className="text-[11px] text-[#8E8E93] mt-0.5">
                    Kafolat pasporti va sovg&apos;a qutisi bilan
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#D4AF37] font-semibold">
                {includeGiftBox ? "+1 500 000 so'm" : "Qo'shilmagan"}
              </span>
            </div>
          </div>

          {/* Trust points */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs text-[#8E8E93]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>COSC Sertifikati</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>5 Yillik Xalqaro Kafolat</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#D4AF37]/15 bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8E93]">
              Jami qiymat ({quantity} ta)
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#D4AF37]">
              {formatPrice(totalSum, lang)}
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 sm:flex-none min-h-[48px] px-8 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center space-x-2 shadow-lg ${
                isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909]"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Savatga qo&apos;shildi</span>
                </>
              ) : (
                <span>Konfiguratsiyani saqlash va Savatga</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
