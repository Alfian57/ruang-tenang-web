"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { broadcastService, type BroadcastNotification, type CreateBroadcastPayload, type UpdateBroadcastPayload } from "@/services/api/broadcast";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export function useBroadcasts() {
  const { token, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlSearch = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

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

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl({ search: debouncedSearch || null, page: null });
    }
  }, [debouncedSearch, updateUrl, urlSearch]);

  const setSearch = (value: string) => setSearchTerm(value);
  const setPage = (value: number) => updateUrl({ page: value > 1 ? value.toString() : null });

  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<BroadcastNotification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sendId, setSendId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBroadcasts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await broadcastService.getAll(token, {
        search: urlSearch || undefined,
        page,
        limit: 10,
      });
      setBroadcasts(response.data || []);
      setTotalPages(response.meta?.total_pages || 1);
    } catch {
      toast.error("Gagal memuat data broadcast");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, urlSearch]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const handleCreate = async (data: CreateBroadcastPayload) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await broadcastService.create(token, data);
      toast.success("Broadcast berhasil dibuat");
      setShowCreateDialog(false);
      loadBroadcasts();
    } catch {
      toast.error("Gagal membuat broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateBroadcastPayload) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await broadcastService.update(token, id, data);
      toast.success("Broadcast berhasil diperbarui");
      setEditingBroadcast(null);
      loadBroadcasts();
    } catch {
      toast.error("Gagal memperbarui broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteId) return;
    setIsSubmitting(true);
    try {
      await broadcastService.delete(token, deleteId);
      toast.success("Broadcast berhasil dihapus");
      setDeleteId(null);
      loadBroadcasts();
    } catch {
      toast.error("Gagal menghapus broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNow = async () => {
    if (!token || !sendId) return;
    setIsSubmitting(true);
    try {
      await broadcastService.sendNow(token, sendId);
      toast.success("Broadcast sedang dikirim ke semua pengguna");
      setSendId(null);
      loadBroadcasts();
    } catch {
      toast.error("Gagal mengirim broadcast");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!token) return;
    try {
      await broadcastService.cancel(token, id);
      toast.success("Broadcast berhasil dibatalkan");
      loadBroadcasts();
    } catch {
      toast.error("Gagal membatalkan broadcast");
    }
  };

  return {
    user,
    broadcasts,
    totalPages,
    isLoading,
    isSubmitting,
    search: searchTerm,
    page,
    showCreateDialog,
    editingBroadcast,
    deleteId,
    sendId,
    setSearch,
    setPage,
    setShowCreateDialog,
    setEditingBroadcast,
    setDeleteId,
    setSendId,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSendNow,
    handleCancel,
  };
}
