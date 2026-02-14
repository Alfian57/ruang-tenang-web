"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService, communityService } from "@/services/api";
import { LevelConfig } from "@/types";
import { useAuthStore } from "@/store/authStore";

export interface LevelFormData {
  level: number;
  min_exp: number;
  badge_name: string;
  badge_icon: string;
}

export function useAdminLevels() {
  const { token } = useAuthStore();
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<LevelConfig | null>(null);
  const [formData, setFormData] = useState<LevelFormData>({
    level: 1,
    min_exp: 0,
    badge_name: "",
    badge_icon: "",
  });
  const [error, setError] = useState("");

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      // Use public endpoint for fetching (same data, no auth required for read)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await communityService.getLevelConfigs() as any;
      setLevels(response.data || []);
    } catch (err) {
      console.error("Failed to fetch levels:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data level");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleAdd = async () => {
    if (!token) {
      setError("Sesi login telah berakhir. Silakan login ulang.");
      return;
    }

    if (!formData.badge_name || !formData.badge_icon) {
      setError("Semua field harus diisi");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await adminService.createLevel(token, formData);
      setShowAddForm(false);
      setFormData({ level: 1, min_exp: 0, badge_name: "", badge_icon: "" });
      fetchLevels();
    } catch (error) {
      console.error("Failed to create level:", error);
      setError(error instanceof Error ? error.message : "Gagal menambahkan level");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (level: LevelConfig) => {
    setEditingId(level.id);
    setFormData({
      level: level.level,
      min_exp: level.min_exp,
      badge_name: level.badge_name,
      badge_icon: level.badge_icon,
    });
  };

  const handleUpdate = async () => {
    if (!token) {
      setError("Sesi login telah berakhir. Silakan login ulang.");
      return;
    }
    if (!editingId) {
      setError("ID level tidak valid");
      return;
    }

    if (!formData.badge_name || !formData.badge_icon) {
      setError("Semua field harus diisi");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await adminService.updateLevel(token, editingId, formData);
      setEditingId(null);
      setFormData({ level: 1, min_exp: 0, badge_name: "", badge_icon: "" });
      fetchLevels();
    } catch (error) {
      console.error("Failed to update level:", error);
      setError(error instanceof Error ? error.message : "Gagal memperbarui level");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) {
      setError("Sesi login telah berakhir. Silakan login ulang.");
      setDeleteModalOpen(false);
      return;
    }
    if (!levelToDelete) {
      setDeleteModalOpen(false);
      return;
    }

    try {
      await adminService.deleteLevel(token, levelToDelete.id);
      setDeleteModalOpen(false);
      setLevelToDelete(null);
      fetchLevels();
    } catch (error) {
      console.error("Failed to delete level:", error);
      setError(error instanceof Error ? error.message : "Gagal menghapus level");
      setDeleteModalOpen(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ level: 1, min_exp: 0, badge_name: "", badge_icon: "" });
    setError("");
  };

  return {
    levels,
    loading,
    saving,
    editingId,
    showAddForm,
    deleteModalOpen,
    levelToDelete,
    formData,
    error,
    setShowAddForm,
    setFormData,
    setDeleteModalOpen,
    setLevelToDelete,
    handleAdd,
    handleEdit,
    handleUpdate,
    handleDelete,
    cancelEdit,
  };
}
