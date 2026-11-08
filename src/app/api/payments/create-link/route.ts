import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PAYMENTS_CONFIG } from "@/lib/payments/config";

/**
 * Generates Payme or Click payment checkout link for an order.
 * Follows official Paycom and Click URL schemes.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, orderNumber, provider = "payme" } = body;

    const identifier = orderId || orderNumber;
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Buyurtma identifikatori ko'rsatilmadi." },
        { status: 400 }
      );
    }

    if (provider !== "payme" && provider !== "click") {
      return NextResponse.json(
        { success: false, error: "Noma'lum to'lov tizimi." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    let resolvedOrderNumber = String(orderNumber || identifier);
    let totalUzs: number | null = null;
    let paymentStatus = "unpaid";

    if (supabase) {
      const { data: order, error } = await supabase
        .from("orders")
        .select("id, order_number, total_uzs, total_usd, payment_status")
        .or(`id.eq.${identifier},order_number.eq.${identifier}`)
        .maybeSingle();

      if (error || !order) {
        return NextResponse.json(
          { success: false, error: "Buyurtma topilmadi." },
          { status: 404 }
        );
      }

      if (order.payment_status === "paid") {
        return NextResponse.json(
          { success: false, error: "Ushbu buyurtma uchun to'lov allaqachon amalga oshirilgan." },
          { status: 400 }
        );
      }

      resolvedOrderNumber = order.order_number;
      totalUzs = order.total_uzs;
      paymentStatus = order.payment_status;
    } else {
      // Development fallback when DB is not connected
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { success: false, error: "Ma'lumotlar bazasi ulanmagan." },
          { status: 500 }
        );
      }
      totalUzs = 1250000;
    }

    if (!totalUzs || totalUzs <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Buyurtma uchun so'mda summa belgilanmagan. Iltimos, naqd to'lov usulini tanlang.",
        },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || "http://localhost:3000";
    const returnUrl = `${origin}/checkout?order_number=${encodeURIComponent(resolvedOrderNumber)}&payment_completed=1`;

    let paymentUrl = "";

    if (provider === "payme") {
      /**
       * Payme Official Checkout Link:
       * Format: https://test.paycom.uz/{base64(m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT_TIYIN;c=CALLBACK_URL)}
       * Amount is in tiyins (1 UZS = 100 tiyins)
       */
      const amountTiyin = Math.round(totalUzs * 100);
      const paramsString = `m=${PAYMENTS_CONFIG.payme.merchantId};ac.order_id=${resolvedOrderNumber};a=${amountTiyin};c=${encodeURI(returnUrl)}`;
      const base64Params = Buffer.from(paramsString).toString("base64");
      paymentUrl = `${PAYMENTS_CONFIG.payme.checkoutUrl}/${base64Params}`;
    } else if (provider === "click") {
      /**
       * Click Official Checkout Link:
       * Format: https://my.click.uz/services/pay?service_id=SERVICE_ID&merchant_id=MERCHANT_ID&amount=AMOUNT&transaction_param=ORDER&return_url=RETURN_URL
       */
      const params = new URLSearchParams({
        service_id: PAYMENTS_CONFIG.click.serviceId,
        merchant_id: PAYMENTS_CONFIG.click.merchantId,
        amount: String(totalUzs),
        transaction_param: resolvedOrderNumber,
        return_url: returnUrl,
      });
      paymentUrl = `${PAYMENTS_CONFIG.click.checkoutUrl}?${params.toString()}`;
    }

    return NextResponse.json({
      success: true,
      provider,
      orderNumber: resolvedOrderNumber,
      totalUzs,
      paymentStatus,
      paymentUrl,
      isTestMode: PAYMENTS_CONFIG.isTestMode,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Noma'lum xatolik";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

