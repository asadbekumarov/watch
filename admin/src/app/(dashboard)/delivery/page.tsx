import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import DeliveryClient from "./DeliveryClient";
import { getDevDeliveryMethods } from "@shared/devStore";
import type { Database } from "@shared/types/database.types";

type DeliveryMethodRow = Database["public"]["Tables"]["delivery_methods"]["Row"];

export default async function DeliverySettingsPage() {
  await requireAuth(["owner", "manager", "staff"]);
  let methods: DeliveryMethodRow[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("delivery_methods")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      methods = data as DeliveryMethodRow[];
    }
  } catch (err) {
    console.warn("Delivery fetch warning in dev:", err);
  }

  if (methods.length === 0 && process.env.NODE_ENV === "development") {
    methods = getDevDeliveryMethods();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-white tracking-tight">
          Yetkazib berish usullari sozlamalari
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Filiallardan olib ketish va kuryerlik xizmatlari tariflari hamda bepul yetkazib berish chegaralari
        </p>
      </div>

      <DeliveryClient initialMethods={methods} />
    </div>
  );
}

