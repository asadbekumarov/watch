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
  Award,
} from "lucide-react";

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

  // Delivery vs Pickup
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [selectedStore, setSelectedStore] = useState(storeData.addresses[0].address);
  const [deliveryTime] = useState<"asap" | "scheduled">("asap");
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
          ? "Пожалуйста, укажите ваше имя."
          : "Iltimos, ismingizni kiriting."
      );
      return;
    }

    const cleanPhone = normalizeUzPhone(phone);
    if (!cleanPhone) {
      setErrorMessage(
        lang === "ru"
          ? "Пожалуйста, введите корректный номер телефона (+998 XX XXX XX XX)."
          : "Iltimos, to'g'ri telefon raqamingizni kiriting (+998 XX XXX XX XX)."
      );
      return;
    }

    if (deliveryType === "delivery" && !address.trim()) {
      setErrorMessage(
        lang === "ru"
          ? "Пожалуйста, укажите адрес доставки."
          : "Iltimos, yetkazib berish manzilini kiriting."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const orderPayload = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        deliveryType,
        address: deliveryType === "delivery" ? `${address.trim()}${apartment ? `, ofis/xonadon: ${apartment}` : ""}` : "",
        storeLocation: deliveryType === "pickup" ? selectedStore : "",
        deliveryTime: deliveryTime === "asap" ? "Tez fursatda (1-2 soat)" : "Belgilangan vaqtda",
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
        setOrderSuccessNumber(data.orderNumber || "CHRONOS-VIP");
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
        <main className="min-h-screen bg-[#090909] text-[#F8F8F8] pt-32 pb-24 px-4 sm:px-8">
          <div className="max-w-xl mx-auto bg-[#111111] border border-[#D4AF37]/35 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Xarid Muvaffaqiyatli Rasmiylashtirildi
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F8F8F8]">
                Rahmat, {fullName}!
              </h1>
              <p className="text-sm text-[#8E8E93] leading-relaxed">
                Sizning buyurtmangiz qabul qilindi. Tez orada Chronos Genève VIP menejeri siz bilan bog&apos;lanadi va topshirish tafsilotlarini kelishib oladi.
              </p>
            </div>

            <div className="bg-[#161616] border border-white/10 rounded-2xl p-5 space-y-2 text-xs font-mono">
              <div className="text-[#8E8E93]">Buyurtma raqami:</div>
              <div className="text-xl font-bold text-[#D4AF37] tracking-wider">
                {orderSuccessNumber}
              </div>
              <div className="text-[#8E8E93] pt-2">
                Topshirish: {deliveryType === "delivery" ? "VIP Zirhli Kuryer" : "Markaziy Showroom"}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="min-h-[48px] px-8 bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center justify-center"
              >
                Bosh sahifaga qaytish
              </Link>
              <Link
                href="/catalog"
                className="min-h-[48px] px-6 bg-[#161616] hover:bg-[#1e1e1e] border border-white/10 text-xs font-mono uppercase tracking-wider text-[#F8F8F8] rounded-xl transition-all inline-flex items-center justify-center"
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
        <main className="min-h-screen bg-[#090909] text-[#F8F8F8] pt-32 pb-24 px-4 text-center">
          <div className="max-w-md mx-auto space-y-6 bg-[#111111] p-10 rounded-3xl border border-white/10">
            <h1 className="font-serif text-2xl text-[#F8F8F8]">
              Savatingizda soatlar mavjud emas
            </h1>
            <p className="text-sm text-[#8E8E93]">
              Buyurtma berish uchun avval kolleksiyadan kerakli modelni tanlang.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center space-x-2 min-h-[46px] px-6 bg-[#D4AF37] text-[#090909] text-xs uppercase font-bold tracking-wider rounded-xl"
            >
              <span>Kolleksiyani ko&apos;rish</span>
              <ArrowRight className="w-4 h-4" />
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

      <main className="min-h-screen bg-[#090909] text-[#F8F8F8] pt-28 pb-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
          {/* Header */}
          <div className="mb-10 space-y-2 border-b border-[#D4AF37]/20 pb-6">
            <div className="text-xs font-mono text-[#8E8E93] tracking-wider uppercase">
              <Link href="/cart" className="hover:text-[#D4AF37] transition-colors">
                Savat
              </Link>{" "}
              / <span className="text-[#F8F8F8]">Rasmiylashtirish</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F8F8F8] tracking-tight">
              {t.checkout.title}
            </h1>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Method Selection */}
                <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
                  <h2 className="font-serif text-xl text-[#F8F8F8] font-normal border-b border-white/10 pb-3 flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-[#D4AF37]" />
                    <span>{t.checkout.deliveryMethod}</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        deliveryType === "delivery"
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                          : "border-white/10 bg-[#161616] text-[#8E8E93]"
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-sm font-semibold text-[#F8F8F8]">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span>VIP Zirhli Kuryer</span>
                      </div>
                      <p className="text-[11px] text-[#8E8E93] mt-1.5 leading-relaxed">
                        To&apos;liq sug&apos;urtalangan inkassatsiya kuryerida yetkazish.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        deliveryType === "pickup"
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                          : "border-white/10 bg-[#161616] text-[#8E8E93]"
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-sm font-semibold text-[#F8F8F8]">
                        <Watch className="w-4 h-4 text-[#D4AF37]" />
                        <span>Showroomda Qabul</span>
                      </div>
                      <p className="text-[11px] text-[#8E8E93] mt-1.5 leading-relaxed">
                        Toshkent markazidagi VIP Loungeda tantanali topshirish.
                      </p>
                    </button>
                  </div>

                  {deliveryType === "pickup" && (
                    <div className="pt-3 space-y-2">
                      <label className="block text-xs font-mono text-[#D4AF37] uppercase">
                        Showroom manzilini tanlang:
                      </label>
                      <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="w-full min-h-[46px] px-3.5 bg-[#161616] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                      >
                        {storeData.addresses.map((addr) => (
                          <option key={addr.address} value={addr.address}>
                            {addr.address} ({addr.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. Customer Info */}
                <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
                  <h2 className="font-serif text-xl text-[#F8F8F8] font-normal border-b border-white/10 pb-3">
                    {t.checkout.contactInfo}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#8E8E93] uppercase">
                        {t.checkout.fullName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masalan: Sardor Aliyev"
                        className="w-full min-h-[46px] px-4 bg-[#161616] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#8E8E93] uppercase">
                        {t.checkout.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => handlePhoneInput(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full min-h-[46px] px-4 bg-[#161616] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  {deliveryType === "delivery" && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#8E8E93] uppercase">
                          {t.checkout.cityAddress} *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Shahar, ko'cha va bino raqami"
                          className="w-full min-h-[46px] px-4 bg-[#161616] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-[#8E8E93] uppercase">
                          {t.checkout.apartment}
                        </label>
                        <input
                          type="text"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          placeholder="Xonadon yoki ofis xonasi"
                          className="w-full min-h-[46px] px-4 bg-[#161616] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-mono text-[#8E8E93] uppercase">
                      Maxsus Ko&apos;rsatmalar (Izoh)
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Masalan: topshirish vaqtida qimmatbaho sovg'a lentalari bilan taqdim etish"
                      className="w-full p-3 bg-[#161616] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                    />
                  </div>

                  {/* Honeypot field for spam prevention */}
                  <input
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* 3. Payment Method */}
                <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
                  <h2 className="font-serif text-xl text-[#F8F8F8] font-normal border-b border-white/10 pb-3">
                    {t.checkout.paymentMethodTitle}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "cash"
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                          : "border-white/10 bg-[#161616] text-[#8E8E93]"
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-xs font-semibold text-[#F8F8F8]">
                        <Banknote className="w-4 h-4 text-[#D4AF37]" />
                        <span>{t.checkout.payCash}</span>
                      </div>
                      <p className="text-[11px] text-[#8E8E93] mt-1">
                        Kuryer yoki shourumda naqd pul topshirilganda
                      </p>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("card_on_delivery")}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "card_on_delivery"
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                          : "border-white/10 bg-[#161616] text-[#8E8E93]"
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-xs font-semibold text-[#F8F8F8]">
                        <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                        <span>{t.checkout.payCardOnDelivery}</span>
                      </div>
                      <p className="text-[11px] text-[#8E8E93] mt-1">
                        Uzcard, Humo, Visa yoki MasterCard terminali
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary & Submit CTA (5 cols) */}
              <div className="lg:col-span-5 bg-[#111111] border border-[#D4AF37]/25 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-xl">
                <h2 className="font-serif text-xl text-[#F8F8F8] font-normal border-b border-white/10 pb-4">
                  {t.checkout.orderSummary}
                </h2>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((i) => (
                    <div key={i.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-2.5">
                      <div>
                        <div className="font-medium text-[#F8F8F8]">{i.product.name}</div>
                        <div className="text-[11px] text-[#8E8E93]">
                          {i.quantity} dona · {i.customization?.strapName || "Standart"}
                        </div>
                      </div>
                      <span className="font-mono text-[#D4AF37] font-semibold">
                        {formatPrice(i.unitPrice * i.quantity, lang)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-2 text-xs border-t border-white/10">
                  <div className="flex justify-between text-[#8E8E93]">
                    <span>{t.checkout.itemsTotal}:</span>
                    <span className="font-mono text-[#F8F8F8]">{formatPrice(totalAmount, lang)}</span>
                  </div>

                  <div className="flex justify-between text-[#8E8E93]">
                    <span>{t.checkout.shipping}:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{t.checkout.free}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-base font-semibold text-[#F8F8F8]">
                    {t.checkout.finalTotal}:
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#D4AF37]">
                    {formatPrice(totalAmount, lang)}
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-xs font-mono text-red-400">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[52px] bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-50 text-[#090909] text-xs uppercase tracking-[0.12em] font-bold rounded-2xl transition-all shadow-[0_8px_24px_rgba(212,175,55,0.35)] flex items-center justify-center space-x-2"
                >
                  <Award className="w-4 h-4" />
                  <span>{loading ? t.checkout.submitting : t.checkout.confirmOrder}</span>
                </button>

                <p className="text-[11px] text-[#8E8E93] text-center leading-relaxed">
                  Tugmani bosish orqali siz buyurtma shartlariga va shaxsiy ma&apos;lumotlarni qayta ishlashga rozilik bildirasiz.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
