"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { useTranslation } from "@/i18n";
import { storeData } from "@/data/store";
import { getTelegramInquiryUrl } from "@/lib/formatPrice";
import { computeEstimatedReadyDate, DeliveryMethodOption, FALLBACK_DELIVERY_METHODS } from "@/lib/delivery";
import {
  CheckCircle2,
  ArrowRight,
  Send,
  Building2,
  Truck,
  Tag,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  Loader2,
  CreditCard,
  Banknote,
  ExternalLink,
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

  // Delivery methods state
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodOption[]>(
    FALLBACK_DELIVERY_METHODS.filter((m) => m.is_enabled)
  );
  const [selectedMethodId, setSelectedMethodId] = useState<string>("pickup_tashkent");
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [defaultPrepDays, setDefaultPrepDays] = useState<number>(1);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "payme" | "click">("cash_on_delivery");

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_usd: number;
    type: string;
    value: number;
  } | null>(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [orderSuccessNumber, setOrderSuccessNumber] = useState<string | null>(null);
  const [orderTrackingToken, setOrderTrackingToken] = useState<string | null>(null);
  const [orderEstimatedDate, setOrderEstimatedDate] = useState<string | null>(null);
  const [orderPaymentUrl, setOrderPaymentUrl] = useState<string | null>(null);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<string>("cash_on_delivery");
  const [orderTotalUzs, setOrderTotalUzs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load delivery methods and settings dynamically
  useEffect(() => {
    fetch("/api/delivery-methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.methods)) {
          setDeliveryMethods(data.methods);
          if (data.methods.length > 0 && !data.methods.find((m: DeliveryMethodOption) => m.id === selectedMethodId)) {
            setSelectedMethodId(data.methods[0].id);
          }
        }
        if (data.settings) {
          setUsdRate(data.settings.usd_to_uzs_rate);
          setDefaultPrepDays(data.settings.default_prep_days || 1);
        }
      })
      .catch((err) => {
        console.warn("Delivery methods fallback used:", err);
      });
  }, [selectedMethodId]);

  const selectedMethod = useMemo(() => {
    return deliveryMethods.find((m) => m.id === selectedMethodId) || deliveryMethods[0] || FALLBACK_DELIVERY_METHODS[0];
  }, [deliveryMethods, selectedMethodId]);

  // Preparation time computation
  const estimatedReadyInfo = useMemo(() => {
    return computeEstimatedReadyDate(defaultPrepDays, lang);
  }, [defaultPrepDays, lang]);

  // Financial calculations
  const subtotal = totalAmount;
  const promoDiscount = appliedPromo ? appliedPromo.discount_usd : 0;
  
  // Delivery fee logic: check free threshold
  const deliveryFee = useMemo(() => {
    if (!selectedMethod || selectedMethod.delivery_type === "pickup") return 0;
    if (selectedMethod.free_above_usd !== null && subtotal >= selectedMethod.free_above_usd) {
      return 0;
    }
    return selectedMethod.price_usd;
  }, [selectedMethod, subtotal]);

  const finalTotalUsd = Math.max(0, subtotal - promoDiscount + deliveryFee);
  const finalTotalUzs = usdRate !== null ? Math.round(finalTotalUsd * usdRate) : null;

  const handlePhoneInput = (val: string) => {
    if (!val.startsWith("+998")) {
      setPhone("+998 ");
      return;
    }
    setPhone(val);
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError(null);

    try {
      const cleanPhone = normalizeUzPhone(phone);
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          subtotal,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedPromo({
          code: data.code,
          discount_usd: data.discount_usd,
          type: data.type,
          value: data.value,
        });
        setPromoInput("");
      } else {
        setPromoError(data.error || "Promokod yaroqsiz.");
      }
    } catch {
      setPromoError("Promokodni tekshirishda tarmoq xatosi yuz berdi.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

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

    if (items.length === 0) {
      setErrorMessage(
        lang === "ru"
          ? "Ваша корзина пуста."
          : "Savatingiz bo'sh. Buyurtma berish uchun soat tanlang."
      );
      return;
    }

    if (selectedMethod.delivery_type === "delivery" && (!address || address.trim().length < 5)) {
      setErrorMessage(
        lang === "ru"
          ? "Пожалуйста, укажите полный адрес доставки."
          : "Iltimos, yetkazib berish manzilini to'liq kiriting (kamida 5 ta belgi)."
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const orderPayload = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        region: selectedMethod.branch_id || "tashkent",
        deliveryType: selectedMethod.delivery_type,
        deliveryMethodId: selectedMethod.id,
        deliveryMethodLabel: lang === "ru" ? selectedMethod.name_ru : selectedMethod.name_uz,
        address: selectedMethod.delivery_type === "delivery" ? address.trim() : (lang === "ru" ? selectedMethod.name_ru : selectedMethod.name_uz),
        paymentMethod,
        comment: comment.trim(),
        promoCode: appliedPromo?.code || "",
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          quantity: i.quantity,
        })),
        honeypot,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderSuccessNumber(data.orderNumber || "SWP-ORDER");
        setOrderTrackingToken(data.trackingToken || null);
        setOrderEstimatedDate(estimatedReadyInfo.formatted);
        setOrderPaymentUrl(data.paymentUrl || null);
        setOrderPaymentMethod(data.paymentMethod || paymentMethod);
        setOrderTotalUzs(data.totalUzs || null);
        clearCart();
      } else {
        setErrorMessage(data.error || t.checkout.errorDesc);
      }
    } catch {
      setErrorMessage(
        lang === "ru"
          ? "Сетевая ошибка при отправке. Вы можете оформить заказ напрямую через Telegram."
          : "Tarmoq xatosi. Buyurtmani to'g'ridan-to'g'ri Telegram orqali yuborishingiz mumkin."
      );
    } finally {
      setLoading(false);
    }
  };

  const itemNames = items.map((i) => i.product.name).join(", ");
  const tgInquiryUrl = getTelegramInquiryUrl(
    itemNames || "SwissWatch Premium kolleksiyasi",
    storeData.telegramManager,
    lang
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#090909] text-[#FFFFFF] pt-28 pb-32">
        <div className="max-w-[1150px] mx-auto px-4 sm:px-8 md:px-12">
          {/* Breadcrumb */}
          <div className="mb-8 space-y-2 border-b border-white/[0.07] pb-6">
            <div className="text-[11px] font-mono text-[#71717A] tracking-[0.16em] uppercase">
              <Link href="/" className="hover:text-white transition-colors">
                Bosh sahifa
              </Link>{" "}
              /{" "}
              <Link href="/cart" className="hover:text-white transition-colors">
                Savat
              </Link>{" "}
              / <span className="text-white">{t.checkout.title}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF] tracking-tight">
              {t.checkout.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A]">
              {t.checkout.subtitle}
            </p>
          </div>

          {/* Success Screen */}
          {orderSuccessNumber ? (
            <div className="py-16 text-center space-y-6 bg-[#111111] border border-white/[0.08] rounded-2xl p-8 sm:p-12 max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#D4AF37]">
                  {orderSuccessNumber}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                  {t.checkout.successTitle}
                </h2>
                <p className="text-xs text-[#71717A] leading-relaxed max-w-md mx-auto">
                  {t.checkout.successDesc}
                </p>
                {orderEstimatedDate && (
                  <div className="pt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Taxminiy tayyor bo&apos;lish sanasi: <strong className="text-white">{orderEstimatedDate}</strong>
                    </span>
                  </div>
                )}

                {orderTrackingToken && (
                  <div className="pt-2">
                    <Link
                      href={`/track/${orderTrackingToken}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37] transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Buyurtma holatini kuzatish sahifasi</span>
                    </Link>
                  </div>
                )}

                {/* Online Sandbox Payment CTA */}
                {orderPaymentMethod !== "cash_on_delivery" && orderPaymentUrl && (
                  <div className="pt-4 p-5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-sm font-semibold text-white uppercase tracking-wider">
                          {orderPaymentMethod === "payme" ? "Payme to'lovi" : "Click to'lovi"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Test rejimi
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300">
                      To&apos;lov summasi:{" "}
                      <strong className="text-white font-mono font-bold">
                        {orderTotalUzs ? `${orderTotalUzs.toLocaleString()} so'm` : "So'mda"}
                      </strong>
                    </p>

                    <a
                      href={orderPaymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#090909] font-medium text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg"
                    >
                      <span>{orderPaymentMethod === "payme" ? "Payme orqali to'lash" : "Click orqali to'lash"}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={tgInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 min-h-[46px] px-6 bg-[#229ED9] hover:bg-[#1E88E5] text-white text-xs uppercase tracking-[0.12em] font-medium rounded-lg transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram orqali tasdiqlash</span>
                </a>

                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center space-x-2 min-h-[46px] px-6 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs uppercase tracking-[0.12em] font-medium rounded-lg transition-all border border-white/[0.1]"
                >
                  <span>Katalogga qaytish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  {/* Honeypot anti-spam */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* 1. Customer Details */}
                  <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-sm font-mono uppercase tracking-[0.12em] text-white font-medium">
                        1. Mijoz ma&apos;lumotlari
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.14em] text-zinc-400 mb-2">
                          {t.checkout.fullName} *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alisher Navoiy"
                          className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.14em] text-zinc-400 mb-2">
                          {t.checkout.phone} *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => handlePhoneInput(e.target.value)}
                          placeholder="+998 90 123 45 67"
                          className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Delivery & Branch Method */}
                  <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                      <Truck className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-sm font-mono uppercase tracking-[0.12em] text-white font-medium">
                        2. Qabul qilish usuli
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {deliveryMethods.map((m) => {
                        const isSelected = selectedMethodId === m.id;
                        const label = lang === "ru" ? m.name_ru : m.name_uz;
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMethodId(m.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/5"
                                : "bg-[#0d0f12] border-white/[0.08] hover:border-white/[0.18] text-zinc-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {m.delivery_type === "pickup" ? (
                                    <Building2 className={`w-4 h-4 ${isSelected ? "text-[#D4AF37]" : "text-zinc-400"}`} />
                                  ) : (
                                    <Truck className={`w-4 h-4 ${isSelected ? "text-[#D4AF37]" : "text-zinc-400"}`} />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{label}</p>
                                  <p className="text-xs text-zinc-400 mt-0.5">
                                    {m.delivery_type === "pickup"
                                      ? "Filialda tekshirib, bepul qabul qilish"
                                      : m.price_usd > 0
                                      ? `Yetkazib berish haqi: $${m.price_usd}`
                                      : "Kuryer narxi menejer orqali kelishiladi"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-medium text-right shrink-0">
                                {m.delivery_type === "pickup" || m.price_usd === 0 ? "Bepul" : `$${m.price_usd}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Address input if delivery is chosen */}
                    {selectedMethod.delivery_type === "delivery" && (
                      <div className="pt-2 space-y-2">
                        <label className="block text-xs font-mono uppercase tracking-[0.14em] text-zinc-400">
                          Yetkazib berish manzili *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Shahar, ko'cha, uy raqami, xonadon"
                          className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                      </div>
                    )}

                    {/* Estimated preparation date banner */}
                    <div className="pt-1">
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#D4AF37]" />
                          <span>Tayyorlash va topshirish muddati:</span>
                        </div>
                        <span className="text-white font-medium">{estimatedReadyInfo.formatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Payment Method */}
                  <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                      <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                      <h2 className="text-sm font-mono uppercase tracking-[0.12em] text-white font-medium">
                        3. To&apos;lov usuli
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {/* Cash on Delivery */}
                      <div
                        onClick={() => setPaymentMethod("cash_on_delivery")}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          paymentMethod === "cash_on_delivery"
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/5"
                            : "bg-[#0d0f12] border-white/[0.08] hover:border-white/[0.18] text-zinc-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <Banknote className={`w-4 h-4 mt-0.5 ${paymentMethod === "cash_on_delivery" ? "text-[#D4AF37]" : "text-zinc-400"}`} />
                            <div>
                              <p className="text-sm font-medium">Naqd / Qabul qilish vaqtida to&apos;lash</p>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                Buyurtmani filialda yoki kuryerdan olayotganda naqd yoki karta orqali to&apos;lash
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payme */}
                      <div
                        onClick={() => {
                          if (usdRate !== null) setPaymentMethod("payme");
                        }}
                        className={`p-4 rounded-xl border transition-all ${
                          usdRate === null
                            ? "opacity-50 cursor-not-allowed bg-[#0d0f12]/50 border-white/[0.04] text-zinc-500"
                            : paymentMethod === "payme"
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/5 cursor-pointer"
                            : "bg-[#0d0f12] border-white/[0.08] hover:border-white/[0.18] text-zinc-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <CreditCard className={`w-4 h-4 mt-0.5 ${paymentMethod === "payme" ? "text-[#D4AF37]" : "text-zinc-400"}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Payme</p>
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Test (Sandbox)
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                Uzcard / Humo kartalari orqali xavfsiz onlayn to&apos;lov
                              </p>
                            </div>
                          </div>
                          {usdRate !== null && finalTotalUzs !== null && (
                            <span className="text-xs font-mono text-zinc-400 shrink-0">
                              {finalTotalUzs.toLocaleString()} so&apos;m
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Click */}
                      <div
                        onClick={() => {
                          if (usdRate !== null) setPaymentMethod("click");
                        }}
                        className={`p-4 rounded-xl border transition-all ${
                          usdRate === null
                            ? "opacity-50 cursor-not-allowed bg-[#0d0f12]/50 border-white/[0.04] text-zinc-500"
                            : paymentMethod === "click"
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/5 cursor-pointer"
                            : "bg-[#0d0f12] border-white/[0.08] hover:border-white/[0.18] text-zinc-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <CreditCard className={`w-4 h-4 mt-0.5 ${paymentMethod === "click" ? "text-[#D4AF37]" : "text-zinc-400"}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Click</p>
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Test (Sandbox)
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                Click ilovasi yoki veb-interfeysi orqali tezkor to&apos;lov
                              </p>
                            </div>
                          </div>
                          {usdRate !== null && finalTotalUzs !== null && (
                            <span className="text-xs font-mono text-zinc-400 shrink-0">
                              {finalTotalUzs.toLocaleString()} so&apos;m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notice if usdRate is null */}
                    {usdRate === null && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400 leading-relaxed">
                        <span>ℹ️ Do&apos;konda UZS kursi (usd_to_uzs_rate) belgilanmaguncha Payme va Click vaqtincha nofaol. Iltimos, naqd to&apos;lov usulini tanlang.</span>
                      </div>
                    )}

                    {/* Sandbox Banner */}
                    {paymentMethod !== "cash_on_delivery" && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-300">TEST REJIMI (SANDBOX MODE)</p>
                          <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                            Ushbu to&apos;lov tizimi sinov (sandbox) rejimida ishlamoqda. Haqiqiy bank kartasidan mablag&apos; yechilmaydi.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Comment */}
                  <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 sm:p-7 space-y-4">
                    <label className="block text-xs font-mono uppercase tracking-[0.14em] text-zinc-400">
                      {t.checkout.comment} (ixtiyoriy)
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Qo'shimcha istaklar yoki sovg'a qutisi talabi..."
                      className="w-full bg-[#0d0f12] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full min-h-[52px] bg-[#D4AF37] hover:bg-[#c49f2e] disabled:opacity-50 text-[#090909] text-xs uppercase tracking-[0.16em] font-medium rounded-xl transition-all shadow-xl shadow-[#D4AF37]/10 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rasmiylashtirilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <span>Buyurtmani tasdiqlash</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Order Summary & Promo Code (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-28">
                {/* Promo Code Box */}
                <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                    <Tag className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-white font-medium">
                      Promokod
                    </h3>
                  </div>

                  {appliedPromo ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-xs font-mono text-emerald-300 font-medium">
                            {appliedPromo.code} faollashtirildi
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            Chegirma: -${appliedPromo.discount_usd.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="p-1 rounded text-zinc-400 hover:text-white"
                        title="O'chirish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="Masalan: SWISS5"
                          className="flex-1 bg-[#0d0f12] border border-white/[0.1] rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoInput.trim()}
                          className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.15] disabled:opacity-50 text-white text-xs font-mono rounded-lg transition-colors shrink-0"
                        >
                          {promoLoading ? "..." : "Qo'llash"}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] text-red-400 font-mono">{promoError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Items & Financial Totals */}
                <div className="bg-[#111111] border border-white/[0.07] rounded-2xl p-6 space-y-6">
                  <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-white font-medium border-b border-white/[0.06] pb-3">
                    Buyurtma tarkibi ({items.length} ta mahsulot)
                  </h3>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-black rounded-lg border border-white/[0.06] shrink-0 overflow-hidden">
                          {it.product.images[0] ? (
                            <Image
                              src={it.product.images[0]}
                              alt={it.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600">
                              Soat
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate font-medium">{it.product.name}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {it.quantity} dona &times; {it.unitPrice ? `$${it.unitPrice}` : "Menejerdan"}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-white font-medium">
                          {it.unitPrice ? `$${it.unitPrice * it.quantity}` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/[0.06] pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Oraliq summa:</span>
                      <span className="font-mono text-white">${subtotal.toLocaleString()} USD</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Promokod ({appliedPromo.code}):</span>
                        <span className="font-mono">-${promoDiscount.toFixed(2)} USD</span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-400">
                      <span>Yetkazib berish:</span>
                      <span className="font-mono text-white">
                        {deliveryFee > 0 ? `$${deliveryFee} USD` : "Bepul"}
                      </span>
                    </div>

                    <div className="border-t border-white/[0.06] pt-3 flex justify-between items-baseline text-white">
                      <span className="font-medium text-sm">Jami:</span>
                      <div className="text-right">
                        <p className="font-serif text-xl font-normal text-[#D4AF37]">
                          ${finalTotalUsd.toLocaleString()} USD
                        </p>
                        {finalTotalUzs !== null ? (
                          <p className="text-xs font-mono text-zinc-400 mt-0.5">
                            {finalTotalUzs.toLocaleString()} so&apos;m
                          </p>
                        ) : (
                          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            UZS to&apos;lov kursi: menejer orqali
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
