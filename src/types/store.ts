export interface StoreBranch {
  id: string;
  city: string;
  cityRu: string;
  address: string;
  addressRu: string;
  landmark: string;
  landmarkRu: string;
  note?: string; // TODO: internal note for store confirmation
}

export interface StoreInfo {
  name: string; // "SwissWatch_premium"
  displayName: string; // "SwissWatch Premium"
  taglineUz: string;
  taglineRu: string;
  aboutUz: string;
  aboutRu: string;
  phone: string; // "+998 88 500 70 00"
  phoneClean: string; // "+998885007000"
  telegramChannel: string; // "https://t.me/swisswatch_premium"
  telegramManager: string; // "@swissWatch_admin"
  telegramManagerUrl: string; // "https://t.me/swissWatch_admin"
  instagramHandle?: string | null; // TODO: store Instagram handle unverified
  workingHoursUz: string;
  workingHoursRu: string;
  branches: StoreBranch[];
  deliveryInfoUz: string;
  deliveryInfoRu: string;
  usdToUzsRate?: number | null;
}
