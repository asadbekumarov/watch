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
  Award,
  Layers,
  ChevronRight,
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

  const giftBoxPrice = includeGiftBox ? 1500000 : 0;
  const engravingPrice = engravingText.trim().length > 0 ? 800000 : 0;

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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-32 text-[#F8F8F8]">
      {/* Breadcrumb */}
      <nav className="mb-8 text-xs font-mono text-[#8E8E93] tracking-wider uppercase flex items-center space-x-2">
        <Link href="/" className="hover:text-[#D4AF37] transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-[#D4AF37] transition-colors">
          Kolleksiya
        </Link>
        <span>/</span>
        <span className="text-[#D4AF37]">{product.brand}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#111111] border border-[#D4AF37]/25 shadow-2xl">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-all duration-300"
            />

            <div className="absolute top-5 left-5 bg-[#090909]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D4AF37]/35 text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>COSC Sertifikati</span>
            </div>

            <div className="absolute bottom-5 right-5 bg-[#090909]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-[#8E8E93]">
              Ref. {product.referenceNumber}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square rounded-2xl overflow-hidden bg-[#111111] border transition-all ${
                    activeImageIndex === idx
                      ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-[1.02]"
                      : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Luxury Trust Points Card */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <div className="text-[#D4AF37] flex items-center space-x-1.5 font-semibold">
                <Truck className="w-4 h-4" />
                <span>Zirhli Yetkazish</span>
              </div>
              <p className="text-[#8E8E93] text-[11px] leading-relaxed">
                Toshkent va viloyatlarga to&apos;liq sug&apos;urtalangan bepul inkassatsiya.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[#D4AF37] flex items-center space-x-1.5 font-semibold">
                <Award className="w-4 h-4" />
                <span>5 Yillik Kafolat</span>
              </div>
              <p className="text-[#8E8E93] text-[11px] leading-relaxed">
                Rasmiy xalqaro xizmat va bepul ustaxona profilaktikasi.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[#D4AF37] flex items-center space-x-1.5 font-semibold">
                <Watch className="w-4 h-4" />
                <span>VIP Showroom</span>
              </div>
              <p className="text-[#8E8E93] text-[11px] leading-relaxed">
                Toshkent markazida shaxsiy sinov va konsultatsiya.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Info & Purchase (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-white/10 pb-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-[0.15em] text-[#D4AF37] font-semibold">
                {product.brand}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs font-mono text-[#8E8E93]">{product.specs?.caseDiameter}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F8F8F8] tracking-tight">
              {product.name}
            </h1>

            <p className="text-sm text-[#8E8E93] leading-relaxed pt-2">
              {product.description}
            </p>

            <div className="pt-4 flex items-baseline space-x-4">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#D4AF37]">
                {formatPrice(unitPrice, lang)}
              </span>
              {product.oldPrice && (
                <span className="font-mono text-sm text-[#8E8E93] line-through">
                  {formatPrice(product.oldPrice, lang)}
                </span>
              )}
            </div>
          </div>

          {/* Horology Specifications Table */}
          {product.specs && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Texnik Xususiyatlar (Specifications)</span>
              </h3>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <dt className="text-[#8E8E93]">Kalibr:</dt>
                  <dd className="font-mono text-[#F8F8F8] font-medium">{product.specs.caliber}</dd>
                </div>
                <div>
                  <dt className="text-[#8E8E93]">Mexanizm turi:</dt>
                  <dd className="font-mono text-[#F8F8F8] font-medium">{product.specs.movement}</dd>
                </div>
                <div>
                  <dt className="text-[#8E8E93]">Korpus diametri:</dt>
                  <dd className="font-mono text-[#F8F8F8] font-medium">{product.specs.caseDiameter}</dd>
                </div>
                <div>
                  <dt className="text-[#8E8E93]">Qalinligi:</dt>
                  <dd className="font-mono text-[#F8F8F8] font-medium">{product.specs.caseThickness}</dd>
                </div>
                <div>
                  <dt className="text-[#8E8E93]">Material:</dt>
                  <dd className="font-mono text-[#F8F8F8] font-medium">{product.specs.caseMaterial}</dd>
                </div>
                <div>
                  <dt className="text-[#8E8E93]">Shisha turi:</dt>
                  <dd className="font-mono text-[#F8F8F8] font-medium">{product.specs.glass}</dd>
                </div>
                <div>
                  <dt className="text-[#8E8E93]">Suvga chidamlilik:</dt>
                  <dd className="font-mono text-[#D4AF37] font-medium">{product.specs.waterResistance}</dd>
                </div>
                <div>
                  <dt className="text-[#8E8E93]">Quvvat zaxirasi:</dt>
                  <dd className="font-mono text-[#F8F8F8] font-medium">{product.specs.powerReserve}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Customization Options */}
          <div className="space-y-4">
            {/* Strap Options */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                Braslet / Remeshok Tanlovi:
              </label>
              <div className="space-y-2">
                {straps.map((strap) => (
                  <button
                    key={strap.id}
                    type="button"
                    onClick={() => setSelectedStrap(strap)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      selectedStrap.id === strap.id
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                        : "border-white/10 bg-[#111111] text-[#8E8E93] hover:border-white/20"
                    }`}
                  >
                    <span>{strap.name}</span>
                    <span className="font-mono text-[#D4AF37]">
                      {strap.extraPrice > 0 ? `+${formatPrice(strap.extraPrice, lang)}` : "Standart"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Engraving */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                Shaxsiy Lazerli Gravirovka (+800 000 so&apos;m):
              </label>
              <input
                type="text"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value.slice(0, 30))}
                placeholder="Korpus orqasiga yoziladigan ism yoki sana"
                className="w-full min-h-[42px] px-3.5 bg-[#111111] border border-white/10 rounded-xl text-xs text-[#F8F8F8] placeholder-[#8E8E93]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
              />
            </div>

            {/* VIP Gift Box */}
            <div
              onClick={() => setIncludeGiftBox(!includeGiftBox)}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${
                includeGiftBox
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F8F8F8] ring-1 ring-[#D4AF37]"
                  : "border-white/10 bg-[#111111] text-[#8E8E93]"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Gift className="w-4 h-4 text-[#D4AF37]" />
                <span>VIP Yog&apos;och Quti & Rasmiy Pasport Konverti</span>
              </div>
              <span className="font-mono text-[#D4AF37]">
                {includeGiftBox ? "+1 500 000 so'm" : "Yo'q"}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-6 bg-[#111111] border border-[#D4AF37]/25 rounded-3xl space-y-4 shadow-xl">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full min-h-[52px] bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs uppercase tracking-[0.12em] font-bold rounded-2xl transition-all shadow-[0_8px_24px_rgba(212,175,55,0.35)] flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Savatga qo&apos;shish · {formatPrice(totalSum, lang)}</span>
            </button>

            {isAddedNotice && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-xs font-mono text-emerald-400 animate-in fade-in">
                ✓ Soat muvaffaqiyatli savatga qo&apos;shildi!
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] bg-[#161616] hover:bg-[#1e1e1e] border border-white/10 hover:border-[#D4AF37] text-xs font-mono uppercase tracking-wider text-[#F8F8F8] rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span>Telegram Konsultatsiya</span>
              </a>

              <a
                href={telLink}
                className="min-h-[44px] bg-[#161616] hover:bg-[#1e1e1e] border border-white/10 hover:border-[#D4AF37] text-xs font-mono uppercase tracking-wider text-[#F8F8F8] rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>VIP Showroomga Qo&apos;ng&apos;iroq</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-12 border-t border-white/10 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                O&apos;xshash Modellar
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#F8F8F8] font-normal">
                Kolleksiyadagi Boshqa Durdonalar
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] hover:underline flex items-center space-x-1"
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
                className="group bg-[#111111] hover:bg-[#161616] border border-white/10 hover:border-[#D4AF37]/50 rounded-xl p-3.5 transition-all shadow-md block hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#161616] mb-2.5">
                  <Image src={rel.images[0]} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider">{rel.brand}</div>
                <div className="font-serif text-base text-[#F8F8F8] truncate group-hover:text-[#D4AF37] transition-colors">{rel.name}</div>
                <div className="font-mono text-sm font-bold text-[#F8F8F8] mt-1.5">{formatPrice(rel.price, lang)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FloatingCartBar />
    </div>
  );
}
