"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Settings, KeyRound, LogOut, Trophy, Crown, Rocket } from "lucide-react";
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
import type { User, XPBoostStatus } from "@/types";

interface MobileHeaderProps {
  user: User;
  isAdmin: boolean;
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
  xpBoost,
  sidebarOpen,
  onToggleSidebar,
  onEditProfile,
  onChangePassword,
  onLogout,
  onShowExpHistory,
}: MobileHeaderProps) {
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
    <header className="header-themed lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-3">
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

      <div className="flex-1 flex justify-center px-2">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 min-w-0">
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
            {!isAdmin && (
              <DropdownMenuItem onClick={onShowExpHistory} className="cursor-pointer">
                <Trophy className="mr-2 h-4 w-4 text-yellow-600" />
                <span>
                  Lv {user?.level || 1} • {user?.exp || 0} EXP
                </span>
              </DropdownMenuItem>
            )}
            {!isAdmin && hasXPBoost && (
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
