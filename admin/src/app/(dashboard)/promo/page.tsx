import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import PromoClient from "./PromoClient";
import { getDevPromoCodes } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type PromoRow = Database["public"]["Tables"]["promo_codes"]["Row"];

export default async function PromoCodesPage() {
  await requireAuth(["owner", "manager", "staff"]);
  let promoCodes: PromoRow[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      promoCodes = data as PromoRow[];
    }
  } catch (err) {
    console.warn("Promo codes fetch warning in dev:", err);
  }

  if (promoCodes.length === 0 && process.env.NODE_ENV === "development") {
    promoCodes = getDevPromoCodes();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-white tracking-tight">
          Promokodlar boshqaruvi
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Chegirma promokodlarini yaratish, amal qilish muddati, minimal buyurtma va foydalanish limitlarini belgilash
        </p>
      </div>

      <PromoClient initialPromos={promoCodes} />
    </div>
  );
}

