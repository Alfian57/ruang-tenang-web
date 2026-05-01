"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminService } from "@/services/api";
import { httpClient } from "@/services/http/client";
import type { PaginatedResponse } from "@/services/http/types";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export interface UserData {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  is_blocked: boolean;
  journal_blocked?: boolean;
  is_forum_blocked?: boolean;
  created_at: string;
}

export function useAdminUsers() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state
  // URL state
  const urlSearch = searchParams.get("search") || "";
  const urlRole = searchParams.get("role") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state from URL
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Update URL from debounced state
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl({ search: debouncedSearch || null, page: null });
    }
  }, [debouncedSearch, updateUrl, urlSearch]);

  const setSearch = (value: string) => setSearchTerm(value);
  const setRole = (value: string) => updateUrl({ role: value || null, page: null });
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
      const response = await httpClient.get<PaginatedResponse<UserData>>("/admin/users", {
        token,
        params: {
          search: urlSearch || undefined,
          role: urlRole || undefined,
          page: page.toString(),
          limit: "10",
        },
      });
      setUsers(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, urlSearch, urlRole]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlockAction = async () => {
    if (!token || !blockId) return;
    try {
      if (blockAction === "block") {
        await adminService.banUser(token, blockId, "Diblokir oleh admin");
        toast.success("Akses login pengguna berhasil diblokir");
      } else {
        await adminService.unbanUser(token, blockId);
        toast.success("Akses login pengguna berhasil dibuka");
      }
      setBlockId(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to block/unblock user:", error);
      toast.error("Gagal memperbarui status blokir login");
      throw error;
    }
  };

  const handleJournalBlockToggle = async (userId: number, currentlyBlocked?: boolean) => {
    if (!token) return;
    try {
      await adminService.toggleJournalBlock(token, userId);
      toast.success(
        currentlyBlocked
          ? "Blokir fitur jurnal berhasil dibuka"
          : "Fitur jurnal berhasil diblokir"
      );
      loadUsers();
    } catch (error) {
      console.error("Failed to toggle journal block:", error);
      toast.error("Gagal memperbarui blokir fitur jurnal");
      throw error;
    }
  };

  const handleForumBlockToggle = async (userId: number, currentlyBlocked?: boolean) => {
    if (!token) return;
    try {
      await adminService.toggleForumBlock(token, userId);
      toast.success(
        currentlyBlocked
          ? "Blokir fitur forum berhasil dibuka"
          : "Fitur forum berhasil diblokir"
      );
      loadUsers();
    } catch (error) {
      console.error("Failed to toggle forum block:", error);
      toast.error("Gagal memperbarui blokir fitur forum");
      throw error;
    }
  };

  const handleRoleChange = async (userId: number, role: "user" | "mitra") => {
    if (!token) return;
    try {
      await adminService.updateUserRole(token, userId, role);
      toast.success(role === "mitra" ? "Pengguna dipromosikan menjadi mitra" : "Role mitra dicabut");
      loadUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Gagal memperbarui role pengguna");
      throw error;
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
    search: searchTerm,
    role: urlRole,
    page,
    setSearch,
    setRole,
    setPage,
    setBlockId,
    openBlockDialog,
    handleBlockAction,
    handleJournalBlockToggle,
    handleForumBlockToggle,
    handleRoleChange,
  };
}
