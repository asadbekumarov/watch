import React, { useState, useEffect } from 'react';
import { Menu, X, Clock, Compass, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../locales/translations';

interface NavbarProps {
  onNavigate?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { label: t.nav.collections, id: 'collections' },
    { label: t.nav.heritage, id: 'heritage' },
    { label: t.nav.craftsmanship, id: 'craftsmanship' },
    { label: t.nav.gallery, id: 'gallery' },
    { label: t.nav.boutiques, id: 'contact' },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'py-3.5 bg-[#020617]/85 backdrop-blur-xl border-b border-blue-500/20 shadow-[0_12px_40px_rgba(2,6,23,0.9),0_1px_0_rgba(59,130,246,0.2)]'
            : 'py-6 bg-gradient-to-b from-[#020617]/90 via-[#020617]/40 to-transparent border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Logo & Monogram */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="group flex items-center space-x-3.5 focus:outline-none text-left"
            aria-label="Maison Horlogerie Home"
          >
            {/* Elegant Monogram Emblem */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full border border-blue-400/40 bg-gradient-to-br from-blue-500/15 to-transparent group-hover:border-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-500">
              <span className="font-sans text-sm font-bold text-blue-300 group-hover:scale-110 transition-transform">
                M
              </span>
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#3B82F6]" />
            </div>

            <div className="flex flex-col">
              <span className="font-sans text-lg md:text-xl font-bold tracking-[0.25em] text-white group-hover:text-blue-200 transition-colors duration-300">
                MAISON
              </span>
              <span className="text-[8px] md:text-[9px] tracking-[0.45em] uppercase text-blue-200/60 group-hover:text-blue-200/90 transition-colors">
                {t.nav.brandSub}
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-10" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className="group relative py-1 text-[11px] lg:text-xs font-medium tracking-[0.25em] uppercase text-white/70 hover:text-white transition-colors duration-300"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* Language Switcher, CTA & Mobile Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Elegant Language Selector */}
            <div className="flex items-center bg-blue-950/40 border border-blue-400/20 hover:border-blue-400/40 rounded-full p-1 backdrop-blur-md transition-colors">
              <Globe className="w-3 h-3 text-blue-400/80 ml-1.5 mr-1 hidden sm:inline" />
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-1 text-[10px] font-mono tracking-widest rounded-full transition-all duration-300 uppercase ${
                    language === l.code
                      ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                      : 'text-white/60 hover:text-white'
                  }`}
                  aria-label={`Switch to ${l.code} language`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* VIP Private Viewing Button */}
            <button
              onClick={() => handleLinkClick('contact')}
              className="hidden lg:inline-flex items-center space-x-2 text-[10px] font-semibold tracking-[0.22em] uppercase px-5 py-2.5 rounded-full border border-blue-400/40 bg-gradient-to-r from-blue-600/20 to-blue-500/10 hover:from-blue-600/30 hover:to-blue-500/20 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.35)] text-blue-200 transition-all duration-300"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.nav.privateViewing}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileMenuOpen ? 'Navigatsiya menyusini yopish' : 'Navigatsiya menyusini ochish'}
              className="md:hidden text-white/80 hover:text-blue-400 p-2 rounded-lg bg-blue-950/40 border border-blue-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobil navigatsiya menyusi"
        className={`fixed inset-0 z-40 bg-[#020617]/95 backdrop-blur-2xl transition-all duration-500 md:hidden flex flex-col justify-center px-8 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col space-y-5 text-center max-w-sm mx-auto w-full">
          <div className="inline-flex items-center justify-center space-x-2 mb-2 text-blue-400">
            <Clock className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-white/60">
              {t.nav.swissHaute}
            </span>
          </div>

          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-center space-x-2 pb-4 border-b border-blue-400/20">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 uppercase ${
                  language === l.code
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                    : 'bg-white/5 text-white/70 border border-white/10'
                }`}
              >
                {l.code === 'uz' ? "O'zbekcha" : l.code === 'en' ? 'English' : 'Русский'}
              </button>
            ))}
          </div>

          {navLinks.map((link, idx) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className="font-sans text-2xl font-bold tracking-widest text-white/90 hover:text-blue-400 transition-colors duration-300 py-2 border-b border-white/10"
              style={{ transitionDelay: `${idx * 40}ms` }}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-4">
            <button
              onClick={() => handleLinkClick('contact')}
              className="luxury-btn w-full !border-blue-500/40 !text-blue-300 hover:!border-white"
            >
              {t.nav.bookConsultation}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

