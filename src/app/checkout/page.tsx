"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { useTranslation } from "@/i18n";
import { storeData } from "@/data/store";
import { formatPrice } from "@/lib/formatPrice";
import {
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Watch,
  Phone,
} from "lucide-react";

const UZBEKISTAN_REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Farg'ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Buxoro viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Xorazm viloyati",
  "Navoiy viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
];

function normalizeUzPhone(rawPhone: string): string | null {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return null;
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { lang, t } = useTranslation();

  // Delivery type: BTS free delivery vs Tashkent courier vs Store pickup
  const [deliveryType, setDeliveryType] = useState<"bts_express" | "tashkent_courier" | "pickup">("bts_express");

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [selectedRegion, setSelectedRegion] = useState("Toshkent shahri");
  const [cityOrDistrict, setCityOrDistrict] = useState("");
  const [btsBranchOrAddress, setBtsBranchOrAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card_on_delivery" | "click" | "payme">("cash");
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhoneInput = (val: string) => {
    if (!val.startsWith("+998")) {
      setPhone("+998 ");
      return;
    }
    setPhone(val);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage(
        lang === "ru"
          ? "Пожалуйста, укажите ваше имя и фамилию."
          : "Iltimos, ism va familiyangizni kiriting."
      );
      return;
    }

    const cleanPhone = normalizeUzPhone(phone);
    if (!cleanPhone) {
      setErrorMessage(
        lang === "ru"
          ? "Пожалуйста, введите корректный номер телефона (+998 XX XXX XX XX)."
          : "Iltimos, to'g'ri O'zbekiston telefon raqamini kiriting (+998 XX XXX XX XX)."
      );
      return;
    }

    if (deliveryType !== "pickup" && !cityOrDistrict.trim()) {
      setErrorMessage(
        lang === "ru"
          ? "Пожалуйста, укажите ваш город или район."
          : "Iltimos, shahar yoki tumaningizni kiriting."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const orderPayload = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        region: deliveryType === "pickup" ? "Toshkent shahri" : selectedRegion,
        deliveryType,
        deliveryMethodLabel:
          deliveryType === "bts_express"
            ? "BTS Pochtasiga Bepul Yetkazish"
            : deliveryType === "tashkent_courier"
            ? "Toshkent Shahar Kuryeri"
            : "Do'kondan olib ketish",
        address:
          deliveryType === "pickup"
            ? storeData.addresses[0].address
            : `${selectedRegion}, ${cityOrDistrict.trim()}${
                btsBranchOrAddress.trim() ? `, Mo'ljal / Filial: ${btsBranchOrAddress.trim()}` : ""
              }`,
        paymentMethod,
        comment: comment.trim(),
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          strap: i.customization?.strapName,
          engraving: i.customization?.engravingText,
          giftBox: i.customization?.giftBox,
        })),
        totalAmount,
        honeypot,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderSuccessNumber(data.orderNumber || "ALFAJR-UZ");
        clearCart();
      } else {
        setErrorMessage(data.error || t.checkout.errorDesc);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(t.checkout.errorDesc);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccessNumber) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#090909] text-[#FFFFFF] pt-28 pb-24 px-4 sm:px-8">
          <div className="max-w-xl mx-auto bg-[#111111] border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-white">
              <CheckCircle2 className="w-8 h-8 text-zinc-200" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#71717A] font-medium">
                Xarid Tasdiqlandi
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF]">
                Rahmat, {fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
                Buyurtmangiz qabul qilindi. Tez orada ALFAJR menejeri siz bilan bog&apos;lanadi va soatingizni azon vaqtlari bo&apos;yicha sozlab, BTS Express orqali bepul jo&apos;natish tafsilotlarini kelishib oladi.
              </p>
            </div>

            <div className="bg-[#090909] border border-white/[0.06] rounded-xl p-5 space-y-2.5 text-xs font-mono text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-[#71717A]">Buyurtma raqami:</span>
                <span className="text-sm font-medium text-white">{orderSuccessNumber}</span>
              </div>
              <div className="flex justify-between items-center text-[#71717A]">
                <span>Yetkazish:</span>
                <span className="text-zinc-300">
                  {deliveryType === "bts_express"
                    ? "BTS Pochta (Bepul)"
                    : deliveryType === "tashkent_courier"
                    ? "Toshkent Kuryeri"
                    : "Do'kondan olib ketish"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#71717A]">
                <span>Servis kafolati:</span>
                <span className="text-[#D4AF37]">@soatsoz_uzb (1 yil)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="min-h-[46px] px-8 bg-white hover:bg-zinc-200 text-[#090909] text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-lg transition-all inline-flex items-center justify-center"
              >
                Bosh sahifa
              </Link>
              <Link
                href="/catalog"
                className="min-h-[46px] px-6 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg transition-all inline-flex items-center justify-center"
              >
                Kolleksiyaga o&apos;tish
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#090909] text-[#FFFFFF] pt-28 pb-24 px-4 text-center">
          <div className="max-w-md mx-auto space-y-6 bg-[#111111] border border-white/[0.07] rounded-2xl p-8 sm:p-12">
            <Watch className="w-10 h-10 text-[#71717A] mx-auto opacity-40" />
            <h1 className="font-serif text-2xl text-[#FFFFFF]">{t.cart.empty}</h1>
            <p className="text-xs text-[#71717A]">{t.cart.emptyDesc}</p>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center min-h-[44px] px-8 bg-white text-black text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-lg"
            >
              {t.cart.browseMenu}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] text-[#FFFFFF] pt-28 pb-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
          {/* Header */}
          <div className="mb-8 space-y-2 border-b border-white/[0.07] pb-6">
            <div className="text-[11px] font-mono text-[#71717A] tracking-[0.16em] uppercase">
              <Link href="/cart" className="hover:text-white transition-colors">
                Savat
              </Link>{" "}
              / <span className="text-white">Buyurtmani rasmiylashtirish</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF] tracking-tight">
              {t.checkout.title}
            </h1>
          </div>

          {/* Minimalist BTS Delivery Line */}
          <div className="mb-8 p-4 bg-[#111111] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3 text-zinc-300">
              <Truck className="w-4 h-4 text-[#71717A]" />
              <span>O&apos;zbekistonning barcha 14 ta hududidagi BTS filiallariga bepul yetkaziladi.</span>
            </div>
            <span className="text-[11px] text-[#D4AF37] tracking-wider uppercase font-medium">
              0 UZS
            </span>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-white/[0.03] border border-red-500/40 rounded-xl text-xs text-red-300 font-mono">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* STEP 1: Delivery Method Selection */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-[#71717A] font-medium flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>1. Yetkazib Berish Usuli</span>
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {/* Option 1: BTS Express (USP) */}
                  <button
                    type="button"
                    onClick={() => setDeliveryType("bts_express")}
                    className={`p-4 rounded-lg border text-left flex items-start justify-between transition-all ${
                      deliveryType === "bts_express"
                        ? "bg-white/[0.04] border-[#D4AF37]/50"
                        : "bg-[#090909] border-white/[0.06] hover:border-white/20 text-[#71717A]"
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="font-sans text-sm font-medium text-[#FFFFFF] flex items-center space-x-2">
                        <span>O&apos;zbekiston bo&apos;ylab BTS Pochtasiga Yetkazish</span>
                        <span className="text-[10px] font-mono text-[#D4AF37]">
                          BEPUL
                        </span>
                      </div>
                      <p className="text-xs text-[#71717A] leading-relaxed">
                        Viloyatingizdagi o&apos;zingizga eng yaqin BTS Express filialiga 1-2 kunda bepul yetkaziladi.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-zinc-300 shrink-0">
                      0 UZS
                    </span>
                  </button>

                  {/* Option 2: Tashkent Courier */}
                  <button
                    type="button"
                    onClick={() => setDeliveryType("tashkent_courier")}
                    className={`p-4 rounded-lg border text-left flex items-start justify-between transition-all ${
                      deliveryType === "tashkent_courier"
                        ? "bg-white/[0.04] border-[#D4AF37]/50"
                        : "bg-[#090909] border-white/[0.06] hover:border-white/20 text-[#71717A]"
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="font-sans text-sm font-medium text-[#FFFFFF]">
                        Toshkent shahri kuryeri (Eshikkacha)
                      </div>
                      <p className="text-xs text-[#71717A] leading-relaxed">
                        Toshkent shahri ichida 2-3 soatda to&apos;g&apos;ridan-to&apos;g&apos;ri eshikkacha yetkazish.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-zinc-300 shrink-0">
                      BEPUL
                    </span>
                  </button>

                  {/* Option 3: Store Pickup */}
                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`p-4 rounded-lg border text-left flex items-start justify-between transition-all ${
                      deliveryType === "pickup"
                        ? "bg-white/[0.04] border-[#D4AF37]/50"
                        : "bg-[#090909] border-white/[0.06] hover:border-white/20 text-[#71717A]"
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="font-sans text-sm font-medium text-[#FFFFFF]">
                        Do&apos;kondan olib ketish (Showroom)
                      </div>
                      <p className="text-xs text-[#71717A] leading-relaxed">
                        {storeData.addresses[0].address} (09:00 - 21:00)
                      </p>
                    </div>
                    <span className="text-xs font-mono text-zinc-300 shrink-0">
                      0 UZS
                    </span>
                  </button>
                </div>
              </div>

              {/* STEP 2: Customer Contact Info */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-[#71717A] font-medium flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>2. Qabul Qiluvchi Ma&apos;lumotlari</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="block text-xs font-mono text-[#71717A]">
                      Ism va Familiyangiz *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masalan: Jamshid Aliyev"
                      className="w-full px-3.5 py-2.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/40 focus:border-[#D4AF37] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="block text-xs font-mono text-[#71717A]">
                      Telefon Raqamingiz (+998) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneInput(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3.5 py-2.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/40 focus:border-[#D4AF37] outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Region & Address Selector */}
                {deliveryType !== "pickup" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Region Select */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#71717A]">
                          Viloyatingiz / Hududingiz *
                        </label>
                        <select
                          value={selectedRegion}
                          onChange={(e) => setSelectedRegion(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] focus:border-[#D4AF37] outline-none"
                        >
                          {UZBEKISTAN_REGIONS.map((r) => (
                            <option key={r} value={r} className="bg-[#111111]">
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* City/District */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#71717A]">
                          Shahar yoki Tumaningiz *
                        </label>
                        <input
                          type="text"
                          required
                          value={cityOrDistrict}
                          onChange={(e) => setCityOrDistrict(e.target.value)}
                          placeholder="Masalan: Chilonzor / Urgut / Qo'qon"
                          className="w-full px-3.5 py-2.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/40 focus:border-[#D4AF37] outline-none"
                        />
                      </div>
                    </div>

                    {/* BTS Branch or Door Address */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#71717A]">
                        {deliveryType === "bts_express"
                          ? "Eng yaqin BTS Pochta filiali yoki mo'ljal"
                          : "Ko'cha, uy va xonadon raqami"}
                      </label>
                      <input
                        type="text"
                        value={btsBranchOrAddress}
                        onChange={(e) => setBtsBranchOrAddress(e.target.value)}
                        placeholder={
                          deliveryType === "bts_express"
                            ? "Masalan: Markaziy BTS filiali yoki Bozor yonidagi punkt"
                            : "Masalan: Navoiy ko'chasi, 24-uy, 15-xonadon"
                        }
                        className="w-full px-3.5 py-2.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/40 focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Comment */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-mono text-[#71717A]">
                    Qo&apos;shimcha izoh (Ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Masalan: Soatni Namangan azon vaqti bilan sozlab bering"
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/40 focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <input
                  type="text"
                  name="user_token"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  className="hidden"
                />
              </div>

              {/* STEP 3: Payment Method */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-[#71717A] font-medium flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>3. To&apos;lov Usulini Tanlang</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3.5 rounded-lg border text-left flex items-center justify-between text-xs font-mono transition-all ${
                      paymentMethod === "cash"
                        ? "bg-white/[0.05] border-[#D4AF37]/50 text-white"
                        : "bg-[#090909] border-white/[0.06] text-[#71717A]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Banknote className="w-4 h-4 text-zinc-400" />
                      <span>Mahsulotni olganda to&apos;lov</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("click")}
                    className={`p-3.5 rounded-lg border text-left flex items-center justify-between text-xs font-mono transition-all ${
                      paymentMethod === "click"
                        ? "bg-white/[0.05] border-[#D4AF37]/50 text-white"
                        : "bg-[#090909] border-white/[0.06] text-[#71717A]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                      <span>Click / Payme orqali</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-6 sm:p-7 space-y-6 sticky top-28">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="font-serif text-lg text-[#FFFFFF] font-normal">
                    Buyurtma Tarkibi
                  </span>
                  <span className="text-xs font-mono text-[#71717A]">
                    {items.length} ta soat
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-medium text-[#FFFFFF]">{item.product.name}</div>
                        <div className="text-[11px] text-[#71717A] font-mono">
                          {item.quantity} dona × {formatPrice(item.unitPrice, lang)}
                        </div>
                        {item.customization?.strapName && (
                          <div className="text-[10px] text-zinc-400 font-mono">
                            • {item.customization.strapName}
                          </div>
                        )}
                      </div>
                      <div className="font-mono font-medium text-[#FFFFFF] shrink-0">
                        {formatPrice(item.unitPrice * item.quantity, lang)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Rows */}
                <div className="space-y-2.5 border-t border-white/[0.06] pt-4 text-xs font-mono">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Soatlar summasi:</span>
                    <span>{formatPrice(totalAmount, lang)}</span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-300">
                    <span>BTS Pochtasiga Dastavka:</span>
                    <span className="font-medium text-white">0 UZS (BEPUL)</span>
                  </div>

                  <div className="flex justify-between text-[#71717A]">
                    <span>@soatsoz_uzb Kafolati:</span>
                    <span className="text-zinc-300">1 Yil Bepul</span>
                  </div>

                  <div className="border-t border-white/[0.08] pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-sans font-medium text-[#FFFFFF]">
                      Jami to&apos;lov:
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-medium text-[#FFFFFF]">
                      {formatPrice(totalAmount, lang)}
                    </span>
                  </div>
                </div>

                {/* Submit Button: Solid Crisp White (Swiss Luxury CTA) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[50px] bg-[#FFFFFF] hover:bg-zinc-200 text-[#090909] text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Rasmiylashtirilmoqda...</span>
                  ) : (
                    <>
                      <span>Buyurtmani Tasdiqlash</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Trust Guarantee Note */}
                <div className="p-3 bg-[#090909] border border-white/[0.05] rounded-lg text-[11px] text-[#71717A] leading-relaxed">
                  Siz buyurtmani BTS Pochtasida yoki kuryer yetkazganda to&apos;liq ochib ko&apos;rib, tekshirganingizdan keyin to&apos;lov qilasiz.
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
