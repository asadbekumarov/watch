import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  User,
  Calendar,
  Compass,
  ArrowRight,
  Gem,
  Award,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CURRENT_YEAR = new Date().getFullYear();

interface SalonMeta {
  cityKey: string;
  cityName: string;
  flag: string;
  timeZone: string;
  badge: { uz: string; en: string; ru: string };
  address: string;
  tel: string;
}

const SALONS: SalonMeta[] = [
  {
    cityKey: 'Geneva',
    cityName: 'Genève',
    flag: '🇨🇭',
    timeZone: 'Europe/Zurich',
    badge: { uz: 'Bosh Manufaktura', en: 'Global Headquarters', ru: 'Главная мануфактура' },
    address: 'Rue du Rhône 42, 1204 Genève',
    tel: '+41 22 819 0000',
  },
  {
    cityKey: 'Paris',
    cityName: 'Paris',
    flag: '🇫🇷',
    timeZone: 'Europe/Paris',
    badge: { uz: 'Tarixiy Salon', en: 'Historic Salon', ru: 'Исторический салон' },
    address: 'Place Vendôme 18, 75001 Paris',
    tel: '+33 1 42 68 0000',
  },
  {
    cityKey: 'New York',
    cityName: 'New York',
    flag: '🇺🇸',
    timeZone: 'America/New_York',
    badge: { uz: 'Beshinchi Avenyu', en: 'Fifth Avenue Residence', ru: 'Резиденция на 5-й авеню' },
    address: '745 Fifth Avenue, New York, NY 10151',
    tel: '+1 212 750 0000',
  },
  {
    cityKey: 'Tokyo',
    cityName: 'Tokyo',
    flag: '🇯🇵',
    timeZone: 'Asia/Tokyo',
    badge: { uz: 'Ginza Butigi', en: 'Ginza Atelier', ru: 'Ателье Гинза' },
    address: '6-10-1 Ginza, Chuo-ku, Tokyo 104-0061',
    tel: '+81 3 3572 0000',
  },
];

const TIMEPIECES = [
  { id: 'Royal Ocean', name: 'Royal Ocean', color: '#3B82F6', tag: 'Aura Calibre 9000' },
  { id: 'Sahara Heritage', name: 'Sahara Heritage', color: '#D4A017', tag: 'Elixir Tourbillon' },
  { id: 'Rose Elegance', name: 'Rose Elegance', color: '#EC4899', tag: 'Rose Moonphase' },
  { id: 'Noir Crimson', name: 'Noir Crimson', color: '#EF4444', tag: 'Crimson Titanium' },
  { id: 'Bespoke Commission', name: 'Bespoke Commission', color: '#38BDF8', tag: 'Piece Unique' },
];

