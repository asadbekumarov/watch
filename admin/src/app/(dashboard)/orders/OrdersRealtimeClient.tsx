"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { advanceOrderStatus, updateOrderInternalNotes, updateOrderEstimatedReadyDate } from "@/app/actions/orderActions";
import type { Database, OrderStatus } from "@shared/types/database.types";
import {
  Clock,
  CheckCircle2,
  Truck,
  Store,
  XCircle,
  Phone,
  Search,
  Volume2,
  VolumeX,
  Save,
  Calendar,
} from "lucide-react";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

interface OrdersRealtimeClientProps {
  initialOrders: OrderRow[];
  orderItems: Record<string, OrderItemRow[]>;
}

// Synthesize pleasant chime using Web Audio API (no external asset required)
function playOrderPing() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (err) {
    console.warn("Audio play prevented:", err);
  }
}

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: "Yangi", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  confirmed: { label: "Tasdiqlangan", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  preparing: { label: "Tayyorlanmoqda", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  ready: { label: "Tayyor", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  out_for_delivery: { label: "Kuryerda", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  completed: { label: "Bajarildi", color: "bg-zinc-800 text-zinc-400 border-zinc-700" },
  cancelled: { label: "Bekor qilindi", color: "bg-red-500/10 text-red-400 border-red-500/30" },
};

export default function OrdersRealtimeClient({
  initialOrders,
  orderItems,
}: OrdersRealtimeClientProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [itemsMap, setItemsMap] = useState<Record<string, OrderItemRow[]>>(orderItems);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [newBadgeCount, setNewBadgeCount] = useState(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("swp_admin_sound_muted") === "true";
    }
    return false;
  });
  const selectedOrderRef = React.useRef<OrderRow | null>(null);

  useEffect(() => {
    selectedOrderRef.current = selectedOrder;
  }, [selectedOrder]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("swp_admin_sound_muted", String(next));
      }
      return next;
    });
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Status Action Transition
  const [isPending, startTransition] = useTransition();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [internalNotesInput, setInternalNotesInput] = useState("");
  const [readyDateInput, setReadyDateInput] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSelectOrder = (o: OrderRow | null) => {
    setSelectedOrder(o);
    setInternalNotesInput(o?.internal_notes || "");
    setReadyDateInput(o?.estimated_ready_date ? o.estimated_ready_date.split("T")[0] : "");
  };

  // Realtime subscription setup
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      // In dev mode without live Supabase cloud instance, poll local dev store every 2.5s
      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/dev-orders");
          if (!res.ok) return;
          const data = await res.json();
          if (Array.isArray(data?.orders)) {
            setOrders((prev) => {
              if (data.orders.length > prev.length && prev.length > 0) {
                if (!isMuted) {
                  playOrderPing();
                }
                setNewBadgeCount((c) => c + (data.orders.length - prev.length));
              }
              return data.orders;
            });

            if (Array.isArray(data.items)) {
              const newMap: Record<string, OrderItemRow[]> = {};
              for (const it of data.items) {
                if (!newMap[it.order_id]) newMap[it.order_id] = [];
                newMap[it.order_id].push(it);
              }
              setItemsMap(newMap);
            }
          }
        } catch {
          // Dev polling ignore
        }
      }, 2500);

      return () => clearInterval(interval);
    }

    const supabase = createClient();

    const channel = supabase
      .channel("admin-orders-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const newOrder = payload.new as OrderRow;
          if (!isMuted) {
            playOrderPing();
          }
          setOrders((prev) => [newOrder, ...prev]);
          setNewBadgeCount((c) => c + 1);

          // Fetch items for new order
          const { data: newItems } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", newOrder.id);

          if (newItems) {
            setItemsMap((prev) => ({ ...prev, [newOrder.id]: newItems }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as OrderRow;
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          if (selectedOrderRef.current && selectedOrderRef.current.id === updated.id) {
            setSelectedOrder(updated);
            setInternalNotesInput(updated.internal_notes || "");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMuted]);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (branchFilter !== "all" && o.branch_id !== branchFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchNumber = o.order_number.toLowerCase().includes(q);
      const matchCustomer = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.toLowerCase().includes(q);
      if (!matchNumber && !matchCustomer && !matchPhone) return false;
    }
    return true;
  });

  const handleStatusAdvance = (newStatus: OrderStatus, reason?: string) => {
    if (!selectedOrder) return;
    setActionError(null);

    startTransition(async () => {
      const res = await advanceOrderStatus({
        orderId: selectedOrder.id,
        newStatus,
        reason: reason || null,
        internalNotes: internalNotesInput || null,
      });

      if (res.error) {
        setActionError(res.error);
      } else {
        setCancelModalOpen(false);
        setCancelReason("");
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedOrder) return;
    setActionError(null);

    startTransition(async () => {
      const res = await updateOrderInternalNotes(selectedOrder.id, internalNotesInput);
      if (res.error) {
        setActionError(res.error);
      }
    });
  };

  const handleSaveReadyDate = () => {
    if (!selectedOrder || !readyDateInput) return;
    setActionError(null);

    startTransition(async () => {
      const res = await updateOrderEstimatedReadyDate(selectedOrder.id, readyDateInput);
      if (res.error) {
        setActionError(res.error);
      } else {
        setSelectedOrder((prev) => (prev ? { ...prev, estimated_ready_date: readyDateInput } : null));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-white">Buyurtmalar boshqaruvi</h1>
            {newBadgeCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>+{newBadgeCount} yangi buyurtma</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Realtime rejimda yangi buyurtmalarni qabul qilish, holatini o&apos;zgartirish va tekshirish
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleMute}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              isMuted
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-white/[0.08] bg-[#13171d] hover:bg-white/[0.04] text-zinc-300"
            }`}
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish (Mute)"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
            <span>{isMuted ? "Ovoz o'chirilgan" : "Ovoz yoqilgan"}</span>
          </button>

          <button
            onClick={playOrderPing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Ovozli bildirishnomani sinab ko'rish"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Ovozni sinash</span>
          </button>
        </div>
      </div>

      {/* Audio permission reminder */}
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          Eslatma: Brauzerlar xavfsizlik siyosati tufayli yangi buyurtma signali sahifadagi birinchi bosishdan (klik) so&apos;ng avtomatik yangraydi.
        </span>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buyurtma raqami, ism yoki telefon..."
            className="w-full pl-9 pr-3 py-2 bg-[#13171d] border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#13171d] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">Barcha holatlar</option>
            <option value="new">Yangi (Kutilmoqda)</option>
            <option value="confirmed">Tasdiqlangan</option>
            <option value="preparing">Tayyorlanmoqda</option>
            <option value="ready">Tayyor (Showroomda)</option>
            <option value="out_for_delivery">Kuryer orqali yetkazilmoqda</option>
            <option value="completed">Bajarildi</option>
            <option value="cancelled">Bekor qilingan</option>
          </select>
        </div>

        <div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#13171d] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">Barcha filiallar</option>
            <option value="tashkent">Toshkent filiali</option>
            <option value="namangan">Namangan filiali</option>
          </select>
        </div>
      </div>

      {/* Orders List & Detail Drawer layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table / List (7 cols or full width) */}
        <div className={`${selectedOrder ? "lg:col-span-7" : "lg:col-span-12"} bg-[#13171d] border border-white/[0.08] rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0d0f12]/60 text-zinc-400">
                  <th className="py-3 px-4 font-medium">Buyurtma</th>
                  <th className="py-3 px-4 font-medium">Mijoz</th>
                  <th className="py-3 px-4 font-medium">Summa (USD)</th>
                  <th className="py-3 px-4 font-medium">Filial / Yetkazish</th>
                  <th className="py-3 px-4 font-medium">Holat</th>
                  <th className="py-3 px-4 font-medium text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      Hech qanday buyurtma topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const isSelected = selectedOrder?.id === o.id;
                    const statusMeta = STATUS_LABELS[o.status] || { label: o.status, color: "text-zinc-400" };

                    return (
                      <tr
                        key={o.id}
                        onClick={() => handleSelectOrder(o)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#D4AF37]/5" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-mono font-medium text-white">{o.order_number}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">
                            {new Date(o.created_at).toLocaleTimeString("uz-UZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-white truncate max-w-[140px]">{o.customer_name}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">{o.customer_phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-mono font-medium text-white">${o.total_usd}</p>
                          {o.total_uzs ? (
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {o.total_uzs.toLocaleString()} so&apos;m
                            </p>
                          ) : (
                            <p className="text-[10px] text-amber-400 font-mono">Menejerdan so&apos;rash</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            {o.delivery_type === "pickup" ? (
                              <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                            <span className="capitalize">{o.branch_id || "Kuryer"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono border ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrder(o);
                            }}
                            className="text-xs text-[#D4AF37] hover:underline"
                          >
                            Ochish &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Drawer (5 cols) */}
        {selectedOrder && (
          <div className="lg:col-span-5 bg-[#13171d] border border-white/[0.08] rounded-xl p-6 space-y-6 sticky top-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-serif font-medium text-white">
                    {selectedOrder.order_number}
                  </h2>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono border ${
                      STATUS_LABELS[selectedOrder.status].color
                    }`}
                  >
                    {STATUS_LABELS[selectedOrder.status].label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  Yaratilgan: {new Date(selectedOrder.created_at).toLocaleString("uz-UZ")}
                </p>
              </div>

              <button
                onClick={() => handleSelectOrder(null)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                {actionError}
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Mijoz ma&apos;lumotlari</span>
              <div className="p-3 rounded-lg bg-[#0d0f12] border border-white/[0.04] space-y-1.5">
                <p className="font-medium text-white">{selectedOrder.customer_name}</p>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <a
                    href={`tel:${selectedOrder.customer_phone}`}
                    className="font-mono text-zinc-200 hover:text-[#D4AF37] underline"
                  >
                    {selectedOrder.customer_phone}
                  </a>
                </div>
                {selectedOrder.delivery_type === "delivery" && selectedOrder.delivery_address && (
                  <p className="text-zinc-400">
                    <span className="text-zinc-500">Yetkazish manzili:</span> {selectedOrder.delivery_address}
                  </p>
                )}
                {selectedOrder.comment && (
                  <p className="text-zinc-400 italic">
                    <span className="text-zinc-500 not-italic">Izoh:</span> {selectedOrder.comment}
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Buyurtma qilingan soatlar</span>
              <div className="divide-y divide-white/[0.04] border border-white/[0.04] rounded-lg bg-[#0d0f12] overflow-hidden">
                {(itemsMap[selectedOrder.id] || []).map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{it.product_name_uz}</p>
                      <p className="text-[11px] text-zinc-500">{it.brand} • {it.quantity} dona</p>
                    </div>
                    <span className="font-mono text-white">${it.total_price_usd}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded-lg bg-[#0d0f12] border border-white/[0.04] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Mahsulotlar summasi:</span>
                <span>${selectedOrder.subtotal_usd}</span>
              </div>
              {selectedOrder.discount_usd > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Chegirma ({selectedOrder.promo_code}):</span>
                  <span>-${selectedOrder.discount_usd}</span>
                </div>
              )}
              {selectedOrder.delivery_fee_usd > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Yetkazib berish:</span>
                  <span>+${selectedOrder.delivery_fee_usd}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/[0.06] flex justify-between font-medium text-white text-sm">
                <span>Jami (USD):</span>
                <span className="text-[#D4AF37]">${selectedOrder.total_usd}</span>
              </div>
              {selectedOrder.total_uzs && (
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>To&apos;lanadigan so&apos;m (kurs: {selectedOrder.usd_to_uzs_rate}):</span>
                  <span>{selectedOrder.total_uzs.toLocaleString()} UZS</span>
                </div>
              )}
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Ichki xodim eslatmasi</span>
              <textarea
                rows={2}
                value={internalNotesInput}
                onChange={(e) => setInternalNotesInput(e.target.value)}
                placeholder="Mijoz bilan kelishilgan holatlar yoki eslatmalar..."
                className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs rounded transition-colors cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Eslatmani saqlash</span>
                </button>
              </div>
            </div>

            {/* Estimated Ready Date (Staff editable) */}
            <div className="space-y-2 p-3 rounded-lg bg-[#0d0f12] border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Tayyor bo&apos;lish sanasi</span>
                </span>
                {selectedOrder.estimated_ready_date && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    Joriy: {new Date(selectedOrder.estimated_ready_date).toLocaleDateString("uz-UZ")}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={readyDateInput}
                  onChange={(e) => setReadyDateInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#13171d] border border-white/[0.1] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={handleSaveReadyDate}
                  disabled={isPending || !readyDateInput}
                  className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] disabled:opacity-50 text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3 h-3" />
                  <span>Saqlash</span>
                </button>
              </div>
            </div>

            {/* Allowed Status Transition Buttons (Strict Matrix Enforced) */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Holatni o&apos;zgartirish</span>

              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === "new" && (
                  <button
                    onClick={() => handleStatusAdvance("confirmed")}
                    disabled={isPending}
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tasdiqlash</span>
                  </button>
                )}

                {selectedOrder.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusAdvance("preparing")}
                    disabled={isPending}
                    className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tayyorlashga yuborish</span>
                  </button>
                )}

                {selectedOrder.status === "preparing" && (
                  <button
                    onClick={() => handleStatusAdvance("ready")}
                    disabled={isPending}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tayyor deb belgilash</span>
                  </button>
                )}

                {selectedOrder.status === "ready" && selectedOrder.delivery_type === "pickup" && (
                  <button
                    onClick={() => handleStatusAdvance("completed")}
                    disabled={isPending}
                    className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Topshirish (Bajarildi)</span>
                  </button>
                )}

                {selectedOrder.status === "ready" && selectedOrder.delivery_type === "delivery" && (
                  <button
                    onClick={() => handleStatusAdvance("out_for_delivery")}
                    disabled={isPending}
                    className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Kuryerga topshirish</span>
                  </button>
                )}

                {selectedOrder.status === "out_for_delivery" && (
                  <button
                    onClick={() => handleStatusAdvance("completed")}
                    disabled={isPending}
                    className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Yetkazildi (Bajarildi)</span>
                  </button>
                )}

                {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    disabled={isPending}
                    className="py-2 px-3 border border-red-500/30 hover:bg-red-950/20 text-red-400 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Bekor qilish</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#13171d] border border-white/[0.08] rounded-xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-medium text-white">
              Buyurtmani bekor qilish ({selectedOrder.order_number})
            </h3>
            <p className="text-xs text-zinc-400">
              Bekor qilish sababini ko&apos;rsatish shart (ushbu sabab audit jurnali va buyurtma tarixida saqlanadi).
            </p>

            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Bekor qilish sababi (masalan: mijoz telefoniga javob bermadi)..."
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-zinc-400 hover:text-white"
              >
                Qaytish
              </button>
              <button
                type="button"
                disabled={isPending || cancelReason.trim().length === 0}
                onClick={() => handleStatusAdvance("cancelled", cancelReason.trim())}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                {isPending ? "Bekor qilinmoqda..." : "Bekor qilishni tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
