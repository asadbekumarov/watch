"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { saveDevPromoCode, deleteDevPromoCode } from "@shared/devStore";
import type { DiscountType, Json } from "@shared/types/database.types";

export async function createPromoCode(payload: {
  code: string;
  type: DiscountType;
  value: number;
  min_order_usd: number;
  max_discount_usd?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  total_usage_limit?: number | null;
  per_customer_limit?: number;
  is_active?: boolean;
}) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Faqat menejer yoki do'kon egasi promokod yarata oladi." };
  }

  const cleanCode = payload.code.trim().toUpperCase();
  if (!cleanCode || cleanCode.length < 3) {
    return { error: "Promokod kodi kamida 3 ta belgidan iborat bo'lishi kerak." };
  }

  if (payload.value <= 0) {
    return { error: "Chegirma miqdori 0 dan katta bo'lishi shart." };
  }

  const insertData = {
    code: cleanCode,
    type: payload.type || "percent",
    value: Number(payload.value),
    min_order_usd: Number(payload.min_order_usd || 0),
    max_discount_usd: payload.max_discount_usd ? Number(payload.max_discount_usd) : null,
    valid_from: payload.valid_from ? new Date(payload.valid_from).toISOString() : null,
    valid_to: payload.valid_to ? new Date(payload.valid_to).toISOString() : null,
    total_usage_limit: payload.total_usage_limit ? Number(payload.total_usage_limit) : null,
    per_customer_limit: Number(payload.per_customer_limit || 1),
    is_active: payload.is_active ?? true,
  };

  if (isSupabaseDevFallback()) {
    const saved = saveDevPromoCode(insertData);
    await logAuditEvent({
      action: "PROMO_CODE_CREATE",
      entityType: "promo_code",
      entityId: cleanCode,
      newValues: insertData,
    });
    revalidatePath("/promo");
    return { success: true, data: saved };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("promo_codes")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "PROMO_CODE_CREATE",
      entityType: "promo_code",
      entityId: String(data.id),
      newValues: insertData,
    });

    revalidatePath("/promo");
    return { success: true, data };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("createPromoCode dev fallback:", err);
      revalidatePath("/promo");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function updatePromoCode(
  id: number,
  payload: Partial<{
    type: DiscountType;
    value: number;
    min_order_usd: number;
    max_discount_usd: number | null;
    valid_from: string | null;
    valid_to: string | null;
    total_usage_limit: number | null;
    per_customer_limit: number;
    is_active: boolean;
  }>
) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    saveDevPromoCode({ id, ...payload } as Parameters<typeof saveDevPromoCode>[0]);
    await logAuditEvent({
      action: "PROMO_CODE_UPDATE",
      entityType: "promo_code",
      entityId: String(id),
      newValues: payload as unknown as Json,
    });
    revalidatePath("/promo");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { data: oldData } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("promo_codes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "PROMO_CODE_UPDATE",
      entityType: "promo_code",
      entityId: String(id),
      oldValues: oldData as unknown as Json,
      newValues: payload as unknown as Json,
    });

    revalidatePath("/promo");
    return { success: true, data };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("updatePromoCode dev fallback:", err);
      revalidatePath("/promo");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function togglePromoCodeActive(id: number, isActive: boolean) {
  return updatePromoCode(id, { is_active: isActive });
}

export async function deletePromoCode(id: number) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    deleteDevPromoCode(id);
    await logAuditEvent({
      action: "PROMO_CODE_DELETE",
      entityType: "promo_code",
      entityId: String(id),
    });
    revalidatePath("/promo");
    return { success: true };
  }

  try {
    const supabase = await createClient();

    // Check if code has redemptions
    const { count } = await supabase
      .from("promo_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("promo_code_id", id);

    if (count && count > 0) {
      return { error: "Ushbu promokoddan foydalanilgan, uni o'chirib bo'lmaydi. Faolsizlantirishingiz mumkin." };
    }

    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "PROMO_CODE_DELETE",
      entityType: "promo_code",
      entityId: String(id),
    });

    revalidatePath("/promo");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("deletePromoCode dev fallback:", err);
      revalidatePath("/promo");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}
