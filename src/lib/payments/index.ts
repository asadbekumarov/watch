// Payment provider interface & abstractions (Click, Payme placeholders)

export type PaymentMethod = "cash_on_delivery" | "pay_in_store" | "click" | "payme";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: "UZS";
  customerName: string;
  customerPhone: string;
  returnUrl?: string;
}

export interface PaymentResult {
  provider: PaymentMethod;
  enabled: boolean;
  status: "pending" | "redirect" | "manual";
  paymentUrl?: string;
  message: string;
}

export interface PaymentProvider {
  id: PaymentMethod;
  name: string;
  isEnabled: boolean;
  processPayment: (req: PaymentRequest) => Promise<PaymentResult>;
}

// 1. Cash on Delivery / Pay in Store (Active default)
export const CashPaymentProvider: PaymentProvider = {
  id: "cash_on_delivery",
  name: "Qabul qilishda to'lov (Naqd / Karta)",
  isEnabled: true,
  processPayment: async (req) => {
    return {
      provider: "cash_on_delivery",
      enabled: true,
      status: "manual",
      message: `Buyurtma ${req.orderId} qabul qilindi. To'lov buyurtma olinganda amalga oshiriladi.`,
    };
  },
};

// 2. Payme (Placeholder, NOT enabled)
export const PaymeProvider: PaymentProvider = {
  id: "payme",
  name: "Payme (Tez kunda)",
  isEnabled: false,
  processPayment: async () => {
    throw new Error("Payme to'lov tizimi hozirda faollashtirilmagan.");
  },
};

// 3. Click (Placeholder, NOT enabled)
export const ClickProvider: PaymentProvider = {
  id: "click",
  name: "Click (Tez kunda)",
  isEnabled: false,
  processPayment: async () => {
    throw new Error("Click to'lov tizimi hozirda faollashtirilmagan.");
  },
};

export const activePaymentProviders: PaymentProvider[] = [
  CashPaymentProvider,
  PaymeProvider,
  ClickProvider,
];

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = activePaymentProviders.find((p) => p.id === method);
  return provider || CashPaymentProvider;
}

