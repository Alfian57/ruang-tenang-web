"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminService } from "@/services/api";
import { httpClient } from "@/services/http/client";

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

export function useAdminUsers() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setSearch = (value: string) => updateUrl({ search: value || null, page: null });
  const setPage = (value: number) => updateUrl({ page: value > 1 ? value.toString() : null });

  const [users, setUsers] = useState<UserData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [blockId, setBlockId] = useState<number | null>(null);
  const [blockAction, setBlockAction] = useState<"block" | "unblock">("block");

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await httpClient.get<{ success?: boolean; data?: UserData[]; total_pages?: number }>("/admin/users", {
        token,
        params: {
          search: search || undefined,
          page: page.toString(),
          limit: "10",
        },
      });
      if (data.success !== false) {
        setUsers(data.data || []);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlockAction = async () => {
    if (!token || !blockId) return;
    try {
      if (blockAction === "block") {
        await adminService.banUser(token, blockId, "Diblokir oleh admin");
      } else {
        await adminService.unbanUser(token, blockId);
      }
      setBlockId(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to block/unblock user:", error);
    }
  };

  const openBlockDialog = (userId: number, action: "block" | "unblock") => {
    setBlockId(userId);
    setBlockAction(action);
  };

  return {
    user,
    users,
    totalPages,
    isLoading,
    blockId,
    blockAction,
    search,
    page,
    setSearch,
    setPage,
    setBlockId,
    openBlockDialog,
    handleBlockAction
  };
}
