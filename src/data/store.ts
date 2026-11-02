// SAMPLE DATA - replace

export interface StoreAddress {
  address: string;
  type: string;
}

export interface StoreInstallment {
  enabled: boolean;
  months: number[];
}

export interface StoreGuarantees {
  original: boolean;
  warrantyMonths: number;
  boxAndDocuments: boolean;
  delivery: string;
}

export interface StoreInfo {
  name: string;
  since: number;
  addresses: StoreAddress[];
  phone: string;
  telegram: string;
  instagram: string;
  workingHours: string;
  mapsLink: string;
  installment: StoreInstallment;
  guarantees: StoreGuarantees;
}

export const storeData: StoreInfo = {
  name: "Vaqt Saroyi",
  since: 2009,
  addresses: [
    {
      address: "Toshkent, Amir Temur ko'chasi 108",
      type: "bosh do'kon",
    },
    {
      address: "Toshkent, Chilonzor, Bunyodkor shoh ko'chasi 24",
      type: "filial",
    },
  ],
  phone: "+998 90 123 45 67",
  telegram: "@vaqtsaroyi_demo",
  instagram: "@vaqtsaroyi.demo",
  workingHours: "Har kuni 10:00 - 21:00",
  mapsLink: "https://maps.google.com/?q=Toshkent+Amir+Temur+108",
  installment: {
    enabled: true,
    months: [6, 12],
  },
  guarantees: {
    original: true,
    warrantyMonths: 24,
    boxAndDocuments: true,
    delivery: "Toshkent bo'ylab bepul, viloyatlarga pochta orqali",
  },
};

export default storeData;

