"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { resendSmsRecord } from "@shared/sms/sender";
import { logAuditEvent } from "@/lib/audit";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";

export async function getSmsLogs(filters?: {
  status?: string;
  search?: string;
}) {
  const { authorized } = await requireAuth(["owner", "manager", "staff"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    return { success: true, logs: [] };
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("sms_log")
      .select("*, orders(order_number)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status as "pending" | "sent" | "failed");
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim();
      query = query.or(`phone.ilike.%${s}%,message.ilike.%${s}%`);
    }

    const { data, error } = await query;
    if (error) {
      return { error: error.message };
    }

    return { success: true, logs: data || [] };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, logs: [] };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function resendSmsAction(smsLogId: number) {
  const { authorized } = await requireAuth(["owner", "manager", "staff"]);
  if (!authorized) {
    return { success: false, provider: "mock" as const, error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    return { success: true, provider: "mock" as const, messageId: `mock-resend-${Date.now()}` };
  }

  try {
    const supabase = await createClient();
    const res = await resendSmsRecord(smsLogId, supabase);

    await logAuditEvent({
      action: "SMS_RESEND",
      entityType: "sms_log",
      entityId: String(smsLogId),
      newValues: { success: res.success, provider: res.provider, error: res.error },
    });

    revalidatePath("/sms");
    return res;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      return { success: true, provider: "mock" as const, messageId: `mock-resend-${Date.now()}` };
    }
    return { success: false, provider: "mock" as const, error: err instanceof Error ? err.message : "Xatolik" };
  }
}
