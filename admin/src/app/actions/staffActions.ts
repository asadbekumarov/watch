"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/audit";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import type { UserRole } from "@shared/types/database.types";

export async function createStaffMember(formData: FormData) {
  const { authorized } = await requireAuth(["owner"]);
  if (!authorized) {
    return { error: "Faqat Bosh Administrator (Owner) yangi xodim qo'sha oladi." };
  }

  const email = (formData.get("email") as string).trim();
  const fullName = (formData.get("full_name") as string).trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;

  if (!email || !fullName || !password) {
    return { error: "Barcha maydonlarni to'ldirish shart." };
  }

  if (password.length < 8) {
    return { error: "Parol kamida 8 ta belgidan iborat bo'lishi kerak." };
  }

  if (isSupabaseDevFallback()) {
    await logAuditEvent({
      action: "STAFF_CREATE",
      entityType: "profile",
      entityId: `dev-${Date.now()}`,
      newValues: { email, full_name: fullName, role },
    });
    revalidatePath("/staff");
    return { success: true };
  }

  try {
    // Service role used strictly here for creating auth user
    const adminSupabase = getAdminClient();

    const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !newUser?.user) {
      return { error: authError?.message || "Auth foydalanuvchisini yaratishda xatolik." };
    }

    const { error: profileError } = await adminSupabase.from("profiles").insert({
      id: newUser.user.id,
      email,
      full_name: fullName,
      role: role || "staff",
      is_active: true,
      must_change_password: true,
    });

    if (profileError) {
      return { error: profileError.message };
    }

    await logAuditEvent({
      action: "STAFF_CREATE",
      entityType: "profile",
      entityId: newUser.user.id,
      newValues: { email, full_name: fullName, role },
    });

    revalidatePath("/staff");
    return { success: true };
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("createStaffMember dev fallback:", err);
      revalidatePath("/staff");
      return { success: true };
    }
    const msg = err instanceof Error ? err.message : "Xodim yaratishda xatolik yuz berdi.";
    return { error: msg };
  }
}

export async function toggleStaffActive(id: string, currentActive: boolean) {
  const { authorized } = await requireAuth(["owner"]);
  if (!authorized) {
    return { error: "Faqat Bosh Administrator (Owner) xodimlarni faollashtirishi yoki o'chirishi mumkin." };
  }

  const newActive = !currentActive;

  if (isSupabaseDevFallback()) {
    await logAuditEvent({
      action: "STAFF_TOGGLE_ACTIVE",
      entityType: "profile",
      entityId: id,
      oldValues: { is_active: currentActive },
      newValues: { is_active: newActive },
    });
    revalidatePath("/staff");
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: newActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "STAFF_TOGGLE_ACTIVE",
      entityType: "profile",
      entityId: id,
      oldValues: { is_active: currentActive },
      newValues: { is_active: newActive },
    });

    revalidatePath("/staff");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("toggleStaffActive dev fallback:", err);
      revalidatePath("/staff");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}
