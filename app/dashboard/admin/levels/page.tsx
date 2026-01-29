"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, Trophy, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { api } from "@/lib/api";
import { LevelConfig } from "@/types";
import { useAuthStore } from "@/stores/authStore";

interface LevelFormData {
  level: number;
  min_exp: number;
  badge_name: string;
  badge_icon: string;
}

export default function LevelsManagementPage() {
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
      const response = await api.getLevelConfigs() as any;
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
      await api.adminCreateLevelConfig(token, formData);
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
      await api.adminUpdateLevelConfig(token, editingId, formData);
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
      await api.adminDeleteLevelConfig(token, levelToDelete.id);
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

  // Common emoji suggestions for badges
  const badgeEmojis = ["🌱", "🌿", "📚", "🌳", "🏆", "💎", "⭐", "👑", "🔥", "💪", "🎯", "🚀"];

  return (
    <div className="p-6">
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Level"
        description={`Apakah Anda yakin ingin menghapus Level ${levelToDelete?.level}? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Kelola Level & Badge
          </h1>
          <p className="text-gray-500 mt-1">Atur konfigurasi level dan badge untuk sistem gamifikasi</p>
        </div>
        {!showAddForm && !editingId && (
          <Button
            onClick={() => {
              setShowAddForm(true);
              setFormData({
                level: (levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1),
                min_exp: (levels.length > 0 ? Math.max(...levels.map(l => l.min_exp)) + 500 : 0),
                badge_name: "",
                badge_icon: "",
              });
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Level
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Tambah Level Baru</h3>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <Input
                type="number"
                min={1}
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min EXP</label>
              <Input
                type="number"
                min={0}
                value={formData.min_exp}
                onChange={(e) => setFormData({ ...formData, min_exp: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Badge</label>
              <Input
                type="text"
                placeholder="e.g., Grandmaster"
                value={formData.badge_name}
                onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Badge</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="🏆"
                  value={formData.badge_icon}
                  onChange={(e) => setFormData({ ...formData, badge_icon: e.target.value })}
                  className="w-20"
                />
                <div className="flex flex-wrap gap-1">
                  {badgeEmojis.slice(0, 6).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge_icon: emoji })}
                      className={`w-8 h-8 rounded hover:bg-gray-100 ${formData.badge_icon === emoji ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-1" /> Batal
            </Button>
            <Button type="button" onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Simpan
            </Button>
          </div>
        </div>
      )}

      {/* Levels Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min EXP</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Badge</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {levels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  {editingId === level.id ? (
                    <>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min={1}
                          value={formData.level}
                          onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                          className="w-20"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min={0}
                          value={formData.min_exp}
                          onChange={(e) => setFormData({ ...formData, min_exp: parseInt(e.target.value) || 0 })}
                          className="w-28"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="text"
                          value={formData.badge_name}
                          onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                          className="w-32"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            value={formData.badge_icon}
                            onChange={(e) => setFormData({ ...formData, badge_icon: e.target.value })}
                            className="w-16"
                          />
                          {badgeEmojis.slice(0, 4).map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setFormData({ ...formData, badge_icon: emoji })}
                              className={`w-7 h-7 rounded text-sm hover:bg-gray-100 ${formData.badge_icon === emoji ? 'bg-yellow-100' : ''}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button type="button" size="sm" onClick={handleUpdate} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-yellow-400 to-amber-500 text-white font-bold">
                          {level.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-gray-700">{level.min_exp.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{level.badge_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl">{level.badge_icon}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(level)}
                            disabled={editingId !== null || showAddForm}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setLevelToDelete(level);
                              setDeleteModalOpen(true);
                            }}
                            disabled={editingId !== null || showAddForm}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {levels.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada konfigurasi level. Klik &quot;Tambah Level&quot; untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Informasi</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Level</strong>: Nomor level yang ditampilkan kepada user</li>
          <li>• <strong>Min EXP</strong>: Minimum EXP yang dibutuhkan untuk mencapai level ini</li>
          <li>• <strong>Badge</strong>: Nama badge yang ditampilkan di profil user</li>
          <li>• <strong>Icon</strong>: Emoji yang merepresentasikan badge</li>
        </ul>
      </div>
    </div>
  );
}
