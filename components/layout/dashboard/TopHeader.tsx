"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Settings, KeyRound, LogOut, Ban, MapIcon, Rocket } from "lucide-react";
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
import type { User, XPBoostStatus } from "@/types";

interface TopHeaderProps {
  user: User;
  isAdmin: boolean;
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
  xpBoost,
  onEditProfile,
  onChangePassword,
  onLogout,
  onShowBlockedUsers,
  onShowExpHistory,
}: TopHeaderProps) {
  const router = useRouter();

  const hasXPBoost = Boolean(xpBoost && xpBoost.remaining_seconds > 0);

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
    <header className="header-themed hidden lg:flex h-16 bg-white border-b items-center px-6 sticky top-0 z-40">
      {/* Search & Actions */}
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-3">
          {/* Gamification Info */}
          {isAdmin ? (
            <div className="hidden md:flex items-center bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full px-4 py-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <span className="text-purple-600 font-semibold">Admin</span>
              </div>
            </div>
          ) : (
            <>
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
          {!isAdmin && <ThemeSwitcher />}

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
              {!isAdmin && (
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
