export type Language = 'uz' | 'en' | 'ru';

export interface CollectionTranslationItem {
  id: string;
  number: string;
  name: string;
  headline: string;
  theme: 'aura' | 'elixir' | 'rose' | 'crimson';
  colorHex: string;
  glowHex: string;
  image: string;
  description: string;
  specs: {
    movement: string;
    powerReserve: string;
    caseMaterial: string;
    waterResistance: string;
  };
}

export interface GalleryTranslationItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
}

export interface Translations {
  nav: {
    brandSub: string;
    collections: string;
    heritage: string;
    craftsmanship: string;
    gallery: string;
    boutiques: string;
    privateViewing: string;
    swissHaute: string;
    bookConsultation: string;
  };
  hero: {
    subtitle: string;
    title1: string;
    title2: string;
    title3: string;
    tagline: string;
    explore: string;
    scroll: string;
  };
  collections: {
    badge: string;
    reserve: string;
    movement: string;
    autonomy: string;
    material: string;
    resistance: string;
    items: CollectionTranslationItem[];
  };
  heritage: {
    locationBadge: string;
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    p1: string;
    p2: string;
    stat1Label: string;
    stat2Label: string;
    stat3Label: string;
  };
  craftsmanship: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    metric1: string;
    metric2: string;
    metric3: string;
  };
  gallery: {
    headerTitle: string;
    headerSub: string;
    introBadge: string;
    introTitle1: string;
    introTitle2: string;
    introDesc: string;
    scrollHint: string;
    of: string;
    items: GalleryTranslationItem[];
  };
  contact: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    salons: {
      city: string;
      address: string;
      tel: string;
    }[];
    formTitle: string;
    formSub: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    locationLabel: string;
    timepieceLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    submitting: string;
    successTitle: string;
    successDesc: (name: string, location: string) => string;
    anotherBtn: string;
    footerJournal: string;
    footerLegal: string;
    footerRights: string;
  };
}

