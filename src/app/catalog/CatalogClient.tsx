"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { productsData, Product, WatchCategory } from "@/data/products";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/lib/cart";
import WatchCustomizerModal from "@/components/WatchCustomizerModal";
import FloatingCartBar from "@/components/FloatingCartBar";
import { ArrowUpDown, Plus, CheckCircle2, Watch, Search } from "lucide-react";

export default function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang } = useTranslation();
  const { addItem } = useCart();

  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Read URL params
  const selectedCategory = (searchParams.get("category") || "all") as "all" | WatchCategory;
  const selectedBrand = searchParams.get("brand") || "all";
  const searchQuery = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "popular";

  // Clean Swiss Typography Categories (NO EMOJIS)
  const categories: { id: "all" | WatchCategory; label: string }[] = [
    { id: "all", label: "Barcha Kolleksiya" },
    { id: "alfajr", label: "Al-Fajr Islomiy" },
    { id: "tsar_bomba", label: "Tsar Bomba Tonneau" },
    { id: "philipp_plein", label: "Philipp Plein & Klassik" },
  ];

  const brands = ["all", "Al-Fajr", "Tsar Bomba", "Philipp Plein"];

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return productsData
      .filter((p) => {
        if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
        if (selectedBrand !== "all" && p.brand !== selectedBrand) return false;
        if (
          searchQuery &&
          !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  const handleProductAction = (product: Product) => {
    if (product.isCustomizable) {
      setCustomizingProduct(product);
    } else {
      addItem(product, 1);
      setJustAddedId(product.id);
      setTimeout(() => {
        setJustAddedId((curr) => (curr === product.id ? null : curr));
      }, 1800);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-32 text-[#FFFFFF]">
      {/* Breadcrumb & Title */}
      <div className="mb-8 space-y-2 border-b border-white/[0.07] pb-6">
        <div className="text-[11px] font-mono text-[#71717A] tracking-[0.16em] uppercase">
          <Link href="/" className="hover:text-white transition-colors">
            Bosh sahifa
          </Link>{" "}
          / <span className="text-white">Soatlar Kolleksiyasi</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF] tracking-tight">
              ALFAJR Soatlar Katalogi
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 max-w-xl">
              Al-Fajr Islomiy soatlari, Tsar Bomba va brend modellar. O&apos;zbekiston bo&apos;ylab BTS pochtalariga bepul yetkazish.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-300 bg-white/[0.02] border border-white/[0.08] px-3.5 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>BTS Express Bepul Yetkazish</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories, Brands, Search & Sort */}
      <div className="space-y-4 mb-8">
        {/* Top Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateQuery("q", e.target.value)}
              placeholder="Model yoki brend qidirish..."
              className="w-full min-h-[44px] pl-10 pr-4 bg-[#111111] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/60 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Sort Selector */}
            <div className="flex items-center space-x-2 bg-[#111111] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 w-full sm:w-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#71717A]" />
              <select
                value={sortBy}
                onChange={(e) => updateQuery("sort", e.target.value)}
                className="bg-transparent text-xs font-mono text-[#FFFFFF] focus:outline-none"
              >
                <option value="popular" className="bg-[#111111]">
                  Ommabopligi bo&apos;yicha
                </option>
                <option value="price_asc" className="bg-[#111111]">
                  Narxi: Avval arzonroq
                </option>
                <option value="price_desc" className="bg-[#111111]">
                  Narxi: Avval qimmatroq
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs: Swiss Hairline Active Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/[0.05]">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => updateQuery("category", cat.id)}
                className={`min-h-[40px] px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                  isActive
                    ? "border-[#D4AF37] text-[#FFFFFF] font-semibold"
                    : "border-transparent text-[#71717A] hover:text-[#FFFFFF]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Brand Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-[#71717A] uppercase text-[10px] mr-1">Brend:</span>
          {brands.map((b) => {
            const isSel = selectedBrand === b;
            return (
              <button
                key={b}
                onClick={() => updateQuery("brand", b)}
                className={`px-3 py-1 rounded border transition-colors ${
                  isSel
                    ? "bg-white/[0.08] border-white/20 text-white font-medium"
                    : "bg-transparent border-white/[0.06] text-[#71717A] hover:text-white"
                }`}
              >
                {b === "all" ? "Barchasi" : b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#111111] border border-white/[0.07] rounded-xl p-8">
          <Watch className="w-10 h-10 text-[#71717A] mx-auto opacity-40" />
          <h2 className="font-serif text-lg text-[#FFFFFF]">Soat topilmadi</h2>
          <p className="text-xs text-[#71717A]">
            Filtr parametrlarini o&apos;zgartirib ko&apos;ring yoki tozalang.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 bg-white text-black text-xs font-mono uppercase rounded-lg"
          >
            Filtrni tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const isJustAdded = justAddedId === product.id;
            return (
              <div
                key={product.id}
                className="group bg-[#111111] hover:bg-[#141414] border border-white/[0.07] hover:border-[#D4AF37]/40 rounded-xl p-4 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717A]">
                      {product.brand}
                    </span>
                    <span className="text-[10px] font-mono text-[#71717A]">
                      {product.specs?.caseDiameter}
                    </span>
                  </div>

                  {/* Image */}
                  <Link
                    href={`/watch/${product.slug}`}
                    className="block relative aspect-[4/3] w-full bg-[#090909] rounded-lg overflow-hidden cursor-pointer my-2 border border-white/[0.05]"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute bottom-2 left-2 bg-[#090909]/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider text-zinc-300 border border-white/[0.08]">
                      {product.specs?.waterResistance || "5 ATM"}
                    </div>
                  </Link>

                  {/* Title & Specs */}
                  <div className="space-y-1 mt-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                      Ref. {product.referenceNumber}
                    </div>

                    <Link
                      href={`/watch/${product.slug}`}
                      className="block font-serif text-base text-[#FFFFFF] group-hover:text-zinc-200 transition-colors cursor-pointer font-normal line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    <div className="text-[11px] font-mono text-[#71717A] line-clamp-1">
                      {product.specs?.movement}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Action */}
                <div className="pt-3 mt-3 border-t border-white/[0.07] flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] font-mono text-[#71717A] uppercase tracking-wider">
                      Narxi
                    </span>
                    <span className="font-mono text-sm sm:text-base font-medium text-[#FFFFFF]">
                      {formatPrice(product.price, lang)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProductAction(product)}
                    className={`min-h-[36px] px-3.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center space-x-1 ${
                      isJustAdded
                        ? "bg-white text-black font-semibold"
                        : "bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-[#D4AF37]/50 text-white"
                    }`}
                    title="Savatga qo'shish"
                  >
                    {isJustAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Qo&apos;shildi</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tanlash</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Bar */}
      <FloatingCartBar />

      {/* Customizer Modal */}
      {customizingProduct && (
        <WatchCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
