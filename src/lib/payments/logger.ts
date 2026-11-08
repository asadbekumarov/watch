import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "../../../shared/types/database.types";

export interface PaymentLogParams {
  orderId?: string | null;
  provider: "payme" | "click";
  method: string;
  requestPayload: unknown;
  responsePayload: unknown;
  status: "success" | "error" | "rejected";
  transactionId?: string | null;
  amount?: number | null;
  errorCode?: number | null;
  errorMessage?: string | null;
}

export async function logPaymentEvent(params: PaymentLogParams) {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[PAYMENT_LOG:${params.provider}] ${params.method} -> ${params.status}:`, params.errorMessage || "OK");
      }
      return;
    }

    await supabase.from("payments_log").insert({
      order_id: params.orderId || null,
      provider: params.provider,
      method: params.method,
      request_payload: (params.requestPayload || {}) as Json,
      response_payload: (params.responsePayload || {}) as Json,
      status: params.status,
      transaction_id: params.transactionId || null,
      amount: params.amount || null,
      error_code: params.errorCode || null,
      error_message: params.errorMessage || null,
    });
  } catch (err) {
    console.error("[PAYMENT_LOG_ERROR] Failed to record payment audit log:", err);
  }
}

