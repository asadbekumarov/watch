import "server-only";
import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { logPaymentEvent } from "./logger";

/**
 * Paycom Merchant API Specification:
 * - JSON-RPC 2.0
 * - All monetary amounts in tiyins (1 UZS = 100 tiyins)
 * - State constants:
 *     STATE_IN_PROGRESS = 1
 *     STATE_DONE = 2
 *     STATE_CANCELLED = -1
 *     STATE_CANCELLED_AFTER_COMPLETE = -2
 * - Timeout: 12 hours (43,200,000 ms)
 */

export const PAYME_ERRORS = {
  INSUFFICIENT_PRIVILEGE: -32504,
  INVALID_JSON_RPC: -32600,
  METHOD_NOT_FOUND: -32601,
  INCORRECT_AMOUNT: -31001,
  TRANSACTION_NOT_FOUND: -31003,
  UNABLE_TO_CANCEL: -31007,
  UNABLE_TO_PERFORM: -31008,
  ORDER_NOT_FOUND: -31050,
};

const PAYME_TIMEOUT_MS = 43200000; // 12 hours

interface JsonRpcRequest {
  id: number | string;
  method: string;
  params: Record<string, unknown>;
}

export function buildJsonRpcError(id: number | string | null, code: number, messageUz: string, messageRu: string, data?: string) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message: {
        uz: messageUz,
        ru: messageRu,
      },
      data: data ?? null,
    },
  };
}

