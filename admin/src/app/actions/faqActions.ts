"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { triggerStorefrontRevalidation } from "@/lib/revalidate";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { saveDevFaq, deleteDevFaq } from "@shared/devStore";

export async function saveFaq(formData: FormData) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  const idRaw = formData.get("id") as string;
  const questionUz = formData.get("question_uz") as string;
  const questionRu = formData.get("question_ru") as string;
  const answerUz = formData.get("answer_uz") as string;
  const answerRu = formData.get("answer_ru") as string;
  const sortOrder = parseInt((formData.get("sort_order") as string) || "0", 10);

  const payload = {
    question_uz: questionUz,
    question_ru: questionRu,
    answer_uz: answerUz,
    answer_ru: answerRu,
    sort_order: sortOrder,
    is_active: true,
  };

  if (isSupabaseDevFallback()) {
    saveDevFaq({
      id: idRaw ? parseInt(idRaw, 10) : undefined,
      ...payload,
    });
    await logAuditEvent({
      action: idRaw ? "FAQ_UPDATE" : "FAQ_CREATE",
      entityType: "faq",
      entityId: idRaw || "new",
      newValues: payload,
    });
    revalidatePath("/faqs");
    return { success: true };
  }

  try {
    const supabase = await createClient();

    if (idRaw) {
      const id = parseInt(idRaw, 10);
      const { error } = await supabase.from("faqs").update(payload).eq("id", id);
      if (error) return { error: error.message };

      await logAuditEvent({
        action: "FAQ_UPDATE",
        entityType: "faq",
        entityId: id.toString(),
        newValues: payload,
      });
    } else {
      const { data, error } = await supabase.from("faqs").insert(payload).select().single();
      if (error) return { error: error.message };

      await logAuditEvent({
        action: "FAQ_CREATE",
        entityType: "faq",
        entityId: data?.id?.toString() || "new",
        newValues: payload,
      });
    }

    await triggerStorefrontRevalidation({ tag: "faqs" });
    revalidatePath("/faqs");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("saveFaq dev fallback:", err);
      revalidatePath("/faqs");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function deleteFaq(id: number) {
  const { authorized } = await requireAuth(["owner", "manager"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    deleteDevFaq(id);
    await logAuditEvent({
      action: "FAQ_DELETE",
      entityType: "faq",
      entityId: id.toString(),
    });
    revalidatePath("/faqs");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return { error: error.message };

    await logAuditEvent({
      action: "FAQ_DELETE",
      entityType: "faq",
      entityId: id.toString(),
    });

    await triggerStorefrontRevalidation({ tag: "faqs" });
    revalidatePath("/faqs");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("deleteFaq dev fallback:", err);
      revalidatePath("/faqs");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

