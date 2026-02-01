"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  LogOut,
  Menu,
  X,
  Users,
  ChevronRight,
  Settings,
  KeyRound,
  MessageSquare,
  ChevronDown,
  LayoutDashboard,
  Music,
  Trophy,
  Shield,
  Sparkles,
  Ban,
  BookOpen,
  Wind,
} from "lucide-react";
import { BlockedUsersModal } from "@/components/moderation";
import { Button } from "@/components/ui/button";
import { LogoutModal } from "@/components/ui/logout-modal";
import { EditProfileModal } from "@/components/dashboard/EditProfileModal";
import { ChangePasswordModal } from "@/components/dashboard/ChangePasswordModal";
import { ExpHistoryModal } from "@/components/dashboard/ExpHistoryModal";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { GlobalMusicPlayer } from "@/components/music";
import { DailyTaskFAB } from "@/components/gamification";
import { getUploadUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

// Member menu items (for regular users)
const StoryIcon = ({ className }: { className?: string }) => (
  <div className={cn("relative", className)}>
    <Image 
      src="/icons/story-icon.png" 
      alt="Story" 
      fill 
      className="object-contain" 
      sizes="20px"
    />
  </div>
);

const memberLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Beranda" },
  { href: "/dashboard/articles", icon: FileText, label: "Artikel" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/journal", icon: BookOpen, label: "Jurnal" },
  { href: "/dashboard/forum", icon: Users, label: "Forum" },
  { href: "/dashboard/stories", icon: StoryIcon, label: "Kisah Inspiratif" },
  { href: "/dashboard/breathing", icon: Wind, label: "Latihan Pernapasan" },
  { href: "/dashboard/music", icon: Music, label: "Musik" },
];

// Admin menu items (for admin only)
const adminLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/admin/users", icon: Users, label: "Pengguna" },
  { href: "/dashboard/admin/articles", icon: FileText, label: "Kelola Artikel" },
  { href: "/dashboard/admin/songs", icon: Music, label: "Kelola Musik" },
  { href: "/dashboard/admin/forums", icon: MessageSquare, label: "Kelola Forum" },
  { href: "/dashboard/admin/levels", icon: Trophy, label: "Kelola Level" },
  { href: "/dashboard/moderation", icon: Shield, label: "Moderasi" },
];

