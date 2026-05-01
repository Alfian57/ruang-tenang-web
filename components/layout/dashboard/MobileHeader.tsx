"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Settings, KeyRound, LogOut, Trophy, Crown, Rocket, Building2, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface MobileHeaderProps {
  user: User;
  isAdmin: boolean;
  isMitra: boolean;
  billingStatus?: BillingStatus | null;
  xpBoost: XPBoostStatus | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onShowExpHistory: () => void;
}

export function MobileHeader({
  user,
  isAdmin,
  isMitra,
  billingStatus,
  xpBoost,
  sidebarOpen,
  onToggleSidebar,
  onEditProfile,
  onChangePassword,
  onLogout,
  onShowExpHistory,
}: MobileHeaderProps) {
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
  const homeRoute = isAdmin
    ? ROUTES.ADMIN.DASHBOARD
    : isMitra
      ? ROUTES.MITRA.DASHBOARD
      : ROUTES.DASHBOARD;

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
    <header className="header-themed lg:hidden fixed top-0 left-0 right-0 h-16 min-w-0 bg-white border-b z-50 flex items-center px-2 min-[360px]:px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-sidebar"
        className="shrink-0"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <div className="min-w-0 flex-1 flex justify-center px-1 min-[360px]:px-2">
        <Link href={homeRoute} className="flex items-center gap-2 min-w-0">
          <Image src="/logo.webp" alt="Ruang Tenang" width={28} height={28} className="object-contain" />
          <span className="hidden min-[390px]:inline text-sm font-bold text-gray-800 truncate">Ruang Tenang</span>
        </Link>
      </div>

      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative border border-gray-200 cursor-pointer"
              aria-label="Buka menu akun"
              aria-haspopup="menu"
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar.startsWith("http") ? user.avatar : getUploadUrl(user.avatar)}
                  alt={user.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <span className="text-primary font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isUser && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={ROUTES.BILLING}>
                  {isPremium ? (
                    <Crown className="mr-2 h-4 w-4 text-violet-600" />
                  ) : isChatLimitExhausted ? (
                    <Lock className="mr-2 h-4 w-4 text-amber-700" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4 text-amber-600" />
                  )}
                  <span>{isPremium ? "Premium • Chat tanpa batas" : isChatLimitExhausted ? "Limit chat habis • Upgrade" : `Gratis • ${chatQuota ? `${quotaLabel} chat` : quotaLabel}`}</span>
                </Link>
              </DropdownMenuItem>
            )}
            {isUser && (
              <DropdownMenuItem onClick={onShowExpHistory} className="cursor-pointer">
                <Trophy className="mr-2 h-4 w-4 text-yellow-600" />
                <span>
                  Lv {user?.level || 1} • {user?.exp || 0} EXP
                </span>
              </DropdownMenuItem>
            )}
            {isUser && hasXPBoost && (
              <DropdownMenuItem disabled className="opacity-100 focus:bg-transparent">
                <Rocket className="mr-2 h-4 w-4 text-orange-600" />
                <span className="text-orange-700">
                  XP x{xpBoost?.multiplier ?? 1} • {formatRemaining(xpBoost?.remaining_seconds ?? 0)}
                </span>
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem disabled>
                <Crown className="mr-2 h-4 w-4 text-purple-600" />
                <span>Admin</span>
              </DropdownMenuItem>
            )}
            {isMitra && (
              <DropdownMenuItem disabled>
                <Building2 className="mr-2 h-4 w-4 text-red-600" />
                <span className="text-red-700">Mitra</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEditProfile} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Edit Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onChangePassword} className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Ganti Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
