export type WatchCategory = "diver" | "chronograph" | "dress" | "haute" | "aviation";
// Backward compatibility alias:
export type CoffeeCategory = WatchCategory;

export interface WatchSpecs {
  movement: string;
  caliber: string;
  caseDiameter: string;
  caseThickness: string;
  caseMaterial: string;
  bezel: string;
  dialColor: string;
  glass: string;
  waterResistance: string;
  powerReserve: string;
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
  // backward-compatibility fields:
  size?: string;
  sizeName?: string;
  milk?: string;
  milkName?: string;
  syrup?: string;
  syrupName?: string;
  temperature?: "hot" | "iced";
  sweetness?: "0%" | "50%" | "100%";
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
  // backward-compatibility properties:
  tasteProfile: string;
  volumeOrWeight: string;
  availableSizes?: CustomizationOption[];
  milkOptions?: CustomizationOption[];
  syrupOptions?: CustomizationOption[];
  temperatureOptions?: ("hot" | "iced")[];
  sweetnessOptions?: ("0%" | "50%" | "100%")[];
}

export const luxuryStrapOptions: CustomizationOption[] = [
  { id: "oem", name: "Standart Zavod Brasleti (Oystersteel)", extraPrice: 0 },
  { id: "leather", name: "Qo'lda tikilgan Aligator charm remeshok", extraPrice: 3500000 },
  { id: "rubber", name: "Shveytsariya Oysterflex kauchuk remeshok", extraPrice: 2200000 },
];

