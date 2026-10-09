import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const galleryData = t.gallery.items;
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      // Calculate total horizontal scroll distance
      const getScrollDistance = () => track.scrollWidth - window.innerWidth + 100;

      // Horizontal movement scrub animation
      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Velocity Skew Effect using gsap.quickSetter
      const skewSetter = gsap.quickSetter('.gallery-item', 'skewX', 'deg');
      const skewClamp = gsap.utils.clamp(-15, 15);
      let skewProxy = { skew: 0 };

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        onUpdate: (self) => {
          // Velocity is in pixels per second; map to degrees
          const vel = self.getVelocity();
          const targetSkew = skewClamp(vel / 280);

          gsap.to(skewProxy, {
            skew: targetSkew,
            duration: 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
            onUpdate: () => {
              skewSetter(skewProxy.skew);
            },
            onComplete: () => {
              // Smooth return to 0 when scrolling stops
              gsap.to(skewProxy, {
                skew: 0,
                duration: 0.5,
                ease: 'power3.out',
                onUpdate: () => skewSetter(skewProxy.skew),
              });
            },
          });
        },
      });

      return () => {
        horizontalTween.kill();
      };
    }, section);

    return () => ctx.revert();
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (modalIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modalIndex]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalIndex === null) return;
      if (e.key === 'Escape') setModalIndex(null);
      if (e.key === 'ArrowRight') {
        setModalIndex((prev) => (prev !== null ? (prev + 1) % galleryData.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setModalIndex((prev) => (prev !== null ? (prev - 1 + galleryData.length) % galleryData.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalIndex, galleryData.length]);

  const activeModalItem = modalIndex !== null ? galleryData[modalIndex] : null;

  return (
    <div id="gallery" ref={sectionRef} className="relative w-full h-screen bg-[#020617] overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full filter blur-[160px] pointer-events-none" />

      {/* Header bar pinned inside section */}
      <div className="absolute top-8 left-8 md:left-14 z-20 flex items-center space-x-4 pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#3B82F6]" />
        <h2 className="font-sans text-2xl md:text-3xl font-bold tracking-wider text-white">
          {t.gallery.headerTitle}
        </h2>
        <span className="text-white/40 text-xs tracking-[0.3em] uppercase hidden sm:inline">
          {t.gallery.headerSub}
        </span>
      </div>

      {/* Horizontal Scrolling Track */}
      <div
        ref={trackRef}
        className="flex items-center h-full pl-8 md:pl-16 pr-24 space-x-8 md:space-x-12 will-change-transform"
      >
        {/* Intro Card */}
        <div className="gallery-item flex-shrink-0 w-[280px] sm:w-[350px] md:w-[420px] flex flex-col justify-center space-y-5 pr-6 will-change-transform">
          <span className="text-xs uppercase tracking-[0.4em] text-blue-400 font-semibold font-mono">
            {t.gallery.introBadge}
          </span>
          <h3 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            {t.gallery.introTitle1} <br />
            <span className="italic font-normal text-blue-200">{t.gallery.introTitle2}</span>
          </h3>
          <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
            {t.gallery.introDesc}
          </p>
          <div className="flex items-center space-x-2 text-white/40 text-[11px] uppercase tracking-widest pt-2">
            <span>{t.gallery.scrollHint}</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
        </div>

        {/* Gallery Items */}
        {galleryData.map((item, index) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`${item.title} — ${item.category}. Ko‘rish uchun bosing`}
            onClick={() => setModalIndex(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setModalIndex(index);
              }
            }}
            className="gallery-item group relative flex-shrink-0 w-[78vw] sm:w-[50vw] md:w-[40vw] lg:w-[32vw] h-[65vh] rounded-2xl overflow-hidden cursor-pointer border border-blue-500/20 hover:border-blue-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-500 will-change-transform bg-slate-950/80 shadow-[0_15px_40px_rgba(2,6,23,0.9)]"
          >
            {/* Image */}
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover filter brightness-90 contrast-110 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/35 to-transparent opacity-85 group-hover:opacity-70 transition-opacity duration-500" />

            {/* Hover Expand Icon */}
            <div className="absolute top-5 right-5 w-10 h-10 rounded-full luxury-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>

            {/* Card Content Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end space-y-2">
              <span className="text-[10px] tracking-[0.3em] uppercase text-blue-400 font-medium">
                {item.category}
              </span>
              <h4 className="font-sans text-xl sm:text-2xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                {item.title}
              </h4>
              <p className="text-xs text-white/60 font-light line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal using Framer Motion AnimatePresence */}
      <AnimatePresence>
        {activeModalItem && modalIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-artwork-title"
            aria-describedby="modal-artwork-desc"
            data-lenis-prevent
            className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 md:p-12"
            onClick={() => setModalIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setModalIndex(null)}
              className="absolute top-6 right-6 z-50 p-3 rounded-full luxury-glass border border-blue-400/30 text-white/80 hover:text-white hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-300"
              aria-label="Modal oynani yopish"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalIndex((modalIndex - 1 + galleryData.length) % galleryData.length);
              }}
              className="absolute left-4 sm:left-8 z-50 p-3 sm:p-4 rounded-full luxury-glass border border-blue-400/30 text-white/80 hover:text-white hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-300"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalIndex((modalIndex + 1) % galleryData.length);
              }}
              className="absolute right-4 sm:right-8 z-50 p-3 sm:p-4 rounded-full luxury-glass border border-blue-400/30 text-white/80 hover:text-white hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-300"
              aria-label="Keyingi rasm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Modal Dialog Content */}
            <motion.div
              key={activeModalItem.id}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center text-center"
            >
              {/* Borderless Image Display */}
              <div className="relative w-full max-h-[68vh] flex items-center justify-center overflow-hidden rounded-lg shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
                <img
                  src={activeModalItem.image}
                  alt={activeModalItem.title}
                  className="max-h-[68vh] w-auto object-contain rounded-lg filter drop-shadow-2xl"
                />
              </div>

              {/* Descriptive text beneath it */}
              <div className="mt-6 max-w-2xl px-4 space-y-2">
                <span className="text-[11px] tracking-[0.35em] uppercase text-blue-400 font-mono">
                  {activeModalItem.category} · {modalIndex + 1} {t.gallery.of} {galleryData.length}
                </span>
                <h3 id="modal-artwork-title" className="font-sans text-2xl sm:text-3xl font-bold text-white">
                  {activeModalItem.title}
                </h3>
                <p id="modal-artwork-desc" className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                  {activeModalItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
