"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { updateDevDeliveryMethod } from "@shared/devStore";
import type { Json } from "@shared/types/database.types";

export async function updateDeliveryMethod(
  id: string,
  payload: {
    price_usd: number;
    free_above_usd?: number | null;
    is_enabled: boolean;
  }
) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Yetkazib berish sozlamalarini faqat menejer yoki egasi o'zgartira oladi." };
  }

  const updateData = {
    price_usd: Number(payload.price_usd || 0),
    free_above_usd: payload.free_above_usd !== null && payload.free_above_usd !== undefined
      ? Number(payload.free_above_usd)
      : null,
    is_enabled: Boolean(payload.is_enabled),
  };

  if (isSupabaseDevFallback()) {
    updateDevDeliveryMethod(id, updateData);
    await logAuditEvent({
      action: "DELIVERY_METHOD_UPDATE",
      entityType: "delivery_method",
      entityId: id,
      newValues: updateData as unknown as Json,
    });
    revalidatePath("/delivery");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { data: oldData } = await supabase
      .from("delivery_methods")
      .select("*")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("delivery_methods")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "DELIVERY_METHOD_UPDATE",
      entityType: "delivery_method",
      entityId: id,
      oldValues: oldData as unknown as Json,
      newValues: updateData as unknown as Json,
    });

    revalidatePath("/delivery");
    return { success: true, data };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("updateDeliveryMethod dev fallback:", err);
      revalidatePath("/delivery");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function toggleDeliveryMethodEnabled(id: string, isEnabled: boolean) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    updateDevDeliveryMethod(id, { is_enabled: isEnabled });
    await logAuditEvent({
      action: "DELIVERY_METHOD_TOGGLE",
      entityType: "delivery_method",
      entityId: id,
      newValues: { is_enabled: isEnabled },
    });
    revalidatePath("/delivery");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("delivery_methods")
      .update({ is_enabled: isEnabled })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "DELIVERY_METHOD_TOGGLE",
      entityType: "delivery_method",
      entityId: id,
      newValues: { is_enabled: isEnabled },
    });

    revalidatePath("/delivery");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("toggleDeliveryMethodEnabled dev fallback:", err);
      revalidatePath("/delivery");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}