export const productsData: Product[] = [
  {
    id: "watch-01",
    slug: "rolex-submariner-date",
    brand: "Rolex",
    model: "Submariner Date",
    referenceNumber: "126610LN",
    category: "diver",
    name: "Rolex Submariner Date 41mm",
    nameRu: "Rolex Submariner Date 41мм",
    price: 185000000,
    oldPrice: 198000000,
    currency: "UZS",
    images: [
      "/images/watches/rolex-submariner-1.webp",
      "/images/watches/rolex-submariner-2.webp",
      "/images/watches/rolex-submariner-3.webp",
    ],
    description: "G'avvoslik soatlarining mutlaq standarti. 41 mm Oystersteel korpusi, qora Cerachrom keramik bezeli va COSC sertifikatiga ega avtomatik Calibre 3235 mexanizmi.",
    specs: {
      movement: "Avtomatik mexanizm (COSC Sertifikati)",
      caliber: "Rolex Calibre 3235",
      caseDiameter: "41 mm",
      caseThickness: "12.3 mm",
      caseMaterial: "Oystersteel 904L zanglamaydigan po'lat",
      bezel: "Bir tomonga aylanuvchi 60 daqiqalik Cerachrom keramika",
      dialColor: "Chuqur qora (Chromalight lyuminestsent)",
      glass: "Tirnalmas sapfir shisha (Sana oynasida Cyclops linzasi)",
      waterResistance: "300 metr / 30 ATM",
      powerReserve: "70 soat",
      strap: "Oystersteel 3 qatorli braslet",
      clasp: "Glidelock xavfsizlik qulfi",
      functions: ["Soat", "Daqiqa", "Soniya", "Tez o'zgaruvchi sana"],
    },
    tags: ["Legend", "Diver", "Xit Savdo"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Rolex Calibre 3235 · Oystersteel 904L",
    volumeOrWeight: "41 mm · 300m",
  },
  {
    id: "watch-02",
    slug: "audemars-piguet-royal-oak",
    brand: "Audemars Piguet",
    model: "Royal Oak 'Jumbo' Extra-Thin",
    referenceNumber: "16202ST.OO.1240ST.02",
    category: "haute",
    name: "Audemars Piguet Royal Oak 39mm",
    nameRu: "Audemars Piguet Royal Oak 39мм",
    price: 495000000,
    currency: "UZS",
    images: [
      "/images/watches/ap-royal-oak-1.webp",
      "/images/watches/ap-royal-oak-2.webp",
      "/images/watches/ap-royal-oak-3.webp",
    ],
    description: "Jerald Jenta tomonidan yaratilgan afsonaviy sakkizburchak shakli, 'Petite Tapisserie' naqshli siferblati va integratsiyalangan po'lat brasleti bilan Haute Horlogerie durdonasi.",
    specs: {
      movement: "Ultra-yupqa avtomatik kalibr",
      caliber: "Audemars Piguet Calibre 7121",
      caseDiameter: "39 mm",
      caseThickness: "8.1 mm",
      caseMaterial: "Sayqallangan zanglamaydigan po'lat",
      bezel: "Sakkizburchakli, 8 ta oq oltin vintli bezel",
      dialColor: "Bleu Nuit, Nuage 50 moviy 'Petite Tapisserie'",
      glass: "Ikki tomonlama antirefleks qoplamali sapfir shisha",
      waterResistance: "50 metr / 5 ATM",
      powerReserve: "55 soat",
      strap: "Integratsiyalangan po'lat braslet",
      clasp: "AP buklanuvchi qisqichi",
      functions: ["Soat", "Daqiqa", "Sana"],
    },
    tags: ["Haute Horlogerie", "Iconic", "Ultra-Thin"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Calibre 7121 · Petite Tapisserie",
    volumeOrWeight: "39 mm · 8.1mm",
  },
  {
    id: "watch-03",
    slug: "patek-philippe-nautilus",
    brand: "Patek Philippe",
    model: "Nautilus Steel Blue Dial",
    referenceNumber: "5711/1A-010",
    category: "haute",
    name: "Patek Philippe Nautilus 40mm",
    nameRu: "Patek Philippe Nautilus 40мм",
    price: 880000000,
    currency: "UZS",
    images: [
      "/images/watches/patek-nautilus-1.webp",
      "/images/watches/patek-nautilus-2.webp",
      "/images/watches/patek-nautilus-3.webp",
    ],
    description: "Dunyoning eng qadrli va nufuzli sport-lyuks soati. Kema illyuminatori shaklidagi korpus, gorizontal relyefli moviy siferblat va Patek Philippe Seal sertifikati.",
    specs: {
      movement: "Avtomatik mexanizm (Patek Philippe Seal)",
      caliber: "Calibre 26-330 S C",
      caseDiameter: "40 mm",
      caseThickness: "8.3 mm",
      caseMaterial: "Zanglamaydigan po'lat",
      bezel: "Satinlangan va sayqallangan porloq faskalar",
      dialColor: "Gorizontal relyefli qora-moviy gradient",
      glass: "Sapfir kristall old va orqa shisha",
      waterResistance: "120 metr / 12 ATM",
      powerReserve: "45 soat",
      strap: "Nautilus integratsiyalangan po'lat braslet",
      clasp: "Buklanuvchi xavfsizlik qisqichi",
      functions: ["Markaziy soniya", "Sana"],
    },
    tags: ["Patek Seal", "Grail Watch", "Premium"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Calibre 26-330 · 21K Oltin Rotor",
    volumeOrWeight: "40 mm · 120m",
  },
  {
    id: "watch-04",
    slug: "omega-speedmaster-moonwatch",
    brand: "Omega",
    model: "Speedmaster Professional Co-Axial",
    referenceNumber: "310.30.42.50.01.002",
    category: "chronograph",
    name: "Omega Speedmaster Moonwatch 42mm",
    nameRu: "Omega Speedmaster Moonwatch 42мм",
    price: 115000000,
    currency: "UZS",
    images: [
      "/images/watches/omega-speedmaster-1.webp",
      "/images/watches/omega-speedmaster-2.webp",
      "/images/watches/omega-speedmaster-3.webp",
    ],
    description: "Oydagi ilk soat (The First Watch Worn on the Moon). Co-Axial Master Chronometer Calibre 3861 mexanizmi va 15 000 gauss magnit qarshiligi bilan ta'minlangan afsona.",
    specs: {
      movement: "Qo'lda burama xronograf (Master Chronometer METAS)",
      caliber: "Omega Calibre 3861",
      caseDiameter: "42 mm",
      caseThickness: "13.2 mm",
      caseMaterial: "316L zanglamaydigan po'lat",
      bezel: "Anodlangan alyuminiy taximetr halqasi (Dot Over 90)",
      dialColor: "Qadamli mot qora siferblat",
      glass: "Ichki antirefleks qoplamali sapfir shisha",
      waterResistance: "50 metr / 5 ATM",
      powerReserve: "50 soat",
      strap: "5 qatorli ergonomik po'lat braslet",
      clasp: "Mikro-sozlanuvchi komfort qisqich",
      functions: ["12-soatlik xronograf", "Kichik soniya", "Taximetr"],
    },
    tags: ["Moonwatch", "METAS Certified", "Chronograph"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Calibre 3861 · 15 000 Gauss",
    volumeOrWeight: "42 mm · Sapphir",
  },
  {
    id: "watch-05",
    slug: "cartier-santos-de-cartier",
    brand: "Cartier",
    model: "Santos de Cartier Large",
    referenceNumber: "WSSA0018",
    category: "dress",
    name: "Cartier Santos de Cartier Large",
    nameRu: "Cartier Santos de Cartier Large",
    price: 110000000,
    currency: "UZS",
    images: [
      "/images/watches/cartier-santos-1.webp",
      "/images/watches/cartier-santos-2.webp",
      "/images/watches/cartier-santos-3.webp",
    ],
    description: "Tarixdagi ilk qo'l soati (1904-yil). Rim raqamlari, ko'k po'lat qilich millari va QuickSwitch patentlangan tezkor remeshok almashtirish tizimi.",
    specs: {
      movement: "Avtomatik mexanizm",
      caliber: "Cartier Calibre 1847 MC",
      caseDiameter: "39.8 mm x 47.5 mm",
      caseThickness: "9.38 mm",
      caseMaterial: "Zanglamaydigan po'lat",
      bezel: "Sayqallangan 8 ta vintli bezel",
      dialColor: "Opal kumushrang siferblat, Rim raqamlari",
      glass: "Tirnalmas sapfir shisha",
      waterResistance: "100 metr / 10 ATM",
      powerReserve: "42 soat",
      strap: "Po'lat braslet (SmartLink sozlash) + qo'shimcha teri remeshok",
      clasp: "Ikkita buklanuvchi po'lat qisqich",
      functions: ["Soat", "Daqiqa", "Soniya", "Sana"],
    },
    tags: ["Klassika", "QuickSwitch", "SmartLink"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Calibre 1847 MC · QuickSwitch",
    volumeOrWeight: "39.8 mm · 100m",
  },
  {
    id: "watch-06",
    slug: "breitling-navitimer-b01",
    brand: "Breitling",
    model: "Navitimer B01 Chronograph 43",
    referenceNumber: "AB0138241G1P1",
    category: "aviation",
    name: "Breitling Navitimer B01 43mm",
    nameRu: "Breitling Navitimer B01 43мм",
    price: 122000000,
    currency: "UZS",
    images: [
      "/images/watches/breitling-navitimer-1.webp",
      "/images/watches/breitling-navitimer-2.webp",
      "/images/watches/breitling-navitimer-3.webp",
    ],
    description: "Aviatsiya xronograflari qiroli. Aylana logarifmik chizg'ich bezeli va Breitling manufaktura Calibre 01 avtomatik xronograf mexanizmi.",
    specs: {
      movement: "Manufaktura avtomatik xronograf (COSC)",
      caliber: "Breitling Calibre 01",
      caseDiameter: "43 mm",
      caseThickness: "13.6 mm",
      caseMaterial: "Zanglamaydigan po'lat",
      bezel: "Ikki tomonlama aylanuvchi hisoblash chizg'ichi",
      dialColor: "Kumushrang siferblat, qora xronograf darchalari",
      glass: "Kamberlangan sapfir shisha (ikki tomonlama qoplama)",
      waterResistance: "30 metr / 3 ATM",
      powerReserve: "70 soat",
      strap: "Aligator terisi / Navitimer 7 qatorli po'lat",
      clasp: "Buklanuvchi qisqich",
      functions: ["1/4 soniya xronograf", "30 daqiqa", "12 soat", "Sana"],
    },
    tags: ["Aviation", "In-House B01", "Chronometer"],
    featured: false,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Breitling 01 · 70 Soat Quvvat",
    volumeOrWeight: "43 mm · Aviator",
  },
  {
    id: "watch-07",
    slug: "vacheron-constantin-overseas",
    brand: "Vacheron Constantin",
    model: "Overseas Self-Winding",
    referenceNumber: "4500V/110A-B128",
    category: "haute",
    name: "Vacheron Constantin Overseas 41mm",
    nameRu: "Vacheron Constantin Overseas 41мм",
    price: 430000000,
    currency: "UZS",
    images: [
      "/images/watches/vacheron-overseas-1.webp",
      "/images/watches/vacheron-overseas-2.webp",
      "/images/watches/vacheron-overseas-3.webp",
    ],
    description: "Shveytsariya 'Muqaddas Uchligi' a'zosi. Malte xochi shaklidagi bezel, laklangan moviy siferblat va 22K oltin rotorga ega Calibre 5100.",
    specs: {
      movement: "Avtomatik kalibr (Hallmark of Geneva)",
      caliber: "Calibre 5100",
      caseDiameter: "41 mm",
      caseThickness: "11.0 mm",
      caseMaterial: "Zanglamaydigan po'lat",
      bezel: "6 qirrali Malte kresti shaklidagi bezel",
      dialColor: "Chuqur shaffof moviy laklangan siferblat",
      glass: "Sapfir kristall old va orqa",
      waterResistance: "150 metr / 15 ATM",
      powerReserve: "60 soat",
      strap: "Tez almashinuvchi po'lat, charm va kauchuk remeshoklar",
      clasp: "Uch qavatli buklanuvchi qisqich",
      functions: ["Soat", "Daqiqa", "Soniya", "Sana"],
    },
    tags: ["Geneva Seal", "Holy Trinity", "Traveler"],
    featured: true,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Calibre 5100 · 22K Oltin Rotor",
    volumeOrWeight: "41 mm · 150m",
  },
  {
    id: "watch-08",
    slug: "jaeger-lecoultre-reverso",
    brand: "Jaeger-LeCoultre",
    model: "Reverso Classic Monoface",
    referenceNumber: "Q3858522",
    category: "dress",
    name: "Jaeger-LeCoultre Reverso Classic",
    nameRu: "Jaeger-LeCoultre Reverso Classic",
    price: 118000000,
    currency: "UZS",
    images: [
      "/images/watches/jlc-reverso-1.webp",
      "/images/watches/jlc-reverso-2.webp",
      "/images/watches/jlc-reverso-3.webp",
    ],
    description: "Art Deco davrining timsoli (1931-yil). Polo o'yinchilari uchun yaratilgan ag'dariluvchi korpus va Casa Fagliano qo'lbola charm remeshoki.",
    specs: {
      movement: "Qo'lda burama mexanik kalibr",
      caliber: "JLC Calibre 822",
      caseDiameter: "42.9 mm x 25.5 mm",
      caseThickness: "7.56 mm",
      caseMaterial: "Sayqallangan zanglamaydigan po'lat",
      bezel: "Klassik 3 chiziqli Art Deco bezeli",
      dialColor: "Kumushrang gilyoshli markaz, qora raqamlar",
      glass: "Sapfir shisha",
      waterResistance: "30 metr / 3 ATM",
      powerReserve: "42 soat",
      strap: "Casa Fagliano dizaynidagi buzoq terisi",
      clasp: "Buklanuvchi po'lat qisqich",
      functions: ["Soat", "Daqiqa"],
    },
    tags: ["Art Deco", "Reversible Case", "Dress"],
    featured: false,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Calibre 822 · Ag'dariluvchi korpus",
    volumeOrWeight: "42.9x25.5 mm · Yupqa",
  },
  {
    id: "watch-09",
    slug: "grand-seiko-snowflake",
    brand: "Grand Seiko",
    model: "Heritage Collection 'Snowflake'",
    referenceNumber: "SBGA211",
    category: "dress",
    name: "Grand Seiko Snowflake Spring Drive",
    nameRu: "Grand Seiko Snowflake Spring Drive",
    price: 86000000,
    currency: "UZS",
    images: [
      "/images/watches/grand-seiko-snowflake-1.webp",
      "/images/watches/grand-seiko-snowflake-2.webp",
      "/images/watches/grand-seiko-snowflake-3.webp",
    ],
    description: "Shinshu tog'laridagi toza qor qoplamini aks ettiruvchi siferblat, o'ta yengil titan korpus va to'xtovsiz mayin suzuvchi Spring Drive 9R65 sekundi.",
    specs: {
      movement: "Spring Drive gibrid mexanizmi",
      caliber: "Calibre 9R65",
      caseDiameter: "41 mm",
      caseThickness: "12.5 mm",
      caseMaterial: "High-Intensity Titanium (O'ta mustahkam titan)",
      bezel: "Zaratsu oynasimon sayqallash texnikasi",
      dialColor: "Qor to'qimali oq Snowflake siferblati",
      glass: "Ikki tomonlama antirefleks sapfir shisha",
      waterResistance: "100 metr / 10 ATM",
      powerReserve: "72 soat (Quvvat indikatori)",
      strap: "High-Intensity Titanium braslet",
      clasp: "Uch qavatli tugmali qisqich",
      functions: ["Suzuvchi soniya", "Sana", "Quvvat zaxirasi indikatori"],
    },
    tags: ["Spring Drive", "Titanium", "Zaratsu Polish"],
    featured: false,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Spring Drive 9R65 · Suzuvchi soniya",
    volumeOrWeight: "41 mm · Titan",
  },
  {
    id: "watch-10",
    slug: "tag-heuer-carrera-glassbox",
    brand: "TAG Heuer",
    model: "Carrera Chronograph 39mm",
    referenceNumber: "CBS2210.FC6534",
    category: "chronograph",
    name: "TAG Heuer Carrera Glassbox 39mm",
    nameRu: "TAG Heuer Carrera Glassbox 39мм",
    price: 89000000,
    currency: "UZS",
    images: [
      "/images/watches/tag-heuer-carrera-1.webp",
      "/images/watches/tag-heuer-carrera-2.webp",
      "/images/watches/tag-heuer-carrera-3.webp",
    ],
    description: "Jack Heuer afsonasining 60 yilligi sharafiga qayta ishlangan 'Glassbox' gumbazsimon sapfiri va ikki tomonlama o'qiluvchi taximetr shkalasi.",
    specs: {
      movement: "Avtomatik manufaktura xronografi",
      caliber: "Calibre TH20-00",
      caseDiameter: "39 mm",
      caseThickness: "13.86 mm",
      caseMaterial: "Sayqallangan zanglamaydigan po'lat",
      bezel: "Glassbox ichki kavisli taximetr shkalasi",
      dialColor: "Qora sirkulyar satinlangan siferblat",
      glass: "Gumbazsimon ikki tomonlama antirefleks sapfir",
      waterResistance: "100 metr / 10 ATM",
      powerReserve: "80 soat",
      strap: "Perforatsiyalangan poyga buzoq terisi",
      clasp: "Buklanuvchi po'lat qisqich",
      functions: ["1/4 soniya xronograf", "30 daqiqa", "12 soat", "Sana"],
    },
    tags: ["Racing Icon", "Glassbox", "80h Reserve"],
    featured: false,
    inStock: true,
    isCustomizable: true,
    availableStraps: luxuryStrapOptions,
    tasteProfile: "Calibre TH20-00 · 80 Soat Quvvat",
    volumeOrWeight: "39 mm · Glassbox",
  },
];

// Accessories for Upsell
export const watchAccessories = [
  {
    id: "acc-01",
    name: "Swiss KubiK Avtomatik Soat Aylantirgich (Watch Winder)",
    price: 9500000,
    image: "/images/watches/rolex-submariner-2.webp",
    description: "Shveytsariya motorli dasturlanadigan magnitsiz winder.",
  },
  {
    id: "acc-02",
    name: "Haqiqiy Charm Sayohat G'ilofi (Travel Watch Roll)",
    price: 3200000,
    image: "/images/watches/ap-royal-oak-2.webp",
    description: "3 ta soat uchun xavfsiz ichki baxmal qoplamali sayohat g'ilofi.",
  },
  {
    id: "acc-03",
    name: "Bergeon Professional Tozalash va Polirovka To'plami",
    price: 1800000,
    image: "/images/watches/patek-nautilus-2.webp",
    description: "Sapfir va 904L po'latni parvarishlovchi Shveytsariya to'plami.",
  },
];
