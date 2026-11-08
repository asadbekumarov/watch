"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { triggerStorefrontRevalidation } from "@/lib/revalidate";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { updateDevHero } from "@shared/devStore";

export async function updateHeroBanner(formData: FormData) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  const id = parseInt((formData.get("id") as string) || "1", 10);
  const titleLine1Uz = formData.get("title_line1_uz") as string;
  const titleLine2Uz = formData.get("title_line2_uz") as string;
  const titleLine1Ru = formData.get("title_line1_ru") as string;
  const titleLine2Ru = formData.get("title_line2_ru") as string;
  const subtitleUz = formData.get("subtitle_uz") as string;
  const subtitleRu = formData.get("subtitle_ru") as string;

  const payload = {
    title_line1_uz: titleLine1Uz,
    title_line2_uz: titleLine2Uz,
    title_line1_ru: titleLine1Ru,
    title_line2_ru: titleLine2Ru,
    subtitle_uz: subtitleUz,
    subtitle_ru: subtitleRu,
    is_active: true,
    sort_order: 0,
  };

  if (isSupabaseDevFallback()) {
    updateDevHero(payload);
    await logAuditEvent({
      action: "HERO_BANNER_UPDATE",
      entityType: "hero_banner",
      entityId: id.toString(),
      newValues: payload,
    });
    revalidatePath("/hero");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("hero_banners").upsert({ id, ...payload });
    if (error) return { error: error.message };

    await logAuditEvent({
      action: "HERO_BANNER_UPDATE",
      entityType: "hero_banner",
      entityId: id.toString(),
      newValues: payload,
    });

    await triggerStorefrontRevalidation({ tag: "hero" });
    revalidatePath("/hero");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("updateHeroBanner dev fallback:", err);
      revalidatePath("/hero");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}
