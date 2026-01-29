"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireMember?: boolean;
  redirectTo?: string;
}

export function AuthProvider({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireMember = false,
  redirectTo = "/login",
}: AuthProviderProps) {
  const router = useRouter();
  const { isAuthenticated, refreshUser, isHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for hydration to complete first
    if (!isHydrated) return;

    const checkAuth = async () => {
      // After hydration, check the actual auth state
      const currentState = useAuthStore.getState();

      // Refresh user data if authenticated
      if (currentState.isAuthenticated && currentState.token) {
        try {
          await refreshUser();
        } catch {
          // If refresh fails, continue with current state
        }
      }

      // Get fresh state after potential refresh
      const freshState = useAuthStore.getState();

      // Check authentication requirements
      if (requireAuth && !freshState.isAuthenticated) {
        router.replace(redirectTo);
        return;
      }

      // Check role requirements
      if (requireAdmin && freshState.user?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      if (requireMember && freshState.user?.role !== "member") {
        router.replace("/dashboard");
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isHydrated, requireAuth, requireAdmin, requireMember, redirectTo, router, refreshUser]);

  // Show loading while hydrating or checking auth
  if (!isHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated (after hydration)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Hook for getting authenticated user safely
export function useAuth() {
  const { user, token, isAuthenticated, logout, isHydrated, refreshUser } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated: isHydrated && isAuthenticated,
    isLoading: !isHydrated,
    isAdmin: user?.role === "admin",
    isModerator: user?.role === "moderator",
    canModerate: user?.role === "admin" || user?.role === "moderator",
    isMember: user?.role === "member",
    logout,
    refreshUser,
  };
}
