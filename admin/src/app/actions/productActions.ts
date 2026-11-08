"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { triggerStorefrontRevalidation } from "@/lib/revalidate";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { saveDevProduct, toggleDevProductActive, deleteDevProduct } from "@shared/devStore";

export async function toggleProductActive(id: string, currentState: boolean) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan. Faqat menejer yoki bosh administrator faoliyatni o'zgartirishi mumkin." };
  }

  const newState = !currentState;

  if (isSupabaseDevFallback()) {
    toggleDevProductActive(id, newState);
    await logAuditEvent({
      action: "PRODUCT_TOGGLE_ACTIVE",
      entityType: "product",
      entityId: id,
      oldValues: { is_active: currentState },
      newValues: { is_active: newState },
    });
    revalidatePath("/products");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ is_active: newState, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "PRODUCT_TOGGLE_ACTIVE",
      entityType: "product",
      entityId: id,
      oldValues: { is_active: currentState },
      newValues: { is_active: newState },
    });

    await triggerStorefrontRevalidation({ tag: "products" });
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("toggleProductActive fallback in dev:", err);
      revalidatePath("/products");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function saveProduct(formData: FormData) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  const supabase = await createClient();

  const id = formData.get("id") as string;
  const slug = (formData.get("slug") as string).trim().toLowerCase();
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const nameUz = formData.get("name_uz") as string;
  const nameRu = formData.get("name_ru") as string;
  const priceUsdRaw = formData.get("price_usd") as string;
  const priceUsd = priceUsdRaw && priceUsdRaw.trim() !== "" ? parseFloat(priceUsdRaw) : null;
  const stockQuantity = parseInt((formData.get("stock_quantity") as string) || "1", 10);
  const prepDays = Math.max(1, parseInt((formData.get("prep_days") as string) || "1", 10));
  const inStock = stockQuantity > 0;
  const isBestseller = formData.get("is_bestseller") === "on";
  const isActive = formData.get("is_active") === "on";
  const descriptionUz = (formData.get("description_uz") as string) || "";
  const descriptionRu = (formData.get("description_ru") as string) || "";
  const movementType = (formData.get("movement_type") as "automatic" | "quartz") || "automatic";
  const movementText = (formData.get("movement_text") as string) || "";
  const caseDiameter = (formData.get("case_diameter") as string) || "";
  const caseDiameterVal = parseInt((formData.get("case_diameter_val") as string) || "0", 10);
  const dialColor = (formData.get("dial_color") as string) || null;
  const waterResistance = (formData.get("water_resistance") as string) || null;
  const imagesRaw = (formData.get("images") as string) || "";
  const images = imagesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const payload = {
    id,
    slug,
    brand,
    model,
    name_uz: nameUz,
    name_ru: nameRu,
    price_usd: priceUsd,
    currency: "USD",
    images,
    description_uz: descriptionUz,
    description_ru: descriptionRu,
    movement_type: movementType,
    movement_text: movementText,
    case_diameter: caseDiameter,
    case_diameter_val: caseDiameterVal,
    dial_color: dialColor,
    water_resistance: waterResistance,
    in_stock: inStock,
    is_bestseller: isBestseller,
    is_active: isActive,
    stock_quantity: stockQuantity,
    prep_days: prepDays,
    updated_at: new Date().toISOString(),
  };

  const isNew = formData.get("is_new") === "true";

  if (isSupabaseDevFallback()) {
    saveDevProduct(payload);
    await logAuditEvent({
      action: isNew ? "PRODUCT_CREATE" : "PRODUCT_UPDATE",
      entityType: "product",
      entityId: id,
      newValues: payload,
    });
    revalidatePath("/products");
    return { success: true };
  }

  try {
    if (isNew) {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return { error: error.message };

      await logAuditEvent({
        action: "PRODUCT_CREATE",
        entityType: "product",
        entityId: id,
        newValues: payload,
      });
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) return { error: error.message };

      await logAuditEvent({
        action: "PRODUCT_UPDATE",
        entityType: "product",
        entityId: id,
        newValues: payload,
      });
    }

    await triggerStorefrontRevalidation({ tag: "products", slug });
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("saveProduct fallback in dev:", err);
      revalidatePath("/products");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function deleteProduct(id: string) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    deleteDevProduct(id);
    await logAuditEvent({
      action: "PRODUCT_DELETE",
      entityType: "product",
      entityId: id,
    });
    revalidatePath("/products");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: error.message };

    await logAuditEvent({
      action: "PRODUCT_DELETE",
      entityType: "product",
      entityId: id,
    });

    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      deleteDevProduct(id);
      revalidatePath("/products");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}
