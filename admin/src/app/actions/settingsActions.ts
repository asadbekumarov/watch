"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { triggerStorefrontRevalidation } from "@/lib/revalidate";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { updateDevSettings } from "@shared/devStore";
import type { Json } from "@shared/types/database.types";

export async function updateSiteSettings(formData: FormData) {
  const { authorized } = await requireAuth(["owner"]);
  if (!authorized) {
    return { error: "Faqat Bosh Administrator (Owner) do'kon sozlamalarini o'zgartirishi mumkin." };
  }

  const storeName = formData.get("store_name") as string;
  const displayName = formData.get("display_name") as string;
  const phone = formData.get("phone") as string;
  const phoneClean = phone.replace(/\D/g, "");
  const telegramChannel = formData.get("telegram_channel") as string;
  const telegramManager = formData.get("telegram_manager") as string;
  const telegramManagerUrl = formData.get("telegram_manager_url") as string;
  const instagramHandle = (formData.get("instagram_handle") as string) || null;
  const workingHoursUz = formData.get("working_hours_uz") as string;
  const workingHoursRu = formData.get("working_hours_ru") as string;
  const taglineUz = formData.get("tagline_uz") as string;
  const taglineRu = formData.get("tagline_ru") as string;
  const aboutUz = formData.get("about_uz") as string;
  const aboutRu = formData.get("about_ru") as string;
  const deliveryInfoUz = formData.get("delivery_info_uz") as string;
  const deliveryInfoRu = formData.get("delivery_info_ru") as string;

  const rateRaw = formData.get("usd_to_uzs_rate") as string;
  const usdToUzsRate = rateRaw && rateRaw.trim() !== "" ? parseFloat(rateRaw) : null;
  const prepDaysRaw = formData.get("default_prep_days") as string;
  const defaultPrepDays = prepDaysRaw && prepDaysRaw.trim() !== "" ? parseInt(prepDaysRaw, 10) : 1;

  const payload = {
    store_name: storeName,
    display_name: displayName,
    phone,
    phone_clean: phoneClean.startsWith("+") ? phoneClean : `+${phoneClean}`,
    telegram_channel: telegramChannel,
    telegram_manager: telegramManager,
    telegram_manager_url: telegramManagerUrl,
    instagram_handle: instagramHandle,
    working_hours_uz: workingHoursUz,
    working_hours_ru: workingHoursRu,
    tagline_uz: taglineUz,
    tagline_ru: taglineRu,
    about_uz: aboutUz,
    about_ru: aboutRu,
    delivery_info_uz: deliveryInfoUz,
    delivery_info_ru: deliveryInfoRu,
    usd_to_uzs_rate: usdToUzsRate,
    default_prep_days: defaultPrepDays,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseDevFallback()) {
    updateDevSettings(payload);
    await logAuditEvent({
      action: "SETTINGS_UPDATE",
      entityType: "site_settings",
      entityId: "default",
      newValues: payload as unknown as Json,
    });
    revalidatePath("/settings");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { data: oldData } = await supabase.from("site_settings").select("*").eq("id", "default").single();

    const { error } = await supabase
      .from("site_settings")
      .update(payload)
      .eq("id", "default");

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "SETTINGS_UPDATE",
      entityType: "site_settings",
      entityId: "default",
      oldValues: oldData as unknown as Json,
      newValues: payload as unknown as Json,
    });

    await triggerStorefrontRevalidation({ tag: "site-settings" });
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("updateSiteSettings dev fallback:", err);
      revalidatePath("/settings");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}