const UI_STRINGS = {
  uz: {
    eyebrowTag: 'MAISON CONCIERGE & ATELIER PRIVÉ',
    headlineMain: 'Eksklyuziv Qabul &',
    headlineSub: 'Shaxsiy Buyurtma',
    tagline: 'Jeneva va jahon poytaxtlaridagi shaxsiy salonlarimizda usta soatsozlarimiz bilan uchrashuv belgilang.',
    worldClocksTitle: 'Xalqaro Salonlar & Vaqt Mintaqalari',
    worldClocksSub: 'Jonli mahalliylashtirilgan vaqt',
    selectSalon: 'Ushbu Butikni Tanlash',
    selectedBadge: 'Tanlandi',
    openStatus: 'Qabul Ochiq',
    dossierTitle: 'Maxsus Qabul Dossiyesi',
    dossierSubtitle: 'Shaxsiy va qat‘iy maxfiy konsultatsiya',
    dossierCode: 'REF: MH-CH/2026',
    formatTitle: 'Qabul Formati',
    formats: [
      { id: 'salon', label: 'Salon Privé', desc: 'Butikda yakkama-yakka' },
      { id: 'master', label: 'Usta Konsultatsiyasi', desc: 'Bosh soatsoz bilan' },
      { id: 'virtual', label: 'Virtual Konsyerj', desc: 'Maxfiy video uchrashuv' },
    ],
    timepieceLabel: 'Qiziqtirgan Soat Modeli',
    clientPhoneLabel: 'Telefon / WhatsApp *',
    preferredDateLabel: 'Qulay Sana & Vaqt oralig‘i',
    datePlaceholder: 'Masalan: Kelgusi hafta, Peshindan keyin',
    submitButton: 'Qabulni Tasdiqlash',
    submitting: 'Konsyerjga Yuborilmoqda...',
    invitationReady: 'Shaxsiy Taklifnoma Tasdiqlandi',
    invitationNote: 'Hurmatli mehmon, so‘rovingiz Jeneva markaziy konsyerj xizmatiga muvaffaqiyatli topshirildi.',
    referenceNumber: 'Maxsus Ro‘yxat Kodingiz',
    selectedLocation: 'Tanlangan Manzil',
    selectedTimepiece: 'Tanlangan Model',
    anotherBooking: 'Yangi Konsultatsiya Band Qilish',
    guaranteeTitle: 'Shveytsariya Ishonch Mezonlari',
    certifications: [
      { title: 'COSC Xronometr', desc: 'Rasmiy Shveytsariya sertifikati' },
      { title: 'Poinçon de Genève', desc: 'Jeneva shahar oliy tamg‘asi' },
      { title: '5 Yillik Xalqaro Kafolat', desc: 'Global bepul texnik xizmat' },
    ],
    footerHotline: 'Jeneva Konsyerj Qaynoq Liniyasi',
    footerHours: 'Dushanba – Shanba · 09:00 - 19:00 CET',
    swissMade: 'FABRIQUÉ EN SUISSE · GENÈVE',
    allRights: 'Barcha huquqlar himoyalangan',
  },
  en: {
    eyebrowTag: 'MAISON CONCIERGE & ATELIER PRIVÉ',
    headlineMain: 'Private Viewing &',
    headlineSub: 'Bespoke Commission',
    tagline: 'Book an exclusive consultation with our master horologists across our Geneva, Paris, New York, and Tokyo private salons.',
    worldClocksTitle: 'Global Flagship Salons & World Time',
    worldClocksSub: 'Synchronized live local time',
    selectSalon: 'Select Boutique',
    selectedBadge: 'Selected',
    openStatus: 'Available',
    dossierTitle: 'Appointment Dossier',
    dossierSubtitle: 'Strictly confidential consultation',
    dossierCode: 'REF: MH-CH/2026',
    formatTitle: 'Consultation Format',
    formats: [
      { id: 'salon', label: 'Salon Privé', desc: 'In-salon private suite' },
      { id: 'master', label: 'Master Horologist', desc: 'One-on-one atelier review' },
      { id: 'virtual', label: 'Virtual Concierge', desc: 'Private secure video room' },
    ],
    timepieceLabel: 'Timepiece of Interest',
    clientPhoneLabel: 'Phone / WhatsApp *',
    preferredDateLabel: 'Preferred Date & Window',
    datePlaceholder: 'e.g. Next Wednesday, Afternoon',
    submitButton: 'Request Private Appointment',
    submitting: 'Dispatching to Concierge...',
    invitationReady: 'Private Invitation Confirmed',
    invitationNote: 'Your consultation dossier has been registered with our Geneva Concierge Office.',
    referenceNumber: 'VIP Reference Code',
    selectedLocation: 'Selected Salon',
    selectedTimepiece: 'Selected Model',
    anotherBooking: 'Book Another Appointment',
    guaranteeTitle: 'Haute Horlogerie Standards',
    certifications: [
      { title: 'COSC Certified', desc: 'Official Swiss Chronometer test' },
      { title: 'Poinçon de Genève', desc: 'Geneva seal of craftsmanship' },
      { title: '5-Year Warranty', desc: 'Comprehensive global guarantee' },
    ],
    footerHotline: 'Geneva Concierge Desk',
    footerHours: 'Monday – Saturday · 09:00 - 19:00 CET',
    swissMade: 'SWISS CRAFTED · GENÈVE',
    allRights: 'All rights reserved',
  },
  ru: {
    eyebrowTag: 'КОНСЬЕРЖ И ПРИВАТНОЕ АТЕЛЬЕ',
    headlineMain: 'Приватный Визит &',
    headlineSub: 'Индивидуальный Заказ',
    tagline: 'Забронируйте персональную встречу с ведущими мастерами в салонах Женевы, Парижа, Нью-Йорка и Токио.',
    worldClocksTitle: 'Флагманские Салоны & Мировое Время',
    worldClocksSub: 'Синхронизированное местное время',
    selectSalon: 'Выбрать этот Бутик',
    selectedBadge: 'Выбран',
    openStatus: 'Доступен',
    dossierTitle: 'Досье Персонального Визита',
    dossierSubtitle: 'Конфиденциальная индивидуальная консультация',
    dossierCode: 'REF: MH-CH/2026',
    formatTitle: 'Формат Встречи',
    formats: [
      { id: 'salon', label: 'Salon Privé', desc: 'Приватная VIP-ложа' },
      { id: 'master', label: 'Мастер-Часовщик', desc: 'Личная техническая сессия' },
      { id: 'virtual', label: 'Онлайн Консьерж', desc: 'Защищенная видеосвязь' },
    ],
    timepieceLabel: 'Интересующая Модель',
    clientPhoneLabel: 'Телефон / WhatsApp *',
    preferredDateLabel: 'Желаемая Дата & Время',
    datePlaceholder: 'Например: Следующий вторник, 15:00',
    submitButton: 'Запросить Индивидуальный Визит',
    submitting: 'Передача в консьерж-службу...',
    invitationReady: 'Пригласительный Билет Подтвержден',
    invitationNote: 'Ваше досье успешно зарегистрировано в центральной службе консьержей в Женеве.',
    referenceNumber: 'VIP-Код Записи',
    selectedLocation: 'Выбранный Салон',
    selectedTimepiece: 'Выбранная Модель',
    anotherBooking: 'Оформить Другой Визит',
    guaranteeTitle: 'Швейцарские Стандарты Качества',
    certifications: [
      { title: 'Сертификат COSC', desc: 'Официальный швейцарский хронометр' },
      { title: 'Poinçon de Genève', desc: 'Высшее Женевское клеймо' },
      { title: '5 Лет Гарантии', desc: 'Глобальное сервисное обслуживание' },
    ],
    footerHotline: 'Женевская Линия Консьержа',
    footerHours: 'Понедельник – Суббота · 09:00 - 19:00 CET',
    swissMade: 'СДЕЛАНО В ШВЕЙЦАРИИ · ЖЕНЕВА',
    allRights: 'Все права защищены',
  },
};

