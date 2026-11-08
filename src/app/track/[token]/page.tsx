import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyTrackingToken } from "@/lib/trackingToken";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getDevOrders } from "@shared/devStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Send,
} from "lucide-react";
import type { Database, OrderStatus } from "@shared/types/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: "Buyurtma holatini kuzatish — SwissWatch Premium",
  robots: {
    index: false,
    follow: false,
  },
};

function maskPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length >= 12) {
    // e.g. +998901234567 -> +998 90 *** ** 67
    return `${cleaned.slice(0, 7)} *** ** ${cleaned.slice(-2)}`;
  }
  return `${cleaned.slice(0, 4)} *** ${cleaned.slice(-2)}`;
}

const ORDER_STEPS: { status: OrderStatus; labelUz: string; descUz: string }[] = [
  { status: "new", labelUz: "Qabul qilindi", descUz: "Buyurtma ro'yxatdan o'tdi" },
  { status: "confirmed", labelUz: "Tasdiqlandi", descUz: "Menejer tasdiqladi" },
  { status: "preparing", labelUz: "Tayyorlanmoqda", descUz: "Omborda tekshirilmoqda" },
  { status: "ready", labelUz: "Tayyor", descUz: "Filialda olib ketishga tayyor" },
  { status: "out_for_delivery", labelUz: "Kuryerda", descUz: "Yetkazib berilmoqda" },
  { status: "completed", labelUz: "Bajarildi", descUz: "Mijozga topshirildi" },
];

function OrderTrackingSkeleton() {
  return (
    <div className="max-w-[850px] mx-auto px-4 sm:px-6 md:px-8 space-y-8 animate-pulse">
      <div className="border-b border-white/[0.08] pb-6 space-y-3">
        <div className="h-3 w-32 bg-white/[0.05] rounded" />
        <div className="h-8 w-64 bg-white/[0.05] rounded" />
        <div className="h-4 w-96 bg-white/[0.05] rounded" />
      </div>
      <div className="h-48 bg-[#111111] border border-white/[0.08] rounded-2xl" />
      <div className="h-64 bg-[#111111] border border-white/[0.08] rounded-2xl" />
    </div>
  );
}

