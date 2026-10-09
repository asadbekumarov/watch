import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export const Craftsmanship: React.FC = () => {
  const { t } = useLanguage();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const foregroundTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Background image scaling up and moving y: "20%" via GSAP scrub
      if (bgImageRef.current && wrapperRef.current) {
        gsap.fromTo(
          bgImageRef.current,
          { scale: 1, yPercent: 0 },
          {
            scale: 1.35,
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        );
      }

      // 2. Foreground text fade in and out via ScrollTrigger scrub:
      // Fades in at start: "top 60%" and fades out at start: "bottom 80%"
      if (foregroundTextRef.current && wrapperRef.current) {
        gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: true,
          },
        })
          .fromTo(
            foregroundTextRef.current,
            { opacity: 0, y: 60, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }
          )
          .to(foregroundTextRef.current, {
            opacity: 0,
            y: -50,
            scale: 1.05,
            duration: 1,
            ease: 'power2.in',
          });
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="craftsmanship"
      ref={wrapperRef}
      className="relative w-full h-[150vh] bg-black text-white select-none"
    >
      {/* Sticky Top Container */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
      >
        {/* Background Macro Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            ref={bgImageRef}
            src="/images/craftsmanship.png"
            alt="Haute Horlogerie Movement Gears"
            className="w-full h-full object-cover filter brightness-[0.55] contrast-125 will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
        </div>

        {/* Rotating Dashed Border Clockwork Simulation Elements */}
        <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
          {/* Outer gear ring */}
          <div className="w-[320px] sm:w-[500px] md:w-[720px] h-[320px] sm:h-[500px] md:h-[720px] rounded-full border border-dashed border-blue-400/25 animate-[spin_120s_linear_infinite]" />

          {/* Middle counter-rotating index ring */}
          <div className="absolute w-[240px] sm:w-[380px] md:w-[540px] h-[240px] sm:h-[380px] md:h-[540px] rounded-full border border-dashed border-blue-500/10 animate-[spin_80s_linear_infinite_reverse]" />

          {/* Compass / Astrolabe tick marks */}
          <div className="absolute w-[180px] sm:w-[280px] md:w-[400px] h-[180px] sm:h-[280px] md:h-[400px] rounded-full border border-white/5 animate-[spin_200s_linear_infinite]" />
        </div>

        {/* Center Foreground Content */}
        <div
          ref={foregroundTextRef}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center will-change-transform"
        >
          {/* Eyebrow Label */}
          <div className="inline-flex items-center space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-blue-400/60" />
            <span className="text-xs uppercase tracking-[0.4em] text-blue-400 font-bold">
              {t.craftsmanship.eyebrow}
            </span>
            <span className="w-8 h-[1px] bg-blue-400/60" />
          </div>

          {/* Main Title: "Unseen Precision" */}
          <h2 className="font-sans text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-tight">
            {t.craftsmanship.titleLine1} <br />
            <span className="italic font-normal text-blue-200">{t.craftsmanship.titleLine2}</span>
          </h2>

          <p className="mt-8 max-w-xl text-xs sm:text-sm md:text-base text-white/70 font-light tracking-widest leading-relaxed">
            {t.craftsmanship.description}
          </p>

          {/* Technical Horological Metrics */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-white/50 text-[11px] uppercase tracking-[0.25em]">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3B82F6]" />
              <span>{t.craftsmanship.metric1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3B82F6]" />
              <span>{t.craftsmanship.metric2}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3B82F6]" />
              <span>{t.craftsmanship.metric3}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
