"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollCanvas from "@/components/ScrollCanvas";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoffeeCustomizerModal from "@/components/CoffeeCustomizerModal";
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
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  Search,
  ChevronDown,
  ShieldCheck,
  Send,
  Phone,
  Award,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
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
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.15, ease: "power3.out", delay: 0.15 }
      );
    }, stageRef);

    return () => ctx.revert();
  }, []);

  // Category list
  const categories: { id: "all" | WatchCategory; label: string }[] = [
    { id: "all", label: "Barcha Kolleksiya" },
    { id: "diver", label: "G'avvoslik (Diver)" },
    { id: "chronograph", label: "Xronograflar" },
    { id: "haute", label: "Yuqori Horologiya" },
    { id: "dress", label: "Klassik & Dress" },
    { id: "aviation", label: "Aviator" },
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
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
  const telClean = storeData.phone.replace(/[^0-9+]/g, "");

  const faqs = [
    {
      q: "Soatlarning 100% asl (original) ekanligi qanday kafolatlanadi?",
      a: "Biz Shveytsariya manufakturalarining rasmiy dilerlari bilan to'g'ridan-to'g'ri ishlaymiz. Har bir soat rasmiy xalqaro kafolat kartasi (NFC/QR chip), seriya raqami va COSC xronometr pasporti bilan birga taqdim etiladi. Xaridor xohishiga ko'ra mustaqil ekspertiza ham o'tkazilishi mumkin.",
    },
    {
      q: "Yetkazib berish xizmati qanday amalga oshiriladi va xavfsizmi?",
      a: "Toshkent shahri va viloyatlar bo'ylab barcha soatlar maxsus litsenziyalangan inkassatsiya xizmati (zirhli kuryer) orqali to'liq sug'urtalangan holda mutlaqo bepul yetkaziladi.",
    },
    {
      q: "VIP Showroomda soatlarni ko'rish va sinab ko'rish mumkinmi?",
      a: "Albatta. Toshkentdagi markaziy VIP Showroomimizda (Wyndham mehmonxonasi yonida) barcha modellarni shaxsan ko'rib, bilakka taqib tanlashingiz mumkin. Shaxsiy qabul va konsultatsiya uchun oldindan yozilish tavsiya etiladi.",
    },
    {
      q: "Kafolat muddati qancha va servis xizmati bormi?",
      a: "Barcha taqdim etilgan soatlarga 5 yillik rasmiy xalqaro ishlab chiqaruvchi kafolati beriladi. Shuningdek, bizning sertifikatlangan Shveytsariya ustaxonamizda bepul o'lchov, magnitsizlantirish va profilaktika xizmatlari amalga oshiriladi.",
    },
    {
      q: "To'lov qanday usullarda qabul qilinadi?",
      a: "To'lovni soatni qabul qilib olganingizda naqd pulda (AQSh Dollari yoki UZS), Uzcard/Humo karta orqali mobil terminalda, yoki bank orqali shartnoma va hisob-faktura asosida amalga oshirishingiz mumkin.",
    },
  ];

  return (
    <>
      {/* ──── 240-KADRLI KINEMATIK SCROLL CANVAS (Rolex 3D aylanishi) ──── */}
      <ScrollCanvas frameCount={239} folderPath="/frames" />

      {/* ──── NAVBAR ──── */}
      <Navbar />

      {/* ──── SCROLL BOSQICHI (ORQA FON SHAFFOF) ──── */}
      <div
        id="scroll-stage"
        ref={stageRef}
        className="relative z-10 bg-transparent text-[#F8F8F8]"
      >
        {/* ═══════════════════════ SECTION 01: CINEMATIC HERO ═══════════════════════ */}
        <section
          id="hero"
          className="relative min-h-[95vh] lg:min-h-screen flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-20 pt-28 sm:pt-36 pb-12"
        >
          {/* Asymmetrical 2-Column Luxury Layout */}
          <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
            {/* Left Column: Typography, Badges & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              {/* Main Headline */}
              <div className="overflow-hidden">
                <h1 className="hero-fade-in font-serif text-3xl sm:text-5xl lg:text-[3.9rem] font-normal text-[#F8F8F8] tracking-tight leading-[1.12]">
                  Vaqt san&apos;ati va <br className="hidden sm:inline" />
                  Shveytsariya nufuzi — <br />
                  <span className="italic font-normal text-[#D4AF37]">Toshkentda</span> rasmiy kafolat bilan.
                </h1>
              </div>

              {/* Description */}
              <p className="hero-fade-in text-[15px] sm:text-[17px] text-[#A1A1A6] font-normal leading-[1.8] max-w-[54ch]">
                Rolex, Patek Philippe, Audemars Piguet va Omega rasmiy durdonalari. Xalqaro COSC xronometr pasporti va O&apos;zbekiston bo&apos;ylab bepul VIP zirhli kuryerlik yetkazishi.
              </p>

              {/* Trust Value Badges (3 cols) */}
              <div className="hero-fade-in grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-1 max-w-lg">
                <div className="bg-[#111111]/60 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl p-3 sm:p-3.5 text-left transition-all shadow-md group">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-mono text-[#F8F8F8] font-semibold">100% Original</div>
                  <div className="text-[10px] text-[#8E8E93]">COSC Pasporti</div>
                </div>

                <div className="bg-[#111111]/60 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl p-3 sm:p-3.5 text-left transition-all shadow-md group">
                  <Truck className="w-4 h-4 text-[#D4AF37] mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-mono text-[#F8F8F8] font-semibold">Zirhli Kuryer</div>
                  <div className="text-[10px] text-[#8E8E93]">Sug&apos;urtalangan</div>
                </div>

                <div className="bg-[#111111]/60 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl p-3 sm:p-3.5 text-left transition-all shadow-md group">
                  <Award className="w-4 h-4 text-[#D4AF37] mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-mono text-[#F8F8F8] font-semibold">5 Yillik Kafolat</div>
                  <div className="text-[10px] text-[#8E8E93]">Xalqaro xizmat</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="hero-fade-in flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#collection"
                  className="min-h-[50px] px-8 bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs sm:text-sm uppercase tracking-wider font-bold rounded-xl shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition-all inline-flex items-center justify-center space-x-2.5"
                >
                  <span>{t.store.heroCtaMenu}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href={`https://t.me/${tgUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[50px] px-6 bg-[#111111]/70 hover:bg-[#161616] border border-white/15 hover:border-[#D4AF37] text-xs sm:text-sm text-[#F8F8F8] rounded-xl tracking-wider transition-all inline-flex items-center justify-center space-x-2 backdrop-blur-md"
                >
                  <Send className="w-4 h-4 text-[#D4AF37]" />
                  <span>VIP Konsultatsiya</span>
                </a>
              </div>
            </div>

            {/* Right Column: Open canvas area (5 cols) */}
            <div className="lg:col-span-5 hidden lg:block pointer-events-none" />
          </div>
        </section>

        {/* ═══════════════════════ SECTION 02: SMART WATCH COLLECTION & FILTERS ═══════════════════════ */}
        <section id="collection" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto space-y-10">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#D4AF37]/20 pb-8">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center space-x-2">
                  <Watch className="w-4 h-4" />
                  <span>Eksklyuziv Shveytsariya Kolleksiyasi</span>
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F8F8F8] tracking-tight">
                  Sizning nufuzingizga munosib xronometrlar
                </h2>
                <p className="text-sm text-[#8E8E93] max-w-xl leading-relaxed">
                  Har bir model o&apos;zining xalqaro COSC pasporti, sapfir shishasi va haqiqiylik kafolati bilan birga taqdim etiladi.
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-[#8E8E93] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Brend yoki model qidirish..."
                  className="w-full min-h-[46px] pl-11 pr-4 bg-[#111111]/90 backdrop-blur-md border border-white/10 rounded-xl text-xs sm:text-sm text-[#F8F8F8] placeholder-[#8E8E93]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-[13px] font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-[#D4AF37] text-[#090909] font-bold border-[#D4AF37] shadow-md"
                        : "bg-[#111111]/85 backdrop-blur-md text-[#8E8E93] border-white/10 hover:border-[#D4AF37]/50 hover:text-[#F8F8F8]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Product Grid (Compact 4-column Luxury Grid) */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center space-y-4 bg-[#111111]/85 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <Watch className="w-10 h-10 text-[#8E8E93] mx-auto opacity-50" />
                <h3 className="font-serif text-xl text-[#F8F8F8]">Soat topilmadi</h3>
                <p className="text-xs text-[#8E8E93]">
                  Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring yoki boshqa toifani tanlang.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2 bg-[#D4AF37] text-[#090909] text-xs font-bold uppercase rounded-lg"
                >
                  Barcha kolleksiyani ko&apos;rish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => {
                  const isJustAdded = justAddedId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="group bg-[#111111]/90 hover:bg-[#161616] backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <div className="flex items-center space-x-1.5">
                            {product.tags?.slice(0, 1).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[9px] font-semibold uppercase bg-[#1e1e1e] border border-[#D4AF37]/30 text-[#D4AF37] rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
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

                        {/* Title & Horology Specs */}
                        <div className="space-y-1 mt-2">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                            {product.brand}
                          </div>

                          <Link
                            href={`/watch/${product.slug}`}
                            className="block font-serif text-base sm:text-lg text-[#F8F8F8] group-hover:text-[#D4AF37] transition-colors cursor-pointer font-normal line-clamp-1"
                          >
                            {product.name}
                          </Link>

                          <div className="text-[11px] font-mono text-[#8E8E93] line-clamp-1">
                            {product.specs?.movement || product.tasteProfile}
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
          </div>
        </section>

        {/* ═══════════════════════ SECTION 03: 3-STEP LUXURY PURCHASING ═══════════════════════ */}
        <section id="services" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-[1400px] mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                Nufuzli va Xavfsiz Jarayon
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F8F8F8] tracking-tight">
                {t.store.howItWorksTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#8E8E93]">
                {t.store.howItWorksSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* Step 1 */}
              <div className="bg-[#111111]/85 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono text-base font-bold">
                  01
                </div>
                <h3 className="font-serif text-xl text-[#F8F8F8] font-normal">
                  {t.store.step1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
                  {t.store.step1Desc}
                </p>
                <div className="text-[11px] font-mono text-[#D4AF37]">
                  Rolex · Patek Philippe · Audemars Piguet
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#111111]/85 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono text-base font-bold">
                  02
                </div>
                <h3 className="font-serif text-xl text-[#F8F8F8] font-normal">
                  {t.store.step2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
                  {t.store.step2Desc}
                </p>
                <div className="text-[11px] font-mono text-[#D4AF37]">
                  COSC Pasporti · Seriya Raqami · 5 Yillik Kafolat
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#111111]/85 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono text-base font-bold">
                  03
                </div>
                <h3 className="font-serif text-xl text-[#F8F8F8] font-normal">
                  {t.store.step3Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
                  {t.store.step3Desc}
                </p>
                <div className="text-[11px] font-mono text-[#D4AF37]">
                  Zirhli Inkassatsiya · Toshkent VIP Showroom
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 04: SWISS HERITAGE STORY ═══════════════════════ */}
        <section id="heritage" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-20 sm:py-28 my-6">
          <div className="max-w-[1400px] mx-auto bg-[#111111]/90 backdrop-blur-xl border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-2xl">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Swiss Horology Heritage</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#F8F8F8] font-normal leading-tight">
                Shveytsariya soatsozlik san&apos;atining asriy an&apos;analari
              </h2>
              <p className="text-sm sm:text-base text-[#8E8E93] leading-relaxed">
                {storeData.heritageStory.origin}
              </p>
              <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
                {storeData.heritageStory.guarantee} {storeData.heritageStory.services}
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[#D4AF37]">
                <div className="flex items-center space-x-2 bg-[#161616] px-3.5 py-2 rounded-xl border border-white/5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Asl Shveytsariya</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#161616] px-3.5 py-2 rounded-xl border border-white/5">
                  <Clock className="w-4 h-4" />
                  <span>Jeneva & Le Lokl</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 relative bg-[#161616]">
                <Image
                  src="/images/watches/rolex-submariner-1.webp"
                  alt="Swiss Horology"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 05: FAQ ACCORDION ═══════════════════════ */}
        <section id="faq" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                Ko&apos;p Beriladigan Savollar
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#F8F8F8] tracking-tight">
                Xaridorlar Uchun Muhim Ma&apos;lumotlar
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="bg-[#111111]/85 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                    >
                      <span className="font-serif text-base sm:text-lg text-[#F8F8F8] font-normal">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#D4AF37] shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#8E8E93] leading-relaxed border-t border-white/5 pt-4">
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
          <div className="max-w-[1400px] mx-auto bg-[#111111]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-8">
            <div className="max-w-xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                Toshkent Markazidagi Showroomlar
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#F8F8F8] font-normal">
                VIP Qabul va Shaxsiy Sinov
              </h2>
              <p className="text-xs sm:text-sm text-[#8E8E93]">
                Soatlarni shourumimizda ko&apos;rish va mutaxassis maslahatini olish uchun oldindan yoziling.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${telClean}`}
                className="min-h-[48px] px-8 bg-[#D4AF37] hover:bg-[#E5C158] text-[#090909] text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>+998 71 200 88 00</span>
              </a>

              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-8 bg-[#161616] hover:bg-[#1e1e1e] border border-[#D4AF37]/35 text-xs uppercase tracking-wider text-[#F8F8F8] rounded-xl transition-all inline-flex items-center space-x-2"
              >
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span>Telegram orqali yozilish</span>
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
        <CoffeeCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          lang={lang}
        />
      )}
    </>
  );
}
