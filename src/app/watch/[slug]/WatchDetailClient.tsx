"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, luxuryStrapOptions } from "@/data/products";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/formatPrice";
import FloatingCartBar from "@/components/FloatingCartBar";
import {
  Watch,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Send,
  Phone,
  Gift,
  Layers,
  ChevronRight,
  Compass,
  CheckCircle2,
} from "lucide-react";

interface WatchDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function WatchDetailClient({
  product,
  relatedProducts,
}: WatchDetailClientProps) {
  const { lang } = useTranslation();
  const { addItem } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Customization state
  const straps = product.availableStraps || luxuryStrapOptions;
  const [selectedStrap, setSelectedStrap] = useState(straps[0]);
  const [includeGiftBox, setIncludeGiftBox] = useState(true);
  const [engravingText, setEngravingText] = useState("");
  const [quantity] = useState(1);
  const [isAddedNotice, setIsAddedNotice] = useState(false);

  const giftBoxPrice = includeGiftBox ? 150000 : 0;
  const engravingPrice = engravingText.trim().length > 0 ? 80000 : 0;

  // Unit Price calculation
  const unitPrice = product.price + selectedStrap.extraPrice + giftBoxPrice + engravingPrice;
  const totalSum = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem(
      product,
      quantity,
      {
        strapId: selectedStrap.id,
        strapName: selectedStrap.name,
        giftBox: includeGiftBox,
        engravingText: engravingText.trim() || undefined,
      },
      unitPrice
    );
    setIsAddedNotice(true);
    setTimeout(() => setIsAddedNotice(false), 3000);
  };

  const tgUsername = storeData.telegram.replace("@", "");
  const telLink = `tel:${storeData.phone.replace(/[^0-9+]/g, "")}`;

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
        {/* Left: Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#111111] border border-white/[0.08] shadow-2xl">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="bg-[#090909]/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.1] text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-300 flex items-center space-x-1.5 shadow-md">
                <Truck className="w-3.5 h-3.5" />
                <span>BTS Bepul Dastavka</span>
              </div>
              {product.islamicFeatures?.azanTimes && (
                <div className="bg-[#090909]/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.08] text-[10px] font-mono text-zinc-400 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Azon & Qibla</span>
                </div>
              )}
            </div>

            <div className="absolute bottom-4 right-4 bg-[#090909]/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.08] text-[11px] font-mono text-[#71717A]">
              Ref. {product.referenceNumber}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-[#111111] border transition-all ${
                    activeImageIndex === idx
                      ? "border-white ring-1 ring-white/30"
                      : "border-white/[0.07] opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Points */}
          <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <div className="text-zinc-300 flex items-center space-x-1.5 font-medium">
                <Truck className="w-4 h-4 text-[#71717A]" />
                <span>BTS Pochtasiga Bepul</span>
              </div>
              <p className="text-[#71717A] text-[11px] leading-relaxed">
                Barcha viloyatlardagi BTS Express filiallariga 0 so&apos;mga yetkaziladi.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-zinc-300 flex items-center space-x-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#71717A]" />
                <span>@soatsoz_uzb Servis</span>
              </div>
              <p className="text-[#71717A] text-[11px] leading-relaxed">
                1 yillik rasmiy kafolat va bepul o&apos;lcham qisqartirish xizmati.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-zinc-300 flex items-center space-x-1.5 font-medium">
                <Watch className="w-4 h-4 text-[#71717A]" />
                <span>Showroomda Sinov</span>
              </div>
              <p className="text-[#71717A] text-[11px] leading-relaxed">
                Toshkent sh., Kichik Xalqa Yo&apos;li, 19 (09:00 - 21:00).
              </p>
            </div>
          </div>
        </div>

        {/* Right: Info & Purchase (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-white/[0.07] pb-6">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#71717A]">
                {product.brand}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs font-mono text-[#71717A]">{product.specs?.caseDiameter}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF] tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed pt-2">
              {product.description}
            </p>

            <div className="pt-4 flex items-baseline space-x-4">
              <span className="font-mono text-2xl sm:text-3xl font-medium text-[#FFFFFF]">
                {formatPrice(unitPrice, lang)}
              </span>
              {product.oldPrice && (
                <span className="font-mono text-sm text-[#71717A] line-through">
                  {formatPrice(product.oldPrice, lang)}
                </span>
              )}
            </div>
          </div>

          {/* Islamic Features Box (if applicable) */}
          {product.islamicFeatures?.azanTimes && (
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-4 space-y-2">
              <div className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-300 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-[#D4AF37]" />
                <span>Islomiy Azon Funksiyalari</span>
              </div>
              <ul className="grid grid-cols-2 gap-2 text-xs text-[#71717A] font-mono">
                <li className="flex items-center space-x-1.5">
                  <span className="text-zinc-400">•</span>
                  <span>5 vaqt avtomatik azon</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-zinc-400">•</span>
                  <span>Qibla kompas yo&apos;nalishi</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-zinc-400">•</span>
                  <span>Hijriy & Milodiy taqvim</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-zinc-400">•</span>
                  <span>Qur&apos;on xatcho&apos;pi</span>
                </li>
              </ul>
            </div>
          )}

          {/* Specifications Table */}
          {product.specs && (
            <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-[#71717A] font-medium flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Texnik Xususiyatlar</span>
              </h3>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <dt className="text-[#71717A]">Mexanizm:</dt>
                  <dd className="font-mono text-zinc-300 font-medium">{product.specs.movement}</dd>
                </div>
                <div>
                  <dt className="text-[#71717A]">Korpus diametri:</dt>
                  <dd className="font-mono text-zinc-300 font-medium">{product.specs.caseDiameter}</dd>
                </div>
                <div>
                  <dt className="text-[#71717A]">Qalinligi:</dt>
                  <dd className="font-mono text-zinc-300 font-medium">{product.specs.caseThickness}</dd>
                </div>
                <div>
                  <dt className="text-[#71717A]">Material:</dt>
                  <dd className="font-mono text-zinc-300 font-medium">{product.specs.caseMaterial}</dd>
                </div>
                <div>
                  <dt className="text-[#71717A]">Shisha:</dt>
                  <dd className="font-mono text-zinc-300 font-medium">{product.specs.glass}</dd>
                </div>
                <div>
                  <dt className="text-[#71717A]">Suvga chidamlilik:</dt>
                  <dd className="font-mono text-zinc-300 font-medium">{product.specs.waterResistance}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Customization Options */}
          <div className="space-y-4">
            {/* Strap Options */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-[0.14em] text-[#71717A]">
                Braslet / Remeshok Tanlovi:
              </label>
              <div className="space-y-2">
                {straps.map((strap) => (
                  <button
                    key={strap.id}
                    type="button"
                    onClick={() => setSelectedStrap(strap)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                      selectedStrap.id === strap.id
                        ? "border-white bg-white/[0.05] text-[#FFFFFF]"
                        : "border-white/[0.06] bg-[#090909] text-[#71717A] hover:border-white/20"
                    }`}
                  >
                    <span>{strap.name}</span>
                    <span className="font-mono text-zinc-300">
                      {strap.extraPrice > 0 ? `+${formatPrice(strap.extraPrice, lang)}` : "Asl variant"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Engraving */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-[0.14em] text-[#71717A]">
                Lazerli Gravirovka (+80 000 UZS):
              </label>
              <input
                type="text"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value.slice(0, 30))}
                placeholder="Korpus orqasiga ism yoki sana (ixtiyoriy)"
                className="w-full min-h-[42px] px-3.5 bg-[#090909] border border-white/[0.08] rounded-lg text-xs text-[#FFFFFF] placeholder-[#71717A]/60 focus:border-[#D4AF37] outline-none"
              />
            </div>

            {/* ALFAJR Gift Box */}
            <div
              onClick={() => setIncludeGiftBox(!includeGiftBox)}
              className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all text-xs ${
                includeGiftBox
                  ? "border-white bg-white/[0.05] text-[#FFFFFF]"
                  : "border-white/[0.06] bg-[#090909] text-[#71717A]"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Gift className="w-4 h-4 text-zinc-300" />
                <span>ALFAJR Sovg&apos;a Qutisi & Brend Paketi</span>
              </div>
              <span className="font-mono text-zinc-300">
                {includeGiftBox ? "+150 000 UZS" : "Kerak emas"}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-6 bg-[#111111] border border-white/[0.08] rounded-2xl space-y-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full min-h-[50px] bg-white hover:bg-zinc-200 text-[#090909] text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Savatga qo&apos;shish · {formatPrice(totalSum, lang)}</span>
            </button>

            {isAddedNotice && (
              <div className="p-3 bg-white/[0.04] border border-white/20 rounded-lg text-center text-xs font-mono text-white animate-in fade-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Soat muvaffaqiyatli savatga qo&apos;shildi</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-zinc-400" />
                <span>Telegram</span>
              </a>

              <a
                href={telLink}
                className="min-h-[44px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>71 200 83 00</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-12 border-t border-white/[0.07] space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#71717A]">
                Kolleksiyadagi Modellar
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#FFFFFF] font-normal">
                Boshqa Mashhur Soatlar
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white flex items-center space-x-1"
            >
              <span>Barchasini ko&apos;rish</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/watch/${rel.slug}`}
                className="group bg-[#111111] hover:bg-[#141414] border border-white/[0.07] hover:border-white/20 rounded-xl p-4 transition-all block"
              >
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#090909] mb-3">
                  <Image src={rel.images[0]} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">{rel.brand}</div>
                <div className="font-serif text-base text-[#FFFFFF] truncate group-hover:text-zinc-200 transition-colors">{rel.name}</div>
                <div className="font-mono text-sm font-medium text-white mt-1.5">{formatPrice(rel.price, lang)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FloatingCartBar />
    </div>
  );
}
