import { NextRequest, NextResponse } from "next/server";
import { productsData } from "@/data/products";
import { storeData } from "@/data/store";

// Simple in-memory rate limiting map
const ipRateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    ipRateLimit.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return false;
  }
  if (entry.count >= 6) {
    return true; // Max 6 requests per minute
  }
  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Juda ko'p so'rov yuborildi. Iltimos, birozdan so'ng urinib ko'ring." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 1. Honeypot check against automated spam bots
    if (body.honeypot) {
      return NextResponse.json({ success: true, orderNumber: "VS-SPAM" });
    }

    const {
      fullName,
      phone,
      deliveryType = "delivery",
      address = "",
      storeLocation = "",
      comment = "",
      items = [],
      isQuickOrder = false,
    } = body;

    // 2. Validate essential fields
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Iltimos, to'liq ism-familiyangizni kiriting." },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || "").replace(/[^0-9+]/g, "");
    if (!cleanPhone.startsWith("+998") || cleanPhone.length < 13) {
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

    // 3. Resolve items from server-side productsData (single source of truth)
    const resolvedItems: { name: string; quantity: number; price: number; priceHidden?: boolean }[] = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const prod = productsData.find((p) => p.id === item.productId);
      if (!prod) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      resolvedItems.push({
        name: `${prod.brand} ${prod.model}`,
        quantity: qty,
        price: prod.price,
        priceHidden: prod.priceHidden,
      });
      if (!prod.priceHidden) {
        calculatedTotal += prod.price * qty;
      }
    }

    if (resolvedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tanlangan mahsulotlar topilmadi." },
        { status: 400 }
      );
    }

    // 4. Generate order number: VS-YYMMDD-XXXX
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VS-${yy}${mm}${dd}-${rand}`;

    // 5. Build formatted Telegram notification message
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    let itemsListText = "";
    resolvedItems.forEach((it, idx) => {
      const priceStr = it.priceHidden
        ? "Narxini so'rang"
        : `${(it.price * it.quantity).toLocaleString("ru-RU")} so'm`;
      itemsListText += `${idx + 1}. <b>${it.name}</b> (${it.quantity} dona) — ${priceStr}\n`;
    });

    const deliveryText =
      deliveryType === "pickup"
        ? `🏪 Do'kondan olib ketish (${storeLocation || storeData.addresses[0].address})`
        : `🚚 Kuryer orqali yetkazib berish\n📍 Manzil: ${address || "Ko'rsatilmagan"}`;

    const tgMessage = `
🔔 <b>YANGI BUYURTMA — ${storeData.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━
📋 <b>Raqami:</b> <code>${orderNumber}</code>
🏷 <b>Turi:</b> ${isQuickOrder ? "⚡ Tez buyurtma (1 bosishda)" : "🛒 Savat orqali buyurtma"}
👤 <b>Mijoz:</b> ${fullName.trim()}
📞 <b>Telefon:</b> <a href="tel:${cleanPhone}">${cleanPhone}</a>
📦 <b>Yetkazish:</b> ${deliveryText}
${comment ? `💬 <b>Izoh:</b> ${comment}\n` : ""}
🛍 <b>Mahsulotlar:</b>
${itemsListText}
💰 <b>Jami summa:</b> <b>${calculatedTotal.toLocaleString("ru-RU")} so'm</b>
━━━━━━━━━━━━━━━━━━
⏰ <i>Sana: ${now.toLocaleDateString("uz-UZ")} ${now.toLocaleTimeString("uz-UZ")}</i>
`.trim();

    // Send to Telegram if credentials are set
    if (botToken && chatId) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgMessage,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });
        if (!tgRes.ok) {
          console.error("Telegram API error:", await tgRes.text());
        }
      } catch (tgErr) {
        console.error("Failed to deliver telegram message:", tgErr);
      }
    } else {
      console.log("[DEV MODE] Telegram notification would be sent:\n", tgMessage);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      totalAmount: calculatedTotal,
      message: "Buyurtmangiz muvaffaqiyatli qabul qilindi.",
    });
  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { success: false, error: "Serverda buyurtmani qayta ishlashda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}

