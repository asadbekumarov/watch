export interface TelegramOrderNotification {
  orderNumber: string;
  totalAmount: number;
  customer: {
    fullName: string;
    phone: string;
    region: string;
    address: string;
  };
  deliveryMethodLabel: string;
  paymentMethod: string;
  comment?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number | null;
  }>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPriceUsd(amount: number | null): string {
  if (amount === null || amount === undefined || amount <= 0) {
    return "Menejerdan so'raladi"; // TODO: confirm price with store
  }
  return `$${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} USD`;
}

export function isTelegramConfigured(): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.CHAT_ID;

  if (!botToken || !chatId) return false;

  const placeholders = [
    "your_telegram_bot_token_here",
    "your_telegram_chat_id_here",
    "placeholder",
    "todo",
  ];

  const t = botToken.trim().toLowerCase();
  const c = chatId.trim().toLowerCase();

  if (placeholders.includes(t) || placeholders.includes(c) || t.includes("your_") || c.includes("your_")) {
    return false;
  }

  return true;
}

export async function sendTelegramOrderNotification(
  order: TelegramOrderNotification
): Promise<boolean> {
  const isConfigured = isTelegramConfigured();
  const isDev = process.env.NODE_ENV === "development";

  if (!isConfigured) {
    if (isDev) {
      console.warn(
        "⚠️ [Telegram Bot - DEV MODE ONLY] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID .env.local da placeholder holatida. Buyurtma faqat konsolga chiqarildi."
      );
      return true;
    }
    // In production, never pretend order was sent if token is missing or a placeholder
    console.error(
      "❌ [Telegram Bot - PRODUCTION ERROR] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID belgilanmagan yoki placeholder. Buyurtma qabul qilinmadi."
    );
    return false;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.CHAT_ID;

  try {
    const itemsList = order.items
      .map((item, idx) => {
        const itemPrice = formatPriceUsd(item.price);
        return `  <b>${idx + 1}. ${escapeHtml(item.name)}</b>\n     └ ${item.quantity} dona × ${itemPrice}`;
      })
      .join("\n\n");

    const safePhone = escapeHtml(order.customer.phone);
    const telDigits = order.customer.phone.replace(/[^0-9+]/g, "");

    const message = `
🌟 <b>SWISSWATCH PREMIUM — YANGI BUYURTMA</b>
<b>Raqam:</b> <code>${escapeHtml(order.orderNumber)}</code>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> ${escapeHtml(order.customer.fullName)}
📞 <b>Telefon:</b> <a href="tel:${telDigits}">${safePhone}</a>
📍 <b>Filial / Usul:</b> ${escapeHtml(order.deliveryMethodLabel)}
💳 <b>To'lov:</b> ${escapeHtml(order.paymentMethod)}
${order.comment ? `💬 <b>Izoh:</b> <i>${escapeHtml(order.comment)}</i>\n` : ""}
📦 <b>Tanlangan soatlar:</b>
${itemsList}

━━━━━━━━━━━━━━━━━━━━━
💰 <b>Jami hisoblangan:</b> <u>${formatPriceUsd(order.totalAmount)}</u>
⏱ <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
`.trim();

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const sendPayload = {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };

    // First attempt
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendPayload),
    }).catch(() => null);

    // If first attempt failed, retry once after 500ms
    if (!res || !res.ok) {
      await new Promise((r) => setTimeout(r, 500));
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendPayload),
      }).catch(() => null);
    }

    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => null) : null;
      console.warn("⚠️ Telegram botga yuborishda xatolik (ikkala urinish ham muvaffaqiyatsiz bo'ldi):", data);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("⚠️ Telegram API tarmoq xatosi, buyurtma buzilmasdan saqlanadi:", error);
    return false;
  }
}
