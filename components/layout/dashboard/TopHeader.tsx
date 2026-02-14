"use client";

import Image from "next/image";
import { ChevronDown, Settings, KeyRound, LogOut, Ban } from "lucide-react";
import { GlobalSearch } from "@/components/layout/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUploadUrl } from "@/services/http/upload-url";
import type { User } from "@/types";

interface TopHeaderProps {
  user: User;
  isAdmin: boolean;
  isModerator: boolean;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onShowBlockedUsers: () => void;
  onShowExpHistory: () => void;
}

export function TopHeader({
  user,
  isAdmin,
  isModerator,
  onEditProfile,
  onChangePassword,
  onLogout,
  onShowBlockedUsers,
  onShowExpHistory,
}: TopHeaderProps) {
  return (
    <header className="hidden lg:flex h-16 bg-white border-b items-center justify-end px-6 sticky top-0 z-40">
      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <GlobalSearch />

        {/* Gamification Info */}
        {isAdmin ? (
          <div className="hidden md:flex items-center mr-4 bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full px-4 py-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>
              <span className="text-purple-600 font-semibold">Admin</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onShowExpHistory}
            className="hidden md:flex items-center mr-4 bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-4 py-1.5 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer"
            title="Klik untuk melihat riwayat EXP"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{user?.badge_icon || "🌱"}</span>
              <span className="text-xs flex items-center gap-3">
                <span className="text-yellow-600 font-semibold whitespace-nowrap">Level {user?.level || 1}</span>
                <span className="text-yellow-300">•</span>
                <span className="text-yellow-700 font-bold whitespace-nowrap">{user?.exp || 0} EXP</span>
              </span>
            </div>
          </button>
        )}

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
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
            </div>
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
            {!isAdmin && !isModerator && (
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
    </header>
  );
}
