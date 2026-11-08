import fs from "node:fs";
import path from "node:path";
import type { Database, OrderStatus, UserRole } from "./types/database.types";
import {
  FALLBACK_PRODUCTS,
  FALLBACK_SETTINGS,
  FALLBACK_BRANCHES,
  FALLBACK_FAQS,
  FALLBACK_HERO_BANNERS,
  FALLBACK_DELIVERY_METHODS,
  FALLBACK_PROMO_CODES,
} from "./fallbackData";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
export type BranchRow = Database["public"]["Tables"]["branches"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
export type HeroBannerRow = Database["public"]["Tables"]["hero_banners"]["Row"];
export type DeliveryMethodRow = Database["public"]["Tables"]["delivery_methods"]["Row"];
export type PromoCodeRow = Database["public"]["Tables"]["promo_codes"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export interface SmsLogEntry {
  id: string;
  order_id: string | null;
  phone: string;
  message: string;
  provider: string;
  status: "sent" | "failed" | "pending";
  attempt_count: number;
  external_id: string | null;
  error_details: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: UserRole | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: unknown;
  new_values: unknown;
  ip_address: string | null;
  created_at: string;
}

export interface DevStoreData {
  products: ProductRow[];
  site_settings: SiteSettingsRow;
  hero_banners: HeroBannerRow[];
  branches: BranchRow[];
  faqs: FaqRow[];
  delivery_methods: DeliveryMethodRow[];
  promo_codes: PromoCodeRow[];
  orders: OrderRow[];
  order_items: OrderItemRow[];
  sms_log: SmsLogEntry[];
  audit_log: AuditLogEntry[];
}

const STORE_PATH = path.resolve(
  /*turbopackIgnore: true*/ process.cwd(),
  process.cwd().endsWith("admin") ? "../shared/dev_data.json" : "shared/dev_data.json"
);

function getInitialStore(): DevStoreData {
  return {
    products: [...FALLBACK_PRODUCTS],
    site_settings: { ...FALLBACK_SETTINGS },
    hero_banners: [...FALLBACK_HERO_BANNERS],
    branches: [...FALLBACK_BRANCHES],
    faqs: [...FALLBACK_FAQS],
    delivery_methods: [...FALLBACK_DELIVERY_METHODS],
    promo_codes: [...FALLBACK_PROMO_CODES],
    orders: [
      {
        id: "ord-demo-001",
        order_number: "SWP-2026-9219",
        customer_name: "Azizbek Rahimov",
        customer_phone: "+998 90 123 45 67",
        customer_email: null,
        lang: "uz",
        status: "new",
        delivery_type: "pickup",
        branch_id: "branch-central",
        delivery_method_id: "delivery-pickup",
        delivery_address: null,
        comment: "Kechga yaqin olib ketaman.",
        internal_notes: "Mijoz bilan bog'lanildi, soat tayyorlanmoqda.",
        promo_code_id: null,
        promo_code: null,
        discount_usd: 0,
        subtotal_usd: 1300,
        delivery_fee_usd: 0,
        total_usd: 1300,
        usd_to_uzs_rate: null,
        total_uzs: null,
        payment_method: "cash_on_delivery",
        payment_status: "unpaid",
        estimated_ready_date: "2026-11-09T18:00:00.000Z",
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
    order_items: [
      {
        id: 1,
        order_id: "ord-demo-001",
        product_id: "west-end-watch-32mm",
        product_slug: "west-end-watch-32mm",
        product_name_uz: "West End Watch 32mm (Olmos sertifikati bilan)",
        product_name_ru: "West End Watch 32mm (С сертификатом на бриллианты)",
        brand: "West End Watch",
        image_url: "/images/watches/west-end-watch-32mm.webp",
        unit_price_usd: 1300,
        quantity: 1,
        total_price_usd: 1300,
        prep_days: 1,
      },
    ],
    sms_log: [
      {
        id: "sms-demo-1",
        order_id: "ord-demo-001",
        phone: "+998901234567",
        message: "SwissWatch: Buyurtmangiz qabul qilindi #SWP-2026-9219. Summa: $1300 USD.",
        provider: "mock",
        status: "sent",
        attempt_count: 1,
        external_id: "mock-sms-001",
        error_details: null,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
    audit_log: [
      {
        id: "audit-demo-1",
        actor_id: "dev-owner-id",
        actor_email: "watch@gmail.com",
        actor_role: "owner",
        action: "INIT_DEV_STORE",
        entity_type: "system",
        entity_id: "default",
        old_values: null,
        new_values: { initialized: true },
        ip_address: "127.0.0.1",
        created_at: new Date().toISOString(),
      },
    ],
  };
}

function readStore(): DevStoreData {
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ STORE_PATH)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[DevStore] Failed reading dev store:", err);
  }

  const initial = getInitialStore();
  writeStore(initial);
  return initial;
}

function writeStore(data: DevStoreData): void {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[DevStore] Failed writing dev store:", err);
  }
}

// ==========================================
// 1. PRODUCTS
// ==========================================
export function getDevProducts(): ProductRow[] {
  return readStore().products;
}

export function saveDevProduct(product: Partial<ProductRow> & { id: string; slug: string }): ProductRow {
  const store = readStore();
  const existingIdx = store.products.findIndex((p) => p.id === product.id);
  const now = new Date().toISOString();

  let fullProduct: ProductRow;
  if (existingIdx >= 0) {
    fullProduct = {
      ...store.products[existingIdx],
      ...product,
      updated_at: now,
    };
    store.products[existingIdx] = fullProduct;
  } else {
    fullProduct = {
      id: product.id,
      slug: product.slug,
      brand: product.brand || "West End Watch",
      model: product.model || "",
      name_uz: product.name_uz || "Yangi soat",
      name_ru: product.name_ru || "Новые часы",
      price_usd: product.price_usd !== undefined ? product.price_usd : null,
      currency: "USD",
      images: product.images || ["/images/watches/west-end-watch-32mm.webp"],
      description_uz: product.description_uz || "",
      description_ru: product.description_ru || "",
      movement_type: product.movement_type || "automatic",
      movement_text: product.movement_text || "Avtomatik mexanizm",
      case_diameter: product.case_diameter || "40 mm",
      case_diameter_val: product.case_diameter_val || 40,
      dial_color: product.dial_color || null,
      water_resistance: product.water_resistance || "50 m",
      glass: product.glass || "Sapfir",
      features: product.features || [],
      notes: product.notes || [],
      tags: product.tags || [],
      in_stock: product.in_stock !== undefined ? product.in_stock : true,
      is_bestseller: Boolean(product.is_bestseller),
      is_active: product.is_active !== undefined ? product.is_active : true,
      stock_quantity: product.stock_quantity || 5,
      prep_days: product.prep_days || 1,
      sort_order: product.sort_order || store.products.length + 1,
      created_at: now,
      updated_at: now,
    };
    store.products.unshift(fullProduct);
  }

  writeStore(store);
  return fullProduct;
}

export function toggleDevProductActive(id: string, newState: boolean): boolean {
  const store = readStore();
  const prod = store.products.find((p) => p.id === id);
  if (!prod) return false;
  prod.is_active = newState;
  prod.updated_at = new Date().toISOString();
  writeStore(store);
  return true;
}

export function deleteDevProduct(id: string): boolean {
  const store = readStore();
  const initLen = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  if (store.products.length !== initLen) {
    writeStore(store);
    return true;
  }
  return false;
}

// ==========================================
// 2. SITE SETTINGS
// ==========================================
export function getDevSettings(): SiteSettingsRow {
  return readStore().site_settings;
}

export function updateDevSettings(patch: Partial<SiteSettingsRow>): SiteSettingsRow {
  const store = readStore();
  store.site_settings = {
    ...store.site_settings,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  writeStore(store);
  return store.site_settings;
}

// ==========================================
// 3. HERO BANNER
// ==========================================
export function getDevHero(): HeroBannerRow {
  const store = readStore();
  return store.hero_banners[0] || FALLBACK_HERO_BANNERS[0];
}

export function updateDevHero(patch: Partial<HeroBannerRow>): HeroBannerRow {
  const store = readStore();
  if (store.hero_banners.length === 0) {
    store.hero_banners = [{ ...FALLBACK_HERO_BANNERS[0], ...patch }];
  } else {
    store.hero_banners[0] = {
      ...store.hero_banners[0],
      ...patch,
    };
  }
  writeStore(store);
  return store.hero_banners[0];
}

// ==========================================
// 4. BRANCHES
// ==========================================
export function getDevBranches(): BranchRow[] {
  return readStore().branches;
}

export function updateDevBranch(id: string, patch: Partial<BranchRow>): BranchRow | null {
  const store = readStore();
  const idx = store.branches.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  store.branches[idx] = { ...store.branches[idx], ...patch };
  writeStore(store);
  return store.branches[idx];
}

// ==========================================
// 5. FAQS
// ==========================================
export function getDevFaqs(): FaqRow[] {
  return readStore().faqs;
}

export function saveDevFaq(faq: Partial<FaqRow> & { question_uz: string; answer_uz: string }): FaqRow {
  const store = readStore();
  let result: FaqRow;
  if (faq.id) {
    const idx = store.faqs.findIndex((f) => f.id === faq.id);
    if (idx >= 0) {
      result = { ...store.faqs[idx], ...faq };
      store.faqs[idx] = result;
    } else {
      result = {
        id: faq.id,
        question_uz: faq.question_uz,
        question_ru: faq.question_ru || faq.question_uz,
        answer_uz: faq.answer_uz,
        answer_ru: faq.answer_ru || faq.answer_uz,
        sort_order: faq.sort_order || store.faqs.length + 1,
        is_active: faq.is_active !== undefined ? faq.is_active : true,
      };
      store.faqs.push(result);
    }
  } else {
    const newId = store.faqs.length > 0 ? Math.max(...store.faqs.map((f) => f.id)) + 1 : 1;
    result = {
      id: newId,
      question_uz: faq.question_uz,
      question_ru: faq.question_ru || faq.question_uz,
      answer_uz: faq.answer_uz,
      answer_ru: faq.answer_ru || faq.answer_uz,
      sort_order: faq.sort_order || store.faqs.length + 1,
      is_active: faq.is_active !== undefined ? faq.is_active : true,
    };
    store.faqs.push(result);
  }
  writeStore(store);
  return result;
}

export function deleteDevFaq(id: number): boolean {
  const store = readStore();
  const initial = store.faqs.length;
  store.faqs = store.faqs.filter((f) => f.id !== id);
  if (store.faqs.length !== initial) {
    writeStore(store);
    return true;
  }
  return false;
}

// ==========================================
// 6. DELIVERY METHODS
// ==========================================
export function getDevDeliveryMethods(): DeliveryMethodRow[] {
  return readStore().delivery_methods;
}

export function updateDevDeliveryMethod(id: string, patch: Partial<DeliveryMethodRow>): DeliveryMethodRow | null {
  const store = readStore();
  const idx = store.delivery_methods.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  store.delivery_methods[idx] = { ...store.delivery_methods[idx], ...patch };
  writeStore(store);
  return store.delivery_methods[idx];
}

// ==========================================
// 7. PROMO CODES
// ==========================================
export function getDevPromoCodes(): PromoCodeRow[] {
  return readStore().promo_codes;
}

export function saveDevPromoCode(promo: Partial<PromoCodeRow> & { code: string; type: "percent" | "fixed"; value: number }): PromoCodeRow {
  const store = readStore();
  const cleanCode = promo.code.trim().toUpperCase();
  const idx = store.promo_codes.findIndex((p) => p.code.toUpperCase() === cleanCode);
  let saved: PromoCodeRow;
  const now = new Date().toISOString();

  if (idx >= 0) {
    saved = { ...store.promo_codes[idx], ...promo, code: cleanCode };
    store.promo_codes[idx] = saved;
  } else {
    const newId = store.promo_codes.length > 0 ? Math.max(...store.promo_codes.map((p) => p.id)) + 1 : 1;
    saved = {
      id: newId,
      code: cleanCode,
      type: promo.type,
      value: promo.value,
      min_order_usd: promo.min_order_usd || 0,
      max_discount_usd: promo.max_discount_usd || null,
      valid_from: promo.valid_from || null,
      valid_to: promo.valid_to || null,
      total_usage_limit: promo.total_usage_limit || null,
      per_customer_limit: promo.per_customer_limit || 1,
      usage_count: 0,
      is_active: promo.is_active !== undefined ? promo.is_active : true,
      created_at: now,
    };
    store.promo_codes.push(saved);
  }
  writeStore(store);
  return saved;
}

export function toggleDevPromoCode(id: number, newState: boolean): boolean {
  const store = readStore();
  const item = store.promo_codes.find((p) => p.id === id);
  if (!item) return false;
  item.is_active = newState;
  writeStore(store);
  return true;
}

export function deleteDevPromoCode(id: number): boolean {
  const store = readStore();
  const initial = store.promo_codes.length;
  store.promo_codes = store.promo_codes.filter((p) => p.id !== id);
  if (store.promo_codes.length !== initial) {
    writeStore(store);
    return true;
  }
  return false;
}

// ==========================================
// 8. ORDERS & ORDER ITEMS
// ==========================================
export function getDevOrders(): { orders: OrderRow[]; items: OrderItemRow[] } {
  const store = readStore();
  return {
    orders: store.orders,
    items: store.order_items,
  };
}

export function saveDevOrder(order: OrderRow, items: OrderItemRow[]): void {
  const store = readStore();
  store.orders = [order, ...store.orders.filter((o) => o.id !== order.id)];
  store.order_items = [...items, ...store.order_items.filter((it) => it.order_id !== order.id)];
  writeStore(store);
}

export function updateDevOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  reason?: string | null,
  internalNotes?: string | null,
  estimatedReadyDate?: string | null
): boolean {
  const store = readStore();
  const orderIdx = store.orders.findIndex((o) => o.id === orderId);
  if (orderIdx === -1) return false;

  const target = store.orders[orderIdx];
  target.status = newStatus;
  target.updated_at = new Date().toISOString();
  if (reason) {
    target.comment = target.comment ? `${target.comment}\n[Bekor qilish sababi]: ${reason}` : `[Bekor qilish sababi]: ${reason}`;
  }
  if (internalNotes !== undefined && internalNotes !== null) {
    target.internal_notes = internalNotes;
  }
  if (estimatedReadyDate !== undefined && estimatedReadyDate !== null) {
    target.estimated_ready_date = estimatedReadyDate;
  }

  writeStore(store);
  return true;
}

// ==========================================
// 9. SMS & AUDIT LOGS
// ==========================================
export function getDevSmsLog(): SmsLogEntry[] {
  return readStore().sms_log;
}

export function saveDevSmsLog(entry: Omit<SmsLogEntry, "id" | "created_at">): SmsLogEntry {
  const store = readStore();
  const newEntry: SmsLogEntry = {
    ...entry,
    id: `sms-dev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
  };
  store.sms_log.unshift(newEntry);
  writeStore(store);
  return newEntry;
}

export function getDevAuditLog(): AuditLogEntry[] {
  return readStore().audit_log;
}

export function saveDevAuditLog(entry: Omit<AuditLogEntry, "id" | "created_at">): AuditLogEntry {
  const store = readStore();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-dev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
  };
  store.audit_log.unshift(newEntry);
  writeStore(store);
  return newEntry;
}
