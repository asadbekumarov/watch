export interface StoreAddress {
  address: string;
  type: string;
  district: string;
  landmark: string;
}

export interface StoreDeliveryInfo {
  btsDelivery: string;
  tashkentDelivery: string;
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
  phoneSecondary: string;
  telegram: string;
  instagram: string;
  serviceCenter: string;
  followersCount: string;
  workingHours: string;
  mapsLink: string;
  delivery: StoreDeliveryInfo;
  serviceStory: {
    origin: string;
    guarantee: string;
    services: string;
  };
}

export const storeData: StoreInfo = {
  name: "ALFAJR — Soatlar Olami",
  tagline: "Islomiy Al-Fajr soatlari, Tsar Bomba va brend xronometrlarning O'zbekistondagi ishonchli do'koni",
  since: 2017,
  addresses: [
    {
      address: "Toshkent sh., Kichik Xalqa Yo'li, 19",
      type: "Bosh do'kon & Ko'rgazma zali",
      district: "Yakkasaroy / Kichik Xalqa",
      landmark: "Kichik Xalqa yo'li yoqasida, 09:00 dan 21:00 gacha",
    },
  ],
  phone: "+998 71 200 83 00",
  phoneSecondary: "+998 99 831 00 99",
  telegram: "@alfajr_uz",
  instagram: "@alfajr_uz",
  serviceCenter: "@soatsoz_uzb",
  followersCount: "235K+",
  workingHours: "Har kuni 09:00 - 21:00 (dam olish kunlarisiz)",
  mapsLink: "https://maps.google.com/?q=Toshkent+Kichik+Xalqa+Yoli+19",
  delivery: {
    btsDelivery: "O'zbekiston bo'ylab BTS Pochta filiallariga mutlaqo BEPUL yetkazib berish",
    tashkentDelivery: "Toshkent shahri bo'ylab tezkor kuryer xizmati (2-3 soatda eshikkacha)",
    freeDeliveryThreshold: 0,
    standardFee: 0,
    coverageArea: "O'zbekistonning barcha 14 ta hududi (BTS Express pochtalari) va Toshkent shahri",
  },
  serviceStory: {
    origin: "ALFAJR — O'zbekistonda 235 mingdan ortiq soat ixlosmandlarini birlashtirgan, ishonchli va asl soatlar maskani.",
    guarantee: "Barcha soatlarga 1 yillik rasmiy kafolat va xalqaro sifat pasporti taqdim etiladi.",
    services: "@soatsoz_uzb ixtisoslashtirilgan rasmiy servis markazi orqali bepul sozlash, batareya almashtirish, o'lchov olish va texnik xizmat ko'rsatiladi.",
  },
};

export default storeData;
