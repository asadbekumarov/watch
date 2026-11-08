import { getSupabaseServerClient } from "../supabase/server";
import { storeData as staticStoreData } from "@/data/store";
import {
  getDevProducts,
  getDevSettings,
  getDevBranches,
  getDevFaqs,
  getDevHero,
  getDevDeliveryMethods,
} from "@shared/devStore";
import type { Product } from "@/types/product";
import type { StoreInfo, StoreBranch } from "@/types/store";
import type { Database } from "../../../shared/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type BranchRow = Database["public"]["Tables"]["branches"]["Row"];
type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
type HeroBannerRow = Database["public"]["Tables"]["hero_banners"]["Row"];

const isDevOrBuild =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PHASE === "phase-production-build";

// Map database product row to Storefront Product model
function mapDbProductToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand as Product["brand"],
    model: row.model,
    name: row.name_uz,
    nameRu: row.name_ru,
    price: row.price_usd !== null ? Number(row.price_usd) : null,
    currency: "USD",
    images: row.images || [],
    descriptionUz: row.description_uz,
    descriptionRu: row.description_ru,
    specs: {
      movement: row.movement_text || "Mexanizm",
      movementType: row.movement_type || "automatic",
      caseDiameter: row.case_diameter || "",
      caseDiameterValue: row.case_diameter_val || 0,
      dialColor: row.dial_color || undefined,
      waterResistance: row.water_resistance || undefined,
      glass: row.glass || undefined,
      features: row.features || [],
      notes: row.notes || [],
    },
    tags: row.tags || [],
    inStock: Boolean(row.in_stock),
    isBestseller: Boolean(row.is_bestseller),
  };
}

// Fetch all active products
export async function getStoreProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isDevOrBuild) {
      return getDevProducts().filter((p) => p.is_active).map(mapDbProductToProduct);
    }
    throw new Error("[SwissWatch] Supabase is not configured in production environment!");
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    if (isDevOrBuild) {
      return getDevProducts().filter((p) => p.is_active).map(mapDbProductToProduct);
    }
    throw new Error(`[SwissWatch] Failed to fetch products from Supabase: ${error?.message}`);
  }

  return data.map(mapDbProductToProduct);
}

// Fetch single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isDevOrBuild) {
      const found = getDevProducts().find((p) => p.slug === slug && p.is_active);
      return found ? mapDbProductToProduct(found) : null;
    }
    throw new Error("[SwissWatch] Supabase is not configured in production environment!");
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    if (isDevOrBuild) {
      const found = getDevProducts().find((p) => p.slug === slug && p.is_active);
      return found ? mapDbProductToProduct(found) : null;
    }
    throw new Error(`[SwissWatch] Failed to fetch product ${slug}: ${error.message}`);
  }

  if (!data) return null;
  return mapDbProductToProduct(data);
}

