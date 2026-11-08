export interface DeliveryMethodOption {
  id: string;
  name_uz: string;
  name_ru: string;
  delivery_type: "pickup" | "delivery";
  branch_id: string | null;
  price_usd: number;
  free_above_usd: number | null;
  is_enabled: boolean;
  sort_order: number;
}

export const FALLBACK_DELIVERY_METHODS: DeliveryMethodOption[] = [
  {
    id: "pickup_tashkent",
    name_uz: "Toshkent filialidan olib ketish (Langar ko'chasi 12)",
    name_ru: "Самовывоз из филиала в Ташкенте (ул. Лангар, 12)",
    delivery_type: "pickup",
    branch_id: "tashkent",
    price_usd: 0,
    free_above_usd: null,
    is_enabled: true,
    sort_order: 0,
  },
  {
    id: "pickup_namangan",
    name_uz: "Namangan filialidan olib ketish (A. Navoiy ko'chasi 42)",
    name_ru: "Самовывоз из филиала в Намангане (ул. А. Навои, 42)",
    delivery_type: "pickup",
    branch_id: "namangan",
    price_usd: 0,
    free_above_usd: null,
    is_enabled: true,
    sort_order: 1,
  },
  {
    id: "courier_city",
    name_uz: "Shahar bo'ylab kuryer orqali yetkazib berish",
    name_ru: "Курьерская доставка по гороdu",
    delivery_type: "delivery",
    branch_id: null,
    price_usd: 0, // Defaults to 0/TODO until owner configures
    free_above_usd: null,
    is_enabled: false,
    sort_order: 2,
  },
  {
    id: "regional_delivery",
    name_uz: "Viloyatlar bo'ylab yetkazib berish",
    name_ru: "Доставка по регионам",
    delivery_type: "delivery",
    branch_id: null,
    price_usd: 0, // Defaults to 0/TODO until owner configures
    free_above_usd: null,
    is_enabled: false,
    sort_order: 3,
  },
];

/**
 * Computes estimated ready date based on prepDays
 */
export function computeEstimatedReadyDate(
  prepDays: number = 1,
  locale: "uz" | "ru" = "uz",
  baseDate?: Date
): {
  date: Date;
  formatted: string;
  daysCount: number;
} {
  const days = Math.max(1, prepDays);
  // During static SSR/prerendering, use deterministic date to avoid dynamic prerender bailouts
  const targetDate = baseDate
    ? new Date(baseDate.getTime())
    : (typeof window === "undefined" ? new Date("2026-11-08T00:00:00Z") : new Date());
  targetDate.setDate(targetDate.getDate() + days);

  const monthNamesUz = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
  ];
  const monthNamesRu = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];

  const day = targetDate.getDate();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const formatted =
    locale === "ru"
      ? `${day} ${monthNamesRu[month]} ${year}`
      : `${day}-${monthNamesUz[month]}, ${year}`;

  return {
    date: targetDate,
    formatted,
    daysCount: days,
  };
}
