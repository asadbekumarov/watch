import { NextRequest, NextResponse } from "next/server";
import { productsData } from "@/data/products";

const ipRateLimit = new Map<string, { count: number; resetTime: number }>();

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

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    ipRateLimit.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }
  if (entry.count >= 10) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Juda ko'p so'rov yuborildi. Iltimos, biroz kuting." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 1. Honeypot check against automated spam bots
    if (body.honeypot) {
      return NextResponse.json({ success: true, orderNumber: "CHRONOS-VIP" });
    }

    const {
      fullName,
      phone,
      deliveryType = "delivery",
      address = "",
      storeLocation = "",
      deliveryTime = "1-2 soat",
      paymentMethod = "cash",
      comment = "",
      items = [],
    } = body;

    // 2. Validate
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Iltimos, ismingizni kiriting." },
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
        { success: false, error: "Buyurtma uchun kamida bitta soat tanlangan bo'lishi kerak." },
        { status: 400 }
      );
    }

    // 3. Resolve items and calculate sum
    let calculatedTotal = 0;
    const resolvedItems: {
      name: string;
      quantity: number;
      price: number;
      customSummary?: string;
    }[] = [];

    for (const it of items) {
      const prod = productsData.find((p) => p.id === it.productId);
      const name = prod ? prod.name : it.name || "Shveytsariya Soati";
      const unitPrice = Number(it.unitPrice) || (prod ? prod.price : 100000000);
      const qty = Math.max(1, Number(it.quantity) || 1);

      const customParts: string[] = [];
      if (it.strap) customParts.push(`Braslet: ${it.strap}`);
      if (it.engraving) customParts.push(`Gravirovka: "${it.engraving}"`);
      if (it.giftBox) customParts.push("VIP Sovg'a Qutisi");

      calculatedTotal += unitPrice * qty;
      resolvedItems.push({
        name,
        quantity: qty,
        price: unitPrice,
        customSummary: customParts.join(", "),
      });
    }

    // 4. Generate Order Identifier
    const orderNumber = `CHRONOS-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      orderNumber,
      totalAmount: calculatedTotal,
      deliveryType,
      address: deliveryType === "delivery" ? address : storeLocation,
      deliveryTime,
      paymentMethod,
      comment,
      items: resolvedItems,
    });
  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { success: false, error: "Buyurtmani qabul qilishda texnik xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
