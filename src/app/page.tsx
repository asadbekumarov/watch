"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollCanvas from "@/components/ScrollCanvas";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchCustomizerModal from "@/components/WatchCustomizerModal";
import FloatingCartBar from "@/components/FloatingCartBar";
import { storeData } from "@/data/store";
import { productsData, Product, WatchCategory } from "@/data/products";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/formatPrice";
import {
  Watch,
  Truck,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Search,
  ChevronDown,
  ShieldCheck,
  Send,
  Phone,
  Compass,
  Wrench,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useTranslation();
  const { addItem } = useCart();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<"all" | WatchCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Customizer Modal
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // GSAP Fade In Entrance
  useEffect(() => {
    if (!stageRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-fade-in",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, stagger: 0.12, ease: "power3.out", delay: 0.1 }
      );
    }, stageRef);

    return () => ctx.revert();
  }, []);

  // Category list - Strictly Clean Swiss Typography (NO EMOJIS)
  const categories: { id: "all" | WatchCategory; label: string }[] = [
    { id: "all", label: "Barcha Kolleksiya" },
    { id: "alfajr", label: "Al-Fajr Islomiy" },
    { id: "tsar_bomba", label: "Tsar Bomba Tonneau" },
    { id: "philipp_plein", label: "Philipp Plein & Klassik" },
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle Quick Add or Open Customizer
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

  const tgUsername = storeData.telegram.replace("@", "");
  const igUsername = storeData.instagram.replace("@", "");
  const telClean = storeData.phone.replace(/[^0-9+]/g, "");

  const faqs = [
    {
      q: "Al-Fajr soatlarida azon vaqtlari O'zbekiston shaharlari bo'yicha qanday ishlaydi?",
      a: "Barcha Al-Fajr soatlariga O'zbekistonning barcha viloyat va shaharlari (Toshkent, Samarqand, Andijon, Farg'ona, Namangan, Buxoro, Qarshi, Nukus va h.k.) dasturlashtirilgan. Siz o'z shahringizni tanlaysiz va soat har kuni 5 mahal namoz vaqtini, azon ovozini hamda Qibla kompasini 100% aniqlik bilan avtomatik hisoblab boradi.",
    },
    {
      q: "BTS Pochtasiga yetkazib berish rostdan ham BEPULMI?",
      a: "Ha, mutlaqo bepul. ALFAJR do'konidan xarid qilingan har bir soat O'zbekistonning istalgan viloyatidagi eng yaqin BTS Express pochta filialiga 0 so'mga yetkaziladi. Mahsulotni pochtada ochib, to'liq tekshirib ko'rganingizdan keyin to'lov qilasiz.",
    },
    {
      q: "@soatsoz_uzb servis markazi qanday kafolat beradi?",
      a: "Har bir xaridorga 1 yillik rasmiy kafolat taloni taqdim etiladi. Bizning rasmiy hamkorimiz — Toshkentdagi ixtisoslashgan @soatsoz_uzb servis markazi soatning mexanizmi, batareyasi va suv himoyasiga professional xizmat ko'rsatadi.",
    },
    {
      q: "Tsar Bomba soatlari asl (original) ekanligini qanday bilish mumkin?",
      a: "Tsar Bomba soatlari asl zavod qadog'ida, individual seriya raqami, xalqaro pasporti va haqiqiylik sertifikati bilan birga yetkaziladi. Har bir soat safir oyna va Seiko Mecha-Quartz / Miyota Automatic mexanizmiga ega.",
    },
    {
      q: "Do'konga borib, soatlarni shaxsan ko'rib tanlasa bo'ladimi?",
      a: "Albatta. Toshkent shahri, Kichik Xalqa Yo'li, 19-uy manzilidagi rasmiy ko'rgazma zalimiz har kuni 09:00 dan 21:00 gacha ochiq. Mutaxassislarimiz barcha modellarni ko'rsatib, azon vaqtlarini sozlab berishadi.",
    },
  ];

  return (
    <>
      {/* ──── 240-KADRLI KINEMATIK SCROLL CANVAS ──── */}
      <ScrollCanvas frameCount={239} folderPath="/frames" />

      {/* ──── NAVBAR ──── */}
      <Navbar />

      {/* ──── SCROLL BOSQICHI (ORQA FON SHAFFOF) ──── */}
      <div
        id="scroll-stage"
        ref={stageRef}
        className="relative z-10 bg-transparent text-[#FFFFFF]"
      >
        {/* ═══════════════════════ SECTION 01: CINEMATIC HERO ═══════════════════════ */}
        <section
          id="hero"
          className="relative min-h-[100svh] flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-20 pt-24 sm:pt-32 lg:pt-36 pb-8 sm:pb-12"
        >
          <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
            {/* Left Column: Typography, Badges & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-7 text-left relative z-10 bg-gradient-to-t from-[#090909]/95 via-[#090909]/75 to-transparent lg:bg-none p-4 sm:p-6 lg:p-0 rounded-2xl lg:rounded-none backdrop-blur-[2px] lg:backdrop-blur-none border border-white/[0.06] lg:border-none shadow-2xl lg:shadow-none">
              {/* Main Headline */}
              <div className="overflow-hidden">
                <h1 className="hero-fade-in font-serif text-[clamp(1.85rem,5.5vw,4rem)] font-normal text-[#FFFFFF] tracking-tight leading-[1.14]">
                  Vaqt san&apos;ati va <br className="hidden sm:inline" />
                  mukammallik nufuzi — <br />
                  <span className="italic font-normal text-zinc-300">Al-Fajr</span> va{" "}
                  <span className="text-white">Tsar Bomba</span>.
                </h1>
              </div>

              {/* Description */}
              <p className="hero-fade-in text-[14px] sm:text-[16px] text-zinc-300 sm:text-[#71717A] font-normal leading-[1.75] max-w-[54ch]">
                5 mahal aniq azon vaqtlari, Qibla kompasi hamda salobatli tonneau korpuslar. Rasmiy kafolat va O&apos;zbekiston bo&apos;ylab bepul BTS Express yetkazishi.
              </p>

              {/* Trust Value Badges (3 cols) */}
              <div className="hero-fade-in grid grid-cols-3 gap-2 sm:gap-3.5 pt-1 max-w-lg">
                <div className="bg-[#111111]/90 backdrop-blur-md border border-white/[0.08] hover:border-white/20 rounded-xl p-2.5 sm:p-3.5 text-left transition-all group">
                  <div className="text-[10px] sm:text-[11px] font-mono text-[#FFFFFF] font-medium flex items-center space-x-1 sm:space-x-1.5 mb-0.5 sm:mb-1 truncate">
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] shrink-0" />
                    <span className="truncate">BTS Bepul</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-[#71717A] truncate">Barcha Viloyatlarga</div>
                </div>

                <div className="bg-[#111111]/90 backdrop-blur-md border border-white/[0.08] hover:border-white/20 rounded-xl p-2.5 sm:p-3.5 text-left transition-all group">
                  <div className="text-[10px] sm:text-[11px] font-mono text-[#FFFFFF] font-medium flex items-center space-x-1 sm:space-x-1.5 mb-0.5 sm:mb-1 truncate">
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] shrink-0" />
                    <span className="truncate">Azon & Qibla</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-[#71717A] truncate">O&apos;zbekiston shaharlari</div>
                </div>

                <div className="bg-[#111111]/90 backdrop-blur-md border border-white/[0.08] hover:border-white/20 rounded-xl p-2.5 sm:p-3.5 text-left transition-all group">
                  <div className="text-[10px] sm:text-[11px] font-mono text-[#FFFFFF] font-medium flex items-center space-x-1 sm:space-x-1.5 mb-0.5 sm:mb-1 truncate">
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] shrink-0" />
                    <span className="truncate">@soatsoz_uzb</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-[#71717A] truncate">1 Yillik Kafolat</div>
                </div>
              </div>

              {/* Action Buttons: Solid White Primary + Minimal Dark Glass Secondary */}
              <div className="hero-fade-in flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  href="#collection"
                  className="w-full sm:w-auto min-h-[48px] px-8 bg-[#FFFFFF] hover:bg-zinc-200 text-[#090909] text-xs uppercase tracking-[0.14em] font-medium rounded-lg transition-all inline-flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Kolleksiyani ko&apos;rish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <a
                  href="tel:+998712008300"
                  className="w-full sm:w-auto min-h-[48px] px-6 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] hover:border-[#D4AF37]/50 text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg transition-all inline-flex items-center justify-center space-x-2 backdrop-blur-md"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>71 200 83 00</span>
                </a>
              </div>
            </div>

            {/* Right Column: Open canvas area */}
            <div className="lg:col-span-5 hidden lg:block pointer-events-none min-h-[300px]" />
          </div>
        </section>

        {/* ═══════════════════════ SECTION 02: WATCH COLLECTION & FILTERS ═══════════════════════ */}
        <section id="collection" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.07] pb-8">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#FFFFFF] tracking-tight">
                  Al-Fajr, Tsar Bomba va Klassik Soatlar
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] max-w-xl leading-relaxed">
                  Har bir soatga @soatsoz_uzb rasmiy kafolati beriladi va O&apos;zbekiston bo&apos;ylab BTS pochtalariga bepul yetkaziladi.
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Model yoki brend qidirish..."
                  className="w-full min-h-[44px] pl-10 pr-4 bg-[#111111] border border-white/[0.08] rounded-lg text-xs sm:text-sm text-[#FFFFFF] placeholder-[#71717A]/60 focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Tabs - Smooth horizontal scroll on mobile with touch snapping */}
            <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-white/[0.07] pb-1">
              <div className="flex items-center gap-2 min-w-max">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`min-h-[44px] px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] whitespace-nowrap transition-all border-b-2 -mb-[2px] snap-start touch-manipulation ${
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
            </div>

            {/* Product Grid - Pure Obsidian Cards with Hairline Borders */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center space-y-4 bg-[#111111] border border-white/[0.07] rounded-2xl p-8">
                <Watch className="w-8 h-8 text-[#71717A] mx-auto opacity-50" />
                <h3 className="font-serif text-lg text-[#FFFFFF]">Soat topilmadi</h3>
                <p className="text-xs text-[#71717A]">
                  Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring yoki boshqa toifani tanlang.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2 bg-white text-black text-xs font-mono uppercase rounded-lg"
                >
                  Barcha kolleksiyani ko&apos;rish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => {
                  const isJustAdded = justAddedId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="group bg-[#111111] hover:bg-[#141414] border border-white/[0.07] hover:border-[#D4AF37]/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300"
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

                        {/* Image Container: Aspect 4/5 for elegant portrait horology display */}
                        <Link
                          href={`/watch/${product.slug}`}
                          className="block relative aspect-[4/5] w-full bg-[#090909] rounded-lg overflow-hidden cursor-pointer my-2 border border-white/[0.05]"
                        >
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Subtle Tag */}
                          <div className="absolute bottom-2 left-2 bg-[#090909]/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider text-zinc-300 border border-white/[0.08]">
                            {product.specs?.waterResistance || "5 ATM"}
                          </div>
                        </Link>

                        {/* Title & Specs */}
                        <div className="space-y-1 mt-2">
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

                      {/* Bottom Pricing & Sleek Action Button */}
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
                          className={`min-h-[40px] px-4 rounded-md text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 touch-manipulation ${
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
          </div>
        </section>

        {/* ═══════════════════════ SECTION 03: 3-STEP PURCHASING FLOW ═══════════════════════ */}
        <section id="delivery" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-[1400px] mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FFFFFF] font-normal tracking-tight">
                {t.store.howItWorksTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* Step 1 */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-3">
                <div className="text-xs font-mono text-[#D4AF37] font-semibold">
                  01 / TANLOV
                </div>
                <h3 className="font-serif text-lg text-[#FFFFFF] font-normal">
                  {t.store.step1Title}
                </h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  {t.store.step1Desc}
                </p>
                <div className="text-[11px] font-mono text-zinc-400 pt-1">
                  Al-Fajr · Tsar Bomba · Philipp Plein
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-3">
                <div className="text-xs font-mono text-[#D4AF37] font-semibold">
                  02 / TEKSHIRUV
                </div>
                <h3 className="font-serif text-lg text-[#FFFFFF] font-normal">
                  {t.store.step2Title}
                </h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  {t.store.step2Desc}
                </p>
                <div className="text-[11px] font-mono text-zinc-400 pt-1">
                  Azon Sozlamasi · @soatsoz_uzb Kafolati
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-3">
                <div className="text-xs font-mono text-[#D4AF37] font-semibold">
                  03 / YETKAZISH
                </div>
                <h3 className="font-serif text-lg text-[#FFFFFF] font-normal">
                  {t.store.step3Title}
                </h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  {t.store.step3Desc}
                </p>
                <div className="text-[11px] font-mono text-zinc-400 pt-1">
                  BTS Express Bepul Dastavka · Tekshirib To&apos;lash
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 04: SERVICE & SOCIAL PROOF ═══════════════════════ */}
        <section id="service" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-[1400px] mx-auto bg-[#111111] border border-white/[0.08] rounded-2xl p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#FFFFFF] font-normal leading-tight">
                Har bir soat @soatsoz_uzb kafolati ostida
              </h2>

              <p className="text-sm text-[#71717A] leading-relaxed">
                Biz nafaqat asl soatlarni sotamiz, balki ularning uzoq yillar bekamu-ko&apos;st ishlashini kafolatlaymiz. ALFAJR xaridorlari uchun rasmiy ta&apos;mirlash va texnik xizmat ko&apos;rsatuvchi <strong className="text-white font-medium">@soatsoz_uzb</strong> ustaxonasi xizmat qiladi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-center space-x-3 bg-[#090909] p-3 rounded-lg border border-white/[0.05] text-xs font-mono text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                  <span>Bepul o&apos;lcham qisqartirish</span>
                </div>
                <div className="flex items-center space-x-3 bg-[#090909] p-3 rounded-lg border border-white/[0.05] text-xs font-mono text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                  <span>1 yillik mexanizm kafolati</span>
                </div>
                <div className="flex items-center space-x-3 bg-[#090909] p-3 rounded-lg border border-white/[0.05] text-xs font-mono text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                  <span>Azon vaqtlarini aniq sozlash</span>
                </div>
                <div className="flex items-center space-x-3 bg-[#090909] p-3 rounded-lg border border-white/[0.05] text-xs font-mono text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                  <span>Suvga chidamlilik sinovi</span>
                </div>
              </div>
            </div>

            {/* Right Social Proof Card (5 cols) */}
            <div className="lg:col-span-5 bg-[#090909] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white mx-auto">
                <InstagramIcon className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-mono font-medium text-[#FFFFFF] tracking-tight">
                  235 000+
                </div>
                <div className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-400">
                  Instagram Auditoriyasi
                </div>
                <div className="text-xs font-mono text-[#D4AF37]">
                  @alfajr_uz
                </div>
              </div>

              <p className="text-xs text-[#71717A] leading-relaxed">
                Mijozlarimizning video-sharhlari, yangi modellar va xaridorlar fikrlari bilan Instagram sahifamizda tanishing.
              </p>

              <a
                href={`https://instagram.com/${igUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-[#D4AF37]/50 text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg transition-all inline-flex items-center justify-center space-x-2"
              >
                <span>Sahifamizni ko&apos;rish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 05: FAQ ACCORDION ═══════════════════════ */}
        <section id="faq" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#FFFFFF] tracking-tight">
                Xaridorlar Uchun Ma&apos;lumotlar
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="bg-[#111111] border border-white/[0.07] hover:border-white/[0.15] rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                    >
                      <span className="font-serif text-base text-[#FFFFFF] font-normal">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-[#71717A] leading-relaxed border-t border-white/[0.04] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 06: SHOWROOM & CONTACTS ═══════════════════════ */}
        <section id="locations" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-[1400px] mx-auto bg-[#111111] border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#71717A] font-medium">
                Rasmiy Ko&apos;rgazma Zali
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FFFFFF] font-normal">
                Toshkent sh., Kichik Xalqa Yo&apos;li, 19
              </h2>
              <p className="text-xs text-[#71717A]">
                Har kuni 09:00 dan 21:00 gacha dam olish kunlarisiz xizmatingizdamiz.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href={`tel:${telClean}`}
                className="min-h-[46px] px-8 bg-[#FFFFFF] hover:bg-zinc-200 text-[#090909] text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-lg transition-all inline-flex items-center space-x-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+998 71 200 83 00</span>
              </a>

              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] px-8 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.1] text-xs font-mono uppercase tracking-[0.14em] text-white rounded-lg transition-all inline-flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5 text-zinc-400" />
                <span>Telegram: @alfajr_uz</span>
              </a>
            </div>
          </div>
        </section>

        {/* ──── FOOTER ──── */}
        <Footer />
      </div>

      {/* ──── FLOATING BOTTOM CART BAR ──── */}
      <FloatingCartBar />

      {/* ──── WATCH CUSTOMIZATION MODAL ──── */}
      {customizingProduct && (
        <WatchCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          lang={lang}
        />
      )}
    </>
  );
}
