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
  Store,
  ArrowRight,
  Send,
  Phone,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { lang, t } = useTranslation();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [selectedStore, setSelectedStore] = useState(storeData.addresses[0].address);
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
      alert("Iltimos, ism-familiyangizni to'liq kiriting.");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 12) {
      alert("Iltimos, to'liq telefon raqamingizni kiriting (+998 XX XXX XX XX).");
      return;
    }

    if (deliveryType === "delivery" && !address.trim()) {
      alert("Iltimos, yetkazib berish manzilini kiriting.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          deliveryType,
          address: deliveryType === "delivery" ? address : "",
          storeLocation: deliveryType === "pickup" ? selectedStore : "",
          comment,
          honeypot,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccessNumber(data.orderNumber);
        clearCart();
      } else {
        setErrorMessage(data.error || t.checkout.errorDesc);
      }
    } catch {
      setErrorMessage(t.checkout.errorDesc);
    } finally {
      setLoading(false);
    }
  };

  const tgUsername = storeData.telegram.replace("@", "");
  const telClean = storeData.phone.replace(/[^0-9+]/g, "");

  // If order was placed successfully
  if (orderSuccessNumber) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#090909] pt-32 pb-32 flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-[#0e0e0e] border border-white/20 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#162916] border border-[#225522] flex items-center justify-center text-[#6ee7b7]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#F5ECD5] font-light">
              {t.confirmation.title}
            </h1>

            <p className="text-sm sm:text-base text-[#A8A8A8] font-normal leading-relaxed">
              {t.confirmation.subtitle}
            </p>

            <div className="p-4 bg-[#141414] border border-white/20 space-y-1">
              <span className="block text-xs font-mono uppercase text-[#B5B5B5]">
                {t.confirmation.orderNumberLabel}
              </span>
              <span className="block font-mono text-xl sm:text-2xl text-[#D4AF37] font-semibold">
                {orderSuccessNumber}
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/catalog"
                className="min-h-[48px] flex-1 inline-flex items-center justify-center bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium hover:bg-white transition-colors"
              >
                {t.confirmation.backHome}
              </Link>
              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-6 border border-white/20 text-xs uppercase tracking-wider text-[#E8E2D0] hover:text-[#D4AF37] hover:border-[#D4AF37] inline-flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If cart is empty and no order just completed
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-[75vh] flex items-center justify-center bg-[#090909] px-4 pt-28 pb-16">
          <div className="max-w-md w-full text-center space-y-6 bg-[#0e0e0e] border border-white/20 p-8 sm:p-12">
            <h2 className="font-serif text-2xl text-[#F5ECD5] font-light">
              {t.cart.empty}
            </h2>
            <p className="text-sm text-[#A8A8A8]">
              {t.cart.emptyDesc}
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center min-h-[48px] px-8 bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium hover:bg-white transition-colors"
            >
              {t.cart.browseCatalog}
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
      <main className="min-h-screen bg-[#090909] pt-28 pb-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
          {/* Header */}
          <div className="mb-10 space-y-2 border-b border-white/20 pb-6">
            <div className="text-xs font-mono text-[#B5B5B5] tracking-wider uppercase">
              <Link href="/cart" className="hover:text-[#F5ECD5] transition-colors">
                {t.cart.title}
              </Link>{" "}
              / <span className="text-[#F5ECD5]">{t.checkout.title}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#F5ECD5] tracking-tight">
              {t.checkout.title}
            </h1>
          </div>

          {errorMessage && (
            <div className="mb-8 p-4 bg-[#261616] border border-[#552222] text-[#fca5a5] text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p>{errorMessage}</p>
                <div className="flex gap-4 pt-1 text-xs">
                  <a href={`tel:${telClean}`} className="underline text-white">
                    {storeData.phone}
                  </a>
                  <a
                    href={`https://t.me/${tgUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-white"
                  >
                    {storeData.telegram}
                  </a>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitOrder}>
            {/* Honeypot anti-spam hidden field */}
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Form inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Contact info */}
                <div className="bg-[#0e0e0e] border border-white/20 p-6 sm:p-8 space-y-5">
                  <h2 className="font-serif text-xl text-[#F5ECD5] font-light border-b border-white/10 pb-3">
                    {t.checkout.contactInfo}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.08em] text-[#B5B5B5] mb-1.5 font-medium">
                        {t.checkout.fullName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alisher Usmonov"
                        className="min-h-[48px] w-full bg-[#141414] border border-white/20 text-sm text-[#F5ECD5] px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.08em] text-[#B5B5B5] mb-1.5 font-medium">
                        {t.checkout.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => handlePhoneInput(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="min-h-[48px] w-full bg-[#141414] border border-white/20 text-sm font-mono text-[#F5ECD5] px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Delivery type */}
                <div className="bg-[#0e0e0e] border border-white/20 p-6 sm:p-8 space-y-5">
                  <h2 className="font-serif text-xl text-[#F5ECD5] font-light border-b border-white/10 pb-3">
                    {t.checkout.deliveryInfo}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      className={`min-h-[64px] p-4 border text-left flex items-start space-x-3 transition-colors ${
                        deliveryType === "delivery"
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5ECD5]"
                          : "border-white/20 text-[#A8A8A8] hover:border-white/40"
                      }`}
                    >
                      <Truck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-[#F5ECD5]">
                          {t.checkout.deliveryCourier}
                        </div>
                        <div className="text-xs text-[#A8A8A8] mt-0.5">
                          {t.checkout.deliveryCourierNote}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      className={`min-h-[64px] p-4 border text-left flex items-start space-x-3 transition-colors ${
                        deliveryType === "pickup"
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5ECD5]"
                          : "border-white/20 text-[#A8A8A8] hover:border-white/40"
                      }`}
                    >
                      <Store className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-[#F5ECD5]">
                          {t.checkout.deliveryPickup}
                        </div>
                        <div className="text-xs text-[#A8A8A8] mt-0.5">
                          {t.checkout.deliveryPickupNote}
                        </div>
                      </div>
                    </button>
                  </div>

                  {deliveryType === "delivery" ? (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.08em] text-[#B5B5B5] mb-1.5 font-medium">
                        {t.checkout.cityAddress} *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Toshkent shahri, Mirobod tumani, Nukus ko'chasi, 28-uy, 14-xonadon"
                        className="w-full bg-[#141414] border border-white/20 text-sm text-[#F5ECD5] p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-mono uppercase tracking-[0.08em] text-[#B5B5B5] font-medium">
                        {t.checkout.selectStore}
                      </label>
                      <div className="space-y-2">
                        {storeData.addresses.map((store) => (
                          <label
                            key={store.address}
                            className={`p-3.5 border flex items-start space-x-3 cursor-pointer transition-colors ${
                              selectedStore === store.address
                                ? "border-[#D4AF37] bg-[#141414]"
                                : "border-white/20 hover:border-white/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="storeLocation"
                              checked={selectedStore === store.address}
                              onChange={() => setSelectedStore(store.address)}
                              className="mt-1 accent-[#D4AF37]"
                            />
                            <div className="space-y-1 text-xs sm:text-[13px]">
                              <div className="text-[#F5ECD5] font-medium">
                                {store.address} ({store.type})
                              </div>
                              <div className="text-[#A8A8A8] flex items-center space-x-2">
                                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>{storeData.workingHours}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  <div className="pt-2">
                    <label className="block text-xs font-mono uppercase tracking-[0.08em] text-[#B5B5B5] mb-1.5 font-medium">
                      {t.checkout.comment}
                    </label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Qo'shimcha istak yoki yetkazish vaqti"
                      className="min-h-[46px] w-full bg-[#141414] border border-white/20 text-sm text-[#F5ECD5] px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Order review & submit (5 cols) */}
              <div className="lg:col-span-5 bg-[#0e0e0e] border border-white/20 p-6 sm:p-8 space-y-6 sticky top-28">
                <h2 className="font-serif text-xl text-[#F5ECD5] font-light border-b border-white/20 pb-4">
                  {t.checkout.orderSummary}
                </h2>

                <div className="divide-y divide-white/10 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-3 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="text-[#F5ECD5] font-medium">
                          {item.product.brand} {item.product.model}
                        </div>
                        <div className="text-[#888]">
                          {item.quantity} dona ×{" "}
                          {item.product.priceHidden
                            ? t.product.askPrice
                            : formatPrice(item.product.price, lang)}
                        </div>
                      </div>
                      <div className="font-mono text-[#F5ECD5] font-medium">
                        {item.product.priceHidden
                          ? t.product.askPrice
                          : formatPrice(item.product.price * item.quantity, lang)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/20 space-y-2 text-sm">
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
                  <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                    <span className="font-medium text-[#F5ECD5]">
                      {t.checkout.finalTotal}:
                    </span>
                    <span className="font-mono text-2xl font-light text-[#F5ECD5]">
                      {formatPrice(totalAmount, lang)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#141414] border border-white/10 text-xs text-[#A8A8A8] leading-relaxed">
                  {t.checkout.paymentNote}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[50px] bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-[0.1em] font-medium hover:bg-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>
                    {loading ? t.checkout.submitting : t.checkout.confirmOrder}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

