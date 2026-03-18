"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService, communityService, progressMapService } from "@/services/api";
import { LevelConfig } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { AdminMapLandmark, MapRegion } from "@/types/progress-map";

export interface LevelTaskFormData {
  id?: string;
  name: string;
  description: string;
  unlock_type: "activity_count" | "streak" | "xp" | "level";
  unlock_activity: string;
  unlock_value: number;
  xp_reward: number;
  coin_reward: number;
}

function resolveTaskIcon(task: Pick<LevelTaskFormData, "unlock_type" | "unlock_activity">): string {
  if (task.unlock_type === "streak") return "🔥";
  if (task.unlock_type === "xp") return "⭐";
  if (task.unlock_type === "level") return "🏆";

  const activity = task.unlock_activity.trim().toLowerCase();
  if (activity === "login") return "🚪";
  if (activity === "mood") return "😊";
  if (activity === "chat") return "💬";
  if (activity === "breathing") return "🌬️";
  if (activity === "journal") return "📝";
  if (activity === "forum") return "🗣️";
  if (activity === "story") return "✨";
  if (activity === "article" || activity === "write_article") return "📖";
  return "🎯";
}

export interface LevelFormData {
  level: number;
  min_exp: number;
  badge_name: string;
  tasks: LevelTaskFormData[];
  badge_image: File | null;
}

function createDefaultTask(index: number): LevelTaskFormData {
  return {
    name: `Tugas ${index + 1}`,
    description: "",
    unlock_type: "activity_count",
    unlock_activity: "breathing",
    unlock_value: 1,
    xp_reward: 10,
    coin_reward: 5,
  };
}

function buildTaskDescription(tasks: LevelTaskFormData[]): string {
  return tasks
    .map((task, index) => `${index + 1}. ${task.description?.trim() || task.name.trim() || `Tugas ${index + 1}`}`)
    .join("\n");
}

function normalizeTaskFromLandmark(item: AdminMapLandmark): LevelTaskFormData {
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    unlock_type: (item.unlock_type as LevelTaskFormData["unlock_type"]) || "activity_count",
    unlock_activity: item.unlock_activity || "",
    unlock_value: item.unlock_value,
    xp_reward: item.xp_reward,
    coin_reward: item.coin_reward,
  };
}

