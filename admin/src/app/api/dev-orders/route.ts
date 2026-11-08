import { NextResponse } from "next/server";
import { getDevOrders } from "@shared/devStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getDevOrders();
    return NextResponse.json({
      success: true,
      orders: data.orders,
      items: data.items,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error reading dev orders" },
      { status: 500 }
    );
  }
}