async function OrderTrackingContent({ params }: PageProps) {
  const { token } = await params;
  const orderId = verifyTrackingToken(token);

  if (!orderId) {
    notFound();
  }

  let order: OrderRow | null = null;
  let items: OrderItemRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);

      order = orderRes.data;
      items = itemsRes.data || [];
    }
  } catch (err) {
    console.warn("Could not query DB for tracking order:", err);
  }

  // Fallback demo order if running without DB connection
  if (!order) {
    const devStore = getDevOrders();
    const matched = devStore.orders.find((o) => o.id === orderId);
    if (matched) {
      order = matched;
      items = devStore.items.filter((it) => it.order_id === orderId);
    } else {
      order = {
        id: orderId,
        order_number: "SWP-2026-9219",
        customer_name: "Azizbek Rahimov",
        customer_phone: "+998901234567",
        customer_email: null,
        lang: "uz",
        status: "preparing",
        delivery_type: "pickup",
        branch_id: "branch-central",
        delivery_method_id: "delivery-pickup",
        delivery_address: null,
        comment: null,
        internal_notes: null,
        promo_code_id: null,
        promo_code: null,
        discount_usd: 0,
        subtotal_usd: 1200,
        delivery_fee_usd: 0,
        total_usd: 1200,
        usd_to_uzs_rate: null,
        total_uzs: null,
        payment_method: "cash_on_delivery",
        payment_status: "unpaid",
        estimated_ready_date: "2026-11-09T18:00:00.000Z",
        created_at: "2026-11-08T10:00:00.000Z",
        updated_at: "2026-11-08T10:00:00.000Z",
      };
    }
  }

  if (!order) {
    notFound();
  }

  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-[850px] mx-auto px-4 sm:px-6 md:px-8 space-y-8">
      {/* Breadcrumb / Top Header */}
      <div className="border-b border-white/[0.08] pb-6 space-y-2">
        <div className="text-[11px] font-mono text-zinc-400 tracking-[0.16em] uppercase flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-white">Buyurtma holatini kuzatish</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white">
          Buyurtma #{order.order_number || order.id.slice(0, 8)}
        </h1>
        <p className="text-xs text-zinc-400">
          Ushbu sahifada buyurtmangizning real vaqtdagi tayyorgarlik va yetkazish bosqichlari ko&apos;rsatilgan
        </p>
      </div>

      {/* Cancelled Banner */}
      {isCancelled ? (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/20 text-red-300 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-red-200">Ushbu buyurtma bekor qilingan</p>
            <p className="text-red-300/80">
              Qo&apos;shimcha ma&apos;lumot yoki yangi buyurtma berish uchun bizning operatorlarimiz bilan bog&apos;lanishingiz mumkin.
            </p>
          </div>
        </div>
      ) : (
        /* Status Tracker Stepper */
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-400">
              Joriy holat
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider uppercase bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              {ORDER_STEPS.find((s) => s.status === order.status)?.labelUz || order.status}
            </span>
          </div>

          <div className="relative border-l-2 border-white/[0.08] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6 py-2">
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.status} className="relative group">
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                      isPast
                        ? "bg-[#D4AF37] border-[#D4AF37]"
                        : isCurrent
                        ? "bg-black border-[#D4AF37] ring-4 ring-[#D4AF37]/20"
                        : "bg-[#161616] border-white/20"
                    }`}
                  >
                    {isPast && <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />}
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        isCurrent
                          ? "text-[#D4AF37]"
                          : isPast
                          ? "text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {step.labelUz}
                    </p>
                    <p className="text-xs text-zinc-400">{step.descUz}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {order.estimated_ready_date && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5 text-xs text-zinc-300">
              <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                Taxminiy tayyor bo&apos;lish sanasi:{" "}
                <strong className="text-white">
                  {order.estimated_ready_date.split("T")[0]}
                </strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Minimal Order Details (Privacy Safe: Masked PII) */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xs font-mono uppercase tracking-[0.14em] text-white font-medium border-b border-white/[0.06] pb-3">
          Buyurtma ma&apos;lumotlari
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-zinc-400">Buyurtmachi:</span>
            <p className="font-medium text-white">{order.customer_name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-400">Telefon (maxfiy):</span>
            <p className="font-mono text-zinc-300">{maskPhone(order.customer_phone)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-400">Yetkazish usuli:</span>
            <p className="text-zinc-200">
              {order.delivery_type === "pickup" ? "Filialdan olib ketish" : "Kuryer orqali yetkazish"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-zinc-400">To&apos;lov usuli:</span>
            <p className="text-zinc-200 uppercase font-mono">
              {order.payment_method === "payme"
                ? "Payme (Test)"
                : order.payment_method === "click"
                ? "Click (Test)"
                : "Qabul qilinganda to'lash"}
            </p>
          </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            <span className="text-xs font-medium text-zinc-400">Buyurtma qilingan soatlar:</span>
            <div className="space-y-2">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="p-3 rounded-lg bg-[#0d0f12] border border-white/[0.04] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-medium text-white">{it.product_name_uz}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {it.quantity} dona &times; ${it.unit_price_usd} USD
                    </p>
                  </div>
                  <span className="font-mono text-white font-medium">
                    ${it.total_price_usd} USD
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Totals */}
        <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Jami to&apos;lov:</span>
          <div className="text-right">
            <p className="font-serif text-lg text-[#D4AF37] font-medium">
              ${order.total_usd} USD
            </p>
            {order.total_uzs && (
              <p className="text-xs font-mono text-zinc-400">
                {order.total_uzs.toLocaleString()} so&apos;m
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Help & Telegram Support CTA */}
      <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <p className="text-xs font-semibold text-white">Savollaringiz bormi?</p>
          <p className="text-xs text-zinc-400">
            Buyurtmangiz haqida ma&apos;lumot olish uchun Telegram orqali bog&apos;laning
          </p>
        </div>
        <a
          href="https://t.me/swissWatch_admin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white text-xs uppercase tracking-wider font-medium rounded-xl transition-all shadow-md shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Menejerga yozish</span>
        </a>
      </div>
    </div>
  );
}

export default function OrderTrackingPage({ params }: PageProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#090909] text-white pt-28 pb-32">
        <Suspense fallback={<OrderTrackingSkeleton />}>
          <OrderTrackingContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