// Moderator menu items (for moderator role)
const moderatorLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Beranda" },
  { href: "/dashboard/articles", icon: FileText, label: "Artikel" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/journal", icon: BookOpen, label: "Jurnal" },
  { href: "/dashboard/forum", icon: Users, label: "Forum" },
  { href: "/dashboard/stories", icon: StoryIcon, label: "Kisah Inspiratif" },
  { href: "/dashboard/breathing", icon: Wind, label: "Latihan Pernapasan" },
  { href: "/dashboard/music", icon: Music, label: "Musik" },
  { href: "/dashboard/moderation", icon: Shield, label: "Moderasi" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requireAuth redirectTo="/login">
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin, isModerator } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [showExpHistoryModal, setShowExpHistoryModal] = useState(false);
  const { token } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      <BlockedUsersModal
        isOpen={showBlockedUsersModal}
        onClose={() => setShowBlockedUsersModal(false)}
      />
      {!isAdmin && (
        <ExpHistoryModal
          isOpen={showExpHistoryModal}
          onClose={() => setShowExpHistoryModal(false)}
          token={token || ""}
          currentExp={user?.exp || 0}
          currentLevel={user?.level || 1}
          badgeName={user?.badge_name || "Pemula"}
          badgeIcon={user?.badge_icon || "🌱"}
        />
      )}

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Ruang Tenang" width={32} height={32} className="object-contain" />
          <span className="text-lg font-bold text-gray-800">Ruang Tenang</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Level/EXP Badge */}
          {!isAdmin && (
            <button
              onClick={() => setShowExpHistoryModal(true)}
              className="flex items-center gap-1 bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-2 py-1 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer"
              title="Lihat riwayat EXP"
            >
              <span className="text-sm">{user?.badge_icon || "🌱"}</span>
              <span className="text-[10px] font-semibold text-yellow-600">Lv {user?.level || 1}</span>
              <span className="text-[10px] text-yellow-300">•</span>
              <span className="text-[10px] font-bold text-yellow-700">{user?.exp || 0}</span>
            </button>
          )}
          {isAdmin && (
            <div className="flex items-center gap-1 bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full px-2 py-1 shadow-sm">
              <span className="text-sm">👑</span>
              <span className="text-[10px] font-semibold text-purple-600">Admin</span>
            </div>
          )}
          {isModerator && (
            <div className="flex items-center gap-1 bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full px-2 py-1 shadow-sm">
              <span className="text-sm">🛡️</span>
              <span className="text-[10px] font-semibold text-blue-600">Moderator</span>
            </div>
          )}
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
              <DropdownMenuItem onClick={() => setShowEditProfileModal(true)} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowChangePasswordModal(true)} className="cursor-pointer">
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Ganti Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r z-40 transform transition-all duration-200",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "lg:w-20" : "lg:w-60",
        "w-60"
      )}>
        {/* Logo */}
        <div className="p-4 h-16 flex items-center justify-between border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            {sidebarCollapsed ? (
              <Image src="/logo.png" alt="Ruang Tenang" width={32} height={32} className="object-contain" />
            ) : (
              <Image src="/logo-full.png" alt="Ruang Tenang" width={0} height={0} sizes="100vw" className="h-8 w-auto object-contain" />
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-8 h-8 rounded-lg bg-gray-100 items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Image src="/images/sidebar-toggle.png" alt="" width={16} height={16} />
            </button>
          )}
        </div>

        {/* Toggle button for collapsed state */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-16 -right-3 hidden lg:flex w-6 h-6 rounded-full bg-white border shadow-sm items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Navigation */}
        <nav className="py-6 overflow-y-auto h-[calc(100vh-10rem)]">
          {/* Show different menus based on role */}
          {isAdmin ? (
            // Admin sees admin links (includes moderation)
            adminLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all relative",
                    isActive
                      ? "text-white bg-primary shadow-md"
                      : "text-gray-600 hover:bg-gray-100",
                    sidebarCollapsed && "lg:justify-center lg:mx-2 lg:px-3"
                  )}
                  title={sidebarCollapsed ? link.label : undefined}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{link.label}</span>}
                </Link>
              );
            })
          ) : isModerator ? (
            // Moderator sees moderator links (member features + moderation)
            moderatorLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all relative mb-1",
                    isActive
                      ? "text-white bg-primary shadow-md"
                      : "text-gray-600 hover:bg-gray-100",
                    sidebarCollapsed && "lg:justify-center lg:mx-2 lg:px-3"
                  )}
                  title={sidebarCollapsed ? link.label : undefined}
                >
                  <link.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-gray-500")} />
                  {!sidebarCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{link.label}</span>}
                </Link>
              );
            })
          ) : (
            // Member sees only member links
            memberLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all relative mb-1",
                    isActive
                      ? "text-white bg-primary shadow-md"
                      : "text-gray-600 hover:bg-gray-100",
                    sidebarCollapsed && "lg:justify-center lg:mx-2 lg:px-3"
                  )}
                  title={sidebarCollapsed ? link.label : undefined}
                >
                  <link.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-gray-500")} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{link.label}</span>
                    </>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Bottom section */}
        {/* Bottom section (Updated to remove logout, maybe add something else or leave empty) */}
        {/* Logout moved to top bar dropdown */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-center p-2">
            <span className="text-xs text-gray-400">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-200",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
      )}>
        {/* Top Header */}
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
                onClick={() => setShowExpHistoryModal(true)}
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
                <DropdownMenuItem onClick={() => setShowEditProfileModal(true)} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Edit Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowChangePasswordModal(true)} className="cursor-pointer">
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Ganti Password</span>
                </DropdownMenuItem>
                {!isAdmin && !isModerator && (
                  <DropdownMenuItem onClick={() => setShowBlockedUsersModal(true)} className="cursor-pointer">
                    <Ban className="mr-2 h-4 w-4" />
                    <span>Pengguna Diblokir</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pt-16 lg:pt-0">
          {children}
        </main>

        {/* Daily Task FAB (for non-admin users) */}
        {!isAdmin && <DailyTaskFAB />}

        {/* Global Music Player */}
        <GlobalMusicPlayer />
      </div>
    </div>
  );
}
