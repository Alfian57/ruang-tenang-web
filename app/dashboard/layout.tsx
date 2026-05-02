"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BlockedUsersModal, AppealModal } from "@/components/shared/moderation";
import { LogoutModal } from "@/components/ui/logout-modal";
import { EditProfileModal } from "@/components/layout/dashboard";
import { ChangePasswordModal } from "@/components/layout/dashboard";
import { ExpHistoryModal } from "@/components/layout/dashboard";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { MoodCheckinProvider } from "@/components/providers/MoodCheckinProvider";
import { WellnessOnboardingProvider } from "@/components/providers/WellnessOnboardingProvider";
import { GlobalMusicPlayer } from "@/components/layout";
import { DailyTaskFAB } from "@/components/shared/gamification";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { SkipLink } from "@/components/ui/accessibility";
import { UserFeatureTour } from "./_components/UserFeatureTour";
import { initAutoSync } from "@/lib/offline/syncOutbox";
import { cn } from "@/utils";
import { useAuthStore } from "@/store/authStore";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useBlockStore } from "@/store/blockStore";
import { Sidebar, MobileHeader, TopHeader } from "@/components/layout/dashboard";
import { ROUTES } from "@/lib/routes";
import { billingService, xpBoostService } from "@/services/api";
import { ApiError } from "@/services/http/types";
import type { BillingStatus, UserRole, XPBoostStatus } from "@/types";

type XPBoostUpdatedEventDetail = {
  status?: XPBoostStatus | null;
};

const SHARED_DASHBOARD_PATHS = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
];

