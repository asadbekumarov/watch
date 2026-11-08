"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatPrice, getTelegramInquiryUrl } from "@/lib/formatPrice";
import { storeData } from "@/data/store";
import { X, CheckCircle2, Send, MapPin, Phone, User } from "lucide-react";

interface QuickBuyModalProps {
  product: Product;
  onClose: () => void;
  lang?: "uz" | "ru";
}

export default function QuickBuyModal({
  product,
  onClose,
  lang = "uz",
}: QuickBuyModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [branchChoice, setBranchChoice] = useState("tashkent");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handlePhoneChange = (val: string) => {
    if (!val.startsWith("+998")) {
      setPhone("+998 ");
      return;
    }
    setPhone(val);
  };

  const getBranchLabel = () => {
    if (branchChoice === "tashkent") return "Do'kondan olib ketish — Toshkent (Langar 12)";
    if (branchChoice === "namangan") return "Do'kondan olib ketish — Namangan (Navoiy 42)";
    return "Yetkazib berish (menejer bilan kelishiladi)"; // TODO: confirm delivery terms with store
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg(
        lang === "ru"
          ? "Пожалуйста, введите ваше имя."
          : "Iltimos, ismingizni kiriting."
      );
      return;
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 12 || !digits.startsWith("998")) {
      setErrorMsg(
        lang === "ru"
          ? "Пожалуйста, введите корректный номер телефона (+998 XX XXX XX XX)."
          : "Iltimos, to'liq telefon raqamingizni kiriting (+998 XX XXX XX XX)."
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        fullName: fullName.trim(),
        phone: `+${digits}`,
        region: getBranchLabel(),
        deliveryType: branchChoice,
        deliveryMethodLabel: getBranchLabel(),
        address: getBranchLabel(),
        paymentMethod: "Menejer bilan kelishiladi", // TODO: confirm payment methods with store
        comment: comment.trim() || "Tezkor so'rov orqali yuborildi",
        items: [
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitPrice: product.price,
          },
        ],
        totalAmount: product.price || 0,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessOrderNumber(data.orderNumber || "SWP-DEMO");
      } else {
        setErrorMsg(
          data.error ||
            (lang === "ru"
              ? "Ошибка при отправке запроса. Пожалуйста, напишите в Telegram."
              : "Xatolik yuz berdi. Iltimos, Telegram orqali bog'laning.")
        );
      }
    } catch {
      setErrorMsg(
        lang === "ru"
          ? "Сетевая ошибка. Вы можете написать менеджеру в Telegram."
          : "Tarmoq xatosi. Menejerimizga Telegram orqali yozishingiz mumkin."
      );
    } finally {
      setLoading(false);
    }
  };

  const tgUrl = getTelegramInquiryUrl(product.name, storeData.telegramManager, lang);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-buy-title"
        className="w-full max-w-lg bg-[#111111] border-t sm:border border-white/[0.12] rounded-t-2xl sm:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[92dvh] flex flex-col overflow-hidden text-[#FFFFFF] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-4 sm:p-5 border-b border-white/[0.06] flex items-start gap-3 bg-[#141414]">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#090909] border border-white/[0.08] shrink-0">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="60px"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#D4AF37]">
              {product.brand} · {product.specs.caseDiameter}
            </span>
            <h2 id="quick-buy-title" className="font-serif text-base font-normal text-white truncate mt-0.5">
              {lang === "ru" ? product.nameRu : product.name}
            </h2>
            <div className="text-xs font-mono text-zinc-300 mt-1">
              {formatPrice(product.price, lang)}
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-lg transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {successOrderNumber ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-white">
                  {lang === "ru" ? "Запрос успешно принят!" : "So'rovingiz qabul qilindi!"}
                </h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                  {lang === "ru"
                    ? `Номер заявки: ${successOrderNumber}. Менеджер скоро свяжется с вами.`
                    : `Buyurtma raqami: ${successOrderNumber}. Tez orada menejerimiz siz bilan bog'lanadi.`}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] bg-[#D4AF37] hover:bg-[#c49f27] text-black font-mono text-xs uppercase tracking-[0.14em] font-medium rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {lang === "ru" ? "Написать менеджеру в Telegram" : "Menejerga Telegramda yozish"}
                  </span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full min-h-[40px] text-xs font-mono text-zinc-400 hover:text-white"
                >
                  {lang === "ru" ? "Закрыть" : "Yopish"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#71717A] uppercase tracking-[0.14em] flex items-center gap-1.5">
                  <User className="w-3 h-3 text-zinc-400" />
                  <span>{lang === "ru" ? "Ваше имя" : "Ismingiz"}</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === "ru" ? "Иван Иванов" : "Ismingizni kiriting"}
                  className="w-full min-h-[42px] px-3 bg-[#090909] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg text-xs font-mono text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#71717A] uppercase tracking-[0.14em] flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-zinc-400" />
                  <span>{lang === "ru" ? "Номер телефона" : "Telefon raqamingiz"}</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+998 88 500 70 00"
                  className="w-full min-h-[42px] px-3 bg-[#090909] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg text-xs font-mono text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#71717A] uppercase tracking-[0.14em] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>{lang === "ru" ? "Способ получения" : "Qabul qilish usuli"}</span>
                </label>
                <select
                  value={branchChoice}
                  onChange={(e) => setBranchChoice(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[#090909] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg text-xs font-mono text-white outline-none transition-colors"
                >
                  <option value="tashkent">
                    {lang === "ru"
                      ? "Самовывоз — Ташкент (ул. Лангар 12)"
                      : "Do'kondan olib ketish — Toshkent (Langar 12)"}
                  </option>
                  <option value="namangan">
                    {lang === "ru"
                      ? "Самовывоз — Наманган (ул. А. Навои 42)"
                      : "Do'kondan olib ketish — Namangan (Navoiy 42)"}
                  </option>
                  <option value="delivery">
                    {lang === "ru"
                      ? "Доставка (согласовать с менеджером)"
                      : "Yetkazib berish (menejer bilan kelishiladi)"}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[#71717A] uppercase tracking-[0.14em]">
                  {lang === "ru" ? "Комментарий (необязательно)" : "Izoh (ixtiyoriy)"}
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={lang === "ru" ? "Вопрос или пожелание..." : "Savol yoki istak..."}
                  className="w-full p-2.5 bg-[#090909] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg text-xs font-mono text-white outline-none transition-colors resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-mono text-xs uppercase tracking-[0.14em] font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>
                  {loading
                    ? (lang === "ru" ? "Отправка..." : "Yuborilmoqda...")
                    : (lang === "ru" ? "Отправить заявку" : "Buyurtmani yuborish")}
                </span>
              </button>

              <div className="relative py-1 flex items-center justify-center">
                <div className="border-t border-white/[0.08] w-full" />
                <span className="bg-[#111111] px-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#71717A] absolute">
                  {lang === "ru" ? "ИЛИ" : "YOKI"}
                </span>
              </div>

              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[42px] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs uppercase tracking-[0.14em] font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {lang === "ru"
                    ? "Уточнить у менеджера в Telegram"
                    : "Menejerdan Telegramda so'rash"}
                </span>
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
