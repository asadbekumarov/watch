"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { productsData, Product } from "@/data/products";
import { storeData } from "@/data/store";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice, getTelegramInquiryUrl } from "@/lib/formatPrice";
import { useProductFilters } from "@/hooks/useProductFilters";
import QuickBuyModal from "@/components/QuickBuyModal";
import { Search, Plus, CheckCircle2, Send, Zap } from "lucide-react";

interface HomeCollectionProps {
  initialProducts?: Product[];
}

export default function HomeCollection({ initialProducts }: HomeCollectionProps = {}) {
  const { lang, t } = useTranslation();
  const { addItem } = useCart();

  const [selectedQuickProduct, setSelectedQuickProduct] = useState<Product | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const {
    filteredProducts,
    selectedBrand,
    selectedSize,
    selectedMovement,
    searchQuery,
    setBrand,
    setSize,
    setMovement,
    setSearchQuery,
    resetAllFilters,
  } = useProductFilters({ products: initialProducts || productsData });

  const brandOptions: { id: string; label: string }[] = [
    { id: "all", label: t.filters.allBrands },
    { id: "West End Watch", label: "West End Watch" },
    { id: "Jacques Philippe", label: "Jacques Philippe" },
  ];

  const sizeOptions = [
    { id: "all", label: t.filters.allSizes },
    { id: "31mm", label: "31 mm" },
    { id: "32mm", label: "32 mm" },
    { id: "37mm", label: "37 mm" },
    { id: "39mm", label: "39 mm" },
    { id: "41mm", label: "41 mm" },
  ];

  const movementOptions = [
    { id: "all", label: t.filters.allMovements },
    { id: "automatic", label: t.filters.automatic },
    { id: "quartz", label: t.filters.quartz },
  ];

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 1800);
  };

  return (
    <section id="collection" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.07] pb-8">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#FFFFFF] tracking-tight">
              West End Watch & Jacques Philippe
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-xl leading-relaxed">
              Toshkent va Namangandagi filiallarimizda taqdim etilgan soatlar to&apos;plami. Narxlar USD valyutasida ko&apos;rsatilgan.
            </p>
          </div>

          {/* Instant Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.filters.searchPlaceholder}
              className="w-full min-h-[44px] pl-10 pr-4 bg-[#111111] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/60 focus:border-[#D4AF37] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filter Controls: Brand, Size, Movement */}
        <div className="space-y-3 border-b border-white/[0.07] pb-4">
          {/* Brand Tabs */}
          <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 min-w-max">
              {brandOptions.map((brand) => {
                const isActive = selectedBrand === brand.id;
                return (
                  <button
                    key={brand.id}
                    onClick={() => setBrand(brand.id)}
                    className={`min-h-[40px] px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] whitespace-nowrap transition-all border-b-2 -mb-[2px] snap-start touch-manipulation ${
                      isActive
                        ? "border-[#D4AF37] text-[#FFFFFF] font-semibold"
                        : "border-transparent text-[#71717A] hover:text-[#FFFFFF]"
                    }`}
                  >
                    {brand.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub Filters: Size & Movement pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
            <span className="text-[#71717A] text-[11px] uppercase tracking-wider mr-1">O&apos;lcham:</span>
            {sizeOptions.map((size) => (
              <button
                key={size.id}
                onClick={() => setSize(size.id)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedSize === size.id
                    ? "bg-white text-black font-medium"
                    : "bg-[#111111] text-[#71717A] hover:text-white border border-white/[0.06]"
                }`}
              >
                {size.label}
              </button>
            ))}

            <span className="text-[#71717A] text-[11px] uppercase tracking-wider ml-2 mr-1">Mexanizm:</span>
            {movementOptions.map((mov) => (
              <button
                key={mov.id}
                onClick={() => setMovement(mov.id)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedMovement === mov.id
                    ? "bg-white text-black font-medium"
                    : "bg-[#111111] text-[#71717A] hover:text-white border border-white/[0.06]"
                }`}
              >
                {mov.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#111111] border border-white/[0.07] rounded-2xl p-8">
            <p className="text-sm font-mono text-[#71717A]">{t.filters.noResults}</p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white rounded-lg transition-colors"
            >
              {t.filters.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map((product) => {
              const isAdded = justAddedId === product.id;
              const hasPrice = product.price !== null && product.price > 0;
              const tgInquiryUrl = getTelegramInquiryUrl(product.name, storeData.telegramManager, lang);

              return (
                <div
                  key={product.id}
                  className="group bg-[#111111] border border-white/[0.08] hover:border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
                >
                  <div>
                    {/* Image Area with Link */}
                    <Link
                      href={`/watch/${product.slug}`}
                      className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#090909] border border-white/[0.05] block mb-4"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md border border-white/10">
                          {product.specs.caseDiameter}
                        </span>
                        {product.isBestseller && (
                          <span className="text-[10px] font-mono uppercase tracking-[0.14em] bg-[#D4AF37] text-black font-semibold px-2.5 py-0.5 rounded-md">
                            Bestseller
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-mono tracking-wider bg-black/75 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                          {product.specs.movementType === "automatic" ? "Avtomatik" : "Kvars"}
                        </span>
                      </div>
                    </Link>

                    {/* Metadata & Title */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#D4AF37]">
                        {product.brand}
                      </div>

                      <Link href={`/watch/${product.slug}`}>
                        <h3 className="font-serif text-lg text-white font-normal group-hover:text-zinc-200 transition-colors line-clamp-1">
                          {lang === "ru" ? product.nameRu : product.name}
                        </h3>
                      </Link>

                      {/* Store-specific notes (if any) */}
                      {product.specs.notes && product.specs.notes.length > 0 && (
                        <div className="pt-0.5 space-y-0.5">
                          {product.specs.notes.map((note, idx) => (
                            <div key={idx} className="text-[10.5px] font-sans text-zinc-400 italic">
                              • {note}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Actions Footer */}
                  <div className="pt-5 border-t border-white/[0.06] mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                        {hasPrice ? "Narxi" : "Narx holati"}
                      </div>
                      <div className="text-base font-mono font-medium text-white">
                        {formatPrice(product.price, lang)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {hasPrice ? (
                        <>
                          <button
                            onClick={() => setSelectedQuickProduct(product)}
                            className="min-h-[38px] px-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-zinc-300 hover:text-white rounded-lg transition-colors flex items-center space-x-1"
                            title="Tezkor band qilish"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="hidden sm:inline">Band qilish</span>
                          </button>

                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`min-h-[38px] px-3.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                              isAdded
                                ? "bg-emerald-600 text-white"
                                : "bg-white hover:bg-zinc-200 text-black font-medium"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Qo&apos;shildi</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Savatga</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <a
                          href={tgInquiryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[38px] px-4 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg text-xs font-mono font-medium inline-flex items-center space-x-2 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t.filters.priceAsk}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Buy Modal */}
      {selectedQuickProduct && (
        <QuickBuyModal
          product={selectedQuickProduct}
          onClose={() => setSelectedQuickProduct(null)}
          lang={lang}
        />
      )}
    </section>
  );
}