// Fetch site settings and branches
export async function getStoreSettings(): Promise<StoreInfo> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isDevOrBuild) {
      const s = getDevSettings();
      const branchesData = getDevBranches().filter((b) => b.is_active);
      const branches: StoreBranch[] = branchesData.map((b) => ({
        id: b.id,
        city: b.city_uz,
        cityRu: b.city_ru,
        address: b.address_uz,
        addressRu: b.address_ru,
        landmark: b.landmark_uz,
        landmarkRu: b.landmark_ru,
        note: b.note_uz || undefined,
      }));

      return {
        name: s.store_name,
        displayName: s.display_name,
        taglineUz: s.tagline_uz,
        taglineRu: s.tagline_ru,
        aboutUz: s.about_uz,
        aboutRu: s.about_ru,
        phone: s.phone,
        phoneClean: s.phone_clean,
        telegramChannel: s.telegram_channel,
        telegramManager: s.telegram_manager,
        telegramManagerUrl: s.telegram_manager_url,
        instagramHandle: s.instagram_handle,
        workingHoursUz: s.working_hours_uz,
        workingHoursRu: s.working_hours_ru,
        branches: branches.length > 0 ? branches : staticStoreData.branches,
        deliveryInfoUz: s.delivery_info_uz,
        deliveryInfoRu: s.delivery_info_ru,
        usdToUzsRate: s.usd_to_uzs_rate !== null ? Number(s.usd_to_uzs_rate) : null,
      };
    }
    throw new Error("[SwissWatch] Supabase is not configured in production environment!");
  }

  const [settingsRes, branchesRes] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
    supabase.from("branches").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  if (settingsRes.error || !settingsRes.data) {
    if (isDevOrBuild) {
      const s = getDevSettings();
      return {
        ...staticStoreData,
        phone: s.phone,
        phoneClean: s.phone_clean,
        usdToUzsRate: s.usd_to_uzs_rate,
      };
    }
    throw new Error(`[SwissWatch] Failed to fetch site settings: ${settingsRes.error?.message}`);
  }

  const s = settingsRes.data as SiteSettingsRow;
  const branchesData = (branchesRes.data || []) as BranchRow[];

  const branches: StoreBranch[] = (branchesData as BranchRow[]).map((b) => ({
    id: b.id,
    city: b.city_uz,
    cityRu: b.city_ru,
    address: b.address_uz,
    addressRu: b.address_ru,
    landmark: b.landmark_uz,
    landmarkRu: b.landmark_ru,
    note: b.note_uz || undefined,
  }));

  return {
    name: s.store_name,
    displayName: s.display_name,
    taglineUz: s.tagline_uz,
    taglineRu: s.tagline_ru,
    aboutUz: s.about_uz,
    aboutRu: s.about_ru,
    phone: s.phone,
    phoneClean: s.phone_clean,
    telegramChannel: s.telegram_channel,
    telegramManager: s.telegram_manager,
    telegramManagerUrl: s.telegram_manager_url,
    instagramHandle: s.instagram_handle,
    workingHoursUz: s.working_hours_uz,
    workingHoursRu: s.working_hours_ru,
    branches: branches.length > 0 ? branches : staticStoreData.branches,
    deliveryInfoUz: s.delivery_info_uz,
    deliveryInfoRu: s.delivery_info_ru,
    usdToUzsRate: s.usd_to_uzs_rate !== null ? Number(s.usd_to_uzs_rate) : null,
  };
}

// Fetch active FAQs
export async function getStoreFaqs(): Promise<Array<{ qUz: string; qRu: string; aUz: string; aRu: string }>> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isDevOrBuild) {
      return getDevFaqs()
        .filter((f) => f.is_active)
        .map((f) => ({
          qUz: f.question_uz,
          qRu: f.question_ru,
          aUz: f.answer_uz,
          aRu: f.answer_ru,
        }));
    }
    throw new Error("[SwissWatch] Supabase is not configured in production environment!");
  }

  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    if (isDevOrBuild) {
      return getDevFaqs()
        .filter((f) => f.is_active)
        .map((f) => ({
          qUz: f.question_uz,
          qRu: f.question_ru,
          aUz: f.answer_uz,
          aRu: f.answer_ru,
        }));
    }
    throw new Error(`[SwissWatch] Failed to fetch faqs: ${error?.message}`);
  }

  return (data as FaqRow[]).map((f) => ({
    qUz: f.question_uz,
    qRu: f.question_ru,
    aUz: f.answer_uz,
    aRu: f.answer_ru,
  }));
}

// Fetch active delivery methods
export async function getActiveDeliveryMethods() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isDevOrBuild) {
      return getDevDeliveryMethods().filter((m) => m.is_enabled);
    }
    throw new Error("[SwissWatch] Supabase is not configured in production environment!");
  }

  const { data, error } = await supabase
    .from("delivery_methods")
    .select("*")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    if (isDevOrBuild) {
      return getDevDeliveryMethods().filter((m) => m.is_enabled);
    }
    throw new Error(`[SwissWatch] Failed to fetch delivery methods: ${error?.message}`);
  }

  return data;
}

// Fetch site settings (usd_to_uzs_rate, default_prep_days)
export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isDevOrBuild) return getDevSettings();
    throw new Error("[SwissWatch] Supabase is not configured in production environment!");
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    if (isDevOrBuild) return getDevSettings();
    throw new Error(`[SwissWatch] Failed to fetch site settings: ${error.message}`);
  }

  return data;
}

// Fetch hero banner
export async function getHeroBanner(): Promise<HeroBannerRow | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isDevOrBuild) return getDevHero();
    throw new Error("[SwissWatch] Supabase is not configured in production environment!");
  }

  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (isDevOrBuild) return getDevHero();
    throw new Error(`[SwissWatch] Failed to fetch hero banner: ${error?.message}`);
  }

  return data;
}
