import "server-only";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { logPaymentEvent } from "./logger";

/**
 * CLICK Shop API Specification (Prepare & Complete Protocol)
 *
 * Signature calculation:
 * - Prepare (action = 0):
 *   md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
 * - Complete (action = 1):
 *   md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
 *
 * Error codes:
 *    0: Success
 *   -1: SIGN CHECK FAILED!
 *   -2: Incorrect amount
 *   -3: Action not found
 *   -4: Already paid
 *   -5: Order not found
 *   -6: Transaction not found
 *   -7: Failed to update order
 *   -8: Error in request from click
 *   -9: Transaction cancelled
 */

export const CLICK_ERRORS = {
  SUCCESS: 0,
  SIGN_CHECK_FAILED: -1,
  INCORRECT_AMOUNT: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_PAID: -4,
  ORDER_NOT_FOUND: -5,
  TRANSACTION_NOT_FOUND: -6,
  UPDATE_FAILED: -7,
  REQUEST_ERROR: -8,
  TRANSACTION_CANCELLED: -9,
};

export interface ClickRequestPayload {
  click_trans_id: string | number;
  service_id: string | number;
  click_paydoc_id?: string | number;
  merchant_trans_id: string; // Order ID or Order Number
  merchant_prepare_id?: string | number;
  amount: string | number;
  action: string | number;
  error: string | number;
  error_note?: string;
  sign_time: string;
  sign_string: string;
}

export function generateClickSignature(params: {
  click_trans_id: string | number;
  service_id: string | number;
  secret_key: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string | number;
  amount: string | number;
  action: string | number;
  sign_time: string;
}): string {
  const parts = [
    String(params.click_trans_id),
    String(params.service_id),
    params.secret_key,
    String(params.merchant_trans_id),
    params.action === 1 || String(params.action) === "1" ? String(params.merchant_prepare_id || "") : "",
    String(params.amount),
    String(params.action),
    String(params.sign_time),
  ];

  const rawString = parts.join("");
  return crypto.createHash("md5").update(rawString).digest("hex");
}

