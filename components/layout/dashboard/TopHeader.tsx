"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Settings, KeyRound, LogOut, Ban, MapIcon, Rocket, Building2, Crown, CreditCard, Lock } from "lucide-react";
import { GlobalSearch, ThemeSwitcher } from "@/components/layout/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUploadUrl } from "@/services/http/upload-url";
import { ROUTES } from "@/lib/routes";
import type { BillingStatus, User, XPBoostStatus } from "@/types";

interface TopHeaderProps {
  user: User;
  isAdmin: boolean;
  isMitra: boolean;
  billingStatus?: BillingStatus | null;
  xpBoost: XPBoostStatus | null;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onShowBlockedUsers: () => void;
  onShowExpHistory: () => void;
}

export function TopHeader({
  user,
  isAdmin,
  isMitra,
  billingStatus,
  xpBoost,
  onEditProfile,
  onChangePassword,
  onLogout,
  onShowBlockedUsers,
  onShowExpHistory,
}: TopHeaderProps) {
  const router = useRouter();
  const isUser = !isAdmin && !isMitra;

  const hasXPBoost = isUser && Boolean(xpBoost && xpBoost.remaining_seconds > 0);
  const isPremium = Boolean(billingStatus?.is_premium || user.is_premium);
  const chatQuota = billingStatus?.chat_quota;
  const isChatLimitExhausted = isUser && Boolean(chatQuota && !isPremium && !chatQuota.is_unlimited && chatQuota.remaining <= 0);
  const quotaLabel = !chatQuota
    ? "cek kuota"
    : chatQuota.is_unlimited
    ? "Tanpa batas"
    : `${Math.max(0, chatQuota?.remaining ?? 0)}/${chatQuota?.limit ?? 0}`;

  const formatRemaining = (seconds: number) => {
    if (seconds <= 0) return "berakhir";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }

    return `${Math.max(1, minutes)}m`;
  };

  return (
    <header className="header-themed hidden lg:flex h-16 min-w-0 bg-white border-b items-center px-4 xl:px-6 sticky top-0 z-40">
      {/* Search & Actions */}
      <div className="w-full min-w-0 flex items-center justify-between gap-3 xl:gap-4">
        <div className="min-w-0 flex-1 max-w-xl">
          <GlobalSearch />
        </div>

        <div className="flex min-w-0 shrink-0 items-center gap-2 xl:gap-3">
          {/* Gamification Info */}
          {isAdmin ? (
            <div className="hidden md:flex items-center bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full px-4 py-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <span className="text-purple-600 font-semibold">Admin</span>
              </div>
            </div>
          ) : isMitra ? (
            <div className="hidden md:flex items-center bg-linear-to-r from-red-50 to-rose-50 border border-red-200 rounded-full px-4 py-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-red-600" />
                <span className="text-red-700 font-semibold">Mitra</span>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push(ROUTES.BILLING)}
                className={`hidden md:flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm transition-all hover:shadow-md ${
                  isPremium
                    ? "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                    : isChatLimitExhausted
                      ? "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
                    : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
                title={isPremium ? "Premium aktif" : isChatLimitExhausted ? "Limit chat habis, buka Billing" : "Buka Billing & Paket"}
                aria-label={isPremium ? "Premium aktif" : isChatLimitExhausted ? "Limit chat habis, buka Billing" : "Buka Billing dan Paket"}
              >
                {isPremium ? <Crown className="h-3.5 w-3.5" /> : isChatLimitExhausted ? <Lock className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                <span className="text-xs font-semibold whitespace-nowrap">
                  {isPremium ? "Premium" : isChatLimitExhausted ? "Limit habis" : "Gratis"}
                </span>
                <span className="text-[11px] opacity-80 whitespace-nowrap">
                  {isPremium ? "Chat tanpa batas" : chatQuota ? `${quotaLabel} chat` : quotaLabel}
                </span>
              </button>

              {hasXPBoost && (
                <div
                  className="hidden md:flex items-center gap-2 rounded-full border border-orange-200 bg-linear-to-r from-orange-50 to-amber-50 px-3 py-1.5 shadow-sm"
                  title="XP Boost aktif"
                >
                  <Rocket className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-700 whitespace-nowrap">
                    XP x{xpBoost?.multiplier ?? 1}
                  </span>
                  <span className="text-[11px] text-orange-500 whitespace-nowrap">
                    {formatRemaining(xpBoost?.remaining_seconds ?? 0)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={onShowExpHistory}
                className="hidden md:flex items-center bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full pl-3 pr-4 py-1.5 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer overflow-hidden relative"
                title="Klik untuk melihat riwayat EXP"
                aria-label="Lihat riwayat EXP"
              >
                <div className="flex items-center gap-2">
                  {user?.badge_icon ? (
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center ml-0.5">
                      <Image
                        src={user.badge_icon}
                        alt={user?.badge_name || "Badge"}
                        width={24}
                        height={24}
                        className="w-full h-full object-contain"
                        unoptimized
                        loader={({ src }) => src}
                      />
                    </div>
                  ) : (
                    <span className="text-lg ml-0.5">🌱</span>
                  )}
                  <span className="text-xs flex items-center gap-3">
                    <span className="text-yellow-600 font-semibold whitespace-nowrap">Level {user?.level || 1}</span>
                    <span className="text-yellow-300">•</span>
                    <span className="text-yellow-700 font-bold whitespace-nowrap">{user?.exp || 0} EXP</span>
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => router.push(ROUTES.PROGRESS_MAP)}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all"
                title="Lihat Journey Tier di Peta Perjalanan"
                aria-label="Buka peta perjalanan"
              >
                <MapIcon className="h-3.5 w-3.5 text-indigo-500" />
              </button>
            </>
          )}

          {/* Theme Switcher */}
          {isUser && <ThemeSwitcher />}

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer"
                aria-label="Buka menu akun"
                aria-haspopup="menu"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative border border-gray-200">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar.startsWith("http") ? user.avatar : getUploadUrl(user.avatar)}
                      alt={user.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-primary font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEditProfile} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onChangePassword} className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Ganti Password</span>
              </DropdownMenuItem>
              {isUser && (
                <DropdownMenuItem onClick={onShowBlockedUsers} className="cursor-pointer">
                  <Ban className="mr-2 h-4 w-4" />
                  <span>Pengguna Diblokir</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