export function useAdminLevels() {
  const { token } = useAuthStore();
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [mapRegions, setMapRegions] = useState<MapRegion[]>([]);
  const [adminLandmarks, setAdminLandmarks] = useState<AdminMapLandmark[]>([]);
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
    tasks: [createDefaultTask(0), createDefaultTask(1), createDefaultTask(2)],
    badge_image: null,
  });
  const [error, setError] = useState("");

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) {
        const response = await communityService.getLevelConfigs();
        setLevels(response.data || []);
        setMapRegions([]);
        setAdminLandmarks([]);
        return;
      }

      const [levelsRes, fullMapRes, landmarksRes] = await Promise.all([
        adminService.getLevels(token).catch(() => communityService.getLevelConfigs()),
        progressMapService.getFullMap(token),
        adminService.getAdminMapLandmarks(token),
      ]);

      setLevels(levelsRes.data || []);
      setMapRegions(fullMapRes.data?.regions || []);
      setAdminLandmarks(landmarksRes.data || []);
    } catch (err) {
      console.error("Failed to fetch levels:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data level");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleAdd = async () => {
    if (!token) {
      setError("Sesi login telah berakhir. Silakan login ulang.");
      return;
    }

    if (!formData.badge_name) {
      setError("Nama badge harus diisi");
      return;
    }

    if (!formData.badge_image) {
      setError("Gambar badge harus dipilih");
      return;
    }

    if (formData.tasks.length === 0) {
      setError("Tambahkan minimal 1 tugas level");
      return;
    }

    if (formData.tasks.some((task) => !task.name.trim() || !task.description.trim())) {
      setError("Nama dan deskripsi semua tugas wajib diisi");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await adminService.createLevel(token, {
        level: formData.level,
        min_exp: formData.min_exp,
        badge_name: formData.badge_name,
        task_description: buildTaskDescription(formData.tasks),
        badge_image: formData.badge_image,
      });

      await syncLevelTasks(formData.level, formData.tasks);

      setShowAddForm(false);
      setFormData({
        level: 1,
        min_exp: 0,
        badge_name: "",
        tasks: [createDefaultTask(0), createDefaultTask(1), createDefaultTask(2)],
        badge_image: null,
      });
      await fetchLevels();
    } catch (error) {
      console.error("Failed to create level:", error);
      setError(error instanceof Error ? error.message : "Gagal menambahkan level");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (level: LevelConfig) => {
    const regionForLevel = mapRegions.find(
      (region) => region.unlock_type === "level" && region.unlock_value === level.level
    );

    const levelTasks = regionForLevel
      ? adminLandmarks
          .filter((item) => item.region_id === regionForLevel.id && item.is_active)
          .sort((a, b) => a.display_order - b.display_order)
          .map(normalizeTaskFromLandmark)
      : [];

    setEditingId(level.id);
    setFormData({
      level: level.level,
      min_exp: level.min_exp,
      badge_name: level.badge_name,
      tasks: levelTasks.length > 0 ? levelTasks : [createDefaultTask(0), createDefaultTask(1), createDefaultTask(2)],
      badge_image: null, // null means keep existing
    });
  };

  const syncLevelTasks = useCallback(
    async (levelValue: number, tasks: LevelTaskFormData[]) => {
      if (!token) {
        throw new Error("Sesi login telah berakhir. Silakan login ulang.");
      }

      const regionForLevel = mapRegions.find(
        (region) => region.unlock_type === "level" && region.unlock_value === levelValue
      );

      if (!regionForLevel) {
        throw new Error(`Region untuk Level ${levelValue} belum tersedia. Tambahkan region level terlebih dahulu.`);
      }

      const existing = adminLandmarks.filter((item) => item.region_id === regionForLevel.id && item.is_active);
      const existingByID = new Map(existing.map((item) => [item.id, item]));
      const retainedIDs = new Set<string>();

      for (let index = 0; index < tasks.length; index += 1) {
        const task = tasks[index];
        const payload = {
          region_id: regionForLevel.id,
          landmark_key:
            existingByID.get(task.id || "")?.landmark_key ||
            `lv${levelValue}_task_${index + 1}_${Date.now().toString().slice(-6)}`,
          name: task.name.trim(),
          description: task.description.trim(),
          icon: resolveTaskIcon(task),
          unlock_type: task.unlock_type,
          unlock_activity: task.unlock_type === "activity_count" ? task.unlock_activity.trim() : "",
          unlock_value: task.unlock_value,
          position_x: (existingByID.get(task.id || "")?.position_x ?? regionForLevel.position_x) + index,
          position_y: (existingByID.get(task.id || "")?.position_y ?? regionForLevel.position_y) + index,
          xp_reward: task.xp_reward,
          coin_reward: task.coin_reward,
          display_order: index + 1,
          is_active: true,
        };

        if (task.id && existingByID.has(task.id)) {
          await adminService.updateAdminMapLandmark(token, task.id, payload);
          retainedIDs.add(task.id);
        } else {
          await adminService.createAdminMapLandmark(token, payload);
        }
      }

      const toDelete = existing.filter((item) => !retainedIDs.has(item.id));
      for (const item of toDelete) {
        await adminService.deleteAdminMapLandmark(token, item.id);
      }
    },
    [adminLandmarks, mapRegions, token]
  );

  const handleUpdate = async () => {
    if (!token) {
      setError("Sesi login telah berakhir. Silakan login ulang.");
      return;
    }
    if (!editingId) {
      setError("ID level tidak valid");
      return;
    }

    if (!formData.badge_name) {
      setError("Nama badge harus diisi");
      return;
    }

    if (formData.tasks.length === 0) {
      setError("Tambahkan minimal 1 tugas level");
      return;
    }

    if (formData.tasks.some((task) => !task.name.trim() || !task.description.trim())) {
      setError("Nama dan deskripsi semua tugas wajib diisi");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await adminService.updateLevel(token, editingId, {
        level: formData.level,
        min_exp: formData.min_exp,
        badge_name: formData.badge_name,
        task_description: buildTaskDescription(formData.tasks),
        badge_image: formData.badge_image, // null = keep existing
      });

      await syncLevelTasks(formData.level, formData.tasks);

      setEditingId(null);
      setFormData({
        level: 1,
        min_exp: 0,
        badge_name: "",
        tasks: [createDefaultTask(0), createDefaultTask(1), createDefaultTask(2)],
        badge_image: null,
      });
      await fetchLevels();
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
    setFormData({
      level: 1,
      min_exp: 0,
      badge_name: "",
      tasks: [createDefaultTask(0), createDefaultTask(1), createDefaultTask(2)],
      badge_image: null,
    });
    setError("");
  };

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const totalPages = Math.ceil(levels.length / limit);
  const paginatedLevels = levels.slice((page - 1) * limit, page * limit);

  // Reset page if out of bounds (e.g. after delete)
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [levels.length, page, totalPages]);

  return {
    levels, // Full list for calculations
    paginatedLevels, // Sliced list for display
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
    page,
    totalPages,
    setPage,
  };
}
