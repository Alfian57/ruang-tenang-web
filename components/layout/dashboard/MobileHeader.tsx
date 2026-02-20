"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Settings, KeyRound, LogOut, Trophy, Crown, Shield } from "lucide-react";
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
import type { User } from "@/types";

interface MobileHeaderProps {
  user: User;
  isAdmin: boolean;
  isModerator: boolean;
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
  isModerator,
  sidebarOpen,
  onToggleSidebar,
  onEditProfile,
  onChangePassword,
  onLogout,
  onShowExpHistory,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/logo.webp" alt="Ruang Tenang" width={32} height={32} className="object-contain" />
        <span className="text-base sm:text-lg font-bold text-gray-800">Ruang Tenang</span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative border border-gray-200 cursor-pointer">
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
            </div>
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
            {isAdmin && (
              <DropdownMenuItem disabled>
                <Crown className="mr-2 h-4 w-4 text-purple-600" />
                <span>Admin</span>
              </DropdownMenuItem>
            )}
            {isModerator && (
              <DropdownMenuItem disabled>
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                <span>Moderator</span>
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
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
}
