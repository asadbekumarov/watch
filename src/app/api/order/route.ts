import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { productsData } from "@/data/products";
import { sendTelegramOrderNotification } from "@/lib/telegram";
import { checkServerlessRateLimit } from "@/lib/rateLimit";
import { PAYMENTS_CONFIG } from "@/lib/payments/config";
import { dispatchSms } from "@shared/sms/sender";
import { buildOrderCreatedSms } from "@shared/sms/templates";
import { generateTrackingToken } from "@/lib/trackingToken";
import { saveDevOrder } from "@shared/devStore";
import type { Database, DeliveryType, PaymentMethod } from "../../../../shared/types/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

function normalizeUzPhone(rawPhone: string): string | null {
  if (!rawPhone || typeof rawPhone !== "string") return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    // 1. Serverless Edge / DB Rate Limiter (20 requests per minute per IP)
    const allowed = await checkServerlessRateLimit(ip, "checkout", 20, 60);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Juda ko'p so'rov yuborildi. Iltimos, bir ozdan so'ng qayta urinib ko'ring.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // 2. Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ success: true, orderNumber: "SWP-SPAM-PREVENTED" });
    }

    const {
      fullName,
      phone,
      region = "tashkent",
      deliveryType: clientDeliveryType,
      deliveryMethodId = null,
      deliveryMethodLabel = "Do'kondan olib ketish",
      address = "",
      paymentMethod = "cash_on_delivery",
      comment = "",
      promoCode = "",
      items = [],
    } = body;

    // 3. Input validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Iltimos, ism va familiyangizni to'liq kiriting." },
        { status: 400 }
      );
    }

    const cleanPhone = normalizeUzPhone(phone || "");
    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, error: "Iltimos, to'g'ri O'zbekiston telefon raqamini kiriting (+998 XX XXX XX XX)." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Buyurtma berish uchun kamida bitta soat tanlangan bo'lishi kerak." },
        { status: 400 }
      );
    }

    // Format items for RPC: client prices are strictly ignored
    const rpcItems = items.map((it: { productId?: string; id?: string; quantity?: number }) => ({
      product_id: it.productId || it.id,
      quantity: Math.max(1, Math.min(10, parseInt(String(it.quantity || 1), 10))),
    }));

    const deliveryType: DeliveryType =
      clientDeliveryType === "delivery" ||
      deliveryMethodLabel.toLowerCase().includes("kuryer") ||
      deliveryMethodLabel.toLowerCase().includes("dostavka") ||
      deliveryMethodLabel.toLowerCase().includes("viloyat")
        ? "delivery"
        : "pickup";

    const branchId = deliveryType === "pickup"
      ? (region.toLowerCase().includes("namangan") || String(deliveryMethodId).includes("namangan") ? "namangan" : "tashkent")
      : null;

    const supabase = getSupabaseAdminClient();

    let orderNumber: string;
    let orderId: string | null = null;
    let totalAmount = 0;
    let totalUzs: number | null = null;
    const resolvedItemsForTelegram: Array<{ name: string; quantity: number; price: number | null }> = [];

    if (supabase) {
      // 4. Atomic PostgreSQL Transaction via create_order_rpc
      const { data: rpcResult, error: rpcError } = await supabase.rpc("create_order_rpc", {
        p_customer_name: fullName.trim(),
        p_customer_phone: cleanPhone,
        p_customer_email: null,
        p_lang: "uz",
        p_delivery_type: deliveryType,
        p_branch_id: branchId,
        p_delivery_method_id: deliveryMethodId || null,
        p_delivery_address: deliveryType === "delivery" ? address : null,
        p_comment: comment.trim() || null,
        p_payment_method: (paymentMethod as PaymentMethod) || "cash_on_delivery",
        p_promo_code: promoCode?.trim() || null,
        p_items: rpcItems,
      });

      if (rpcError) {
        return NextResponse.json(
          { success: false, error: rpcError.message },
          { status: 400 }
        );
      }

      const res = rpcResult as {
        success: boolean;
        order_id: string;
        order_number: string;
        total_usd: number;
        total_uzs?: number | null;
      };

      orderNumber = res.order_number;
      totalAmount = res.total_usd;
      totalUzs = res.total_uzs || null;
      orderId = res.order_id;
    } else {
      // Fallback mode when Supabase is not connected
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      orderNumber = `SWP-${new Date().getFullYear()}-${randomSuffix}`;
      orderId = `ord-dev-${Date.now()}-${randomSuffix}`;

      const devItems: OrderItemRow[] = [];
      let itemIndex = 1;

      for (const item of rpcItems) {
        const p = productsData.find((prod) => prod.id === item.product_id);
        const itemPrice = p?.price ?? 1200;
        totalAmount += itemPrice * item.quantity;

        resolvedItemsForTelegram.push({
          name: p ? p.name : (item.product_id || "Swiss Watch"),
          quantity: item.quantity,
          price: itemPrice,
        });

        devItems.push({
          id: itemIndex++,
          order_id: orderId,
          product_id: item.product_id ?? null,
          product_slug: p?.id || "watch",
          product_name_uz: p?.name || "Klassik Soat",
          product_name_ru: p?.name || "Классические часы",
          brand: p?.brand || "West End Watch",
          image_url: p?.images?.[0] || "/frames/watch.webp",
          unit_price_usd: itemPrice,
          quantity: item.quantity,
          total_price_usd: itemPrice * item.quantity,
          prep_days: 1,
        });
      }

      const devOrder: OrderRow = {
        id: orderId,
        order_number: orderNumber,
        customer_name: fullName.trim(),
        customer_phone: cleanPhone,
        customer_email: null,
        lang: "uz",
        status: "new",
        delivery_type: deliveryType,
        branch_id: branchId,
        delivery_method_id: deliveryMethodId || null,
        delivery_address: deliveryType === "delivery" ? (address || null) : null,
        comment: comment.trim() || null,
        internal_notes: null,
        promo_code_id: null,
        promo_code: promoCode?.trim() || null,
        discount_usd: 0,
        subtotal_usd: totalAmount,
        delivery_fee_usd: 0,
        total_usd: totalAmount,
        usd_to_uzs_rate: null,
        total_uzs: null,
        payment_method: (paymentMethod as PaymentMethod) || "cash_on_delivery",
        payment_status: "unpaid",
        estimated_ready_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      saveDevOrder(devOrder, devItems);
    }

    // 5. Telegram notification is OPTIONAL and NEVER blocks or cancels the order
    Promise.resolve(
      sendTelegramOrderNotification({
        orderNumber,
        totalAmount,
        customer: {
          fullName: fullName.trim(),
          phone: cleanPhone,
          region: branchId === "namangan" ? "Namangan filiali" : "Toshkent filiali",
          address: address || deliveryMethodLabel,
        },
        deliveryMethodLabel,
        paymentMethod,
        comment: comment.trim(),
        items: resolvedItemsForTelegram.length > 0 ? resolvedItemsForTelegram : items.map((it: { name?: string; productId?: string; quantity?: number }) => ({
          name: it.name || it.productId || "Soat",
          quantity: it.quantity || 1,
          price: null,
        })),
      })
    ).catch((telegramErr) => {
      console.warn("[Order] Telegram notification failed, order remains valid:", telegramErr);
    });

    // 6. Send Customer SMS Notification (Non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || "http://localhost:3000";
    const trackingToken = orderId ? generateTrackingToken(orderId) : "";
    const trackingUrl = trackingToken ? `${appUrl}/track/${trackingToken}` : `${appUrl}/catalog`;
    const smsMessage = buildOrderCreatedSms({
      orderNumber,
      totalUsd: totalAmount,
      totalUzs,
      trackingUrl,
      lang: "uz",
    });

    Promise.resolve(
      dispatchSms({
        phone: cleanPhone,
        message: smsMessage,
        orderId,
        supabaseClient: supabase,
      })
    ).catch((smsErr) => {
      console.warn("[Order] SMS dispatch failed, order remains valid:", smsErr);
    });

    // 7. Generate Sandbox Payment URL if Payme or Click selected and UZS amount available
    let paymentUrl: string | null = null;
    if ((paymentMethod === "payme" || paymentMethod === "click") && totalUzs && totalUzs > 0) {
      const origin = req.nextUrl.origin || "http://localhost:3000";
      const returnUrl = `${origin}/track/${trackingToken}?payment_completed=1`;
      if (paymentMethod === "payme") {
        const amountTiyin = Math.round(totalUzs * 100);
        const paramsString = `m=${PAYMENTS_CONFIG.payme.merchantId};ac.order_id=${orderNumber};a=${amountTiyin};c=${encodeURI(returnUrl)}`;
        const base64Params = Buffer.from(paramsString).toString("base64");
        paymentUrl = `${PAYMENTS_CONFIG.payme.checkoutUrl}/${base64Params}`;
      } else if (paymentMethod === "click") {
        const params = new URLSearchParams({
          service_id: PAYMENTS_CONFIG.click.serviceId,
          merchant_id: PAYMENTS_CONFIG.click.merchantId,
          amount: String(totalUzs),
          transaction_param: orderNumber,
          return_url: returnUrl,
        });
        paymentUrl = `${PAYMENTS_CONFIG.click.checkoutUrl}?${params.toString()}`;
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      totalAmount,
      totalUzs,
      paymentMethod,
      paymentUrl,
      trackingToken,
      trackingUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ichki server xatoligi";
    console.error("Order API Error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
