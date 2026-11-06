export type WatchCategory = "alfajr" | "tsar_bomba" | "philipp_plein" | "diver" | "chronograph" | "haute" | "dress" | "aviation";

export interface WatchSpecs {
  movement: string;
  caliber?: string;
  caseDiameter: string;
  caseThickness: string;
  caseMaterial: string;
  bezel: string;
  dialColor: string;
  glass: string;
  waterResistance: string;
  powerReserve?: string;
  strap: string;
  clasp: string;
  functions?: string[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  extraPrice: number;
}

export interface SelectedCustomization {
  strapId?: string;
  strapName?: string;
  engravingText?: string;
  giftBox?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  model: string;
  category: WatchCategory;
  name: string;
  nameRu?: string;
  referenceNumber: string;
  price: number;
  oldPrice?: number;
  currency: "UZS";
  images: string[];
  description: string;
  specs: WatchSpecs;
  tags: string[];
  featured?: boolean;
  inStock: boolean;
  isCustomizable?: boolean;
  availableStraps?: CustomizationOption[];
  islamicFeatures?: {
    azanTimes: boolean;
    qiblaCompass: boolean;
    hijriCalendar: boolean;
    quranBookmark: boolean;
  };
}

export const luxuryStrapOptions: CustomizationOption[] = [
  { id: "original", name: "Asl Zavod Brasleti (Stainless Steel / Silicone)", extraPrice: 0 },
  { id: "premium-leather", name: "Premium qora / jigarrang charm remeshok", extraPrice: 180000 },
  { id: "magnetic-milanese", name: "Magnitli Milana to'qima tilla braslet", extraPrice: 220000 },
];

export const productsData: Product[] = [
  {
    id: "alfajr-wy16",
    slug: "al-fajr-wy-16-silver",
    brand: "Al-Fajr",
    model: "WY-16 Deluxe",
    referenceNumber: "WY-16",
    category: "alfajr",
    name: "Al-Fajr WY-16 Silver Steel Azan",
    nameRu: "Al-Fajr WY-16 Silver Steel с Азаном",
    price: 1350000,
    oldPrice: 1550000,
    currency: "UZS",
    images: [
      "/images/watches/rolex-submariner-1.webp",
      "/images/watches/rolex-submariner-2.webp",
      "/images/watches/rolex-submariner-3.webp",
    ],
    description: "Al-Fajr brendining eng mashhur va nufuzli modeli. Dunyoning barcha shaharlari uchun avtomatik azon vaqti, kompas orqali aniq Qibla yo'nalishi va Hijriy taqvim. Zanglamas po'latdan ishlangan mustahkam korpus va suvga to'liq chidamlilik.",
    specs: {
      movement: "Original Al-Fajr Digital & Quartz Micro-chip",
      caseDiameter: "40 mm",
      caseThickness: "11 mm",
      caseMaterial: "Zanglamas po'lat (Stainless Steel 316L)",
      bezel: "Sayqallangan tilla / kumush hoshiya",
      dialColor: "Zumrad-kulrang akslantiruvchi FSTN LCD",
      glass: "Qirilishga chidamli Mineral Safir qoplamali oyna",
      waterResistance: "5 ATM (50 metr — tahorat va yomg'irga to'liq chidamli)",
      strap: "Zanglamas po'lat qisqichli braslet",
      clasp: "Xavfsizlik qisqichi bilan ikki tomonlama buklama",
      functions: ["5 mahal azon vaqti", "Qibla kompasi", "Hijriy/Milodiy taqvim", "Qur'on xatcho'pi", "O'zbekiston shaharlari tayyor"],
    },
    tags: ["Azon Soati", "Qibla Kompas", "Hit Savdo", "BTS Bepul Dastavka"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    islamicFeatures: {
      azanTimes: true,
      qiblaCompass: true,
      hijriCalendar: true,
      quranBookmark: true,
    },
  },
  {
    id: "alfajr-ws06l",
    slug: "al-fajr-ws-06l-gold-leather",
    brand: "Al-Fajr",
    model: "WS-06L Gold Edition",
    referenceNumber: "WS-06L",
    category: "alfajr",
    name: "Al-Fajr WS-06L Gold Leather Azan",
    nameRu: "Al-Fajr WS-06L Gold Leather с Азаном",
    price: 1490000,
    oldPrice: 1700000,
    currency: "UZS",
    images: [
      "/images/watches/cartier-santos-1.webp",
      "/images/watches/cartier-santos-2.webp",
      "/images/watches/cartier-santos-3.webp",
    ],
    description: "Klassik uslub va Islomiy texnologiyalar uyg'unligi. Tilla suvi yugurtirilgan korpus, tabiiy buzoq terisidan ishlangan qora remeshok va zamonaviy azon hisoblash tizimi.",
    specs: {
      movement: "Al-Fajr Smart Precision IC",
      caseDiameter: "38 mm",
      caseThickness: "10.5 mm",
      caseMaterial: "18K Tilla PVD qoplamali zanglamas po'lat",
      bezel: "Klassik silliq tilla hoshiya",
      dialColor: "Oq emal va analog/raqamli gibrid siferblat",
      glass: "Qalinlashtirilgan mineral billur oyna",
      waterResistance: "3 ATM (Suv sachrashiga va tahoratga chidamli)",
      strap: "Tabiiy naqshli qora charm remeshok",
      clasp: "Klassik tilla po'lat qisqich",
      functions: ["Azon signali", "Qibla yo'nalishi", "Kunlik uyg'otgich", "Ikki xil vaqt zonalari"],
    },
    tags: ["Klassik Charm", "Tilla Korpus", "Azon Soati", "Sovg'abop"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    islamicFeatures: {
      azanTimes: true,
      qiblaCompass: true,
      hijriCalendar: true,
      quranBookmark: true,
    },
  },
  {
    id: "alfajr-wl08",
    slug: "al-fajr-wl-08-diamond-shape",
    brand: "Al-Fajr",
    model: "WL-08 Diamond Luxury",
    referenceNumber: "WL-08",
    category: "alfajr",
    name: "Al-Fajr WL-08 Ayollar & Erkaklar Azan Soati",
    nameRu: "Al-Fajr WL-08 Унисекс с Азаном",
    price: 1250000,
    oldPrice: 1400000,
    currency: "UZS",
    images: [
      "/images/watches/jlc-reverso-1.webp",
      "/images/watches/jlc-reverso-2.webp",
      "/images/watches/jlc-reverso-3.webp",
    ],
    description: "Nafis to'rtburchak shakldagi eksklyuziv model. Bilakda juda ixcham va viqorli ko'rinadi. Azon vaqtlari ovozli va vizual tarzda eslatiladi.",
    specs: {
      movement: "Al-Fajr Calibre 2026",
      caseDiameter: "31 x 40 mm",
      caseThickness: "9.8 mm",
      caseMaterial: "Zanglamas sayqallangan po'lat",
      bezel: "Geometrik fasetli rom",
      dialColor: "Qoramtir zumrad tusli siferblat",
      glass: "Mineral qavariq billur",
      waterResistance: "3 ATM",
      strap: "Po'lat zanjirli qulay braslet",
      clasp: "Kapalak shaklidagi buklama",
      functions: ["Toshkent vaqti bilan azon", "Qibla hisoblagich", "Hijriy sana", "Batareya darajasi ko'rsatkichi"],
    },
    tags: ["Ixcham Dizayn", "Azon Soati", "Uniseks"],
    featured: false,
    inStock: true,
    isCustomizable: true,
    islamicFeatures: {
      azanTimes: true,
      qiblaCompass: true,
      hijriCalendar: true,
      quranBookmark: true,
    },
  },
  {
    id: "alfajr-wp04",
    slug: "al-fajr-wp-04-sport-black",
    brand: "Al-Fajr",
    model: "WP-04 Sport Active",
    referenceNumber: "WP-04",
    category: "alfajr",
    name: "Al-Fajr WP-04 Sport Qora Azan",
    nameRu: "Al-Fajr WP-04 Sport Black с Азаном",
    price: 980000,
    oldPrice: 1150000,
    currency: "UZS",
    images: [
      "/images/watches/omega-speedmaster-1.webp",
      "/images/watches/omega-speedmaster-2.webp",
      "/images/watches/omega-speedmaster-3.webp",
    ],
    description: "Sport va faol hayot tarzi uchun maxsus ishlab chiqilgan yengil Al-Fajr soati. Mustahkam polimer korpus, yumshoq silikon remeshok va suvga yuqori chidamlilik.",
    specs: {
      movement: "Al-Fajr Shock-Resistant Digital Engine",
      caseDiameter: "43 mm",
      caseThickness: "12 mm",
      caseMaterial: "Yuqori zichlikdagi kompozit polimer",
      bezel: "Zarbga chidamli mat qora",
      dialColor: "Moviy orqa yoritgichli LCD",
      glass: "Akril qattiq billur",
      waterResistance: "5 ATM (Cho'milish va sportga mos)",
      strap: "Gipoallergen elastik silikon",
      clasp: "Temir klassik qisqich",
      functions: ["5 vaqt azon", "Qibla kompas", "Sekundomer", "Yorqin tungi yoritgich (EL Backlight)"],
    },
    tags: ["Sport", "Suvga Chidamli", "Silikon", "Hamyonbop"],
    featured: false,
    inStock: true,
    isCustomizable: false,
    islamicFeatures: {
      azanTimes: true,
      qiblaCompass: true,
      hijriCalendar: true,
      quranBookmark: true,
    },
  },
  {
    id: "tsar-bomba-tb8204",
    slug: "tsar-bomba-tb-8204-ceramic-luxury",
    brand: "Tsar Bomba",
    model: "TB-8204 Ceramic & Rose Gold",
    referenceNumber: "TB-8204",
    category: "tsar_bomba",
    name: "Tsar Bomba TB-8204 Tonneau Rose Gold",
    nameRu: "Tsar Bomba TB-8204 Tonneau Rose Gold",
    price: 3650000,
    oldPrice: 4200000,
    currency: "UZS",
    images: [
      "/images/watches/ap-royal-oak-1.webp",
      "/images/watches/ap-royal-oak-2.webp",
      "/images/watches/ap-royal-oak-3.webp",
    ],
    description: "Richard Mille uslubidagi afsonaviy bochkasimon (Tonneau) korpus. Yaponiyaning yuqori aniqlikdagi Seiko VK67 mexanizmi, qirilmaydigan safir oyna va teflon qoplamali qizil tilla hoshiya.",
    specs: {
      movement: "Yapon Quartz Xronografi (Seiko VK67 Mecha-Quartz)",
      caseDiameter: "43.5 x 50.4 mm",
      caseThickness: "15.5 mm",
      caseMaterial: "316L jarrohlik po'lati + Karbon tola",
      bezel: "18K Rose Gold PVD + Titan vintlar",
      dialColor: "Skeleton ko'p qatlamli 3D siferblat",
      glass: "Haqiqiy Safir oyna (Anti-reflective Sapphire)",
      waterResistance: "5 ATM (50 metr)",
      strap: "Harbiy darajadagi FKM ftorokauchuk remeshok",
      clasp: "Ergonomik po'lat qisqich",
      functions: ["Xronograf soniyalar", "24 soatlik format", "Sana ko'rsatkichi", "Lyuminestsent tilla ko'rsatkichlar"],
    },
    tags: ["Tsar Bomba", "Tonneau Korpus", "Safir Oyna", "Premium Xit"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
  },
  {
    id: "tsar-bomba-tb8208",
    slug: "tsar-bomba-tb-8208-mechanical-skeleton",
    brand: "Tsar Bomba",
    model: "TB-8208 Automatic Skeleton",
    referenceNumber: "TB-8208",
    category: "tsar_bomba",
    name: "Tsar Bomba TB-8208 Avtomatik Mexanika",
    nameRu: "Tsar Bomba TB-8208 Механика Скелетон",
    price: 4850000,
    oldPrice: 5500000,
    currency: "UZS",
    images: [
      "/images/watches/vacheron-overseas-1.webp",
      "/images/watches/vacheron-overseas-2.webp",
      "/images/watches/vacheron-overseas-3.webp",
    ],
    description: "Batareyasiz ishlaydigan, bilak harakatidan avtomatik zaryadlanuvchi ochiq skelet mexanizm. Shaffof orqa qopqoq va kuchli sport dizayni.",
    specs: {
      movement: "Avtomatik mexanizm (Custom Citizen Miyota Skeleton Calibre)",
      caseDiameter: "44 x 51 mm",
      caseThickness: "15.8 mm",
      caseMaterial: "Karbon kompozit va po'lat",
      bezel: "Ko'mir qora PVD qoplama",
      dialColor: "To'liq ochiq skelet mexanizm",
      glass: "Safir billur oyna",
      waterResistance: "5 ATM",
      powerReserve: "42 soat uzluksiz quvvat zaxirasi",
      strap: "Olovrang yoki qora FKM sport kauchuk",
      clasp: "Kengaytirilgan mustahkam qisqich",
      functions: ["Avtomatik zaryadlanish", "Ochiq muvozanat g'ildiragi", "Shaffof safir orqa oyna"],
    },
    tags: ["Avtomatik Mexanika", "Skeleton", "Karbon", "TOP Nufuz"],
    featured: true,
    inStock: true,
    isCustomizable: true,
  },
  {
    id: "philipp-plein-skull",
    slug: "philipp-plein-the-skull-black-gold",
    brand: "Philipp Plein",
    model: "The $kull King Edition",
    referenceNumber: "PWAAA0121",
    category: "philipp_plein",
    name: "Philipp Plein The $kull Black & Gold",
    nameRu: "Philipp Plein The $kull Black & Gold",
    price: 3890000,
    oldPrice: 4400000,
    currency: "UZS",
    images: [
      "/images/watches/tag-heuer-carrera-1.webp",
      "/images/watches/tag-heuer-carrera-2.webp",
      "/images/watches/tag-heuer-carrera-3.webp",
    ],
    description: "Jasur va eksklyuziv ko'rinish. 3D relyefli mashhur Philipp Plein bosh suyagi ramzi, zumrad va tilla rangli jilolar hamda xarizmatik dizayn.",
    specs: {
      movement: "Yapon kvars mexanizmi (Miyota 203A)",
      caseDiameter: "44 mm",
      caseThickness: "14.4 mm",
      caseMaterial: "IP Qora va Tilla qoplamali po'lat",
      bezel: "Swarovski kristallari bilan bezatilgan bezel",
      dialColor: "3D Faceted Skull (Bosh suyagi) markazda",
      glass: "Mineral qirilishga qarshi oyna",
      waterResistance: "5 ATM",
      strap: "Yumshoq silikon Philipp Plein naqshli",
      clasp: "Tilla tanaffusli qisqich",
      functions: ["Aniq vaqt", "Lyuminestsent siferblat", "Maxsus brend quti"],
    },
    tags: ["Philipp Plein", "The Skull", "Lyuks", "Kreativ"],
    featured: true,
    inStock: true,
    isCustomizable: false,
  },
  {
    id: "philipp-plein-extreme",
    slug: "philipp-plein-extreme-chronograph",
    brand: "Philipp Plein",
    model: "Plein Extreme Chrono",
    referenceNumber: "PWGAA0821",
    category: "philipp_plein",
    name: "Philipp Plein Extreme Chrono Silver",
    nameRu: "Philipp Plein Extreme Хронограф",
    price: 3450000,
    oldPrice: 3900000,
    currency: "UZS",
    images: [
      "/images/watches/breitling-navitimer-1.webp",
      "/images/watches/breitling-navitimer-2.webp",
      "/images/watches/breitling-navitimer-3.webp",
    ],
    description: "Katta va salobatli 44 mm korpus, sport xronografi va monolit po'lat braslet. O'ziga ishongan insonlar uchun mukammal tanlov.",
    specs: {
      movement: "Precision Quartz Chronograph",
      caseDiameter: "44 mm",
      caseThickness: "13.2 mm",
      caseMaterial: "Zanglamas po'lat 316L",
      bezel: "Taximetr shkalali sport bezeli",
      dialColor: "Qora gilosimon gilotsh",
      glass: "Qattiqlashtirilgan mineral billur",
      waterResistance: "5 ATM",
      strap: "Og'ir va monolit zanglamas po'lat braslet",
      clasp: "Xavfsizlik tugmali kapalak qisqich",
      functions: ["Xronograf 1/10 soniya", "Sana ko'rsatkichi", "Taximetr"],
    },
    tags: ["Klassik Xronograf", "Monolit Po'lat", "Philipp Plein"],
    featured: false,
    inStock: true,
    isCustomizable: true,
  },
  {
    id: "alfajr-cw05-wall",
    slug: "al-fajr-cw-05-azan-wall-clock",
    brand: "Al-Fajr",
    model: "CW-05 Classic Azan Clock",
    referenceNumber: "CW-05",
    category: "alfajr",
    name: "Al-Fajr CW-05 Katta Devor & Stol Azon Soati",
    nameRu: "Al-Fajr CW-05 Большие Настенные Часы с Азаном",
    price: 1100000,
    oldPrice: 1300000,
    currency: "UZS",
    images: [
      "/images/watches/grand-seiko-snowflake-1.webp",
      "/images/watches/grand-seiko-snowflake-2.webp",
      "/images/watches/grand-seiko-snowflake-3.webp",
    ],
    description: "Xonadon, ofis va namozxonalar uchun mo'ljallangan Al-Fajr devor va stol azon soati. 5 mahal to'liq go'zal azon ovozi (Makka, Madina, Quddus azonlari), harorat o'lchagich va qulay masofaviy pult.",
    specs: {
      movement: "Al-Fajr Wall Audio Precision Processor",
      caseDiameter: "230 x 390 mm",
      caseThickness: "30 mm",
      caseMaterial: "Oliy toifali yog'och va kumush naqshli korpus",
      bezel: "Keng ko'rish burchagiga ega ramka",
      dialColor: "Katta harfli kontrastli LCD displey",
      glass: "Himoya billur oynasi",
      waterResistance: "Xona sharoiti uchun",
      strap: "Devorga osish va stolga qo'yish tirgagi",
      clasp: "Stol tirgagi kiritilgan",
      functions: ["Makka/Madina azon ovozlari", "Ovoz balandligini sozlash", "Xona harorati", "Keyingi namozgacha qolgan vaqt"],
    },
    tags: ["Devor Soati", "Go'zal Azon Ovozi", "Xonadon Uchun", "Eng Yaxshi Sovg'a"],
    featured: true,
    inStock: true,
    isCustomizable: false,
    islamicFeatures: {
      azanTimes: true,
      qiblaCompass: true,
      hijriCalendar: true,
      quranBookmark: true,
    },
  },
];

export default productsData;
