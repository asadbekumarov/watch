export interface StoreAddress {
  address: string;
  type: string;
  district: string;
  landmark: string;
}

export interface StoreDeliveryInfo {
  estimatedMinutes: string;
  freeDeliveryThreshold: number;
  standardFee: number;
  coverageArea: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  since: number;
  addresses: StoreAddress[];
  phone: string;
  telegram: string;
  instagram: string;
  workingHours: string;
  mapsLink: string;
  delivery: StoreDeliveryInfo;
  heritageStory: {
    origin: string;
    guarantee: string;
    services: string;
  };
}

export const storeData: StoreInfo = {
  name: "Chronos Genève | Haute Horlogerie",
  tagline: "O'zbekistondagi rasmiy Shveytsariya lyuks soatlari butigi va maxsus xizmat",
  since: 2018,
  addresses: [
    {
      address: "Toshkent, Amir Temur shoh ko'chasi 107B",
      type: "Markaziy VIP Showroom & Xizmat Markazi",
      district: "Yunusobod",
      landmark: "Wyndham Tashkent mehmonxonasi yonida",
    },
    {
      address: "Toshkent, Mirobod ko'chasi 21",
      type: "Zarafshon Exclusive Lounge",
      district: "Mirobod",
      landmark: "Premier Hall ro'parasida",
    },
  ],
  phone: "+998 71 200 88 00",
  telegram: "@chronos_geneve",
  instagram: "@chronos.uz",
  workingHours: "Har kuni 10:00 - 21:00 (VIP qabul oldindan yozilish orqali)",
  mapsLink: "https://maps.google.com/?q=Toshkent+Amir+Temur+107B",
  delivery: {
    estimatedMinutes: "1-2 soat ichida",
    freeDeliveryThreshold: 0, // All watches are delivered with complimentary VIP armored courier
    standardFee: 0,
    coverageArea: "Toshkent shahri va O'zbekiston bo'ylab maxsus zirhli inkassatsiya kuryerida",
  },
  heritageStory: {
    origin: "Barcha taqdim etilgan soatlar Jeneva va Le Lokldagi rasmiy ishlab chiqaruvchilardan to'g'ridan-to'g'ri keltiriladi.",
    guarantee: "Har bir soatga xalqaro COSC xronometr sertifikati va 5 yillik rasmiy ishlab chiqaruvchi kafolati taqdim etiladi.",
    services: "Bepul o'lchov, remeshok almashtirish, xususiy gravirovka va bir umrlik profilaktika xizmati.",
  },
};

export default storeData;
