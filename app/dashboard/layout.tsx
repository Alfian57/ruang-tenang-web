"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BlockedUsersModal } from "@/components/shared/moderation";
import { LogoutModal } from "@/components/ui/logout-modal";
import { EditProfileModal } from "@/components/layout/dashboard";
import { ChangePasswordModal } from "@/components/layout/dashboard";
import { ExpHistoryModal } from "@/components/layout/dashboard";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { MoodCheckinProvider } from "@/components/providers/MoodCheckinProvider";
import { GlobalMusicPlayer } from "@/components/layout";
import { DailyTaskFAB } from "@/components/shared/gamification";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useBlockStore } from "@/store/blockStore";
import { Sidebar, MobileHeader, TopHeader } from "@/components/layout/dashboard";
import { ROUTES } from "@/lib/routes";

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
  const loadBlockedUsers = useBlockStore((s) => s.loadBlockedUsers);

  // Load blocked users list on mount
  useEffect(() => {
    if (token) {
      loadBlockedUsers(token);
    }
  }, [token, loadBlockedUsers]);

  const handleLogout = useCallback(() => {
    logout();
    router.push(ROUTES.LOGIN);
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
      {/* Modals */}
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
      <MobileHeader
        user={user}
        isAdmin={isAdmin}
        isModerator={isModerator}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onEditProfile={() => setShowEditProfileModal(true)}
        onChangePassword={() => setShowChangePasswordModal(true)}
        onLogout={() => setShowLogoutModal(true)}
        onShowExpHistory={() => setShowExpHistoryModal(true)}
      />

      {/* Sidebar */}
      <Sidebar
        isAdmin={isAdmin}
        isModerator={isModerator}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onCloseSidebar={() => setSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-200",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
      )}>
        {/* Top Header (Desktop) */}
        <TopHeader
          user={user}
          isAdmin={isAdmin}
          isModerator={isModerator}
          onEditProfile={() => setShowEditProfileModal(true)}
          onChangePassword={() => setShowChangePasswordModal(true)}
          onLogout={() => setShowLogoutModal(true)}
          onShowBlockedUsers={() => setShowBlockedUsersModal(true)}
          onShowExpHistory={() => setShowExpHistoryModal(true)}
        />

        {/* Page Content */}
        <main className="flex-1 pt-16 lg:pt-0">
          {children}
        </main>

        {/* Mood Check-in Modal (for regular users only) */}
        {!isAdmin && !isModerator && <MoodCheckinProvider />}

        {/* Daily Task FAB (for non-admin and non-moderator users) */}
        {!isAdmin && !isModerator && <DailyTaskFAB />}

        {/* Global Music Player */}
        <GlobalMusicPlayer />
      </div>
    </div>
  );
}
