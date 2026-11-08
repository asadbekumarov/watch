import React from "react";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import { getDevOrders } from "@shared/devStore";
import OrdersRealtimeClient from "./OrdersRealtimeClient";
import type { Database } from "@shared/types/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export default async function OrdersPage() {
  await requireAuth(["owner", "manager", "staff"]);

  let orders: OrderRow[] = [];
  let allItems: OrderItemRow[] = [];

  try {
    if (!isSupabaseDevFallback()) {
      const supabase = await createClient();
      const [ordersRes, itemsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("order_items")
          .select("*")
          .order("id", { ascending: true }),
      ]);

      orders = (ordersRes.data || []) as OrderRow[];
      allItems = (itemsRes.data || []) as OrderItemRow[];
    }
  } catch (err) {
    console.warn("Orders fetch warning in dev:", err);
  }

  // Load local persistent dev store if Supabase is unavailable or empty in dev
  if (orders.length === 0) {
    const devData = getDevOrders();
    orders = devData.orders;
    allItems = devData.items;
  }

  const itemsMap: Record<string, OrderItemRow[]> = {};
  for (const item of allItems) {
    if (!itemsMap[item.order_id]) {
      itemsMap[item.order_id] = [];
    }
    itemsMap[item.order_id].push(item);
  }

  return <OrdersRealtimeClient initialOrders={orders} orderItems={itemsMap} />;
}

