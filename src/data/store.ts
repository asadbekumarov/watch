import type { StoreBranch, StoreInfo } from "@/types/store";

export type { StoreBranch, StoreInfo };

export const storeData: StoreInfo = {
  name: "SwissWatch_premium",
  displayName: "SwissWatch Premium",
  taglineUz: "Toshkent va Namangandagi West End Watch hamda Jacques Philippe soatlari kolleksiyasi",
  taglineRu: "Коллекция часов West End Watch и Jacques Philippe в Ташкенте и Намангане",
  aboutUz:
    "SwissWatch Premium — Toshkent va Namangan shaharlaridagi do'konlarda West End Watch hamda Jacques Philippe soatlarini taklif etadi. Do'konga tashrif buyurib modellarni ko'rishingiz yoki Telegram orqali narxlarni aniqlab buyurtma berishingiz mumkin.",
  aboutRu:
    "SwissWatch Premium представляет коллекции часов West End Watch и Jacques Philippe в Ташкенте и Намангане. Вы можете ознакомиться с моделями в наших филиалах или уточнить актуальные цены и детали через Telegram.",
  phone: "+998 88 500 70 00",
  phoneClean: "+998885007000",
  telegramChannel: "https://t.me/swisswatch_premium",
  telegramManager: "@swissWatch_admin",
  telegramManagerUrl: "https://t.me/swissWatch_admin",
  instagramHandle: null, // TODO: Instagram handle not verified yet by store
  workingHoursUz: "Ish vaqtini menejerdan so'rang", // TODO: store never gave hours, replace with real showroom hours once confirmed
  workingHoursRu: "Уточняйте график у менеджера", // TODO: store never gave hours, replace with real showroom hours once confirmed
  branches: [
    {
      id: "tashkent",
      city: "Toshkent shahri",
      cityRu: "г. Ташкент",
      address: "Toshkent shahri, Langar ko'chasi, 12-uy", // TODO: confirm house number, 12 or 8
      addressRu: "г. Ташкент, ул. Лангар, дом 12",
      landmark: "Hotel Marwa mehmonxonasi",
      landmarkRu: "Ориентир: гостиница Hotel Marwa",
      note: "Hotel Marwa yaqinida",
    },
    {
      id: "namangan",
      city: "Namangan shahri",
      cityRu: "г. Наманган",
      address: "Namangan shahri, A. Navoiy ko'chasi, 42-uy",
      addressRu: "г. Наманган, ул. А. Навои, дом 42",
      landmark: "Shodlik savdo markazi",
      landmarkRu: "Ориентир: ТЦ Шодлик",
    },
  ],
  deliveryInfoUz: "Yetkazib berish shartlari menejer bilan kelishiladi", // TODO: confirm delivery options
  deliveryInfoRu: "Условия доставки согласовываются с менеджером",
};

export default storeData;
