/**
 * SwissWatch_premium — SMS Dispatcher & Audit Logger
 * Supports Mock (local/testing) and Eskiz.uz (sandbox/production)
 */

import { sendEskizSms } from "./eskiz";
import { saveDevSmsLog } from "../devStore";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

export interface SendSmsParams {
  phone: string;
  message: string;
  orderId?: string | null;
  supabaseClient?: SupabaseClient<Database> | null;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  provider: "mock" | "eskiz";
  error?: string;
}

export async function dispatchSms(params: SendSmsParams): Promise<SendSmsResult> {
  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase() === "eskiz" ? "eskiz" : "mock";

  let success = false;
  let messageId: string | undefined;
  let error: string | undefined;

  if (provider === "mock") {
    // 1. MOCK PROVIDER (Local dev & testing)
    messageId = `mock_sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    success = true;
    console.log(`[MOCK SMS SENDER] To: ${params.phone} | Msg: "${params.message}" | ID: ${messageId}`);
  } else {
    // 2. ESKIZ.UZ PROVIDER
    const eskizRes = await sendEskizSms({
      phone: params.phone,
      message: params.message,
    });
    success = eskizRes.success;
    messageId = eskizRes.messageId;
    error = eskizRes.error;

    if (!success) {
      console.warn(`[ESKIZ SMS FAILED] To: ${params.phone} | Error: ${error}`);
    } else {
      console.log(`[ESKIZ SMS SENT] To: ${params.phone} | ID: ${messageId}`);
    }
  }

  // 3. Record in sms_log table (Non-blocking)
  if (params.supabaseClient) {
    try {
      await params.supabaseClient.from("sms_log").insert({
        order_id: params.orderId || null,
        phone: params.phone,
        message: params.message,
        provider,
        status: success ? "sent" : "failed",
        attempt_count: 1,
        external_id: messageId || null,
        error_details: error || null,
      });
    } catch (dbErr) {
      console.warn("[SMS LOGGER] Failed to insert sms_log record:", dbErr);
    }
  } else {
    try {
      saveDevSmsLog({
        order_id: params.orderId || null,
        phone: params.phone,
        message: params.message,
        provider,
        status: success ? "sent" : "failed",
        attempt_count: 1,
        external_id: messageId || null,
        error_details: error || null,
      });
    } catch (err) {
      console.warn("[SMS LOGGER] Dev store log failed:", err);
    }
  }

  return {
    success,
    messageId,
    provider,
    error,
  };
}

/**
 * Re-send an existing SMS from sms_log
 */
export async function resendSmsRecord(
  smsLogId: number,
  supabaseClient: SupabaseClient<Database>
): Promise<SendSmsResult> {
  // Fetch existing SMS record
  const { data: record, error: fetchErr } = await supabaseClient
    .from("sms_log")
    .select("*")
    .eq("id", smsLogId)
    .single();

  if (fetchErr || !record) {
    return {
      success: false,
      provider: "mock",
      error: "SMS yozuvi topilmadi.",
    };
  }

  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase() === "eskiz" ? "eskiz" : "mock";
  let success = false;
  let messageId: string | undefined;
  let error: string | undefined;

  if (provider === "mock") {
    messageId = `mock_resend_${Date.now()}`;
    success = true;
    console.log(`[MOCK RESEND] To: ${record.phone} | Msg: "${record.message}"`);
  } else {
    const eskizRes = await sendEskizSms({
      phone: record.phone,
      message: record.message,
    });
    success = eskizRes.success;
    messageId = eskizRes.messageId;
    error = eskizRes.error;
  }

  // Update sms_log attempt count and status
  const newAttemptCount = (record.attempt_count || 1) + 1;
  await supabaseClient
    .from("sms_log")
    .update({
      status: success ? "sent" : "failed",
      attempt_count: newAttemptCount,
      external_id: messageId || record.external_id,
      error_details: error || (success ? null : "Qayta urinishda xatolik yuz berdi"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", smsLogId);

  return {
    success,
    messageId,
    provider,
    error,
  };
}