export function verifyClickSignature(payload: ClickRequestPayload): boolean {
  const secretKey = process.env.CLICK_SECRET_KEY || "test_click_secret_key";
  const expectedSig = generateClickSignature({
    click_trans_id: payload.click_trans_id,
    service_id: payload.service_id,
    secret_key: secretKey,
    merchant_trans_id: payload.merchant_trans_id,
    merchant_prepare_id: payload.merchant_prepare_id,
    amount: payload.amount,
    action: payload.action,
    sign_time: payload.sign_time,
  });

  const sig = String(payload.sign_string || "").toLowerCase();
  const expected = expectedSig.toLowerCase();

  if (sig.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/**
 * Main Click Shop API Processor
 */
export async function processClickRequest(payload: ClickRequestPayload): Promise<{
  click_trans_id: string | number;
  merchant_trans_id: string;
  merchant_prepare_id?: string | number;
  merchant_confirm_id?: string | number;
  error: number;
  error_note: string;
}> {
  const action = Number(payload.action);
  const clickTransId = Number(payload.click_trans_id);
  const amount = parseFloat(String(payload.amount));
  const merchantTransId = String(payload.merchant_trans_id || "").trim();

  // 1. Signature Verification
  if (!verifyClickSignature(payload)) {
    await logPaymentEvent({
      provider: "click",
      method: action === 0 ? "Prepare" : "Complete",
      requestPayload: payload,
      responsePayload: { error: CLICK_ERRORS.SIGN_CHECK_FAILED },
      status: "rejected",
      errorCode: CLICK_ERRORS.SIGN_CHECK_FAILED,
      errorMessage: "Imzo tekshiruvi muvaffaqiyatsiz tugadi (SIGN CHECK FAILED).",
    });

    return {
      click_trans_id: payload.click_trans_id,
      merchant_trans_id: payload.merchant_trans_id,
      error: CLICK_ERRORS.SIGN_CHECK_FAILED,
      error_note: "SIGN CHECK FAILED!",
    };
  }

  const supabase = getSupabaseAdminClient();

  try {
    // -------------------------------------------------------------------------
    // ACTION 0: PREPARE
    // -------------------------------------------------------------------------
    if (action === 0) {
      if (supabase) {
        // Query Order
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .or(`id.eq.${merchantTransId},order_number.eq.${merchantTransId}`)
          .maybeSingle();

        if (!order) {
          return {
            click_trans_id: payload.click_trans_id,
            merchant_trans_id: payload.merchant_trans_id,
            error: CLICK_ERRORS.ORDER_NOT_FOUND,
            error_note: "Order does not exist",
          };
        }

        if (order.status === "cancelled") {
          return {
            click_trans_id: payload.click_trans_id,
            merchant_trans_id: payload.merchant_trans_id,
            error: CLICK_ERRORS.TRANSACTION_CANCELLED,
            error_note: "Order is cancelled",
          };
        }

        if (order.payment_status === "paid") {
          return {
            click_trans_id: payload.click_trans_id,
            merchant_trans_id: payload.merchant_trans_id,
            error: CLICK_ERRORS.ALREADY_PAID,
            error_note: "Already paid",
          };
        }

        // Amount verification
        const expectedUzs = Number(order.total_uzs || 0);
        if (Math.abs(amount - expectedUzs) > 0.01) {
          return {
            click_trans_id: payload.click_trans_id,
            merchant_trans_id: payload.merchant_trans_id,
            error: CLICK_ERRORS.INCORRECT_AMOUNT,
            error_note: "Incorrect parameter amount",
          };
        }

        // Check if Click transaction already exists (Idempotency)
        const { data: existingTrans } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("provider", "click")
          .eq("click_trans_id", clickTransId)
          .maybeSingle();

        let prepareId: number;
        if (existingTrans) {
          prepareId = existingTrans.id;
        } else {
          // Record new transaction in prepared state
          const { data: newTrans, error: insertErr } = await supabase
            .from("payment_transactions")
            .insert({
              order_id: order.id,
              provider: "click",
              click_trans_id: clickTransId,
              click_paydoc_id: payload.click_paydoc_id ? Number(payload.click_paydoc_id) : null,
              click_state: 0, // Prepared
              amount,
              status: "pending",
            })
            .select()
            .single();

          if (insertErr || !newTrans) {
            return {
              click_trans_id: payload.click_trans_id,
              merchant_trans_id: payload.merchant_trans_id,
              error: CLICK_ERRORS.UPDATE_FAILED,
              error_note: "Failed to record transaction",
            };
          }
          prepareId = newTrans.id;
        }

        // Update order status to pending
        await supabase
          .from("orders")
          .update({ payment_status: "pending", updated_at: new Date().toISOString() })
          .eq("id", order.id);

        const response = {
          click_trans_id: payload.click_trans_id,
          merchant_trans_id: payload.merchant_trans_id,
          merchant_prepare_id: prepareId,
          error: CLICK_ERRORS.SUCCESS,
          error_note: "Success",
        };

        await logPaymentEvent({
          orderId: order.id,
          provider: "click",
          method: "Prepare",
          requestPayload: payload,
          responsePayload: response,
          status: "success",
          transactionId: String(clickTransId),
          amount,
        });

        return response;
      }

      // Standalone simulation response
      if (merchantTransId.includes("NON-EXISTENT")) {
        return {
          click_trans_id: payload.click_trans_id,
          merchant_trans_id: payload.merchant_trans_id,
          error: CLICK_ERRORS.ORDER_NOT_FOUND,
          error_note: "Order does not exist",
        };
      }

      return {
        click_trans_id: payload.click_trans_id,
        merchant_trans_id: payload.merchant_trans_id,
        merchant_prepare_id: 101,
        error: CLICK_ERRORS.SUCCESS,
        error_note: "Success",
      };
    }

    // -------------------------------------------------------------------------
    // ACTION 1: COMPLETE
    // -------------------------------------------------------------------------
    if (action === 1) {
      const merchantPrepareId = Number(payload.merchant_prepare_id);

      if (supabase) {
        const { data: trans } = await supabase
          .from("payment_transactions")
          .select("*, orders(*)")
          .eq("provider", "click")
          .eq("click_trans_id", clickTransId)
          .maybeSingle();

        if (!trans) {
          return {
            click_trans_id: payload.click_trans_id,
            merchant_trans_id: payload.merchant_trans_id,
            merchant_prepare_id: payload.merchant_prepare_id,
            error: CLICK_ERRORS.TRANSACTION_NOT_FOUND,
            error_note: "Transaction not found",
          };
        }

        // Check if Click sent an error parameter
        const clickError = Number(payload.error || 0);
        if (clickError < 0) {
          await supabase
            .from("payment_transactions")
            .update({ click_state: -1, status: "failed", updated_at: new Date().toISOString() })
            .eq("id", trans.id);

          await supabase
            .from("orders")
            .update({ payment_status: "failed", updated_at: new Date().toISOString() })
            .eq("id", trans.order_id);

          return {
            click_trans_id: payload.click_trans_id,
            merchant_trans_id: payload.merchant_trans_id,
            merchant_prepare_id: payload.merchant_prepare_id,
            error: CLICK_ERRORS.TRANSACTION_CANCELLED,
            error_note: "Transaction cancelled by Click",
          };
        }

        // Idempotency: if already completed
        if (trans.click_state === 1) {
          return {
            click_trans_id: payload.click_trans_id,
            merchant_trans_id: payload.merchant_trans_id,
            merchant_confirm_id: trans.id,
            error: CLICK_ERRORS.SUCCESS,
            error_note: "Already confirmed",
          };
        }

        // Mark completed & set order payment_status = 'paid'
        await supabase
          .from("payment_transactions")
          .update({
            click_state: 1, // Completed
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", trans.id);

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", trans.order_id);

        const response = {
          click_trans_id: payload.click_trans_id,
          merchant_trans_id: payload.merchant_trans_id,
          merchant_confirm_id: trans.id,
          error: CLICK_ERRORS.SUCCESS,
          error_note: "Success",
        };

        await logPaymentEvent({
          orderId: trans.order_id,
          provider: "click",
          method: "Complete",
          requestPayload: payload,
          responsePayload: response,
          status: "success",
          transactionId: String(clickTransId),
          amount,
        });

        return response;
      }

      // Standalone simulation response
      return {
        click_trans_id: payload.click_trans_id,
        merchant_trans_id: payload.merchant_trans_id,
        merchant_confirm_id: merchantPrepareId || 101,
        error: CLICK_ERRORS.SUCCESS,
        error_note: "Success",
      };
    }

    return {
      click_trans_id: payload.click_trans_id,
      merchant_trans_id: payload.merchant_trans_id,
      error: CLICK_ERRORS.ACTION_NOT_FOUND,
      error_note: "Action not found",
    };
  } catch (err: unknown) {
    const error = err as Error;
    await logPaymentEvent({
      provider: "click",
      method: action === 0 ? "Prepare" : "Complete",
      requestPayload: payload,
      responsePayload: { error: error.message },
      status: "error",
      errorMessage: error.message,
    });

    return {
      click_trans_id: payload.click_trans_id,
      merchant_trans_id: payload.merchant_trans_id,
      error: CLICK_ERRORS.UPDATE_FAILED,
      error_note: error.message || "Failed to process request",
    };
  }
}
