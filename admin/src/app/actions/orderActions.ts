"use server";

import { revalidatePath } from "next/cache";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { dispatchSms } from "@shared/sms/sender";
import { buildOrderStatusSms } from "@shared/sms/templates";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { updateDevOrderStatus } from "@shared/devStore";
import type { OrderStatus } from "@shared/types/database.types";

export async function advanceOrderStatus({
  orderId,
  newStatus,
  reason = null,
  internalNotes = null,
  estimatedReadyDate = null,
}: {
  orderId: string;
  newStatus: OrderStatus;
  reason?: string | null;
  internalNotes?: string | null;
  estimatedReadyDate?: string | null;
}) {
  const { authorized } = await requireAuth(["owner", "manager", "staff"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    updateDevOrderStatus(orderId, newStatus, reason, internalNotes, estimatedReadyDate);
    await logAuditEvent({
      action: "ORDER_STATUS_TRANSITION",
      entityType: "order",
      entityId: orderId,
      newValues: { new_status: newStatus, reason },
    });
    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true, data: newStatus };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("update_order_status_secure", {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_reason: reason,
      p_internal_notes: internalNotes,
      p_estimated_ready_date: estimatedReadyDate,
    });

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "ORDER_STATUS_TRANSITION",
      entityType: "order",
      entityId: orderId,
      newValues: { new_status: newStatus, reason },
    });

    // Customer SMS Notification on status transition (Non-blocking)
    try {
      const { data: orderDetails } = await supabase
        .from("orders")
        .select("id, order_number, customer_phone, lang, branch_id, estimated_ready_date, branches(name_uz, name_ru, address_uz, address_ru, phone)")
        .eq("id", orderId)
        .maybeSingle();

      if (orderDetails && orderDetails.customer_phone) {
        const branch = orderDetails.branches as { name_uz?: string; name_ru?: string; address_uz?: string; address_ru?: string; phone?: string } | null;
        const isRu = orderDetails.lang === "ru";
        const branchName = branch ? (isRu ? branch.name_ru : branch.name_uz) : null;
        const branchAddress = branch ? (isRu ? branch.address_ru : branch.address_uz) : null;

        const smsText = buildOrderStatusSms(newStatus, {
          orderNumber: orderDetails.order_number,
          lang: orderDetails.lang || "uz",
          branchName: branchName || null,
          branchAddress: branchAddress || null,
          branchPhone: branch?.phone || null,
          estimatedDate: orderDetails.estimated_ready_date || estimatedReadyDate || null,
          reason: reason || null,
        });

        if (smsText) {
          Promise.resolve(
            dispatchSms({
              phone: orderDetails.customer_phone,
              message: smsText,
              orderId,
              supabaseClient: supabase,
            })
          ).catch((smsErr) => {
            console.warn("[Admin Order Status] SMS dispatch error:", smsErr);
          });
        }
      }
    } catch (notifyErr) {
      console.warn("[Admin Order Status] Failed to process SMS notification:", notifyErr);
    }

    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true, data };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("advanceOrderStatus dev fallback:", err);
      revalidatePath("/orders");
      revalidatePath("/");
      return { success: true, data: newStatus };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function updateOrderInternalNotes(orderId: string, notes: string) {
  const { authorized } = await requireAuth(["owner", "manager", "staff"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    updateDevOrderStatus(orderId, "new", null, notes, null);
    await logAuditEvent({
      action: "ORDER_NOTES_UPDATE",
      entityType: "order",
      entityId: orderId,
      newValues: { internal_notes: notes },
    });
    revalidatePath("/orders");
    return { success: true };
  }

  try {
    const supabase = await createClient();

    // Fetch current order to preserve status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("status, internal_notes")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { error: "Buyurtma topilmadi." };
    }

    // Update notes via secure procedure
    const { error } = await supabase.rpc("update_order_status_secure", {
      p_order_id: orderId,
      p_new_status: order.status,
      p_internal_notes: notes,
    });

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "ORDER_NOTES_UPDATE",
      entityType: "order",
      entityId: orderId,
      oldValues: { internal_notes: order.internal_notes },
      newValues: { internal_notes: notes },
    });

    revalidatePath("/orders");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("updateOrderInternalNotes dev fallback:", err);
      revalidatePath("/orders");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

export async function updateOrderEstimatedReadyDate(orderId: string, readyDate: string) {
  const { authorized } = await requireAuth(["owner", "manager", "staff"]);
  if (!authorized) {
    return { error: "Ruxsat berilmagan." };
  }

  if (isSupabaseDevFallback()) {
    updateDevOrderStatus(orderId, "new", null, null, readyDate);
    await logAuditEvent({
      action: "ORDER_READY_DATE_UPDATE",
      entityType: "order",
      entityId: orderId,
      newValues: { estimated_ready_date: readyDate },
    });
    revalidatePath("/orders");
    return { success: true };
  }

  try {
    const supabase = await createClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("status, estimated_ready_date")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { error: "Buyurtma topilmadi." };
    }

    const { error } = await supabase.rpc("update_order_status_secure", {
      p_order_id: orderId,
      p_new_status: order.status,
      p_estimated_ready_date: readyDate,
    });

    if (error) {
      return { error: error.message };
    }

    await logAuditEvent({
      action: "ORDER_READY_DATE_UPDATE",
      entityType: "order",
      entityId: orderId,
      oldValues: { estimated_ready_date: order.estimated_ready_date },
      newValues: { estimated_ready_date: readyDate },
    });

    revalidatePath("/orders");
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV === "development" || isSupabaseDevFallback()) {
      console.warn("updateOrderEstimatedReadyDate dev fallback:", err);
      revalidatePath("/orders");
      return { success: true };
    }
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }
}