export const Contact: React.FC = () => {
  const { t, language } = useLanguage();
  const currentLang = (language === 'en' || language === 'ru') ? language : 'uz';
  const strings = UI_STRINGS[currentLang];

  const { ref: sectionRef, inView: sectionInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Live World Clocks state updated every second
  const [worldTimes, setWorldTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const updated: Record<string, string> = {};
      SALONS.forEach((salon) => {
        try {
          updated[salon.cityKey] = now.toLocaleTimeString('en-GB', {
            timeZone: salon.timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
        } catch {
          updated[salon.cityKey] = '12:00:00';
        }
      });
      setWorldTimes(updated);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Geneva',
    timepiece: 'Royal Ocean',
    format: 'salon',
    preferredDate: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `MH-${formData.location.substring(0, 3).toUpperCase()}-${randomSuffix}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setReferenceCode(code);
      setIsSubmitted(true);
    }, 850);
  };

  const selectedSalonMeta = SALONS.find((s) => s.cityKey === formData.location) || SALONS[0];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#020617] text-white pt-28 pb-16 px-4 sm:px-8 lg:px-14 flex flex-col justify-between border-t border-blue-500/10 overflow-hidden font-sans select-none"
    >
      {/* Dynamic Background Architectural Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-600/15 via-blue-950/20 to-transparent rounded-full filter blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[130px] pointer-events-none" />

      {/* Subtle Horological Dial Rings Background Motif */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] border border-blue-400/[0.04] rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-[850px] h-[850px] border border-blue-400/[0.08] rounded-full border-dashed flex items-center justify-center">
          <div className="w-[600px] h-[600px] border border-blue-400/[0.04] rounded-full" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto my-auto space-y-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          {/* Eyebrow Jewel Pill */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-950/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_#3B82F6]" />
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase text-blue-200">
              {strings.eyebrowTag}
            </span>
          </div>

          {/* Grand Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            <span className="block text-white/90">{strings.headlineMain}</span>
            <span className="block bg-gradient-to-r from-blue-200 via-blue-400 to-blue-100 bg-clip-text text-transparent">
              {strings.headlineSub}
            </span>
          </h2>

          <p className="text-xs sm:text-base text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
            {strings.tagline}
          </p>
        </motion.div>

        {/* Global Salons & World Time Track */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                {strings.worldClocksTitle}
              </span>
            </div>
            <span className="text-[11px] font-mono tracking-widest text-blue-400/70 uppercase hidden sm:inline">
              {strings.worldClocksSub}
            </span>
          </div>

          {/* 4 Flagship Boutique Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SALONS.map((salon) => {
              const isSelected = formData.location === salon.cityKey;
              return (
                <button
                  key={salon.cityKey}
                  type="button"
                  onClick={() => setFormData({ ...formData, location: salon.cityKey })}
                  className={`relative p-5 rounded-xl text-left transition-all duration-400 border group ${
                    isSelected
                      ? 'bg-gradient-to-b from-blue-950/60 to-[#020617] border-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/60'
                      : 'bg-white/[0.02] border-white/10 hover:border-blue-500/30 hover:bg-blue-950/20'
                  }`}
                >
                  {/* Active Indicator Pin */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/70">
                      {salon.flag} {salon.cityName}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-blue-500 text-white font-extrabold shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'bg-white/10 text-white/60 group-hover:text-blue-300'
                      }`}
                    >
                      {isSelected ? strings.selectedBadge : strings.openStatus}
                    </span>
                  </div>

                  {/* World Clock Tick */}
                  <div className="flex items-baseline space-x-2 my-2 font-mono">
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-white/40'}`} />
                    <span className={`text-xl font-bold tracking-widest ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                      {worldTimes[salon.cityKey] || '00:00:00'}
                    </span>
                  </div>

                  <p className="text-[10px] uppercase tracking-wider text-blue-200/70 font-medium mb-1">
                    {salon.badge[currentLang]}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed truncate">
                    {salon.address}
                  </p>
                  <p className="text-[11px] font-mono text-white/40 mt-1">
                    {salon.tel}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Central Reservation Console / Form Dossier */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-[#020617] to-[#020617] backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-[0_25px_60px_rgba(2,6,23,0.9)] overflow-hidden"
        >
          {/* Subtle Guilloché Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dossier Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Gem className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                        {strings.dossierTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-white/50 tracking-wider mt-1">
                      {strings.dossierSubtitle}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-start sm:self-auto">
                    <span className="text-[10px] font-mono tracking-widest text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full bg-blue-950/40">
                      {strings.dossierCode}
                    </span>
                    <span className="text-[11px] text-white/70 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-mono">
                      {selectedSalonMeta.cityName} · {worldTimes[selectedSalonMeta.cityKey] || 'LIVE'}
                    </span>
                  </div>
                </div>

                {/* Consultation Format Chips */}
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold block">
                    {strings.formatTitle}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {strings.formats.map((fmt) => {
                      const isActive = formData.format === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, format: fmt.id })}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isActive
                              ? 'border-blue-400 bg-blue-500/15 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                              : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-blue-400/30'
                          }`}
                        >
                          <p className="text-xs font-bold text-white tracking-wide">{fmt.label}</p>
                          <p className="text-[10px] text-white/50 mt-0.5">{fmt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timepiece Selection Visual Matrix */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold block">
                      {strings.timepieceLabel}
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono">
                      {formData.timepiece}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {TIMEPIECES.map((item) => {
                      const isSelected = formData.timepiece === item.name;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, timepiece: item.name })}
                          className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 ${
                            isSelected
                              ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                              : 'border-white/10 bg-white/[0.02] hover:border-blue-400/30 hover:bg-blue-950/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                              style={{ backgroundColor: item.color, color: item.color }}
                            />
                            {isSelected && (
                              <span className="text-[9px] text-blue-400 font-bold">✓</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                            <p className="text-[9px] text-white/40 font-mono truncate">{item.tag}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Client Contact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="client-name"
                      className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold block"
                    >
                      {t.contact.nameLabel}
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="client-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t.contact.namePlaceholder}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="client-email"
                      className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold block"
                    >
                      {t.contact.emailLabel}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="client-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t.contact.emailPlaceholder}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="client-phone"
                      className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold block"
                    >
                      {strings.clientPhoneLabel}
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="client-phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+41 22 819 0000"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Preferred Date & Time Window */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="client-date"
                      className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold block"
                    >
                      {strings.preferredDateLabel}
                    </label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                      <input
                        id="client-date"
                        type="text"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        placeholder={strings.datePlaceholder}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Bespoke Requests or Notes */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="client-message"
                    className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold block"
                  >
                    {t.contact.messageLabel}
                  </label>
                  <textarea
                    id="client-message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t.contact.messagePlaceholder}
                    className="w-full p-4 rounded-lg bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all resize-none"
                  />
                </div>

                {/* Submission CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full py-4 px-8 rounded-full font-bold uppercase tracking-[0.25em] text-xs text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 hover:from-blue-500 hover:to-blue-300 transition-all duration-300 shadow-[0_10px_30px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.55)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-3 disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin text-white" />
                        <span>{strings.submitting}</span>
                      </>
                    ) : (
                      <>
                        <span>{strings.submitButton}</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Grand VIP Invitation State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="py-6 px-2 text-center space-y-6"
              >
                {/* Sapphire Crest */}
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-blue-400/60 bg-gradient-to-br from-blue-500/25 via-[#020617] to-transparent flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                  <CheckCircle2 className="w-10 h-10 text-blue-400" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-[0.35em] text-blue-400 uppercase">
                    {strings.dossierCode} · VIP PRIVÉ
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-wide">
                    {strings.invitationReady}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
                    {strings.invitationNote}
                  </p>
                </div>

                {/* VIP Invitation Card */}
                <div className="max-w-md mx-auto p-6 rounded-xl border border-blue-400/30 bg-[#020617]/90 space-y-4 text-left font-mono">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">
                      {strings.referenceNumber}
                    </span>
                    <span className="text-sm font-bold text-blue-300">
                      {referenceCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/40">
                        {strings.selectedLocation}
                      </p>
                      <p className="font-bold text-white mt-0.5">{selectedSalonMeta.cityName}</p>
                      <p className="text-[10px] text-white/50">{worldTimes[selectedSalonMeta.cityKey]}</p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/40">
                        {strings.selectedTimepiece}
                      </p>
                      <p className="font-bold text-blue-300 mt-0.5">{formData.timepiece}</p>
                      <p className="text-[10px] text-white/50 capitalize">{formData.format} Suite</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[11px] text-white/60">
                    <span className="text-blue-400 font-bold">Client:</span> {formData.name || 'Honored Guest'} ({formData.email})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full border border-white/20 text-xs font-semibold tracking-widest uppercase text-white/80 hover:text-white hover:border-blue-400 hover:bg-blue-950/30 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>{strings.anotherBooking}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Swiss Manufacture Assurance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-blue-500/10 text-center">
          {strings.certifications.map((cert, index) => (
            <div key={index} className="p-4 rounded-xl border border-blue-500/10 bg-blue-950/10 space-y-1">
              <Award className="w-4 h-4 text-blue-400 mx-auto mb-2" />
              <p className="text-xs font-bold tracking-wider uppercase text-white">{cert.title}</p>
              <p className="text-[11px] text-white/40">{cert.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Redesigned Haute Horlogerie Footer */}
      <footer className="relative z-10 mt-24 pt-12 border-t border-blue-500/15 w-full max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand Signature */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full border border-blue-400/50 flex items-center justify-center bg-blue-400/10">
                <span className="text-xs font-bold text-blue-300 font-sans">M</span>
              </div>
              <span className="text-lg font-bold tracking-[0.25em] text-white">
                MAISON HORLOGERIE
              </span>
            </div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/40">
              {strings.swissMade}
            </p>
          </div>

          {/* Quick Concierge Hotlines */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-white/60">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-white/90">+41 22 819 0000</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-white/90">concierge@maisonhorlogerie.ch</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p className="text-[11px]">
            © {CURRENT_YEAR} Maison Horlogerie S.A. {strings.allRights}.
          </p>

          <div className="flex items-center space-x-6 text-[11px] tracking-wider uppercase">
            <a href="#collections" className="hover:text-blue-300 transition-colors">
              {t.nav.collections}
            </a>
            <a href="#heritage" className="hover:text-blue-300 transition-colors">
              {t.nav.heritage}
            </a>
            <a href="#gallery" className="hover:text-blue-300 transition-colors">
              {t.nav.gallery}
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 text-white/30" />
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
};