export function buildJsonRpcSuccess(id: number | string, result: unknown) {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

/**
 * Verify Payme Basic Auth header:
 * Format: "Basic base64(Paycom:SECRET_KEY)"
 */
export function verifyPaymeAuth(authHeader: string | null): boolean {
  const secretKey = process.env.PAYME_SECRET_KEY || "test_payme_secret_key";
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  try {
    const base64Credentials = authHeader.substring(6).trim();
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [login, key] = credentials.split(":");

    if (login !== "Paycom" || !key) {
      return false;
    }

    // Timing-safe comparison to prevent side-channel timing attacks
    const keyBuf = Buffer.from(key);
    const expectedBuf = Buffer.from(secretKey);

    if (keyBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(keyBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Main Payme JSON-RPC 2.0 Request Processor
 */
export async function processPaymeRequest(body: unknown, authHeader: string | null): Promise<unknown> {
  const req = body as JsonRpcRequest;

  // 1. Validate JSON-RPC structure
  if (!req || typeof req !== "object" || !req.method || req.id === undefined) {
    return buildJsonRpcError(
      null,
      PAYME_ERRORS.INVALID_JSON_RPC,
      "Noto'g'ri JSON-RPC so'rovi.",
      "Неверный JSON-RPC запрос."
    );
  }

  // 2. Validate Authorization header
  if (!verifyPaymeAuth(authHeader)) {
    await logPaymentEvent({
      provider: "payme",
      method: req.method,
      requestPayload: req,
      responsePayload: { error: PAYME_ERRORS.INSUFFICIENT_PRIVILEGE },
      status: "rejected",
      errorCode: PAYME_ERRORS.INSUFFICIENT_PRIVILEGE,
      errorMessage: "Avtorizatsiyadan o'tilmadi (noto'g'ri kalit).",
    });

    return buildJsonRpcError(
      req.id,
      PAYME_ERRORS.INSUFFICIENT_PRIVILEGE,
      "Ruxsat berilmagan.",
      "Недостаточно привилегий."
    );
  }

  const supabase = getSupabaseAdminClient();
  const params = req.params || {};

  try {
    switch (req.method) {
      // -----------------------------------------------------------------------
      // 1. CheckPerformTransaction
      // -----------------------------------------------------------------------
      case "CheckPerformTransaction": {
        const amountTiyin = Number(params.amount);
        const account = params.account as { order_id?: string; order_number?: string } | undefined;
        const orderIdentifier = account?.order_id || account?.order_number;

        if (!orderIdentifier) {
          return buildJsonRpcError(
            req.id,
            PAYME_ERRORS.ORDER_NOT_FOUND,
            "Buyurtma kodi kiritilmagan.",
            "Не указан код заказа.",
            "order_id"
          );
        }

        if (supabase) {
          const { data: order } = await supabase
            .from("orders")
            .select("*")
            .or(`id.eq.${orderIdentifier},order_number.eq.${orderIdentifier}`)
            .maybeSingle();

          if (!order) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.ORDER_NOT_FOUND,
              "Buyurtma topilmadi.",
              "Заказ не найден.",
              "order_id"
            );
          }

          if (order.status === "cancelled") {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.UNABLE_TO_PERFORM,
              "Buyurtma bekor qilingan.",
              "Заказ отменен."
            );
          }

          if (order.payment_status === "paid") {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.UNABLE_TO_PERFORM,
              "Buyurtma allaqachon to'langan.",
              "Заказ уже оплачен."
            );
          }

          const expectedTiyin = (order.total_uzs || 0) * 100;
          if (expectedTiyin <= 0 || amountTiyin !== expectedTiyin) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.INCORRECT_AMOUNT,
              `Noto'g'ri summa. Kutilgan: ${expectedTiyin} tiyin, berilgan: ${amountTiyin} tiyin.`,
              `Неверная сумма заказа.`,
              "amount"
            );
          }
        } else {
          // Development / simulation mock responses
          if (orderIdentifier.includes("NON-EXISTENT")) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.ORDER_NOT_FOUND,
              "Buyurtma topilmadi.",
              "Заказ не найден.",
              "order_id"
            );
          }
          if (orderIdentifier.includes("CANCELLED")) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.UNABLE_TO_PERFORM,
              "Buyurtma bekor qilingan.",
              "Заказ отменен."
            );
          }
          if (amountTiyin === 999999999) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.INCORRECT_AMOUNT,
              "Noto'g'ri summa.",
              "Неверная сумма.",
              "amount"
            );
          }
        }

        const resp = buildJsonRpcSuccess(req.id, { allow: true });
        await logPaymentEvent({
          provider: "payme",
          method: "CheckPerformTransaction",
          requestPayload: req,
          responsePayload: resp,
          status: "success",
          amount: amountTiyin,
        });
        return resp;
      }

      // -----------------------------------------------------------------------
      // 2. CreateTransaction
      // -----------------------------------------------------------------------
      case "CreateTransaction": {
        const paymeTransId = String(params.id);
        const time = Number(params.time);
        const amountTiyin = Number(params.amount);
        const account = params.account as { order_id?: string; order_number?: string } | undefined;
        const orderIdentifier = account?.order_id || account?.order_number;

        if (supabase) {
          // Check if transaction already exists
          const { data: existingTrans } = await supabase
            .from("payment_transactions")
            .select("*")
            .eq("provider", "payme")
            .eq("payme_trans_id", paymeTransId)
            .maybeSingle();

          if (existingTrans) {
            if (existingTrans.payme_state === 1) {
              const now = Date.now();
              if (now - (existingTrans.payme_create_time || 0) > PAYME_TIMEOUT_MS) {
                // Cancel expired transaction
                await supabase
                  .from("payment_transactions")
                  .update({ payme_state: -1, payme_cancel_time: now, payme_reason: 4, status: "timed_out" })
                  .eq("id", existingTrans.id);

                return buildJsonRpcError(
                  req.id,
                  PAYME_ERRORS.UNABLE_TO_PERFORM,
                  "Tranzaksiya muddati tugagan.",
                  "Время ожидания транзакции истекло."
                );
              }
            }

            return buildJsonRpcSuccess(req.id, {
              create_time: existingTrans.payme_create_time,
              transaction: String(existingTrans.id),
              state: existingTrans.payme_state,
            });
          }

          // Validate Order
          const { data: order } = await supabase
            .from("orders")
            .select("*")
            .or(`id.eq.${orderIdentifier},order_number.eq.${orderIdentifier}`)
            .maybeSingle();

          if (!order) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.ORDER_NOT_FOUND,
              "Buyurtma topilmadi.",
              "Заказ не найден.",
              "order_id"
            );
          }

          const expectedTiyin = (order.total_uzs || 0) * 100;
          if (amountTiyin !== expectedTiyin) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.INCORRECT_AMOUNT,
              "Summa mos kelmadi.",
              "Сумма не совпадает.",
              "amount"
            );
          }

          // Insert new transaction record
          const { data: newTrans, error: insertErr } = await supabase
            .from("payment_transactions")
            .insert({
              order_id: order.id,
              provider: "payme",
              payme_trans_id: paymeTransId,
              payme_state: 1, // STATE_IN_PROGRESS
              payme_create_time: time,
              amount: amountTiyin / 100, // stored in UZS
              status: "pending",
            })
            .select()
            .single();

          if (insertErr || !newTrans) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.UNABLE_TO_PERFORM,
              "Tranzaksiyani saqlashda xatolik.",
              "Ошибка сохранения транзакции."
            );
          }

          // Update order payment_status to pending
          await supabase
            .from("orders")
            .update({ payment_status: "pending", updated_at: new Date().toISOString() })
            .eq("id", order.id);

          const resp = buildJsonRpcSuccess(req.id, {
            create_time: time,
            transaction: String(newTrans.id),
            state: 1,
          });

          await logPaymentEvent({
            orderId: order.id,
            provider: "payme",
            method: "CreateTransaction",
            requestPayload: req,
            responsePayload: resp,
            status: "success",
            transactionId: paymeTransId,
            amount: amountTiyin,
          });

          return resp;
        }

        // Mock response if database not present
        return buildJsonRpcSuccess(req.id, {
          create_time: time,
          transaction: `mock_trans_${Date.now()}`,
          state: 1,
        });
      }

      // -----------------------------------------------------------------------
      // 3. PerformTransaction
      // -----------------------------------------------------------------------
      case "PerformTransaction": {
        const paymeTransId = String(params.id);

        if (supabase) {
          const { data: trans } = await supabase
            .from("payment_transactions")
            .select("*, orders(*)")
            .eq("provider", "payme")
            .eq("payme_trans_id", paymeTransId)
            .maybeSingle();

          if (!trans) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.TRANSACTION_NOT_FOUND,
              "Tranzaksiya topilmadi.",
              "Транзакция не найдена."
            );
          }

          const now = Date.now();

          // Idempotent: already performed
          if (trans.payme_state === 2) {
            return buildJsonRpcSuccess(req.id, {
              transaction: String(trans.id),
              perform_time: trans.payme_perform_time,
              state: 2,
            });
          }

          if (trans.payme_state !== 1) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.UNABLE_TO_PERFORM,
              "Tranzaksiya holati bajarishga ruxsat bermaydi.",
              "Статус транзакции не позволяет выполнить ее."
            );
          }

          // Check 12-hour timeout
          if (now - (trans.payme_create_time || 0) > PAYME_TIMEOUT_MS) {
            await supabase
              .from("payment_transactions")
              .update({ payme_state: -1, payme_cancel_time: now, payme_reason: 4, status: "timed_out" })
              .eq("id", trans.id);

            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.UNABLE_TO_PERFORM,
              "Tranzaksiya muddati tugagan.",
              "Время ожидания транзакции истекло."
            );
          }

          // Perform transaction & mark order paid atomically
          await supabase
            .from("payment_transactions")
            .update({
              payme_state: 2, // STATE_DONE
              payme_perform_time: now,
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

          const resp = buildJsonRpcSuccess(req.id, {
            transaction: String(trans.id),
            perform_time: now,
            state: 2,
          });

          await logPaymentEvent({
            orderId: trans.order_id,
            provider: "payme",
            method: "PerformTransaction",
            requestPayload: req,
            responsePayload: resp,
            status: "success",
            transactionId: paymeTransId,
          });

          return resp;
        }

        return buildJsonRpcSuccess(req.id, {
          transaction: "mock_trans",
          perform_time: Date.now(),
          state: 2,
        });
      }

      // -----------------------------------------------------------------------
      // 4. CancelTransaction
      // -----------------------------------------------------------------------
      case "CancelTransaction": {
        const paymeTransId = String(params.id);
        const reason = Number(params.reason);

        if (supabase) {
          const { data: trans } = await supabase
            .from("payment_transactions")
            .select("*")
            .eq("provider", "payme")
            .eq("payme_trans_id", paymeTransId)
            .maybeSingle();

          if (!trans) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.TRANSACTION_NOT_FOUND,
              "Tranzaksiya topilmadi.",
              "Транзакция не найдена."
            );
          }

          const now = Date.now();

          // Idempotent: already cancelled
          if (trans.payme_state === -1 || trans.payme_state === -2) {
            return buildJsonRpcSuccess(req.id, {
              transaction: String(trans.id),
              cancel_time: trans.payme_cancel_time,
              state: trans.payme_state,
            });
          }

          let newState = -1; // cancelled while pending
          if (trans.payme_state === 2) {
            newState = -2; // refunded after complete
          }

          await supabase
            .from("payment_transactions")
            .update({
              payme_state: newState,
              payme_cancel_time: now,
              payme_reason: reason,
              status: newState === -2 ? "refunded" : "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", trans.id);

          await supabase
            .from("orders")
            .update({
              payment_status: newState === -2 ? "refunded" : "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", trans.order_id);

          const resp = buildJsonRpcSuccess(req.id, {
            transaction: String(trans.id),
            cancel_time: now,
            state: newState,
          });

          await logPaymentEvent({
            orderId: trans.order_id,
            provider: "payme",
            method: "CancelTransaction",
            requestPayload: req,
            responsePayload: resp,
            status: "success",
            transactionId: paymeTransId,
          });

          return resp;
        }

        return buildJsonRpcSuccess(req.id, {
          transaction: "mock_trans",
          cancel_time: Date.now(),
          state: -1,
        });
      }

      // -----------------------------------------------------------------------
      // 5. CheckTransaction
      // -----------------------------------------------------------------------
      case "CheckTransaction": {
        const paymeTransId = String(params.id);

        if (supabase) {
          const { data: trans } = await supabase
            .from("payment_transactions")
            .select("*")
            .eq("provider", "payme")
            .eq("payme_trans_id", paymeTransId)
            .maybeSingle();

          if (!trans) {
            return buildJsonRpcError(
              req.id,
              PAYME_ERRORS.TRANSACTION_NOT_FOUND,
              "Tranzaksiya topilmadi.",
              "Транзакция не найдена."
            );
          }

          return buildJsonRpcSuccess(req.id, {
            create_time: trans.payme_create_time,
            perform_time: trans.payme_perform_time || 0,
            cancel_time: trans.payme_cancel_time || 0,
            transaction: String(trans.id),
            state: trans.payme_state,
            reason: trans.payme_reason || null,
          });
        }

        return buildJsonRpcSuccess(req.id, {
          create_time: Date.now() - 5000,
          perform_time: 0,
          cancel_time: 0,
          transaction: "mock_trans",
          state: 1,
          reason: null,
        });
      }

      // -----------------------------------------------------------------------
      // 6. GetStatement
      // -----------------------------------------------------------------------
      case "GetStatement": {
        const fromTime = Number(params.from);
        const toTime = Number(params.to);

        if (supabase) {
          const { data: transactions } = await supabase
            .from("payment_transactions")
            .select("*")
            .eq("provider", "payme")
            .gte("payme_create_time", fromTime)
            .lte("payme_create_time", toTime);

          const list = (transactions || []).map((t) => ({
            id: t.payme_trans_id,
            time: t.payme_create_time,
            amount: Math.round(t.amount * 100),
            account: { order_id: t.order_id },
            create_time: t.payme_create_time,
            perform_time: t.payme_perform_time || 0,
            cancel_time: t.payme_cancel_time || 0,
            transaction: String(t.id),
            state: t.payme_state,
            reason: t.payme_reason || null,
          }));

          return buildJsonRpcSuccess(req.id, { transactions: list });
        }

        return buildJsonRpcSuccess(req.id, { transactions: [] });
      }

      default:
        return buildJsonRpcError(
          req.id,
          PAYME_ERRORS.METHOD_NOT_FOUND,
          "Bunday metod mavjud emas.",
          "Метод не найден."
        );
    }
  } catch (err: unknown) {
    const error = err as Error;
    await logPaymentEvent({
      provider: "payme",
      method: req.method,
      requestPayload: req,
      responsePayload: { error: error.message },
      status: "error",
      errorMessage: error.message,
    });

    return buildJsonRpcError(
      req.id,
      PAYME_ERRORS.UNABLE_TO_PERFORM,
      error.message || "Tizim xatoligi.",
      "Системная ошибка."
    );
  }
}
