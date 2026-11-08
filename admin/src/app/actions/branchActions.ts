"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { triggerStorefrontRevalidation } from "@/lib/revalidate";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { updateDevBranch } from "@shared/devStore";
import type { Json } from "@shared/types/database.types";

export async function updateBranch(formData: FormData) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  const id = formData.get("id") as string;
  const addressUz = formData.get("address_uz") as string;
  const addressRu = formData.get("address_ru") as string;
  const landmarkUz = formData.get("landmark_uz") as string;
  const landmarkRu = formData.get("landmark_ru") as string;
  const noteUz = (formData.get("note_uz") as string) || null;
  const noteRu = (formData.get("note_ru") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const workingHoursUz = (formData.get("working_hours_uz") as string) || null;
  const workingHoursRu = (formData.get("working_hours_ru") as string) || null;
  const mapLink = (formData.get("map_link") as string) || null;
  const pickupEnabled = formData.get("pickup_enabled") === "on";

  const payload = {
    address_uz: addressUz,
    address_ru: addressRu,
    landmark_uz: landmarkUz,
    landmark_ru: landmarkRu,
    note_uz: noteUz,
    note_ru: noteRu,
    phone,
    working_hours_uz: workingHoursUz,
    working_hours_ru: workingHoursRu,
    map_link: mapLink,
    pickup_enabled: pickupEnabled,
  };

  if (isSupabaseDevFallback()) {
    updateDevBranch(id, payload);
    await logAuditEvent({
      action: "BRANCH_UPDATE",
      entityType: "branch",
      entityId: id,
      newValues: payload as unknown as Json,
    });
    revalidatePath("/branches");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { data: oldBranch } = await supabase.from("branches").select("*").eq("id", id).single();

    const { error } = await supabase
      .from("branches")
      .update(payload)
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "BRANCH_UPDATE",
      entityType: "branch",
      entityId: id,
      oldValues: oldBranch as unknown as Json,
      newValues: payload as unknown as Json,
    });

    await triggerStorefrontRevalidation({ tag: "branches" });
    revalidatePath("/branches");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("updateBranch fallback in dev:", err);
      revalidatePath("/branches");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}
