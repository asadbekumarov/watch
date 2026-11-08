import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDevDeliveryMethods, getDevSettings } from "@shared/devStore";
import { FALLBACK_DELIVERY_METHODS } from "@/lib/delivery";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    if (supabase) {
      const [methodsRes, settingsRes] = await Promise.all([
        supabase
          .from("delivery_methods")
          .select("*")
          .eq("is_enabled", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("site_settings")
          .select("usd_to_uzs_rate, default_prep_days")
          .eq("id", "default")
          .maybeSingle(),
      ]);

      const methods = (methodsRes.data && methodsRes.data.length > 0)
        ? methodsRes.data
        : getDevDeliveryMethods().filter((m) => m.is_enabled);

      return NextResponse.json({
        success: true,
        methods,
        settings: {
          usd_to_uzs_rate: settingsRes.data?.usd_to_uzs_rate ?? getDevSettings().usd_to_uzs_rate ?? null,
          default_prep_days: settingsRes.data?.default_prep_days ?? getDevSettings().default_prep_days ?? 1,
        },
      });
    }

    // Development persistent shared store
    const devMethods = getDevDeliveryMethods().filter((m) => m.is_enabled);
    const devSettings = getDevSettings();

    return NextResponse.json({
      success: true,
      methods: devMethods.length > 0 ? devMethods : FALLBACK_DELIVERY_METHODS.filter((m) => m.is_enabled),
      settings: {
        usd_to_uzs_rate: devSettings.usd_to_uzs_rate ?? null,
        default_prep_days: devSettings.default_prep_days ?? 1,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

