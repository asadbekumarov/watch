import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Feather, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export const Heritage: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraph1Ref = useRef<HTMLParagraphElement>(null);
  const paragraph2Ref = useRef<HTMLParagraphElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Clip-path mask reveal for the image container
      if (imageContainerRef.current) {
        gsap.fromTo(
          imageContainerRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.5,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              end: 'top 20%',
              scrub: false,
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 2. Parallax y: "20%" on the image during scroll
      if (imageRef.current && sectionRef.current) {
        gsap.fromTo(
          imageRef.current,
          { yPercent: -15, scale: 1.15 },
          {
            yPercent: 15,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      // 3. Staggered GSAP reveal for all text elements
      const textElements = [
        eyebrowRef.current,
        headingRef.current,
        paragraph1Ref.current,
        paragraph2Ref.current,
        badgesRef.current,
      ].filter(Boolean);

      gsap.fromTo(
        textElements,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textContainerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="heritage"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#020617] text-white py-28 md:py-36 px-6 md:px-12 flex items-center justify-center overflow-hidden border-t border-b border-blue-500/10"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: 50vh-80vh tall container with inset clip-path mask reveal */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            ref={imageContainerRef}
            className="relative w-full max-w-lg h-[55vh] sm:h-[65vh] lg:h-[75vh] rounded-2xl overflow-hidden border border-blue-500/20 shadow-[0_20px_50px_rgba(2,6,23,0.9)] will-change-transform"
          >
            <img
              ref={imageRef}
              src="/images/heritage.png"
              alt="Maison Horlogerie 1884 Atelier"
              className="w-full h-full object-cover filter grayscale contrast-125 mix-blend-luminosity will-change-transform"
            />
            {/* Subtle Vignette & luxury gradient on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-[#020617]/40 pointer-events-none" />
            <div className="absolute inset-0 border border-blue-500/20 rounded-2xl pointer-events-none" />

            {/* Corner Badge */}
            <div className="absolute bottom-6 left-6 luxury-glass px-4 py-2 rounded-full border border-blue-400/30 bg-blue-950/50">
              <span className="text-[10px] tracking-[0.3em] uppercase text-blue-300 font-semibold font-mono">
                {t.heritage.locationBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Text & Legacy Story */}
        <div
          ref={textContainerRef}
          className="lg:col-span-6 flex flex-col justify-center space-y-7 lg:pl-6"
        >
          {/* Eyebrow */}
          <div>
            <span
              ref={eyebrowRef}
              className="inline-block text-blue-400 font-bold text-xs sm:text-sm tracking-[0.35em] uppercase"
            >
              {t.heritage.eyebrow}
            </span>
          </div>

          {/* Heading */}
          <h2
            ref={headingRef}
            className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]"
          >
            {t.heritage.titleLine1} <br />
            <span className="italic font-normal text-blue-200">{t.heritage.titleLine2}</span>
          </h2>

          {/* Paragraphs */}
          <p
            ref={paragraph1Ref}
            className="text-white/70 text-sm sm:text-base font-light leading-relaxed tracking-wide"
          >
            {t.heritage.p1}
          </p>

          <p
            ref={paragraph2Ref}
            className="text-white/60 text-sm sm:text-base font-light leading-relaxed tracking-wide"
          >
            {t.heritage.p2}
          </p>

          {/* Luxury Milestones / Badges */}
          <div
            ref={badgesRef}
            className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-4 border-t border-blue-500/20"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 mb-1">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-sans text-base sm:text-xl font-bold text-white">140+</span>
              </div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 leading-tight">{t.heritage.stat1Label}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 mb-1">
                <Feather className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-sans text-base sm:text-xl font-bold text-white">100%</span>
              </div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 leading-tight">{t.heritage.stat2Label}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-sans text-base sm:text-xl font-bold text-white">COSC</span>
              </div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 leading-tight">{t.heritage.stat3Label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