export const translations: Record<Language, Translations> = {
  uz: {
    nav: {
      brandSub: 'HORLOGERIE · JENEVA',
      collections: 'To‘plamlar',
      heritage: 'Meros',
      craftsmanship: 'Mahorat',
      gallery: 'Galereya',
      boutiques: 'Butiklar',
      privateViewing: 'Maxsus Qabul',
      swissHaute: 'Shveytsariya Yuksak Soatsozligi',
      bookConsultation: 'Konsultatsiyaga Yozilish',
    },
    hero: {
      subtitle: 'Shveytsariya soatsozligining yuksak cho‘qqisi',
      title1: 'VAQT',
      title2: 'BU',
      title3: 'SAN‘AT',
      tagline: 'Jeneva hunarmandchiligining nozik an‘analari vaqt chegaralarini oshib, mangulikka tutashadigan manzil.',
      explore: 'Kolleksiyani Kashf Eting',
      scroll: 'Kashf qilish uchun suring',
    },
    collections: {
      badge: 'Nodir Durdona',
      reserve: 'Buyurtma Berish',
      movement: 'Mexanizm',
      autonomy: 'Avtonomiya',
      material: 'Material',
      resistance: 'Chidamlilik',
      items: [
        {
          id: 'royal-ocean',
          number: '01',
          name: 'ROYAL OCEAN',
          headline: 'Ufq ortidagi mukammal aniqlik',
          theme: 'aura',
          colorHex: '#3B82F6',
          glowHex: 'rgba(59, 130, 246, 0.25)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_blue.png',
          description:
            'Tubsiz dengiz qa’ri va oliyjanob dengizchilik an’analari uchun yaratilgan. To‘q ko‘k keramik bezel va yuqori chastotali anker mexanizmi har qanday okean sayohatida sobitqadamlikni ta’minlaydi.',
          specs: {
            movement: 'Calibre 3235 Doimiy Xronometr',
            powerReserve: '70 Soatlik Zaxira',
            caseMaterial: '904L Suvosti Oystersteel po‘lati',
            waterResistance: '300m / 1000ft Suv o‘tkazmaslik',
          },
        },
        {
          id: 'sahara-heritage',
          number: '02',
          name: 'SAHARA HERITAGE',
          headline: 'Sahro shamollari kabi mangu',
          theme: 'elixir',
          colorHex: '#D4A017',
          glowHex: 'rgba(212, 160, 23, 0.3)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_desert.png',
          description:
            'Oltin qumtepalar va qadimiy yulduzlar kompasidan ilhomlangan. Qo‘lda quyilgan 18 karatli sariq oltin, shampan sathi va silliqlangan ustunlar bilan uyg‘unlashgan nodir san‘at asari.',
          specs: {
            movement: 'Calibre 4130 Ustunli g‘ildirakli xronograf',
            powerReserve: '72 soatlik optimal quvvat zaxirasi',
            caseMaterial: '18 ct Sariq Oltin Qotishmasi',
            waterResistance: '100m / 330ft Mustahkamlangan',
          },
        },
        {
          id: 'rose-elegance',
          number: '03',
          name: 'ROSE ELEGANCE',
          headline: 'Zargarlik durdonasidek jilolangan',
          theme: 'rose',
          colorHex: '#EC4899',
          glowHex: 'rgba(236, 72, 153, 0.28)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_rose.png',
          description:
            'Yuksak soatsozlik va zargarlik san‘atining poetik simfoniyasi. Avloddan-avlodga o‘z jilosini yo‘qotmaydigan noyob olmoslar hamda Everose pushti oltini bilan bezatilgan.',
          specs: {
            movement: 'Calibre 2236 Siloksi soch-spirali',
            powerReserve: '55 Soat Doimiy Quvvat',
            caseMaterial: '18 ct Everose Oltin & Olmoslar',
            waterResistance: '100m / 330ft Suv o‘tkazmaslik',
          },
        },
        {
          id: 'noir-crimson',
          number: '04',
          name: 'NOIR CRIMSON',
          headline: 'Ehtiros va qudrat timsoli',
          theme: 'crimson',
          colorHex: '#EF4444',
          glowHex: 'rgba(239, 68, 68, 0.28)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_sensual.png',
          description:
            'Zamonaviy soatsozlik mahoratining murosasiz aksi. Ochiq arxitekturaga ega turbiyon ko‘priklari, qizil yoqut urg‘ulari va aviatsiya titan korpusi bilan jihozlangan.',
          specs: {
            movement: 'Calibre 9001 Manufaktura Turbiyoni',
            powerReserve: '72 Soat Juft Baraban',
            caseMaterial: '5-darajali Titan & Uglerod tolasi',
            waterResistance: '200m / 660ft Dinamik',
          },
        },
      ],
    },
    heritage: {
      locationBadge: 'Val-de-Ju · 1884',
      eyebrow: '1884-yildan buyon · Shveytsariyada qo‘lda yasalgan',
      titleLine1: 'Mukammallik',
      titleLine2: 'Merosi',
      p1: 'Bir yuz qirq yildan ortiq vaqt davomida Maison Horlogerie Shveytsariya yuksak soatsozligi beshigida o‘z mavqeini saqlab kelmoqda. Qorli Yura tog‘laridagi mo‘jaz ustaxonada boshlangan yo‘l bugun yuksak soatsozlik san‘atining timsoliga aylandi.',
      p2: 'Har bir anker, balans chambari va qo‘lda silliqlangan ko‘prik ustalarimizning cheksiz mehrini ifodalaydi. Biz faqat ma‘lum mavsum uchun soat yaratmaymiz; biz avloddan-avlodga meros bo‘lib o‘tadigan mangu qadriyatlarni bunyod etamiz.',
      stat1Label: 'Yillik Tarix',
      stat2Label: 'O‘z Manufakturasi',
      stat3Label: 'COSC Sertifikati',
    },
    craftsmanship: {
      eyebrow: 'Hunarmandchilik & Mexanika',
      titleLine1: 'Ko‘z Ilg‘amas',
      titleLine2: 'Aniqlik',
      description: 'Aniqlik millimetrning 1/1000 qismigacha sozlangan. Har bir tishli g‘ildirak ko‘zgudek silliqlanadi, har bir murvat olov taftida ko‘kartiriladi va har bir mexanizm ustaning nozik didi bilan uyg‘unlashtiriladi.',
      metric1: 'Ko‘zgu Anglyaj',
      metric2: 'Jeneva To‘lqinlari',
      metric3: 'Nozik Perlyaj',
    },
    gallery: {
      headerTitle: 'GALEREYA',
      headerSub: '/ Saralangan modellar namoyishi',
      introBadge: 'Ko‘rgazma 2026',
      introTitle1: 'Saralangan',
      introTitle2: 'Nigohlar',
      introDesc: 'Qo‘lda sayqallangan xronograflar, ochiq mexanizmli murakkab modellar va maxsus buyurtmalar arxivimiz bilan tanishing.',
      scrollHint: 'Gorizontal suring',
      of: 'dan',
      items: [
        {
          id: 'chronograph-sunray',
          title: 'Xronograf Kalibri',
          category: 'Yuksak Murakkablik',
          description:
            'To‘q ko‘k quyosh nuri siferblati, 18 karatli pushti oltin tugmachalar va keramik taximetr bezeli bilan. Millisekundlik poyga aniqligiga sozlangan.',
          image: '/images/gallery1.png',
        },
        {
          id: 'skeleton-calibre',
          title: 'Skelet Arxitekturasi',
          category: 'Ochiq Kalibr',
          description:
            'Titan ko‘priklarining har bir ortiqcha grammi qo‘lda yo‘nilgan bo‘lib, garmonik tebranuvchi balans chambari va tilla g‘ildiraklar tizimini namoyon etadi.',
          image: '/images/gallery2.png',
        },
        {
          id: 'ocean-heritage',
          title: 'Tublik Jilosi',
          category: 'Dengiz Turkumi',
          description:
            'Chromalight lyuminestsent qoplamali ko‘rsatkichlar 300 metrdan chuqur suv ostida ham yorqin moviy nur taratib, mukammal ko‘rinishni kafolatlaydi.',
          image: '/images/gallery3.png',
        },
        {
          id: 'master-finishing',
          title: 'Qo‘l Mehnati Anglyaji',
          category: 'Hunarmandlik San‘ati',
          description:
            'Gentian yog‘ochi va olmos kukuni yordamida qo‘lda qirralangan qismlar ko‘zgu singari mukammal nur aks ettirish darajasiga yetkaziladi.',
          image: '/images/gallery4.png',
        },
        {
          id: 'celestial-complication',
          title: 'Buyuk Murakkablik',
          category: 'Samoviy Murakkablik',
          description:
            'Qo‘lda tikilgan Missisipi alligatori terisidan tasma va 122 yilda atigi bir kun og‘uvchi astronomik oy fazasi ko‘rsatkichi.',
          image: '/images/gallery5.png',
        },
      ],
    },
    contact: {
      eyebrow: 'Shaxsiy Konsyerj',
      titleLine1: 'Shaxsiy Qabulga',
      titleLine2: 'Yozilish',
      description: 'Bizning usta soatsozlarimiz kolleksionerlarni Jeneva, Parij, Nyu-York va Tokiodagi shaxsiy salonlarimizda mamnuniyat bilan qabul qilishadi. Kalibrlarni ko‘zdan kechirish yoki maxsus buyurtmalarni muhokama qilish uchun eksklyuziv konsultatsiyani band qiling.',
      salons: [
        { city: 'Jeneva Saloni', address: 'Rue du Rhône 42, 1204 Genève', tel: '+41 22 819 0000' },
        { city: 'Parij Butigi', address: 'Place Vendôme 18, 75001 Paris', tel: '+33 1 42 68 0000' },
        { city: 'Nyu-York Binosi', address: '745 Fifth Avenue, New York, NY 10151', tel: '+1 212 750 0000' },
        { city: 'Tokio Ginza', address: '6-10-1 Ginza, Chuo-ku, Tokyo 104-0061', tel: '+81 3 3572 0000' },
      ],
      formTitle: 'Salon Qabuliga Yozilish',
      formSub: 'Maxfiy va individual konsultatsiya',
      nameLabel: 'To‘liq Ismingiz *',
      namePlaceholder: 'masalan: Bobur Rahimov',
      emailLabel: 'Elektron Pochta *',
      emailPlaceholder: 'masalan: bobur@example.uz',
      locationLabel: 'Butik Manzili *',
      timepieceLabel: 'Qiziqtirgan Soat Modeli',
      messageLabel: 'Maxsus Tilaklar yoki Talablar',
      messagePlaceholder: 'Qulay sanalar, korpusdagi gravyura yoki shaxsiy qabul talablarini ko‘rsating...',
      submitBtn: 'So‘rovni Yuborish',
      submitting: 'Yuborilmoqda...',
      successTitle: 'Qabul So‘rovi Yuborildi',
      successDesc: (name, loc) =>
        `Tashakkur, muhtaram ${name || 'mehmon'}. ${loc} salonimizning shaxsiy maslahatchisi 24 soat ichida shaxsiy uchrashuvni tasdiqlash uchun siz bilan bog‘lanadi.`,
      anotherBtn: 'Boshqa So‘rov Yuborish',
      footerJournal: 'Jurnal',
      footerLegal: 'Huquqiy & Sertifikatlar',
      footerRights: 'Barcha huquqlar himoyalangan.',
    },
  },
  en: {
    nav: {
      brandSub: 'HORLOGERIE · GENÈVE',
      collections: 'Collections',
      heritage: 'Heritage',
      craftsmanship: 'Craftsmanship',
      gallery: 'Gallery',
      boutiques: 'Boutiques',
      privateViewing: 'Private Viewing',
      swissHaute: 'Swiss Haute Horlogerie',
      bookConsultation: 'Book Consultation',
    },
    hero: {
      subtitle: 'The Pinnacle of Swiss Watchmaking',
      title1: 'TIME',
      title2: 'IS AN',
      title3: 'ART',
      tagline: 'Where artisanal Geneva savoir-faire transcends temporal boundaries into perpetual eternity.',
      explore: 'Explore Creations',
      scroll: 'Scroll to Discover',
    },
    collections: {
      badge: 'Collection Masterpiece',
      reserve: 'Reserve Allocation',
      movement: 'Movement',
      autonomy: 'Autonomy',
      material: 'Material',
      resistance: 'Resistance',
      items: [
        {
          id: 'royal-ocean',
          number: '01',
          name: 'ROYAL OCEAN',
          headline: 'Precision Beyond The Horizon',
          theme: 'aura',
          colorHex: '#3B82F6',
          glowHex: 'rgba(59, 130, 246, 0.25)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_blue.png',
          description:
            'Engineered for the unfathomable depths and nautical nobility. Crafted with deep blue ceramic bezel and high-frequency escapement, ensuring uncompromising resilience across all oceanic voyages.',
          specs: {
            movement: 'Calibre 3235 Perpetual Chronometer',
            powerReserve: '70 Hours Autonomy',
            caseMaterial: '904L Submarine Oystersteel',
            waterResistance: '300m / 1000ft Hermetic',
          },
        },
        {
          id: 'sahara-heritage',
          number: '02',
          name: 'SAHARA HERITAGE',
          headline: 'Timeless As The Desert Winds',
          theme: 'elixir',
          colorHex: '#D4A017',
          glowHex: 'rgba(212, 160, 23, 0.3)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_desert.png',
          description:
            'Inspired by eternal golden dunes and ancient stellar navigation. Enclosed in proprietary hand-poured 18-karat yellow gold with champagne sunray finish and hand-beveled columns.',
          specs: {
            movement: 'Calibre 4130 Column-Wheel Chrono',
            powerReserve: '72 Hours Optimal',
            caseMaterial: '18 ct Yellow Gold Alloy',
            waterResistance: '100m / 330ft Reinforced',
          },
        },
        {
          id: 'rose-elegance',
          number: '03',
          name: 'ROSE ELEGANCE',
          headline: 'Luxury Worn Like Jewelry',
          theme: 'rose',
          colorHex: '#EC4899',
          glowHex: 'rgba(236, 72, 153, 0.28)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_rose.png',
          description:
            'A poetic symphony between high horology and haute joaillerie. Enriched with rare diamonds and everlasting Everose gold that maintains its luster over generations of sovereign elegance.',
          specs: {
            movement: 'Calibre 2236 Siloxi Hairspring',
            powerReserve: '55 Hours Constant Force',
            caseMaterial: '18 ct Everose Gold & Diamonds',
            waterResistance: '100m / 330ft Sealed',
          },
        },
        {
          id: 'noir-crimson',
          number: '04',
          name: 'NOIR CRIMSON',
          headline: 'Built For Passion And Power',
          theme: 'crimson',
          colorHex: '#EF4444',
          glowHex: 'rgba(239, 68, 68, 0.28)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_sensual.png',
          description:
            'An uncompromising manifestation of modern horological mastery. Featuring openworked architectural tourbillon bridges, red sapphire accents, and an aerospace titanium case.',
          specs: {
            movement: 'Calibre 9001 Tourbillon Manufacture',
            powerReserve: '72 Hours Double Barrel',
            caseMaterial: 'Grade 5 Titanium & Forged Carbon',
            waterResistance: '200m / 660ft Dynamic',
          },
        },
      ],
    },
    heritage: {
      locationBadge: 'Vallée De Joux · 1884',
      eyebrow: 'Since 1884 · Handcrafted In Switzerland',
      titleLine1: 'A Legacy of',
      titleLine2: 'Perfection',
      p1: 'For over one hundred and forty years, Maison Horlogerie has resided in the cradle of high Swiss watchmaking. What began as an intimate atelier in the snow-draped Jura Mountains has evolved into an emblematic temple of haute horlogerie.',
      p2: 'Every escapement, balance wheel, and hand-chamfered bridge carries the unyielding devotion of master watchmakers who spend months perfecting a single mechanical heartbeat. We do not manufacture timepieces for seasons; we sculpt eternal heirlooms passed from generation to sovereign generation.',
      stat1Label: 'Years Heritage',
      stat2Label: 'In-House Manufacture',
      stat3Label: 'Certified Poinçon',
    },
    craftsmanship: {
      eyebrow: 'Artisanat & Mécanique',
      titleLine1: 'Unseen',
      titleLine2: 'Precision',
      description: 'Where tolerances are calibrated to 1/1000th of a millimetre. Every gear tooth is mirror-polished, every screw heat-blued by flame, and every escapement tuned by human ear.',
      metric1: 'Anglage Miroir',
      metric2: 'Côtes de Genève',
      metric3: 'Perlage Fine',
    },
    gallery: {
      headerTitle: 'THE GALLERY',
      headerSub: '/ Horizontal Curated Showcase',
      introBadge: 'Exhibition 2026',
      introTitle1: 'Curated',
      introTitle2: 'Visions',
      introDesc: 'Glide horizontally to experience our archive of hand-finished chronographs, openworked complications, and bespoke creations.',
      scrollHint: 'Drag / Scroll horizontally',
      of: 'of',
      items: [
        {
          id: 'chronograph-sunray',
          title: 'The Calibre Chronograph',
          category: 'High Complication',
          description:
            'Featuring a deep midnight blue sunray dial framed by 18-karat rose gold pushers and ceramic tachymeter bezel. Calibrated for millisecond racing telemetry.',
          image: '/images/gallery1.png',
        },
        {
          id: 'skeleton-calibre',
          title: 'Skeletal Architecture',
          category: 'Openworked Calibre',
          description:
            'Every unnecessary gram of titanium bridge has been carved away by hand, revealing the harmonic oscillating balance wheel and golden gear train.',
          image: '/images/gallery2.png',
        },
        {
          id: 'ocean-heritage',
          title: 'Abyssal Dial Aesthetics',
          category: 'Nautical Series',
          description:
            'Sunken indices coated in Chromalight luminescence, providing intense blue radiance for deep-sea readability beyond 300 meters.',
          image: '/images/gallery3.png',
        },
        {
          id: 'master-finishing',
          title: 'Handcrafted Anglage',
          category: 'Artisanal Savoir-Faire',
          description:
            'Meticulously hand-beveled edges using gentian wood pegs and diamond paste to attain distortion-free specular reflection.',
          image: '/images/gallery4.png',
        },
        {
          id: 'celestial-complication',
          title: 'Grand Complication',
          category: 'Celestial Complication',
          description:
            'Hand-stitched Mississippiensis alligator leather strap paired with astronomical moonphase accurate to one day every 122 years.',
          image: '/images/gallery5.png',
        },
      ],
    },
    contact: {
      eyebrow: 'Private Concierge',
      titleLine1: 'Request A',
      titleLine2: 'Private Viewing',
      description: 'Our master horologists welcome collectors to discreet private salons in Geneva, Paris, New York, and Tokyo. Reserve an exclusive consultation to inspect calibres or discuss bespoke commissions.',
      salons: [
        { city: 'Geneva Salons', address: 'Rue du Rhône 42, 1204 Genève', tel: '+41 22 819 0000' },
        { city: 'Paris Boutique', address: 'Place Vendôme 18, 75001 Paris', tel: '+33 1 42 68 0000' },
        { city: 'New York Maison', address: '745 Fifth Avenue, New York, NY 10151', tel: '+1 212 750 0000' },
        { city: 'Tokyo Ginza', address: '6-10-1 Ginza, Chuo-ku, Tokyo 104-0061', tel: '+81 3 3572 0000' },
      ],
      formTitle: 'Salon Appointment',
      formSub: 'Confidential & Bespoke Consultation',
      nameLabel: 'Full Name *',
      namePlaceholder: 'e.g. Lord Alexander Sterling',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'e.g. alexander@sterling-estates.ch',
      locationLabel: 'Boutique Location *',
      timepieceLabel: 'Timepiece of Interest',
      messageLabel: 'Special Notes or Inquiries',
      messagePlaceholder: 'Specify preferred dates, case engravings, or private viewing requirements...',
      submitBtn: 'Transmit Request',
      submitting: 'Transmitting...',
      successTitle: 'Viewing Requested',
      successDesc: (name, loc) =>
        `Thank you, ${name || 'esteemed patron'}. A private client advisor from our ${loc} salon will contact you within 24 hours to confirm your private salon appointment.`,
      anotherBtn: 'Submit Another Inquiry',
      footerJournal: 'Journal',
      footerLegal: 'Legal & Certifications',
      footerRights: 'All Rights Reserved.',
    },
  },
  ru: {
    nav: {
      brandSub: 'HORLOGERIE · ЖЕНЕВА',
      collections: 'Коллекции',
      heritage: 'Наследие',
      craftsmanship: 'Мастерство',
      gallery: 'Галерея',
      boutiques: 'Бутики',
      privateViewing: 'Частный Показ',
      swissHaute: 'Швейцарское Часовое Искусство',
      bookConsultation: 'Записаться на Прием',
    },
    hero: {
      subtitle: 'Вершина швейцарского часового искусства',
      title1: 'ВРЕМЯ',
      title2: 'ЭТО',
      title3: 'ИСКУССТВО',
      tagline: 'Где ремесленное мастерство Женевы преодолевает границы времени, устремляясь в вечность.',
      explore: 'Открыть Коллекции',
      scroll: 'Прокрутите для знакомства',
    },
    collections: {
      badge: 'Шедевр Коллекции',
      reserve: 'Забронировать',
      movement: 'Механизм',
      autonomy: 'Запас Хода',
      material: 'Материал',
      resistance: 'Водозащита',
      items: [
        {
          id: 'royal-ocean',
          number: '01',
          name: 'ROYAL OCEAN',
          headline: 'Точность за пределами горизонта',
          theme: 'aura',
          colorHex: '#3B82F6',
          glowHex: 'rgba(59, 130, 246, 0.25)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_blue.png',
          description:
            'Создан для непостижимых глубин и благородной морской стихии. Керамический безель глубокого синего оттенка и высокочастотный спуск гарантируют надежность во всех путешествиях.',
          specs: {
            movement: 'Калибр 3235 Вечный Хронометр',
            powerReserve: '70 Часов Автономии',
            caseMaterial: '904L Подводная сталь Oystersteel',
            waterResistance: '300м / 1000футов Герметичность',
          },
        },
        {
          id: 'sahara-heritage',
          number: '02',
          name: 'SAHARA HERITAGE',
          headline: 'Вечен, как ветры пустыни',
          theme: 'elixir',
          colorHex: '#D4A017',
          glowHex: 'rgba(212, 160, 23, 0.3)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_desert.png',
          description:
            'Вдохновлен вечными золотыми дюнами и древней навигацией по звездам. Корпус из 18-каратного желтого золота с циферблатом цвета шампанского и полированными колоннами.',
          specs: {
            movement: 'Калибр 4130 Хронограф с колонным колесом',
            powerReserve: '72 Часа Запас Хода',
            caseMaterial: 'Сплав 18-каратного желтого золота',
            waterResistance: '100м / 330футов Усиленная',
          },
        },
        {
          id: 'rose-elegance',
          number: '03',
          name: 'ROSE ELEGANCE',
          headline: 'Роскошь ювелирного произведения',
          theme: 'rose',
          colorHex: '#EC4899',
          glowHex: 'rgba(236, 72, 153, 0.28)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_rose.png',
          description:
            'Поэтическая гармония высокого часового и ювелирного искусства. Украшен редкими бриллиантами и золотом Everose, сохраняющим свое сияние сквозь поколения.',
          specs: {
            movement: 'Калибр 2236 Кремниевая спираль Siloxi',
            powerReserve: '55 Часов Постоянной Силы',
            caseMaterial: '18-каратное золото Everose и бриллианты',
            waterResistance: '100м / 330футов Герметичный',
          },
        },
        {
          id: 'noir-crimson',
          number: '04',
          name: 'NOIR CRIMSON',
          headline: 'Воплощение страсти и мощи',
          theme: 'crimson',
          colorHex: '#EF4444',
          glowHex: 'rgba(239, 68, 68, 0.28)',
          image: 'https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_sensual.png',
          description:
            'Бескомпромиссный триумф современного часового мастерства. Ажурные архитектурные мосты турбийона, акценты из красного сапфира и корпус из титана Grade 5.',
          specs: {
            movement: 'Калибр 9001 Мануфактурный Турбийон',
            powerReserve: '72 Часа Двойной Барабан',
            caseMaterial: 'Титан Grade 5 и кованый карбон',
            waterResistance: '200м / 660футов Динамическая',
          },
        },
      ],
    },
    heritage: {
      locationBadge: 'Валле-де-Жу · 1884',
      eyebrow: 'С 1884 года · Ручная работа в Швейцарии',
      titleLine1: 'Наследие',
      titleLine2: 'Совершенства',
      p1: 'Более ста сорока лет Maison Horlogerie бережно хранит традиции швейцарского часового искусства. Путь, начавшийся в заснеженных горах Юра, привел к созданию культового храма высокой механики.',
      p2: 'Каждый спуск, колесо баланса и мост с ручной фаской отражают безграничную преданность мастеров. Мы создаем не просто часы, а вечные фамильные реликвии, передаваемые из поколения в поколение.',
      stat1Label: 'Лет Наследия',
      stat2Label: 'Собственная Мануфактура',
      stat3Label: 'Сертификат COSC',
    },
    craftsmanship: {
      eyebrow: 'Ремесло и Механика',
      titleLine1: 'Незримая',
      titleLine2: 'Точность',
      description: 'Допуски выверены с точностью до 1/1000 миллиметра. Каждый зубец зеркально отполирован, каждый винт воронен в пламени, а каждый спуск настроен чутким слухом мастера.',
      metric1: 'Зеркальный Англяж',
      metric2: 'Женевские Волны',
      metric3: 'Тонкий Перлаж',
    },
    gallery: {
      headerTitle: 'ГАЛЕРЕЯ',
      headerSub: '/ Кураторская экспозиция шедевров',
      introBadge: 'Выставка 2026',
      introTitle1: 'Избранные',
      introTitle2: 'Взгляды',
      introDesc: 'Прокрутите горизонтально, чтобы познакомиться с архивом хронографов ручной отделки, скелетонов и эксклюзивных моделей.',
      scrollHint: 'Прокрутите вбок',
      of: 'из',
      items: [
        {
          id: 'chronograph-sunray',
          title: 'Калибр Хронограф',
          category: 'Высокое Усложнение',
          description:
            'Глубокий синий циферблат с лучевой шлифовкой, кнопки из 18-каратного розового золота и керамический тахиметрический безель.',
          image: '/images/gallery1.png',
        },
        {
          id: 'skeleton-calibre',
          title: 'Архитектура Скелетона',
          category: 'Скелетонированный Калибр',
          description:
            'Каждый лишний грамм титанового моста бережно снят вручную, открывая взору гармоничное колебание баланса и золотую колесную систему.',
          image: '/images/gallery2.png',
        },
        {
          id: 'ocean-heritage',
          title: 'Эстетика Бездны',
          category: 'Морская Серия',
          description:
            'Углубленные метки с люминесцентным составом Chromalight обеспечивают яркое синее свечение на глубине свыше 300 метров.',
          image: '/images/gallery3.png',
        },
        {
          id: 'master-finishing',
          title: 'Ручной Англяж',
          category: 'Ремесленное Мастерство',
          description:
            'Кромки деталей вручную скошены и отполированы стеблями горечавки с алмазной пастой для достижения безупречного зеркального блеска.',
          image: '/images/gallery4.png',
        },
        {
          id: 'celestial-complication',
          title: 'Гранд Усложнение',
          category: 'Астрономическое Усложнение',
          description:
            'Ремешок из кожи миссисипского аллигатора ручной работы и индикатор фаз Луны с погрешностью в один день за 122 года.',
          image: '/images/gallery5.png',
        },
      ],
    },
    contact: {
      eyebrow: 'Персональный Консьерж',
      titleLine1: 'Запрос на',
      titleLine2: 'Частный Показ',
      description: 'Наши мастера приглашают коллекционеров в уединенные салоны в Женеве, Париже, Нью-Йорке и Токио. Забронируйте персональную встречу для знакомства с калибрами или заказа эксклюзивных часов.',
      salons: [
        { city: 'Салоны Женевы', address: 'Rue du Rhône 42, 1204 Genève', tel: '+41 22 819 0000' },
        { city: 'Бутик в Париже', address: 'Place Vendôme 18, 75001 Paris', tel: '+33 1 42 68 0000' },
        { city: 'Дом в Нью-Йорке', address: '745 Fifth Avenue, New York, NY 10151', tel: '+1 212 750 0000' },
        { city: 'Токио Гинза', address: '6-10-1 Ginza, Chuo-ku, Tokyo 104-0061', tel: '+81 3 3572 0000' },
      ],
      formTitle: 'Запись в Салон',
      formSub: 'Конфиденциальная индивидуальная встреча',
      nameLabel: 'Ваше Имя *',
      namePlaceholder: 'напр. Александр Белов',
      emailLabel: 'Электронная Почта *',
      emailPlaceholder: 'напр. alexander@example.com',
      locationLabel: 'Локация Бутика *',
      timepieceLabel: 'Интересующая Модель',
      messageLabel: 'Особые Пожелания',
      messagePlaceholder: 'Укажите желаемые даты, гравировку или пожелания к визиту...',
      submitBtn: 'Отправить Запрос',
      submitting: 'Отправка...',
      successTitle: 'Запрос Отправлен',
      successDesc: (name, loc) =>
        `Благодарим вас, уважаемый ${name || 'гость'}. Консультант салона в г. ${loc} свяжется с вами в течение 24 часов для подтверждения записи.`,
      anotherBtn: 'Отправить Еще Запрос',
      footerJournal: 'Журнал',
      footerLegal: 'Правовая информация & Сертификаты',
      footerRights: 'Все права защищены.',
    },
  },
};
