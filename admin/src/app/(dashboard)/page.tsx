import React from "react";
import Link from "next/link";
import { createClient, requireAuth } from "@/lib/supabase/server";
import { isSupabaseDevFallback } from "@/lib/supabase/devFallback";
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  MapPin,
  AlertTriangle,
  AlertCircle,
  Watch,
} from "lucide-react";
import { FALLBACK_PRODUCTS, FALLBACK_SETTINGS } from "@shared/fallbackData";
import type { Database } from "@shared/types/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export default async function DashboardPage() {
  const { profile } = await requireAuth(["owner", "manager", "staff"]);

  let orders: OrderRow[] = [];
  let orderItems: OrderItemRow[] = [];
  let products: ProductRow[] = [];
  let settings = FALLBACK_SETTINGS;

  try {
    const supabase = await createClient();
    const [ordersRes, itemsRes, productsRes, settingsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("order_items").select("*"),
      supabase.from("products").select("*").order("stock_quantity", { ascending: true }),
      supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
    ]);

    orders = (ordersRes.data || []) as OrderRow[];
    orderItems = (itemsRes.data || []) as OrderItemRow[];
    products = (productsRes.data || []) as ProductRow[];
    if (settingsRes.data) {
      settings = settingsRes.data;
    }
  } catch (err) {
    console.warn("DashboardPage data warning in dev:", err);
  }

  if (products.length === 0 && (process.env.NODE_ENV === "development" || isSupabaseDevFallback())) {
    products = FALLBACK_PRODUCTS;
  }

  const now = new Date();
  const nowMs = now.getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const sevenDaysAgo = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(nowMs - 30 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Key Metrics
  const todayOrders = orders.filter((o) => o.created_at >= todayStart);
  const newOrdersWaiting = orders.filter((o) => o.status === "new");

  // 2. Revenue computations
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const revToday = validOrders
    .filter((o) => o.created_at >= todayStart)
    .reduce((sum, o) => sum + Number(o.total_usd || 0), 0);

  const rev7Days = validOrders
    .filter((o) => o.created_at >= sevenDaysAgo)
    .reduce((sum, o) => sum + Number(o.total_usd || 0), 0);

  const rev30Days = validOrders
    .filter((o) => o.created_at >= thirtyDaysAgo)
    .reduce((sum, o) => sum + Number(o.total_usd || 0), 0);

  // 3. Orders by status
  const statusCounts: Record<string, number> = {
    new: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    out_for_delivery: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  }

  // 4. Orders by branch
  const tashkentOrders = orders.filter((o) => o.branch_id === "tashkent").length;
  const namanganOrders = orders.filter((o) => o.branch_id === "namangan").length;
  const courierOrders = orders.filter((o) => o.delivery_type === "delivery").length;

  // 5. Low-stock products (< 3 items)
  const lowStockProducts = products.filter((p) => p.stock_quantity < 3);

  // 6. Top Products ordered
  const productQtyMap: Record<string, { name: string; brand: string; qty: number; revenue: number }> = {};
  for (const item of orderItems) {
    const key = item.product_id || item.product_slug;
    if (!productQtyMap[key]) {
      productQtyMap[key] = {
        name: item.product_name_uz,
        brand: item.brand,
        qty: 0,
        revenue: 0,
      };
    }
    productQtyMap[key].qty += item.quantity;
    productQtyMap[key].revenue += Number(item.total_price_usd);
  }

  const topProducts = Object.values(productQtyMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 7. 7-Day Chart Data (Day by Day counts)
  const days: { dateStr: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayLabel = d.toLocaleDateString("uz-UZ", { weekday: "short", day: "numeric" });

    const count = orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;

    days.push({ dateStr: d.toISOString().split("T")[0], label: dayLabel, count });
  }

  const maxChartCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-serif font-medium text-white">Xush kelibsiz, {profile?.full_name}</h1>
          <p className="text-xs text-zinc-400 mt-1">SwissWatch Premium savdo va buyurtmalar tahlili</p>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Barcha buyurtmalarni ko&apos;rish</span>
        </Link>
      </div>

      {/* Warning if usd_to_uzs_rate is NULL */}
      {settings?.usd_to_uzs_rate === null && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-medium text-amber-300">USD/UZS valyuta kursi belgilanmagan</p>
            <p className="text-amber-200/80 leading-relaxed">
              Do&apos;kon sozlamalarida kurs kiritilmagan. Valyuta kursi kiritilmaguncha, do&apos;konda UZS
              hisob-kitoblari va onlayn to&apos;lovlar (Payme / Click) xavfsizlik maqsadida o&apos;chirilgan holatda bo&apos;ladi.
            </p>
          </div>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Bugungi buyurtmalar</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-white">{todayOrders.length}</span>
            <span className="text-xs text-zinc-500">ta buyurtma</span>
          </div>
          <p className="text-[11px] text-zinc-400 pt-1 border-t border-white/[0.04]">
            Jami: <span className="font-mono text-zinc-300">${revToday.toLocaleString()}</span>
          </p>
        </div>

        {/* New Waiting Orders */}
        <div className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Kutilayotgan yangi</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-amber-400">{newOrdersWaiting.length}</span>
            <span className="text-xs text-zinc-500">tasdiqlash kerak</span>
          </div>
          <div className="pt-1 border-t border-white/[0.04]">
            <Link href="/orders?status=new" className="text-xs text-[#D4AF37] hover:underline inline-flex items-center gap-1">
              Ko&apos;rish va tasdiqlash &rarr;
            </Link>
          </div>
        </div>

        {/* 7-Day Revenue */}
        <div className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">7 kunlik tushum</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-white">${rev7Days.toLocaleString()}</span>
            <span className="text-xs text-zinc-500">USD</span>
          </div>
          <p className="text-[11px] text-zinc-500 pt-1 border-t border-white/[0.04]">
            Faol va yakunlangan buyurtmalar
          </p>
        </div>

        {/* 30-Day Revenue */}
        <div className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">30 kunlik tushum</span>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-white">${rev30Days.toLocaleString()}</span>
            <span className="text-xs text-zinc-500">USD</span>
          </div>
          <p className="text-[11px] text-zinc-500 pt-1 border-t border-white/[0.04]">
            Oylik aylanma
          </p>
        </div>
      </div>

      {/* 7-Day Orders Chart & Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">Oxirgi 7 kunlik buyurtmalar dinamikasi</h2>
              <p className="text-xs text-zinc-400">Kunlar bo&apos;yicha yangi buyurtmalar soni</p>
            </div>
            <span className="text-xs font-mono text-[#D4AF37]">{orders.length} jami</span>
          </div>

          {/* Simple CSS Bar Chart */}
          <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-white/[0.06]">
            {days.map((d, idx) => {
              const heightPercent = Math.max(12, Math.round((d.count / maxChartCount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t bg-gradient-to-t from-[#D4AF37]/40 to-[#D4AF37] group-hover:to-amber-300 transition-all cursor-pointer relative"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono capitalize">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-4">
          <h2 className="text-sm font-medium text-white">Holatlar bo&apos;yicha taqsimot</h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-[#0d0f12] border border-white/[0.04]">
              <span className="text-blue-400">Yangi</span>
              <span className="font-mono font-medium text-white">{statusCounts.new}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0d0f12] border border-white/[0.04]">
              <span className="text-purple-400">Tasdiqlangan</span>
              <span className="font-mono font-medium text-white">{statusCounts.confirmed}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0d0f12] border border-white/[0.04]">
              <span className="text-amber-400">Tayyorlanmoqda</span>
              <span className="font-mono font-medium text-white">{statusCounts.preparing}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0d0f12] border border-white/[0.04]">
              <span className="text-emerald-400">Tayyor</span>
              <span className="font-mono font-medium text-white">{statusCounts.ready}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0d0f12] border border-white/[0.04]">
              <span className="text-cyan-400">Kuryer orqali yetkazilmoqda</span>
              <span className="font-mono font-medium text-white">{statusCounts.out_for_delivery}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0d0f12] border border-white/[0.04]">
              <span className="text-zinc-400">Bajarildi</span>
              <span className="font-mono font-medium text-white">{statusCounts.completed}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0d0f12] border border-white/[0.04]">
              <span className="text-red-400">Bekor qilingan</span>
              <span className="font-mono font-medium text-white">{statusCounts.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch & Low Stock & Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branch Breakdown */}
        <div className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-white uppercase tracking-wider font-mono">Filiallar bo&apos;yicha</h3>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-zinc-400">Toshkent filiali:</span>
              <span className="font-mono text-white">{tashkentOrders} ta</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-zinc-400">Namangan filiali:</span>
              <span className="font-mono text-white">{namanganOrders} ta</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-400">Kuryer yetkazishi:</span>
              <span className="font-mono text-white">{courierOrders} ta</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-white uppercase tracking-wider font-mono">Kam qolgan modellar</h3>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-zinc-500 py-3">Barcha soatlar yetarli hajmda mavjud.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {lowStockProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-300 truncate max-w-[180px]">{p.name_uz}</span>
                  <span className="font-mono font-medium text-amber-400">{p.stock_quantity} dona</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="p-5 rounded-xl bg-[#13171d] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-white uppercase tracking-wider font-mono">Eng ko&apos;p sotilganlar</h3>
            <Watch className="w-4 h-4 text-[#D4AF37]" />
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-zinc-500 py-3">Hozircha sotuvlar qayd etilmagan.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-300 truncate max-w-[180px]">{p.name}</span>
                  <span className="font-mono text-white">{p.qty} dona</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
