"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { productsData, Product, ProductMovement, ProductGender, ProductStock } from "@/data/products";
import { useTranslation } from "@/i18n";
import { formatPrice, formatInstallment } from "@/lib/formatPrice";
import { storeData } from "@/data/store";
import { Filter, X, ArrowUpDown, ChevronDown, Check } from "lucide-react";

export default function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang, t } = useTranslation();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read URL params
  const selectedBrand = searchParams.get("brand") || "";
  const selectedMovement = searchParams.get("movement") || "";
  const selectedGender = searchParams.get("gender") || "";
  const selectedStock = searchParams.get("stock") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sort") || "newest";

  // Distinct Brands
  const availableBrands = useMemo(() => {
    return Array.from(new Set(productsData.map((p) => p.brand))).sort();
  }, []);

  // Update query param helper
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBrand) count++;
    if (selectedMovement) count++;
    if (selectedGender) count++;
    if (selectedStock) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  }, [selectedBrand, selectedMovement, selectedGender, selectedStock, minPrice, maxPrice]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return productsData
      .filter((p) => {
        if (selectedBrand && p.brand !== selectedBrand) return false;
        if (selectedMovement && p.movement !== selectedMovement) return false;
        if (selectedGender && p.gender !== selectedGender) return false;
        if (selectedStock && p.stock !== selectedStock) return false;
        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        // Default: newest
        return b.id.localeCompare(a.id);
      });
  }, [selectedBrand, selectedMovement, selectedGender, selectedStock, minPrice, maxPrice, sortBy]);



  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-24">
      {/* Page Title & Breadcrumb */}
      <div className="mb-10 space-y-2">
        <div className="text-xs font-mono text-[#B5B5B5] tracking-wider uppercase">
          <Link href="/" className="hover:text-[#F5ECD5] transition-colors">
            {t.storeName}
          </Link>{" "}
          / <span className="text-[#F5ECD5]">{t.nav.catalog}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#F5ECD5] tracking-tight">
          {t.catalog.title}
        </h1>
        <p className="text-sm sm:text-base text-[#A8A8A8] font-normal max-w-[58ch]">
          {t.catalog.subtitle}
        </p>
      </div>

      {/* Mobile Bar: Filter button & Sort */}
      <div className="lg:hidden flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/20">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="min-h-[44px] px-5 bg-[#141414] border border-white/20 text-[#F5ECD5] text-sm flex items-center space-x-2 rounded-sm"
        >
          <Filter className="w-4 h-4 text-[#D4AF37]" />
          <span>{t.catalog.filterButton}</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-[#D4AF37] text-[#090909] font-semibold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-4 h-4 text-[#B5B5B5]" />
          <select
            value={sortBy}
            onChange={(e) => updateQuery("sort", e.target.value)}
            className="min-h-[44px] bg-[#141414] border border-white/20 text-[#F5ECD5] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <option value="newest">{t.catalog.sortNewest}</option>
            <option value="price_asc">{t.catalog.sortPriceAsc}</option>
            <option value="price_desc">{t.catalog.sortPriceDesc}</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-10">
        {/* Desktop Sticky Filters Column */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28 space-y-8 bg-[#090909] border border-white/20 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/20">
            <h2 className="font-serif text-xl text-[#F5ECD5] font-normal flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.catalog.filterButton}</span>
            </h2>
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-[#D4AF37] hover:underline"
              >
                {t.catalog.resetFilters} ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="space-y-3">
            <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
              {t.catalog.brand}
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => updateQuery("brand", "")}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                  !selectedBrand
                    ? "bg-[#141414] text-[#F5ECD5] font-medium"
                    : "text-[#A8A8A8] hover:text-white"
                }`}
              >
                <span>{t.catalog.allBrands}</span>
                {!selectedBrand && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </button>
              {availableBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => updateQuery("brand", selectedBrand === b ? "" : b)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                    selectedBrand === b
                      ? "bg-[#141414] text-[#F5ECD5] font-medium"
                      : "text-[#A8A8A8] hover:text-white"
                  }`}
                >
                  <span>{b}</span>
                  {selectedBrand === b && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Movement Filter */}
          <div className="space-y-3 pt-4 border-t border-white/20">
            <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
              {t.catalog.movementType}
            </span>
            <div className="flex flex-wrap gap-2">
              {(["avtomat", "mexanik", "kvars"] as ProductMovement[]).map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    updateQuery("movement", selectedMovement === m ? "" : m)
                  }
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    selectedMovement === m
                      ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5ECD5] font-medium"
                      : "border-white/20 text-[#A8A8A8] hover:border-white/40"
                  }`}
                >
                  {t.movement[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="space-y-3 pt-4 border-t border-white/20">
            <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
              {t.catalog.genderType}
            </span>
            <div className="flex flex-wrap gap-2">
              {(["erkaklar", "ayollar", "uniseks"] as ProductGender[]).map((g) => (
                <button
                  key={g}
                  onClick={() =>
                    updateQuery("gender", selectedGender === g ? "" : g)
                  }
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    selectedGender === g
                      ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5ECD5] font-medium"
                      : "border-white/20 text-[#A8A8A8] hover:border-white/40"
                  }`}
                >
                  {t.gender[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-3 pt-4 border-t border-white/20">
            <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
              {t.catalog.availability}
            </span>
            <div className="flex flex-col space-y-1.5">
              {(["in_stock", "on_order", "sold_out"] as ProductStock[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateQuery("stock", selectedStock === s ? "" : s)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between border transition-colors ${
                    selectedStock === s
                      ? "border-[#D4AF37] bg-[#141414] text-[#F5ECD5] font-medium"
                      : "border-transparent text-[#A8A8A8] hover:text-white"
                  }`}
                >
                  <span>{t.stock[s]}</span>
                  {selectedStock === s && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* Desktop Top Bar: Count & Sort */}
          <div className="hidden lg:flex items-center justify-between pb-4 border-b border-white/20">
            <div className="text-sm font-mono text-[#B5B5B5]">
              <span className="text-[#F5ECD5] font-medium">{filteredProducts.length}</span>{" "}
              {t.catalog.resultsCount}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono uppercase text-[#B5B5B5]">
                {t.catalog.sortBy}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => updateQuery("sort", e.target.value)}
                className="min-h-[40px] bg-[#141414] border border-white/20 text-[#F5ECD5] px-3.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <option value="newest">{t.catalog.sortNewest}</option>
                <option value="price_asc">{t.catalog.sortPriceAsc}</option>
                <option value="price_desc">{t.catalog.sortPriceDesc}</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-[#0e0e0e] border border-white/20 p-8">
              <h3 className="font-serif text-2xl text-[#F5ECD5] font-light">
                {t.catalog.noProducts}
              </h3>
              <p className="text-sm text-[#A8A8A8] max-w-md mx-auto">
                {t.catalog.noProductsHelp}
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-4 px-6 py-3 bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium hover:bg-white transition-colors"
              >
                {t.catalog.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((watch) => (
                <Link
                  key={watch.id}
                  href={`/watch/${watch.slug}`}
                  className="group bg-[#0e0e0e] border border-white/20 hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                >
                  {/* Image container with aspect-square */}
                  <div className="relative aspect-square w-full bg-[#121212] overflow-hidden flex items-center justify-center p-3">
                    <Image
                      src={watch.images[0]}
                      alt={`${watch.brand} ${watch.model}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono text-[#B5B5B5]">
                        <span>{watch.brand}</span>
                        <span>{watch.caseSize}</span>
                      </div>
                      <h3 className="font-serif text-xl text-[#F5ECD5] font-normal group-hover:text-white transition-colors">
                        {watch.model}
                      </h3>
                      <div className="text-xs text-[#A8A8A8] font-light">
                        {t.movement[watch.movement]} · {watch.caseMaterial}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-1">
                      {watch.priceHidden ? (
                        <div className="text-base text-[#D4AF37] font-medium">
                          {t.product.askPrice}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline space-x-2">
                            <span className="font-mono text-lg font-medium text-[#F5ECD5]">
                              {formatPrice(watch.price, lang)}
                            </span>
                            {watch.oldPrice && (
                              <span className="font-mono text-xs text-[#777] line-through">
                                {formatPrice(watch.oldPrice, lang)}
                              </span>
                            )}
                          </div>
                          {storeData.installment.enabled && (
                            <div className="text-[12px] text-[#A8A8A8] font-mono">
                              {formatInstallment(watch.price, 12, lang)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end lg:hidden">
          <div className="bg-[#0e0e0e] border-t border-white/20 p-6 max-h-[85vh] overflow-y-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-white/20">
              <h2 className="font-serif text-xl text-[#F5ECD5] font-normal flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.catalog.filterButton}</span>
              </h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#B5B5B5] hover:text-white"
                aria-label="Yopish"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Filter */}
            <div className="space-y-3">
              <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
                {t.catalog.brand}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateQuery("brand", "")}
                  className={`min-h-[44px] p-2 text-xs border text-left ${
                    !selectedBrand
                      ? "border-[#D4AF37] bg-[#141414] text-[#F5ECD5] font-medium"
                      : "border-white/20 text-[#A8A8A8]"
                  }`}
                >
                  {t.catalog.allBrands}
                </button>
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateQuery("brand", selectedBrand === b ? "" : b)}
                    className={`min-h-[44px] p-2 text-xs border text-left ${
                      selectedBrand === b
                        ? "border-[#D4AF37] bg-[#141414] text-[#F5ECD5] font-medium"
                        : "border-white/20 text-[#A8A8A8]"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Movement Filter */}
            <div className="space-y-3">
              <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
                {t.catalog.movementType}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["avtomat", "mexanik", "kvars"] as ProductMovement[]).map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      updateQuery("movement", selectedMovement === m ? "" : m)
                    }
                    className={`min-h-[44px] p-2 text-xs border text-center ${
                      selectedMovement === m
                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5ECD5] font-medium"
                        : "border-white/20 text-[#A8A8A8]"
                    }`}
                  >
                    {t.movement[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-3">
              <span className="block text-xs font-mono uppercase tracking-[0.1em] text-[#B5B5B5] font-medium">
                {t.catalog.availability}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["in_stock", "on_order", "sold_out"] as ProductStock[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateQuery("stock", selectedStock === s ? "" : s)}
                    className={`min-h-[44px] p-2 text-xs border text-center ${
                      selectedStock === s
                        ? "border-[#D4AF37] bg-[#141414] text-[#F5ECD5] font-medium"
                        : "border-white/20 text-[#A8A8A8]"
                    }`}
                  >
                    {t.stock[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/20">
              <button
                onClick={() => {
                  resetAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="min-h-[48px] flex-1 border border-white/20 text-xs uppercase tracking-wider text-[#B5B5B5]"
              >
                {t.catalog.resetFilters}
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="min-h-[48px] flex-1 bg-[#F5ECD5] text-[#090909] text-xs uppercase tracking-wider font-medium"
              >
                {t.catalog.resultsCount} ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

