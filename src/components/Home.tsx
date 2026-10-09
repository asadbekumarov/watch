import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const title3Ref = useRef<HTMLSpanElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro Stagger Animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, delay: 0.3 }
      )
        .fromTo(
          [title1Ref.current, title2Ref.current, title3Ref.current],
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.4, stagger: 0.18 },
          '-=0.8'
        )
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 1 },
          '-=0.4'
        );

      // ScrollTrigger Parallax Scale Down & Fade Out on scroll
      if (containerRef.current && contentRef.current) {
        gsap.to(contentRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
          scale: 0.85,
          opacity: 0,
          y: -50,
          ease: 'none',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScrollDown = () => {
    const target = document.getElementById('collections');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617] select-none"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/craftsmanship.png"
          className="w-full h-full object-cover scale-105 filter brightness-[0.7] contrast-125"
        >
          <source
            src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_bg_watch.mp4"
            type="video/mp4"
          />
        </video>
        {/* Gradients Overlay: oceanic dark blue vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/50 to-[#020617] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18)_0%,transparent_75%)] pointer-events-none" />
      </div>

      {/* Hero Foreground Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-6 pt-20 sm:pt-24 md:pt-16 text-center flex flex-col items-center justify-center will-change-transform"
      >
        {/* Subtitle */}
        <div
          ref={subtitleRef}
          className="inline-flex items-center space-x-3 mb-6 md:mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-90" />
          <p className="font-sans text-xs md:text-sm tracking-[0.4em] uppercase text-white/60 font-medium">
            {t.hero.subtitle}
          </p>
          <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-90" />
        </div>

        {/* Title: Balanced Luxury Typography */}
        <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white flex flex-col items-center leading-[1.05] sm:leading-[1] drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
          <span ref={title1Ref} className="block overflow-hidden pb-1">
            {t.hero.title1}
          </span>
          <span className="block overflow-hidden tracking-tight mt-1 sm:mt-2">
            <span
              ref={title2Ref}
              className="inline-block italic font-normal text-blue-300 mr-3 sm:mr-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              {t.hero.title2}
            </span>
            <span
              ref={title3Ref}
              className="inline-block tracking-widest text-white"
            >
              {t.hero.title3}
            </span>
          </span>
        </h1>

        {/* Tagline & Exploratory Callout */}
        <p className="mt-8 md:mt-10 max-w-xl text-xs md:text-base text-white/70 font-light tracking-widest leading-relaxed">
          {t.hero.tagline}
        </p>

        {/* CTA Button */}
        <div className="mt-8 md:mt-10 flex items-center space-x-4">
          <button
            onClick={handleScrollDown}
            className="luxury-btn !border-blue-500/40 hover:!border-blue-400 group"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>{t.hero.explore}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        ref={scrollIndicatorRef}
        onClick={handleScrollDown}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center cursor-pointer group"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 group-hover:text-blue-400 transition-colors duration-300 mb-2">
          {t.hero.scroll}
        </span>
        <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5 group-hover:border-blue-400/60 transition-colors duration-300">
          <div className="w-1 h-2 rounded-full bg-blue-400 animate-bounce shadow-[0_0_8px_#3B82F6]" />
        </div>
        <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors duration-300 mt-1 animate-pulse" />
      </div>
    </section>
  );
};