function isPathAtOrBelow(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function isSharedDashboardPath(pathname: string): boolean {
  return SHARED_DASHBOARD_PATHS.some((path) => isPathAtOrBelow(pathname, path));
}

function getRoleHome(role: UserRole): string {
  if (role === "admin") return ROUTES.ADMIN.DASHBOARD;
  if (role === "mitra") return ROUTES.MITRA.DASHBOARD;
  return ROUTES.DASHBOARD;
}

function getUnauthorizedDashboardRedirect(pathname: string, role: UserRole): string | null {
  const isAdminPath = isPathAtOrBelow(pathname, ROUTES.ADMIN.DASHBOARD) || isPathAtOrBelow(pathname, ROUTES.ADMIN.MODERATION);
  const isMitraPath = isPathAtOrBelow(pathname, ROUTES.MITRA.DASHBOARD);

  if (isSharedDashboardPath(pathname)) {
    return null;
  }

  if (role === "admin") {
    return isAdminPath ? null : getRoleHome(role);
  }

  if (role === "mitra") {
    return isMitraPath ? null : getRoleHome(role);
  }

  return isAdminPath || isMitraPath ? getRoleHome(role) : null;
}

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
  const { user, logout, isAdmin, isMitra, isUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [showExpHistoryModal, setShowExpHistoryModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [xpBoostStatus, setXPBoostStatus] = useState<XPBoostStatus | null>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const { token } = useAuthStore();
  const loadBlockedUsers = useBlockStore((s) => s.loadBlockedUsers);
  const isPlayerVisible = useMusicPlayerStore((s) => s.isPlayerVisible);
  const currentSong = useMusicPlayerStore((s) => s.currentSong);
  const isMinimized = useMusicPlayerStore((s) => s.isMinimized);
  const showMusicPlayer = isPlayerVisible && currentSong;

  // Load blocked users list on mount
  useEffect(() => {
    if (token && isUser) {
      loadBlockedUsers(token);
    }
  }, [token, isUser, loadBlockedUsers]);

  const refreshXPBoostStatus = useCallback(async () => {
    if (!token || !isUser) {
      setXPBoostStatus(null);
      return;
    }

    try {
      const response = await xpBoostService.getActiveBoost(token);
      setXPBoostStatus(response.data ?? null);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) {
        setXPBoostStatus(null);
        return;
      }

      console.error("Failed to load XP boost status:", error);
    }
  }, [token, isUser]);

  useEffect(() => {
    refreshXPBoostStatus();
  }, [refreshXPBoostStatus]);

  const refreshBillingStatus = useCallback(async () => {
    if (!token || !isUser) {
      setBillingStatus(null);
      return;
    }

    try {
      const response = await billingService.getStatus(token);
      setBillingStatus(response.data);
    } catch (error) {
      console.error("Failed to load billing status:", error);
      setBillingStatus(null);
    }
  }, [token, isUser]);

  useEffect(() => {
    refreshBillingStatus();
  }, [refreshBillingStatus]);

  useEffect(() => {
    if (!token || !isUser) return;

    const interval = setInterval(refreshBillingStatus, 60_000);
    return () => clearInterval(interval);
  }, [token, isUser, refreshBillingStatus]);

  useEffect(() => {
    const handleRefresh = () => {
      refreshBillingStatus();
    };

    window.addEventListener("billing-status-refresh", handleRefresh);
    return () => window.removeEventListener("billing-status-refresh", handleRefresh);
  }, [refreshBillingStatus]);

  useEffect(() => {
    if (!token || !isUser) return;

    const interval = setInterval(refreshXPBoostStatus, 30_000);
    return () => clearInterval(interval);
  }, [token, isUser, refreshXPBoostStatus]);

  useEffect(() => {
    const handleXPBoostUpdated = (event: Event) => {
      const detail = (event as CustomEvent<XPBoostUpdatedEventDetail>).detail;
      if (detail && Object.prototype.hasOwnProperty.call(detail, "status")) {
        setXPBoostStatus(detail.status ?? null);
      }

      refreshXPBoostStatus();
    };

    window.addEventListener("xp-boost-updated", handleXPBoostUpdated);
    return () => window.removeEventListener("xp-boost-updated", handleXPBoostUpdated);
  }, [refreshXPBoostStatus]);

  useEffect(() => {
    if (!xpBoostStatus) {
      return;
    }

    const expiresAtMs = new Date(xpBoostStatus.expires_at).getTime();
    const fallbackExpiryMs = Date.now() + Math.max(0, xpBoostStatus.remaining_seconds) * 1000;
    const targetExpiryMs = Number.isFinite(expiresAtMs) && expiresAtMs > 0 ? expiresAtMs : fallbackExpiryMs;
    const delay = targetExpiryMs - Date.now();

    if (delay <= 0) {
      setXPBoostStatus(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      setXPBoostStatus(null);
      refreshXPBoostStatus();
    }, delay + 500);

    return () => window.clearTimeout(timeout);
  }, [xpBoostStatus, refreshXPBoostStatus]);

  // Initialize offline auto-sync
  useEffect(() => {
    const cleanup = initAutoSync();
    return cleanup;
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.push(ROUTES.LOGIN);
  }, [logout, router]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const unauthorizedRedirect = user
    ? getUnauthorizedDashboardRedirect(pathname, user.role)
    : null;

  useEffect(() => {
    if (unauthorizedRedirect) {
      router.replace(unauthorizedRedirect);
    }
  }, [router, unauthorizedRedirect]);

  if (!user || unauthorizedRedirect) {
    return null;
  }

  const activeDashboardTheme = user.role === "user" && user.profile_theme && user.profile_theme !== "default"
    ? user.profile_theme
    : null;

  return (
    <div className={cn(
      "min-h-screen",
      activeDashboardTheme
        ? `theme-${activeDashboardTheme} theme-bg`
        : "bg-gray-50"
    )}>
      <SkipLink href="#main-content" className="focus:z-70" />

      {/* Offline Indicator */}
      <OfflineIndicator />

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
      <AppealModal
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
      />
      {isUser && (
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
        isMitra={isMitra}
        billingStatus={billingStatus}
        xpBoost={xpBoostStatus}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onEditProfile={() => setShowEditProfileModal(true)}
        onChangePassword={() => setShowChangePasswordModal(true)}
        onLogout={() => setShowLogoutModal(true)}
        onShowExpHistory={() => setShowExpHistoryModal(true)}
      />

      {/* Sidebar */}
      <Sidebar
        userRole={user.role}
        billingStatus={billingStatus}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onCloseSidebar={() => setSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={cn(
        "min-h-screen min-w-0 max-w-full flex flex-col transition-all duration-200",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
      )}>
        {/* Top Header (Desktop) */}
        <TopHeader
          user={user}
          isAdmin={isAdmin}
          isMitra={isMitra}
          billingStatus={billingStatus}
          xpBoost={xpBoostStatus}
          onEditProfile={() => setShowEditProfileModal(true)}
          onChangePassword={() => setShowChangePasswordModal(true)}
          onLogout={() => setShowLogoutModal(true)}
          onShowBlockedUsers={() => setShowBlockedUsersModal(true)}
          onShowExpHistory={() => setShowExpHistoryModal(true)}
        />

        {/* Suspension/Ban Banner */}
        {(user?.is_suspended || user?.is_banned) && (
          <div className="bg-red-50 border-b border-red-200 px-3 py-3 sm:px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-red-600 font-medium text-sm">
                {user.is_banned
                  ? "⛔ Akun Anda telah diblokir permanen."
                  : `⚠️ Akun Anda sedang disuspend${user.suspension_end ? ` hingga ${new Date(user.suspension_end).toLocaleDateString("id-ID")}` : ""}.`}
              </span>
            </div>
            <button
              onClick={() => setShowAppealModal(true)}
              className="self-start text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline sm:self-auto sm:whitespace-nowrap"
            >
              Ajukan Banding
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className={cn(
          "focus:outline-none w-full min-w-0 max-w-[120rem] mx-auto overflow-x-clip",
          "flex-1 pt-16 lg:pt-0 transition-[padding-bottom] duration-200",
          showMusicPlayer && (isMinimized ? "pb-16" : "pb-28")
        )}
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Wellness onboarding and mood check-in modal (for regular users only) */}
        {isUser && <WellnessOnboardingProvider />}
        {isUser && <MoodCheckinProvider />}
        {isUser && <UserFeatureTour />}

        {/* Daily Task FAB (for non-admin users) */}
        {isUser && <DailyTaskFAB isSidebarOpen={sidebarOpen} xpBoost={xpBoostStatus} />}

        {/* Global Music Player */}
        <GlobalMusicPlayer sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  );
}
