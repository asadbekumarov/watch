"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { productsData, Product } from "@/data/products";
import { formatPrice } from "@/lib/formatPrice";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

interface BrandShelfProps {
  brands: string[];
  brandCounts: Record<string, number>;
  totalProducts: number;
  lang?: string;
}

export default function BrandShelf({
  brands,
  brandCounts,
  totalProducts,
  lang = "uz",
}: BrandShelfProps) {
  // Asosiy konteynerlar
  const sectionRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Har bir brend uchun namuna mahsulot
  const brandProducts = useMemo(() => {
    const map: Record<string, Product | undefined> = {};
    for (const b of brands) {
      map[b] =
        productsData.find((p) => p.brand.toLowerCase() === b.toLowerCase() && p.featured) ||
        productsData.find((p) => p.brand.toLowerCase() === b.toLowerCase()) ||
        productsData[0];
    }
    return map;
  }, [brands]);

  // Fizika holatlari (rAF loop ichida)
  const currentOffset = useRef(0);
  const targetOffset = useRef(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Drag holatlari
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const lastDragX = useRef(0);
  const velocity = useRef(0);
  const lastTime = useRef(0);

  // O'lchamlar
  const CARD_SPACING = 220; // kartalar orasidagi masofa (kattalashtirilgan)
  const totalCards = brands.length;
  const maxScrollOffset = (totalCards - 1) * CARD_SPACING;

  // Indeks bo'yicha offset
  const getOffsetForIndex = useCallback((idx: number) => {
    return -idx * CARD_SPACING;
  }, [CARD_SPACING]);

  // Muayyan indeksga o'tish (Scroll bilan birga)
  const goTo = useCallback(
    (idx: number, smoothScroll = true) => {
      const clamped = Math.max(0, Math.min(totalCards - 1, idx));
      targetOffset.current = getOffsetForIndex(clamped);
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);

      // Agar section ichida bo'lsa, tegishli vertikal scroll joyiga silliq siljitish
      if (smoothScroll && sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const sectionTop = scrollTop + rect.top;
        const scrollDistance = rect.height - window.innerHeight;
        if (scrollDistance > 0) {
          const targetY = sectionTop + (clamped / (totalCards - 1)) * scrollDistance;
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      }
    },
    [totalCards, getOffsetForIndex]
  );

  // ─── 1. VERTIKAL SAHIFA SCROLLINI SHELF ANIMATSIYASIGA BOG'LASH (PINNED SCROLL) ───
  useEffect(() => {
    const handleScroll = () => {
      if (isDragging.current || !sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) return;

      // Section ko'rinishida bo'lganda progressni hisoblaymiz
      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));

      // Scroll bo'yicha maqsadli gorizontal ofset (o'ngdan chapga qarab)
      targetOffset.current = -progress * maxScrollOffset;

      const calculatedIndex = Math.min(
        totalCards - 1,
        Math.max(0, Math.round(progress * (totalCards - 1)))
      );

      if (activeIndexRef.current !== calculatedIndex) {
        activeIndexRef.current = calculatedIndex;
        setActiveIndex(calculatedIndex);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Dastlabki tekshiruv

    return () => window.removeEventListener("scroll", handleScroll);
  }, [maxScrollOffset, totalCards]);

  // ─── 2. 60FPS SILLIQ rAF LOOP (Spring Physics & 3D VHS Vitrina) ───
  useEffect(() => {
    let animId: number;
    let prevTimestamp = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - prevTimestamp) / 1000, 0.05);
      prevTimestamp = now;

      // Silliq spring interpolatsiyasi
      const factor = 1 - Math.exp(-14 * dt);
      currentOffset.current += (targetOffset.current - currentOffset.current) * factor;

      // Rail harakati
      if (railRef.current) {
        railRef.current.style.transform = `translate3d(${currentOffset.current}px, 0, 0)`;
      }

      // Har bir kartaning 3D holati (Leon Vasari VHS animatsiyasi)
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        // Kartaning vitrina markaziga nisbatan masofasi
        const itemCenter = i * CARD_SPACING + currentOffset.current;
        const normDist = itemCenter / CARD_SPACING;

        // Markazga yaqinlik (1 = markazda, 0 = uzoqda)
        const closeness = Math.max(0, 1 - Math.abs(normDist));

        // 3D parametrlar
        // 1. Z o'qi bo'yicha oldinga tortilish
        const z = closeness * 65 - 15;

        // 2. Biroz yuqoriga ko'tarilish
        const y = -closeness * 28;

        // 3. Qirralarning 3D burilishi
        const rotY = (1 - closeness) * Math.sign(normDist) * -36 - closeness * 4;
        const rotZ = closeness * -1.5;
        const scale = 0.88 + closeness * 0.16;

        card.style.transform = `translate3d(0, ${y}px, ${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
        card.style.zIndex = Math.round(closeness * 100).toString();

        // Qirra (spine) vs Old yuzi (front cover) almashinuvi
        const spineEl = card.querySelector(".shelf-spine") as HTMLElement | null;
        const coverEl = card.querySelector(".shelf-cover") as HTMLElement | null;

        if (spineEl && coverEl) {
          coverEl.style.opacity = Math.min(1, Math.max(0, (closeness - 0.25) * 2)).toString();
          spineEl.style.opacity = Math.min(1, Math.max(0, (0.75 - closeness) * 2)).toString();
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [CARD_SPACING]);

  // ─── 3. DRAG & SWIPE QO'LLAB-QUVVATLASh ───
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;

      isDragging.current = true;
      dragStartX.current = e.clientX;
      dragStartOffset.current = targetOffset.current;
      lastDragX.current = e.clientX;
      lastTime.current = performance.now();
      velocity.current = 0;
      rail.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStartX.current;
      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        velocity.current = ((e.clientX - lastDragX.current) / dt) * 1000;
      }
      lastDragX.current = e.clientX;
      lastTime.current = now;

      targetOffset.current = Math.max(-maxScrollOffset, Math.min(0, dragStartOffset.current + dx));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      try {
        rail.releasePointerCapture(e.pointerId);
      } catch {}

      // Inertia va snap
      targetOffset.current += velocity.current * 0.15;
      const nearest = Math.round(-targetOffset.current / CARD_SPACING);
      goTo(nearest, true);
    };

    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onPointerMove);
    rail.addEventListener("pointerup", onPointerUp);
    rail.addEventListener("pointercancel", onPointerUp);

    return () => {
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onPointerMove);
      rail.removeEventListener("pointerup", onPointerUp);
      rail.removeEventListener("pointercancel", onPointerUp);
    };
  }, [maxScrollOffset, CARD_SPACING, goTo]);

  const currentBrand = brands[activeIndex] || brands[0];
  const currentProduct = brandProducts[currentBrand];

  return (
    /* 
      Tashqi konteyner: 280vh balandlikda bo'ladi.
      Foydalanuvchi scroll qilganda sahifa shu balandlik bo'ylab pastga tushadi,
      ichki vitrina esa STICKY TOP-0 holatida turadi va brendlar o'ngdan chapga aylanadi.
      Tugagach esa keyingi sectionga silliq o'tib ketadi!
    */
    <div
      ref={sectionRef}
      id="brands"
      className="relative scroll-mt-0"
      style={{
        height: "280vh", // Scroll masofasi (foydalanuvchi scroll qilishdan to'xtamasa to'liq aylanib chiqadi)
      }}
    >
      {/* ─── STICKY EKRAN ICHIDAGI 3D VITRINA ─── */}
      <section className="sticky top-0 h-screen w-full flex flex-col justify-between py-8 sm:py-12 select-none overflow-hidden z-20">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 md:px-12 flex-1 flex flex-col justify-between">
          
          {/* Section Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                  Prestige Maisons · 3D Shelf
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#F5ECD5] font-normal mt-0.5 tracking-tight">
                {lang === "uz" ? "Biz taqdim etadigan rasmiy brendlar" : "Официальные бренды"}
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/catalog"
                className="hidden sm:inline-flex items-center space-x-2 text-xs font-mono text-[#D4AF37] hover:text-[#f5ecd5] transition-colors tracking-wider"
              >
                <span>{lang === "uz" ? `Barcha modellar (${totalProducts})` : `Все модели (${totalProducts})`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* O'q tugmalari */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => goTo(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  className="w-8 h-8 rounded-full border border-white/10 hover:border-[#D4AF37] bg-white/[0.03] hover:bg-[#D4AF37]/10 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#F5ECD5] transition-all"
                  aria-label="Oldingi brend"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goTo(activeIndex + 1)}
                  disabled={activeIndex === brands.length - 1}
                  className="w-8 h-8 rounded-full border border-white/10 hover:border-[#D4AF37] bg-white/[0.03] hover:bg-[#D4AF37]/10 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#F5ECD5] transition-all"
                  aria-label="Keyingi brend"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── 3D JAVON SAHNO (Kattalashtirilgan o'lchamda) ─── */}
          <div
            className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center my-auto cursor-grab active:cursor-grabbing"
            style={{
              perspective: 1400,
              perspectiveOrigin: "50% 45%",
            }}
          >
            {/* Javon orqasidagi nozik nur */}
            <div
              className="absolute w-[600px] h-[280px] rounded-full pointer-events-none blur-[100px]"
              style={{
                background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
                bottom: "40px",
              }}
            />

            {/* Silliq suriluvchi rels */}
            <div
              ref={railRef}
              className="absolute flex items-end h-[440px]"
              style={{
                left: "50%",
                bottom: "35px",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {brands.map((brand, i) => {
                const product = brandProducts[brand];

                return (
                  <div
                    key={brand}
                    ref={(el) => {
                      cardsRef.current[i] = el;
                    }}
                    onClick={() => goTo(i)}
                    className="absolute cursor-pointer select-none"
                    style={{
                      left: `${i * CARD_SPACING}px`,
                      marginLeft: "-155px", // 310px kenglikdagi kartaning markazlashishi
                      bottom: 0,
                      width: "310px",
                      height: "430px",
                      transformStyle: "preserve-3d",
                      transformOrigin: "center bottom",
                      willChange: "transform, z-index",
                    }}
                  >
                    {/* 1. FRONT COVER (Aktiv 3D Vitrina - Kattalashtirilgan) */}
                    <div
                      className="shelf-cover absolute inset-0 rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.2)]"
                      style={{
                        background:
                          "linear-gradient(155deg, rgba(24,21,16,0.97) 0%, rgba(10,9,7,0.98) 60%, rgba(16,14,11,0.98) 100%)",
                        backfaceVisibility: "hidden",
                        transition: "box-shadow 0.4s ease",
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                      <div className="relative w-full h-full p-5 sm:p-6 flex flex-col justify-between z-10">
                        {/* Brend nomi */}
                        <div className="text-center pt-1">
                          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
                            Haute Horlogerie
                          </span>
                          <h4 className="font-serif text-2xl sm:text-3xl text-[#F5ECD5] font-normal tracking-wide mt-1">
                            {brand}
                          </h4>
                        </div>

                        {/* Soat surati (Katta va tiniq) */}
                        <div className="relative w-full h-[200px] my-2 flex items-center justify-center">
                          {product?.images?.[0] ? (
                            <div className="relative w-full h-full transition-transform duration-500 hover:scale-105">
                              <Image
                                src={product.images[0]}
                                alt={`${brand} - ${product.model}`}
                                fill
                                sizes="310px"
                                className="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.75)]"
                                priority={i === 0}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-[#D4AF37]">
                              <Sparkles className="w-8 h-8 opacity-40" />
                            </div>
                          )}
                        </div>

                        {/* Model & Xarid tugmasi */}
                        <div className="text-center space-y-2 pb-1">
                          <div className="text-[13px] font-serif text-[#E0D8C3] line-clamp-1">
                            {product?.model || `${brandCounts[brand]} ta model`}
                          </div>
                          {product?.price && (
                            <div className="text-sm sm:text-base font-mono text-[#D4AF37] font-semibold">
                              {formatPrice(product.price)}
                            </div>
                          )}
                          <div className="pt-1.5">
                            <Link
                              href={`/catalog?brand=${encodeURIComponent(brand)}`}
                              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#D4AF37] hover:bg-[#e4c254] text-[#090909] text-xs font-mono uppercase font-bold tracking-wider rounded-lg transition-all shadow-[0_6px_20px_rgba(212,175,55,0.35)]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{lang === "uz" ? "Katalog" : "Каталог"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. SHELF SPINE (Yon qirra - Kattalashtirilgan) */}
                    <div
                      className="shelf-spine absolute inset-y-0 left-1/2 -ml-[38px] w-[76px] rounded-xl overflow-hidden border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.8)] pointer-events-none"
                      style={{
                        background: "linear-gradient(180deg, #1f1d19 0%, #0d0c0a 50%, #171512 100%)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <div className="absolute inset-y-0 left-0 w-[2px] bg-white/10" />
                      <div className="absolute inset-y-0 right-0 w-[2px] bg-black/40" />

                      <div className="relative w-full h-full py-5 flex flex-col items-center justify-between">
                        <div className="flex flex-col items-center space-y-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#D4AF37]/70" />
                          <span className="text-[8px] font-mono uppercase tracking-widest text-[#888]">
                            CH
                          </span>
                        </div>

                        <div
                          className="flex-1 flex items-center justify-center my-3"
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                          }}
                        >
                          <span className="font-serif text-[15px] tracking-[0.22em] uppercase text-[#D8D0BA] whitespace-nowrap">
                            {brand}
                          </span>
                        </div>

                        <div className="flex flex-col items-center space-y-1.5">
                          <span className="text-[10px] font-mono text-[#D4AF37] font-semibold">
                            {brandCounts[brand]}
                          </span>
                          <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center text-[8px] font-mono text-[#777]">
                            ★
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vitrina pastidagi toza bo'shliq */}
          <div className="h-4" />
        </div>
      </section>
    </div>
  );
}
