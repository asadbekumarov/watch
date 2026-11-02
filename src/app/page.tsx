"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollCanvas from "@/components/ScrollCanvas";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandShelf from "@/components/BrandShelf";
import { storeData } from "@/data/store";
import { productsData, Product } from "@/data/products";
import { useTranslation } from "@/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/formatPrice";
import {
  ShieldCheck,
  RotateCcw,
  Package,
  Truck,
  ArrowRight,
  Clock,
  Phone,
  Send,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  Award,
  Compass,
  MessageCircle,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useTranslation();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<"all" | "erkaklar" | "ayollar" | "avtomat">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Distinct brand list with count
  const brandCounts = productsData.reduce((acc, curr) => {
    acc[curr.brand] = (acc[curr.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const brandsList = Object.keys(brandCounts).sort();

  // Filter watches by active tab
  const filteredWatches = productsData.filter((watch) => {
    if (activeTab === "all") return true;
    if (activeTab === "erkaklar") return watch.gender === "erkaklar";
    if (activeTab === "ayollar") return watch.gender === "ayollar";
    if (activeTab === "avtomat") return watch.movement === "avtomat" || watch.movement === "mexanik";
    return true;
  }).slice(0, 6);

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

  const handleAddToCart = (e: React.MouseEvent, watch: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(watch, 1);
    setAddedId(watch.id);
    setTimeout(() => {
      setAddedId((curr) => (curr === watch.id ? null : curr));
    }, 2000);
  };

  const tgUsername = storeData.telegram.replace("@", "");
  const telClean = storeData.phone.replace(/[^0-9+]/g, "");

  const faqs = [
    {
      q: lang === "uz" ? "Soatlar haqiqatan ham 100% originalmi?" : "Часы действительно на 100% оригинальные?",
      a: lang === "uz"
        ? "Ha, albatta. Biz faqat rasmiy ishlab chiqaruvchilar va tasdiqlangan distribyutorlar bilan ishlaymiz. Har bir soat o'zining asl zavod qutisi, xalqaro pasporti, seriya raqami va bizning 24 oylik rasmiy kafolat talonimiz bilan taqdim etiladi."
        : "Да, безусловно. Мы сотрудничаем исключительно с официальными дистрибьюторами и фабриками. Все часы комплектуются оригинальной заводской коробкой, паспортом с серийным номером и официальным гарантийным талоном на 24 месяца.",
    },
    {
      q: lang === "uz" ? "Yetkazib berish Toshkentda va viloyatlarda qanday amalga oshiriladi?" : "Как устроена доставка по Ташкенту и в регионы?",
      a: lang === "uz"
        ? "Toshkent shahri bo'ylab xavfsiz kuryer orqali bepul yetkazib beriladi — buyurtmani ko'rib, tekshirib keyin to'lov qilishingiz mumkin. O'zbekistonning barcha viloyatlariga esa maxsus xavfsiz pochta orqali 1-3 ish kunida yetkaziladi."
        : "По Ташкенту доставка бесплатная курьером с возможностью осмотра перед оплатой. В регионы Узбекистана отправляем экспресс-почтой в течение 1-3 рабочих дней с полной страховкой груза.",
    },
    {
      q: lang === "uz" ? "Bo'lib to'lash (muddatli to'lov) imkoniyati bormi?" : "Доступна ли покупка в рассрочку?",
      a: lang === "uz"
        ? "Ha, bizda 6 oydan 12 oygacha qulay bo'lib to'lash xizmati mavjud. Bank kartalari yoki hamkor to'lov tizimlari orqali rasmiylashtirish mumkin. Batafsil ma'lumot uchun menejerimiz bilan bog'laning."
        : "Да, мы предоставляем возможность покупки в рассрочку на 6 или 12 месяцев через карты и банки-партнеры. Оформление занимает всего несколько минут.",
    },
    {
      q: lang === "uz" ? "Do'koningizga kelib o'zimiz ko'rib tanlasak bo'ladimi?" : "Можно ли приехать в салон и примерить часы вживую?",
      a: lang === "uz"
        ? "Albatta! Toshkent shahrida 2 ta qulay manzilimiz bor: Amir Temur ko'chasi 108 va Bunyodkor shoh ko'chasi 24. Har kuni soat 10:00 dan 21:00 gacha eshiklarimiz siz uchun ochiq. Soatlarni bilagingizga taqib, o'lchab tanlashingiz mumkin."
        : "Конечно! У нас два уютных салона в Ташкенте: ул. Амира Темура 108 и пр. Бунёдкор 24. Работаем ежедневно с 10:00 до 21:00 без выходных. Приезжайте на примерку и чашку кофе.",
    },
    {
      q: lang === "uz" ? "24 oylik kafolatga nimalar kiradi?" : "Что покрывает 24-месячная гарантия?",
      a: lang === "uz"
        ? "Biz o'z professional soat ustaxonamizga egamiz. Kafolat davrida mexanizmning aniqligi, yurishi va zavod nuqsonlari bepul ta'mirlanadi yoki xizmat ko'rsatiladi."
        : "У нас собственный авторизованный сервисный центр. Гарантия 24 месяца покрывает работу механизма, точность хода и устранение любых заводских дефектов.",
    },
  ];

  return (
    <>
      {/* ──── FIXED 240-FRAME KINEMATIC CANVAS BACKGROUND (DO NOT TOUCH) ──── */}
      <ScrollCanvas frameCount={239} folderPath="/frames" />

      {/* ──── NAVBAR ──── */}
      <Navbar />

      {/* ──── SCROLL STAGE (TRANSPARENT TO REVEAL 3D CANVAS) ──── */}
      <div
        id="scroll-stage"
        ref={stageRef}
        className="relative z-10 bg-transparent text-[#EDEDED]"
      >
        {/* ═══════════════════════ SECTION 00: CINEMATIC OPEN HERO ═══════════════════════ */}
        <section
          id="hero"
          className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-20 pt-28 sm:pt-32 pb-12"
        >
          {/* Centered Glass Card (Translucent so background 3D watch animation shines through) */}
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-black/30 sm:bg-black/35 border border-white/10 p-7 sm:p-12 lg:p-14 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-center space-y-6 sm:space-y-7 relative overflow-hidden">

              {/* Eyebrow badge */}
              <div className="hero-fade-in flex items-center justify-center space-x-3">
                <span className="w-6 sm:w-8 h-[1px] bg-[#D4AF37]" />
                <span className="text-xs sm:text-[13px] font-mono tracking-[0.18em] text-[#D4AF37] uppercase font-semibold">
                  Noble Horology · Original Timepieces
                </span>
                <span className="w-6 sm:w-8 h-[1px] bg-[#D4AF37]" />
              </div>

              {/* Main Headline */}
              <div className="overflow-hidden">
                <h1 className="hero-fade-in font-serif text-3xl sm:text-5xl lg:text-[3.5rem] font-normal text-[#F5ECD5] tracking-tight leading-[1.12]">
                  {lang === "uz" ? (
                    <>
                      Vaqt o&apos;tadi — <br />
                      <span className="italic font-normal text-white">Haqiqiy qadr</span> abadiy qoladi.
                    </>
                  ) : (
                    <>
                      Время идёт — <br />
                      <span className="italic font-normal text-white">Истинная ценность</span> остаётся.
                    </>
                  )}
                </h1>
              </div>

              {/* Description */}
              <p className="hero-fade-in text-[15px] sm:text-[16px] text-[#D8D2C2] font-normal leading-[1.8] max-w-[54ch] mx-auto">
                {lang === "uz" ? (
                  <>
                    Shveytsariya va jahonning nufuzli brendlaridan original qo&apos;l soatlari.
                    Har bir model uchun <strong className="text-[#F5ECD5] font-medium">24 oylik to&apos;liq kafolat</strong>,
                    zavod qutisi va Toshkent bo&apos;ylab bepul tekshirib yetkazib berish.
                  </>
                ) : (
                  <>
                    Оригинальные наручные часы от ведущих мировых брендов.
                    На каждую модель действует <strong className="text-[#F5ECD5] font-medium">полная гарантия 24 месяца</strong>,
                    фирменная коробка и бесплатная доставка с примеркой по Ташкенту.
                  </>
                )}
              </p>

              {/* Action Buttons */}
              <div className="hero-fade-in flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <Link
                  href="/catalog"
                  className="group min-h-[48px] px-8 py-3 bg-[#D4AF37] hover:bg-[#e4c254] text-[#090909] text-xs sm:text-sm uppercase tracking-wider font-semibold rounded-xl shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition-all inline-flex items-center justify-center space-x-2"
                >
                  <span>{lang === "uz" ? "Katalogga o'tish" : "Перейти в каталог"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href={`https://t.me/${tgUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-[#D4AF37]/60 text-xs sm:text-sm text-[#F5ECD5] rounded-xl tracking-wider transition-all inline-flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>{lang === "uz" ? "Konsultatsiya" : "Консультация"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Scroll Indicator */}
          <div className="hero-fade-in pt-8 sm:pt-12 flex justify-center items-center">
            <a
              href="#brands"
              className="group inline-flex flex-col items-center space-y-2 text-[#A8A8A8] hover:text-[#D4AF37] transition-colors"
              aria-label="Pastga surish"
            >
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#888] group-hover:text-[#D4AF37] transition-colors">
                {lang === "uz" ? "Kashf etish uchun suring" : "Прокрутите для просмотра"}
              </span>
              <div className="w-5 h-8 rounded-full border border-white/20 group-hover:border-[#D4AF37] flex items-start justify-center p-1 transition-colors">
                <span className="w-1 h-2 rounded-full bg-[#D4AF37] animate-bounce" />
              </div>
            </a>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 01: PRESTIGE BRANDS (3D SHELF) ═══════════════════════ */}
        <BrandShelf brands={brandsList} brandCounts={brandCounts} totalProducts={productsData.length} lang={lang} />

        {/* ═══════════════════════ SECTION 02: 3-STEP EASY & SAFE PURCHASE ═══════════════════════ */}
        <section className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-[1400px] mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                Oson va Shaffof Xarid
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5ECD5] tracking-tight">
                {t.store.howItWorksTitle || "Qanday xarid qilinadi?"}
              </h2>
              <p className="text-sm sm:text-base text-[#A8A8A8]">
                {t.store.howItWorksSubtitle || "3 ta oson va ishonchli qadamda asl soat egasi bo'ling"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 space-y-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono text-xl font-bold">
                  01
                </div>
                <h3 className="font-serif text-2xl text-[#F5ECD5] font-normal">
                  {t.store.step1Title || "1. Modelni tanlang"}
                </h3>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  {t.store.step1Desc || "Katalogimizdan didingizga mos soatni tanlang yoki mutaxassisimizga yozing."}
                </p>
                <div className="pt-2 text-xs font-mono text-[#D4AF37]">
                  Onlayn katalog yoki shaxsiy maslahat
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 space-y-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono text-xl font-bold">
                  02
                </div>
                <h3 className="font-serif text-2xl text-[#F5ECD5] font-normal">
                  {t.store.step2Title || "2. Shaxsan tekshiring"}
                </h3>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  {t.store.step2Desc || "Salonimizda bilagingizga taqib ko'ring yoki bepul kuryer orqali qabul qiling."}
                </p>
                <div className="pt-2 text-xs font-mono text-[#D4AF37]">
                  Toshkentda sinab ko&apos;rib to&apos;lash
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 space-y-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono text-xl font-bold">
                  03
                </div>
                <h3 className="font-serif text-2xl text-[#F5ECD5] font-normal">
                  {t.store.step3Title || "3. Kafolat bilan oling"}
                </h3>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  {t.store.step3Desc || "24 oylik rasmiy kafolat taloni, zavod qutisi va hujjatlari bilan topshiriladi."}
                </p>
                <div className="pt-2 text-xs font-mono text-[#D4AF37]">
                  24 oylik servis xizmati
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 03: WHY VAQT SAROYI (GLASS GUARANTEES) ═══════════════════════ */}
        <section id="about" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-20 sm:py-28 my-6">
          <div className="max-w-[1400px] mx-auto space-y-16">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-white/10 pb-8 gap-6">
              <div>
                <span className="text-xs sm:text-[13px] font-mono tracking-[0.1em] text-[#D4AF37] uppercase font-semibold">
                  Halol va Shaffof Tamoyillar
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5ECD5] tracking-tight mt-1">
                  {t.store.whyUsTitle}
                </h2>
              </div>
              <div className="text-sm font-mono text-[#A8A8A8]">
                {storeData.since}–2026 · 17 {t.store.yearsOfExcellence}
              </div>
            </div>

            {/* 4 Guarantees Cards: Shaffof shisha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 space-y-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F5ECD5] font-normal">
                  {t.store.guaranteeOriginal}
                </h3>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  {t.store.guaranteeOriginalDesc}
                </p>
              </div>

              <div className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 space-y-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <RotateCcw className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F5ECD5] font-normal">
                  {t.store.guaranteeWarranty}
                </h3>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  {t.store.guaranteeWarrantyDesc}
                </p>
              </div>

              <div className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 space-y-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Package className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F5ECD5] font-normal">
                  {t.store.guaranteeBox}
                </h3>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  {t.store.guaranteeBoxDesc}
                </p>
              </div>

              <div className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 space-y-4 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Truck className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F5ECD5] font-normal">
                  {t.store.guaranteeDelivery}
                </h3>
                <p className="text-sm text-[#A8A8A8] leading-relaxed">
                  {t.store.guaranteeDeliveryDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 04: VIP CONCIERGE & CONSULTATION BANNER ═══════════════════════ */}
        <section className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-12">
          <div className="max-w-[1400px] mx-auto bg-black/40 backdrop-blur-lg border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center justify-center lg:justify-start space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Shaxsiy Xizmat & Tanlov</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#F5ECD5] font-normal leading-tight">
                {t.store.conciergeTitle || "O'zingizga mos soat tanlashda yordam kerakmi?"}
              </h2>
              <p className="text-sm sm:text-base text-[#D0C9B6] leading-relaxed">
                {t.store.conciergeDesc || "Tajribali ekspertimiz byudjetingiz, uslubingiz va talablaringizga mos modelni tanlab beradi. Telegram orqali 15 daqiqada javob beramiz."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
              <a
                href={`https://t.me/${tgUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[50px] px-8 py-3 bg-[#D4AF37] hover:bg-[#e4c254] text-[#090909] text-xs sm:text-sm uppercase tracking-wider font-semibold rounded-xl transition-all shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{t.store.conciergeBtn || "Mutaxassis bilan bog'lanish"}</span>
              </a>

              <a
                href={`tel:${telClean}`}
                className="w-full sm:w-auto min-h-[50px] px-6 py-3 bg-black/40 hover:bg-black/60 border border-white/20 text-[#F5ECD5] text-xs sm:text-sm rounded-xl transition-all inline-flex items-center justify-center space-x-2 font-mono"
              >
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>{storeData.phone}</span>
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 05: CURATED COLLECTION SHOWCASE (TRANSPARENT) ═══════════════════════ */}
        <section className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-20 sm:py-24 my-8">
          <div className="max-w-[1400px] mx-auto space-y-10">
            {/* Header + Tabs */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <span className="text-xs sm:text-[13px] font-mono uppercase tracking-[0.12em] text-[#D4AF37] font-semibold flex items-center space-x-2">
                  <Compass className="w-4 h-4" />
                  <span>Kolleksiya Durdonalari</span>
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5ECD5] tracking-tight">
                  Tavsiya Etilayotgan Asl Modellar
                </h2>
                <p className="text-sm text-[#A8A8A8] max-w-xl">
                  Har bir soat haqiqiyligi qat&apos;iy tekshirilgan. Zavod to&apos;plami va 24 oylik kafolat bilan beriladi.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "all"
                      ? "bg-[#F5ECD5] text-[#090909] font-semibold shadow-md"
                      : "text-[#A8A8A8] hover:text-white"
                  }`}
                >
                  {t.store.tabs?.all || "Barchasi"}
                </button>
                <button
                  onClick={() => setActiveTab("erkaklar")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "erkaklar"
                      ? "bg-[#F5ECD5] text-[#090909] font-semibold shadow-md"
                      : "text-[#A8A8A8] hover:text-white"
                  }`}
                >
                  {t.store.tabs?.men || "Erkaklar"}
                </button>
                <button
                  onClick={() => setActiveTab("ayollar")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "ayollar"
                      ? "bg-[#F5ECD5] text-[#090909] font-semibold shadow-md"
                      : "text-[#A8A8A8] hover:text-white"
                  }`}
                >
                  {t.store.tabs?.women || "Ayollar"}
                </button>
                <button
                  onClick={() => setActiveTab("avtomat")}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === "avtomat"
                      ? "bg-[#F5ECD5] text-[#090909] font-semibold shadow-md"
                      : "text-[#A8A8A8] hover:text-white"
                  }`}
                >
                  {t.store.tabs?.automatic || "Avtomat & Mexanik"}
                </button>
              </div>
            </div>

            {/* Watches Grid: Ultra-shaffof kartochkalar, orqa fondagi soat ko'rinib turadi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredWatches.map((watch) => {
                const isJustAdded = addedId === watch.id;
                return (
                  <div
                    key={watch.id}
                    className="group bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                  >
                    <div>
                      {/* Top Meta: Brand & Stock Badge */}
                      <div className="flex items-center justify-between text-xs font-mono mb-3">
                        <span className="text-[#D4AF37] uppercase font-semibold tracking-wider">
                          {watch.brand}
                        </span>
                        <span
                          className={`text-[11px] font-mono ${
                            watch.stock === "in_stock"
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {watch.stock === "in_stock" ? "Mavjud" : "Buyurtmaga"}
                        </span>
                      </div>

                      {/* Product Image */}
                      <Link
                        href={`/watch/${watch.slug}`}
                        className="relative block aspect-square w-full bg-black/25 rounded-xl overflow-hidden p-6 border border-white/5 my-3"
                      >
                        <Image
                          src={watch.images[0]}
                          alt={`${watch.brand} ${watch.model}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Title & Specs */}
                      <Link href={`/watch/${watch.slug}`}>
                        <h3 className="font-serif text-xl sm:text-2xl text-[#F5ECD5] group-hover:text-white transition-colors line-clamp-1 font-normal">
                          {watch.model}
                        </h3>
                      </Link>

                      <div className="flex items-center space-x-2 text-xs text-[#888] mt-1.5 font-mono">
                        <span>{watch.caseSize}</span>
                        <span>•</span>
                        <span>{t.movement[watch.movement]}</span>
                        <span>•</span>
                        <span>{watch.caseMaterial.split(" ")[0]}</span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-[11px] font-mono text-[#888] uppercase">
                          Narxi
                        </span>
                        <span className="font-mono text-lg sm:text-xl font-semibold text-[#F5ECD5]">
                          {watch.priceHidden ? t.product.askPrice : formatPrice(watch.price, lang)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleAddToCart(e, watch)}
                          className={`min-h-[42px] px-3.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-center space-x-1.5 ${
                            isJustAdded
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : "bg-white/5 hover:bg-white/10 border-white/15 text-[#EDEDED] hover:text-[#D4AF37] hover:border-[#D4AF37]"
                          }`}
                          title="Savatga qo'shish"
                        >
                          {isJustAdded ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Qo&apos;shildi</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span className="hidden sm:inline">Savat</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/watch/${watch.slug}`}
                          className="min-h-[42px] px-3.5 bg-[#F5ECD5] hover:bg-white text-[#090909] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>Ko&apos;rish</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Catalog Redirect */}
            <div className="text-center pt-4">
              <Link
                href="/catalog"
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 hover:border-[#D4AF37] text-xs sm:text-sm uppercase tracking-widest text-[#F5ECD5] rounded-xl transition-all"
              >
                <span>Barcha {productsData.length} ta soatni katalogda ko&apos;rish</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 06: INTERACTIVE FAQ (TRANSPARENT GLASS) ═══════════════════════ */}
        <section className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-20 sm:py-28 my-8">
          <div className="max-w-[1000px] mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                Savollaringiz bormi?
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5ECD5] tracking-tight">
                {t.store.faqTitle || "Ko'p beriladigan savollar"}
              </h2>
              <p className="text-sm sm:text-base text-[#A8A8A8]">
                {t.store.faqSubtitle || "Xarid va kafolat haqida bilishingiz kerak bo'lgan asosiy ma'lumotlar"}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-white/10 rounded-2xl bg-black/35 backdrop-blur-md overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 text-base sm:text-lg font-serif text-[#F5ECD5] hover:text-white transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#D4AF37] shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-[#A8A8A8] font-sans leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════ SECTION 07: BOUTIQUES & VISITS (TRANSPARENT GLASS) ═══════════════════════ */}
        <section id="locations" className="relative px-4 sm:px-8 md:px-12 lg:px-20 py-24 sm:py-32">
          <div className="max-w-[1400px] mx-auto">
            <div className="max-w-2xl mb-16 space-y-3">
              <span className="text-xs sm:text-[13px] font-mono tracking-[0.1em] text-[#D4AF37] uppercase font-semibold">
                Toshkentdagi salonlarimiz
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5ECD5] tracking-tight">
                {t.store.locationsTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#A8A8A8] font-normal leading-[1.7]">
                Do&apos;konlarimizga tashrif buyuring, soatlarni shaxsan ko&apos;rib,
                bilagingizga taqib sinab ko&apos;ring. Choy yoki qahva ustida suhbatlashamiz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {storeData.addresses.map((loc) => (
                <div
                  key={loc.address}
                  className="bg-black/35 backdrop-blur-md border border-white/15 hover:border-[#D4AF37]/50 rounded-2xl p-8 space-y-6 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                      {loc.type}
                    </span>
                    <span className="text-xs font-mono text-[#888]">Toshkent shahri</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl text-[#F5ECD5] font-normal">
                    {loc.address}
                  </h3>

                  <div className="space-y-3 text-sm text-[#A8A8A8] border-t border-white/10 pt-5">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      <span>{storeData.workingHours}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-[#D4AF37]" />
                      <span>{storeData.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <a
                      href={storeData.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#090909] bg-[#F5ECD5] hover:bg-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      <span>{t.store.openMap}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`tel:${telClean}`}
                      className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#F5ECD5] hover:text-[#D4AF37] border border-white/20 hover:border-[#D4AF37] px-4 py-2.5 rounded-lg transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Qo&apos;ng&apos;iroq qilish</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════ FLOATING CONTACT BUTTONS (MOBILE SAFE) ═══════════════════════ */}
        <div className="fixed bottom-6 right-4 sm:right-8 z-40 flex flex-col space-y-3">
          <a
            href={`https://t.me/${tgUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[50px] min-w-[50px] px-4 bg-[#0088cc] hover:bg-[#0099e6] text-white rounded-full shadow-[0_8px_24px_rgba(0,136,204,0.4)] flex items-center justify-center space-x-2 transition-all hover:scale-105"
            aria-label="Telegram orqali bog'lanish"
          >
            <Send className="w-4 h-4" />
            <span className="text-xs font-mono font-medium hidden sm:inline">Telegram</span>
          </a>

          <a
            href={`tel:${telClean}`}
            className="min-h-[50px] min-w-[50px] px-4 bg-[#D4AF37] hover:bg-[#e4c254] text-[#090909] rounded-full shadow-[0_8px_24px_rgba(212,175,55,0.4)] flex items-center justify-center space-x-2 transition-all hover:scale-105"
            aria-label="Qo'ng'iroq qilish"
          >
            <Phone className="w-4 h-4" />
            <span className="text-xs font-mono font-medium hidden sm:inline">Qo&apos;ng&apos;iroq</span>
          </a>
        </div>

        {/* ═══════════════════════ FOOTER ═══════════════════════ */}
        <Footer />
      </div>
    </>
  );
}
