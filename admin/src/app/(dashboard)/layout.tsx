import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  Watch,
  Settings,
  MapPin,
  HelpCircle,
  Users,
  FileText,
  LogOut,
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  Tag,
  Truck,
  MessageSquare,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile || !profile.is_active) {
    redirect("/login");
  }

  if (profile.must_change_password) {
    redirect("/change-password");
  }

  const role = profile.role;
  const isOwner = role === "owner";
  const isManagerOrOwner = role === "owner" || role === "manager";

  return (
    <div className="min-h-screen flex bg-[#0d0f12]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111419] border-r border-white/[0.08] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-sm font-medium text-white tracking-tight">SwissWatch</h1>
                <p className="text-[11px] text-zinc-400">Boshqaruv paneli</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-400" />
              <span>Bosh sahifa</span>
            </Link>

            <Link
              href="/orders"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              <span>Buyurtmalar</span>
            </Link>

            <Link
              href="/sms"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <span>SMS xabarlar</span>
            </Link>

            {isManagerOrOwner && (
              <Link
                href="/products"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Watch className="w-4 h-4 text-zinc-400" />
                <span>Mahsulotlar</span>
              </Link>
            )}

            {isManagerOrOwner && (
              <Link
                href="/promo"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Tag className="w-4 h-4 text-zinc-400" />
                <span>Promokodlar</span>
              </Link>
            )}

            {isManagerOrOwner && (
              <Link
                href="/delivery"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Truck className="w-4 h-4 text-zinc-400" />
                <span>Yetkazib berish</span>
              </Link>
            )}

            {isManagerOrOwner && (
              <Link
                href="/branches"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>Filiallar</span>
              </Link>
            )}

            {isManagerOrOwner && (
              <Link
                href="/faqs"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-zinc-400" />
                <span>Savollar (FAQ)</span>
              </Link>
            )}

            {isManagerOrOwner && (
              <Link
                href="/hero"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>Hero banner</span>
              </Link>
            )}

            {isOwner && (
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Do&apos;kon sozlamalari</span>
              </Link>
            )}

            {isOwner && (
              <Link
                href="/staff"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Xodimlar</span>
              </Link>
            )}

            {isManagerOrOwner && (
              <Link
                href="/audit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Audit jurnali</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-medium text-white truncate">{profile.full_name}</p>
              <p className="text-[11px] text-zinc-400 truncate">{profile.email}</p>
            </div>
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                role === "owner"
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30"
                  : role === "manager"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}
            >
              {role}
            </span>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

