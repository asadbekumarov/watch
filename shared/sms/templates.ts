/**
 * SwissWatch_premium — SMS Notification Templates
 * Multi-language templates for all 7 order lifecycle events.
 */

export interface OrderCreatedTemplateParams {
  orderNumber: string;
  totalUsd?: number | null;
  totalUzs?: number | null;
  trackingUrl?: string | null;
  lang?: string;
}

export interface OrderStatusTemplateParams {
  orderNumber: string;
  lang?: string;
  branchName?: string | null;
  branchAddress?: string | null;
  branchPhone?: string | null;
  estimatedDate?: string | null;
  reason?: string | null;
}

export function buildOrderCreatedSms(params: OrderCreatedTemplateParams): string {
  const isRu = params.lang === "ru";
  const url = params.trackingUrl ? ` Kuzatish: ${params.trackingUrl}` : "";
  const total = params.totalUsd ? ` Summa: $${params.totalUsd} USD.` : "";

  if (isRu) {
    const totalRu = params.totalUsd ? ` Итого: $${params.totalUsd} USD.` : "";
    return `SwissWatch: Ваш заказ #${params.orderNumber} принят.${totalRu}${url}`;
  }

  return `SwissWatch: Buyurtmangiz #${params.orderNumber} qabul qilindi.${total}${url}`;
}

export function buildOrderStatusSms(status: string, params: OrderStatusTemplateParams): string | null {
  const isRu = params.lang === "ru";

  switch (status) {
    case "confirmed":
      return isRu
        ? `SwissWatch: Ваш заказ #${params.orderNumber} подтвержден менеджером и передан в обработку.`
        : `SwissWatch: Buyurtmangiz #${params.orderNumber} menejer tomonidan tasdiqlandi.`;

    case "preparing": {
      const dateNotice = params.estimatedDate ? ` Taxminiy muddat: ${params.estimatedDate}.` : "";
      const dateNoticeRu = params.estimatedDate ? ` Примерная дата: ${params.estimatedDate}.` : "";
      return isRu
        ? `SwissWatch: Ваш заказ #${params.orderNumber} комплектуется и готовится к выдаче.${dateNoticeRu}`
        : `SwissWatch: Buyurtmangiz #${params.orderNumber} tayyorlanmoqda va qadoqlanmoqda.${dateNotice}`;
    }

    case "ready": {
      const branch = params.branchName ? ` в филиале ${params.branchName}` : "";
      const branchUz = params.branchName ? ` ${params.branchName} filialida` : "";
      const addr = params.branchAddress ? ` Адрес: ${params.branchAddress}.` : "";
      const addrUz = params.branchAddress ? ` Manzil: ${params.branchAddress}.` : "";
      const phone = params.branchPhone ? ` Тел: ${params.branchPhone}` : "";
      const phoneUz = params.branchPhone ? ` Tel: ${params.branchPhone}` : "";

      return isRu
        ? `SwissWatch: Ваш заказ #${params.orderNumber} готов к выдаче${branch}!${addr}${phone}`
        : `SwissWatch: Buyurtmangiz #${params.orderNumber}${branchUz} tayyor! Olib ketishingiz mumkin.${addrUz}${phoneUz}`;
    }

    case "out_for_delivery":
      return isRu
        ? `SwissWatch: Ваш заказ #${params.orderNumber} передан курьеру и доставляется по указанному адресу.`
        : `SwissWatch: Buyurtmangiz #${params.orderNumber} kuryerga topshirildi va yetkazilmoqda.`;

    case "completed":
      return isRu
        ? `SwissWatch: Заказ #${params.orderNumber} успешно выполнен. Спасибо за покупку и доверие!`
        : `SwissWatch: #${params.orderNumber} buyurtmangiz muvaffaqiyatli topshirildi. Xaridingiz uchun tashakkur!`;

    case "cancelled": {
      const reasonNotice = params.reason ? ` Sabab: ${params.reason}.` : "";
      const reasonNoticeRu = params.reason ? ` Причина: ${params.reason}.` : "";
      return isRu
        ? `SwissWatch: Ваш заказ #${params.orderNumber} отменен.${reasonNoticeRu}`
        : `SwissWatch: Buyurtmangiz #${params.orderNumber} bekor qilindi.${reasonNotice}`;
    }

    default:
      return null;
  }
}

