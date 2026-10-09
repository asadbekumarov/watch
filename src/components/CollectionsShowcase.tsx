import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, ShieldCheck, Zap, Droplets, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export const CollectionsShowcase: React.FC = () => {
  const { t } = useLanguage();
  const collectionsData = t.collections.items;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const pinSection = pinSectionRef.current;
    if (!pinSection) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: Pinned cinematic scroll experience
      mm.add('(min-width: 1024px)', () => {
        triggerRef.current = ScrollTrigger.create({
          trigger: pinSection,
          start: 'top top',
          end: '+=1200',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const raw = self.progress * 4;
            const newIdx = Math.min(3, Math.max(0, Math.floor(raw === 4 ? 3 : raw)));

            if (newIdx !== activeIndexRef.current) {
              activeIndexRef.current = newIdx;
              setActiveIndex(newIdx);
            }
          },
        });
      });
    }, pinSection);

    return () => ctx.revert();
  }, []);

  const current = collectionsData[activeIndex] || collectionsData[0];

  // Dynamic Background Gradient mapping
  const bgGradients = [
    'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 50%, #000000 100%)',
    'radial-gradient(circle at 50% 50%, rgba(45, 27, 14, 0.85) 0%, rgba(20, 12, 6, 0.95) 50%, #000000 100%)',
    'radial-gradient(circle at 50% 50%, rgba(74, 4, 78, 0.75) 0%, rgba(30, 2, 35, 0.95) 50%, #000000 100%)',
    'radial-gradient(circle at 50% 50%, rgba(69, 10, 10, 0.8) 0%, rgba(30, 5, 5, 0.95) 50%, #000000 100%)',
  ];

  const handleSelectCollection = (idx: number) => {
    setActiveIndex(idx);
    activeIndexRef.current = idx;

    // Synchronize scroll position on desktop when tab is clicked
    if (triggerRef.current && window.innerWidth >= 1024) {
      const start = triggerRef.current.start;
      const end = triggerRef.current.end;
      const targetScroll = start + (idx / 3.2) * (end - start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="collections"
      ref={pinSectionRef}
      className="relative w-full min-h-screen lg:h-screen lg:overflow-hidden bg-black text-white select-none py-4 lg:py-0"
    >
      {/* Background Morph */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-none z-0"
        style={{
          background: bgGradients[activeIndex],
        }}
      />

      {/* Floating Particle Dust / Stars Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle star particles */}
          {[
            { cx: '12%', cy: '18%', r: '1.5', delay: '0s' },
            { cx: '25%', cy: '68%', r: '2', delay: '1s' },
            { cx: '42%', cy: '25%', r: '1', delay: '2s' },
            { cx: '68%', cy: '15%', r: '1.5', delay: '0.5s' },
            { cx: '85%', cy: '35%', r: '2.5', delay: '1.5s' },
            { cx: '78%', cy: '75%', r: '1', delay: '2.5s' },
            { cx: '18%', cy: '85%', r: '1.5', delay: '3s' },
            { cx: '55%', cy: '82%', r: '2', delay: '0.8s' },
            { cx: '92%', cy: '88%', r: '1.2', delay: '1.8s' },
            { cx: '35%', cy: '45%', r: '1', delay: '2.2s' },
          ].map((pt, i) => (
            <circle
              key={i}
              cx={pt.cx}
              cy={pt.cy}
              r={pt.r}
              fill={current.colorHex}
              className="animate-pulse"
              style={{
                animationDuration: `${3 + (i % 3)}s`,
                animationDelay: pt.delay,
                filter: `drop-shadow(0 0 6px ${current.colorHex})`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Ambient radial highlight behind watch */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[700px] h-[300px] sm:h-[500px] md:h-[700px] rounded-full pointer-events-none z-[2] transition-all duration-1000 ease-out filter blur-[100px] sm:blur-[140px]"
        style={{
          backgroundColor: current.glowHex,
        }}
      />

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-between py-6 sm:py-10 lg:py-20"
      >
        {/* Top Header / Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">{t.collections.badge}</span>
            <span className="text-white/20">/</span>
            <span
              className="text-xs uppercase tracking-[0.3em] font-semibold transition-colors duration-500"
              style={{ color: current.colorHex }}
            >
              {current.theme.toUpperCase()}
            </span>
          </div>

          {/* Quick Collection Switcher Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {collectionsData.map((col, idx) => (
              <button
                key={col.id}
                onClick={() => handleSelectCollection(idx)}
                aria-label={`Kolleksiya ${col.number}: ${col.name}`}
                className={`relative min-w-[38px] min-h-[38px] px-2.5 py-1 text-xs font-mono tracking-wider transition-all duration-300 rounded flex items-center justify-center ${
                  activeIndex === idx
                    ? 'text-white font-bold bg-white/10 border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                    : 'text-white/40 hover:text-white/80'
                }`}
                style={{
                  borderColor: activeIndex === idx ? current.colorHex : 'transparent',
                }}
              >
                {col.number}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Interactive Grid */}
        <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 items-center gap-4 sm:gap-6 my-auto pt-2 pb-2">
          
          {/* Left Column (Cols 1-4 on desktop) */}
          <div className="lg:col-span-4 z-20 flex flex-col justify-center order-2 lg:order-1 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${current.id}`}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="inline-flex items-center justify-center lg:justify-start space-x-3">
                  <span
                    className="font-mono text-xs sm:text-sm tracking-[0.3em] font-bold px-3 py-1 rounded-full border border-white/10 bg-white/5"
                    style={{ color: current.colorHex }}
                  >
                    {current.number} / 04
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Haute Horlogerie</span>
                </div>

                <h2 className="font-sans text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
                  {current.name}
                </h2>

                <p className="font-sans text-xs sm:text-base tracking-[0.15em] text-white/80 font-medium">
                  {current.headline}
                </p>

                <div className="pt-1 sm:pt-2">
                  <a
                    href="#contact"
                    className="luxury-btn !border-white/20 hover:!border-white group"
                  >
                    <span className="flex items-center space-x-2">
                      <span>{t.collections.reserve}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center Column: Massive Absolute Watch (Cols 5-8 on desktop) */}
          <div className="relative lg:col-span-4 h-[28vh] sm:h-[38vh] lg:h-[65vh] flex items-center justify-center order-1 lg:order-2 my-2 lg:my-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`watch-${current.id}`}
                initial={{ y: '100%', opacity: 0, scale: 0.88, rotate: -3 }}
                animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                exit={{ y: '-80%', opacity: 0, scale: 0.92, rotate: 3 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={current.image}
                  alt={`${current.name} — Shveytsariya yuqori sifatli mexanik soati`}
                  className="max-h-[90%] max-w-[90%] object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Description & 2x2 Specs Grid (Cols 9-12 on desktop) */}
          <div className="lg:col-span-4 z-20 flex flex-col justify-center order-3 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`right-${current.id}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 sm:space-y-5"
              >
                <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed border-l-2 border-white/20 pl-4 py-1">
                  {current.description}
                </p>

                {/* 2x2 Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                  <div className="luxury-glass p-2.5 sm:p-3 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-1.5 text-white/40 mb-1">
                      <Zap className="w-3 h-3" style={{ color: current.colorHex }} />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">{t.collections.movement}</span>
                    </div>
                    <p className="text-xs font-medium text-white/90 leading-tight">
                      {current.specs.movement}
                    </p>
                  </div>

                  <div className="luxury-glass p-3 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-1.5 text-white/40 mb-1">
                      <Compass className="w-3 h-3" style={{ color: current.colorHex }} />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">{t.collections.autonomy}</span>
                    </div>
                    <p className="text-xs font-medium text-white/90 leading-tight">
                      {current.specs.powerReserve}
                    </p>
                  </div>

                  <div className="luxury-glass p-3 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-1.5 text-white/40 mb-1">
                      <ShieldCheck className="w-3 h-3" style={{ color: current.colorHex }} />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">{t.collections.material}</span>
                    </div>
                    <p className="text-xs font-medium text-white/90 leading-tight">
                      {current.specs.caseMaterial}
                    </p>
                  </div>

                  <div className="luxury-glass p-3 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-1.5 text-white/40 mb-1">
                      <Droplets className="w-3 h-3" style={{ color: current.colorHex }} />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">{t.collections.resistance}</span>
                    </div>
                    <p className="text-xs font-medium text-white/90 leading-tight">
                      {current.specs.waterResistance}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Scroll Progress Bar */}
        <div className="w-full flex items-center justify-between pt-4 border-t border-white/10 text-[10px] tracking-widest text-white/40 uppercase">
          <span>{collectionsData[0]?.number} · {collectionsData[0]?.name}</span>
          <div className="flex-1 mx-6 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${((activeIndex + 1) / 4) * 100}%`,
                backgroundColor: current.colorHex,
              }}
            />
          </div>
          <span>{collectionsData[3]?.number} · {collectionsData[3]?.name}</span>
        </div>
      </div>
    </section>
  );
};
