import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkServerlessRateLimit } from "@/lib/rateLimit";
import { getDevPromoCodes } from "@shared/devStore";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    // Rate limit promo code validation (15 per minute per IP to prevent brute-force attacks)
    const allowed = await checkServerlessRateLimit(ip, "promo_validate", 15, 60);
    if (!allowed) {
      return NextResponse.json(
        {
          valid: false,
          error: "Juda ko'p urinish. Iltimos, bir ozdan so'ng qayta urinib ko'ring.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { code, subtotal = 0, phone = null } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { valid: false, error: "Promokod kiritilishi shart." },
        { status: 400 }
      );
    }

    const numSubtotal = Number(subtotal) || 0;
    if (numSubtotal <= 0) {
      return NextResponse.json(
        { valid: false, error: "Promokod qo'llash uchun savatda mahsulotlar bo'lishi kerak." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    if (supabase) {
      const { data, error } = await supabase.rpc("validate_promo_code_rpc", {
        p_code: code.trim(),
        p_subtotal_usd: numSubtotal,
        p_customer_phone: phone,
      });

      if (error) {
        return NextResponse.json(
          { valid: false, error: error.message },
          { status: 400 }
        );
      }

      const res = data as {
        valid: boolean;
        error?: string;
        discount_usd?: number;
        code?: string;
        type?: string;
        value?: number;
        min_order_usd?: number;
        max_discount_usd?: number | null;
      };

      if (!res.valid) {
        return NextResponse.json(
          { valid: false, error: res.error || "Promokod yaroqsiz." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        valid: true,
        code: res.code,
        discount_usd: res.discount_usd,
        type: res.type,
        value: res.value,
        min_order_usd: res.min_order_usd,
        max_discount_usd: res.max_discount_usd,
      });
    }

    // Development mode persistent shared store
    if (process.env.NODE_ENV === "development") {
      const clean = code.trim().toUpperCase();
      const allPromos = getDevPromoCodes();
      const promo = allPromos.find((p) => p.code.toUpperCase() === clean && p.is_active);

      if (!promo) {
        return NextResponse.json(
          { valid: false, error: "Bunday promokod mavjud emas yoki faol emas." },
          { status: 400 }
        );
      }

      if (numSubtotal < promo.min_order_usd) {
        return NextResponse.json(
          {
            valid: false,
            error: `Ushbu promokod uchun minimal buyurtma summasi $${promo.min_order_usd} USD.`,
          },
          { status: 400 }
        );
      }

      let discount = 0;
      if (promo.type === "percent") {
        discount = Math.round((numSubtotal * promo.value) / 100);
        if (promo.max_discount_usd && discount > promo.max_discount_usd) {
          discount = promo.max_discount_usd;
        }
      } else {
        discount = Math.min(promo.value, numSubtotal);
      }

      return NextResponse.json({
        valid: true,
        code: promo.code,
        discount_usd: discount,
        type: promo.type,
        value: promo.value,
        min_order_usd: promo.min_order_usd,
        max_discount_usd: promo.max_discount_usd,
      });
    }

    return NextResponse.json(
      { valid: false, error: "Tizim ma'lumotlar bazasiga ulana olmadi." },
      { status: 500 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { valid: false, error: error.message || "Promokodni tekshirishda xatolik." },
      { status: 500 }
    );
  }
}

