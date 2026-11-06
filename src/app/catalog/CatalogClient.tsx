"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { productsData, Product, WatchCategory } from "@/data/products";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/lib/cart";
import CoffeeCustomizerModal from "@/components/CoffeeCustomizerModal";
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

  const categories: { id: "all" | WatchCategory; label: string }[] = [
    { id: "all", label: "Barcha Kolleksiya" },
    { id: "diver", label: "G'avvoslik (Diver)" },
    { id: "chronograph", label: "Xronograflar" },
    { id: "haute", label: "Yuqori Horologiya" },
    { id: "dress", label: "Klassik & Dress" },
    { id: "aviation", label: "Aviator" },
  ];

  const brands = ["all", "Rolex", "Audemars Piguet", "Patek Philippe", "Omega", "Cartier", "Breitling", "Vacheron Constantin", "Jaeger-LeCoultre", "Grand Seiko", "TAG Heuer"];

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
          !p.description.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-32">
      {/* Breadcrumb & Title */}
      <div className="mb-10 space-y-2 border-b border-[#D4AF37]/20 pb-6">
        <div className="text-xs font-mono text-[#8E8E93] tracking-wider uppercase">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">
            Bosh sahifa
          </Link>{" "}
          / <span className="text-[#F8F8F8]">Soatlar Kolleksiyasi</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#F8F8F8] tracking-tight">
          Shveytsariya Xronometrlari Katalogi
        </h1>
        <p className="text-sm sm:text-base text-[#8E8E93] max-w-[62ch]">
          Dunyoning eng nufuzli Shveytsariya manufakturalarining afsonaviy modellari. Xalqaro COSC xronometr pasporti va to&apos;liq rasmiy kafolat bilan.
        </p>
      </div>

      {/* Search, Filter Bar and Sorting */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateQuery("q", e.target.value)}
              placeholder="Model yoki brend qidirish..."
              className="w-full min-h-[46px] pl-11 pr-4 bg-[#111111] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] placeholder-[#8E8E93]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-[#D4AF37]" />
            <select
              value={sortBy}
              onChange={(e) => updateQuery("sort", e.target.value)}
              className="min-h-[46px] px-3.5 bg-[#111111] border border-white/10 text-xs font-mono text-[#F8F8F8] rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
            >
              <option value="popular">Tavsiya etilgan (Mashhur)</option>
              <option value="price_asc">Narx: Arzondan qimmatga</option>
              <option value="price_desc">Narx: Qimmatdan arzonga</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateQuery("category", cat.id)}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-[#D4AF37] text-[#090909] font-bold border-[#D4AF37]"
                    : "bg-[#111111] text-[#8E8E93] border-white/10 hover:border-[#D4AF37]/40 hover:text-[#F8F8F8]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
          <span className="text-[#8E8E93] shrink-0 mr-1">Brend:</span>
          {brands.map((b) => {
            const isSelected = selectedBrand === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => updateQuery("brand", b)}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                  isSelected
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-semibold"
                    : "border-white/5 bg-[#161616] text-[#8E8E93] hover:text-[#F8F8F8]"
                }`}
              >
                {b === "all" ? "Barcha Brendlar" : b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93] mb-6">
        <span>Katalogda: {filteredProducts.length} ta xronometr mavjud</span>
        {(selectedCategory !== "all" || selectedBrand !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-[#D4AF37] hover:underline"
          >
            Filtrlarni tozalash
          </button>
        )}
      </div>

      {/* Grid (Compact 4-column Luxury Grid) */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#111111] border border-white/10 rounded-2xl p-8">
          <Watch className="w-10 h-10 text-[#8E8E93] mx-auto opacity-40" />
          <h3 className="font-serif text-xl text-[#F8F8F8]">Soat topilmadi</h3>
          <p className="text-xs text-[#8E8E93]">
            Tanlangan filtrlarga mos model mavjud emas. Filtrlarni tozalab qaytadan ko&apos;ring.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2 bg-[#D4AF37] text-[#090909] text-xs font-bold uppercase rounded-lg"
          >
            Barcha modellarni ko&apos;rish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const isJustAdded = justAddedId === product.id;
            return (
              <div
                key={product.id}
                className="group bg-[#111111] hover:bg-[#161616] border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-semibold">
                      {product.brand}
                    </span>
                    <span className="text-[10px] font-mono text-[#8E8E93]">
                      {product.specs?.caseDiameter || "41 mm"}
                    </span>
                  </div>

                  {/* Image */}
                  <Link
                    href={`/watch/${product.slug}`}
                    className="block relative aspect-[4/3] w-full bg-[#161616] rounded-xl overflow-hidden cursor-pointer my-2 border border-white/5"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute bottom-2 left-2 bg-[#090909]/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#D4AF37]/30 text-[9px] font-mono uppercase tracking-wider text-[#D4AF37]">
                      {product.specs?.waterResistance || "100m"}
                    </div>
                  </Link>

                  {/* Title & Specs */}
                  <div className="space-y-1 mt-2">
                    <Link
                      href={`/watch/${product.slug}`}
                      className="block font-serif text-base sm:text-lg text-[#F8F8F8] group-hover:text-[#D4AF37] transition-colors cursor-pointer font-normal line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    <div className="text-[11px] font-mono text-[#8E8E93] line-clamp-1">
                      {product.specs?.movement}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Action Button */}
                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] font-mono text-[#8E8E93] uppercase">
                      Qiymati
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-[#F8F8F8]">
                      {formatPrice(product.price, lang)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleProductAction(product)}
                      className={`min-h-[38px] px-3 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center space-x-1 shadow-sm ${
                        isJustAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909]"
                      }`}
                      title="Konfiguratsiya va Savat"
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
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Bar */}
      <FloatingCartBar />

      {/* Customizer Modal */}
      {customizingProduct && (
        <CoffeeCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
