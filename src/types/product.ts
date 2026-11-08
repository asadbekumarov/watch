export type WatchBrand = "West End Watch" | "Jacques Philippe";
export type WatchMovement = "automatic" | "quartz";

export interface WatchSpecs {
  movement: string; // e.g. "Avtomatik mexanizm" or "Kvars (batareya)"
  movementType: WatchMovement;
  caseDiameter: string; // e.g. "32 mm", "41 mm"
  caseDiameterValue: number; // 31, 32, 37, 39, 41
  dialColor?: string;
  waterResistance?: string; // e.g. "50 m"
  glass?: string;
  features?: string[];
  notes?: string[]; // Store-provided notes (e.g. "Do'kon ma'lumotiga ko'ra: olmos sertifikati mavjud")
}

export interface Product {
  id: string;
  slug: string;
  brand: WatchBrand;
  model: string;
  name: string;
  nameRu: string;
  price: number | null; // null means "TODO: Narxni so'rash / Уточнить цену"
  currency: "USD";
  images: string[];
  descriptionUz: string;
  descriptionRu: string;
  specs: WatchSpecs;
  tags: string[];
  inStock: boolean;
  isBestseller?: boolean;
}
