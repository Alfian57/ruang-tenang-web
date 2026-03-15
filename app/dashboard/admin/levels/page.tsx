"use client";

import { Plus, Pencil, Trash2, Loader2, Save, X, ImageIcon, Star, Shield, Zap, Coins, Info } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { useAdminLevels } from "./_hooks/useAdminLevels";
import { Pagination } from "@/components/ui/pagination";

export default function LevelsManagementPage() {
  const {
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
    paginatedLevels,
    page,
    totalPages,
    setPage,
  } = useAdminLevels();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, badge_image: file });
  };

  const previewUrl = formData.badge_image
    ? URL.createObjectURL(formData.badge_image)
    : null;

  const createTaskTemplate = (index: number) => ({
    name: `Tugas ${index + 1}`,
    description: "",
    unlock_type: "activity_count" as const,
    unlock_activity: "breathing",
    unlock_value: 1,
    xp_reward: 10,
    coin_reward: 5,
  });

  const addTaskField = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, createTaskTemplate(formData.tasks.length)],
    });
  };

  const removeTaskField = (index: number) => {
    if (formData.tasks.length <= 1) return;
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, taskIndex) => taskIndex !== index),
    });
  };

  const updateTaskField = <K extends keyof (typeof formData.tasks)[number]>(
    index: number,
    key: K,
    value: (typeof formData.tasks)[number][K]
  ) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [key]: value } : task
      ),
    });
  };

  /* ─────────────────── Shared Form UI ──────────────────── */

  const renderLevelForm = (mode: "add" | "edit") => (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">
          {mode === "add" ? "✨ Tambah Level Baru" : `✏️ Edit Level ${formData.level}`}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Konfigurasi level, badge, dan tugas yang akan muncul di Progress Map member.
        </p>
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* Basic Info Section */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Informasi Dasar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
              <Input
                type="number"
                min={1}
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min EXP</label>
              <Input
                type="number"
                min={0}
                value={formData.min_exp}
                onChange={(e) => setFormData({ ...formData, min_exp: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Badge</label>
              <Input
                type="text"
                placeholder="contoh: Grandmaster"
                value={formData.badge_name}
                onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gambar Badge</label>
              <div className="flex items-center gap-2">
                <input
                  ref={mode === "add" ? fileInputRef : editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (mode === "add" ? fileInputRef : editFileInputRef).current?.click()}
                  className="flex-1 h-10"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {formData.badge_image ? formData.badge_image.name : "Pilih Gambar"}
                </Button>
                {previewUrl && (
                  <div className="w-10 h-10 rounded-lg border overflow-hidden shrink-0">
                    <Image src={previewUrl} alt="Preview" width={40} height={40} className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Daftar Tugas Level</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Konfigurasi tugas yang dipakai untuk validasi klaim reward member di Progress Map.
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addTaskField}>
              <Plus className="w-4 h-4 mr-1" /> Tugas
            </Button>
          </div>

          <div className="space-y-3">
            {formData.tasks.map((task, index) => (
              <div key={`form-task-${index}`} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {task.name || `Tugas ${index + 1}`}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 h-7 px-2"
                    onClick={() => removeTaskField(index)}
                    disabled={formData.tasks.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama Tugas</label>
                    <Input
                      value={task.name}
                      onChange={(e) => updateTaskField(index, "name", e.target.value)}
                      placeholder="Contoh: Login Pertama"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Kriteria</label>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={task.unlock_type}
                      onChange={(e) => updateTaskField(index, "unlock_type", e.target.value as "activity_count" | "streak" | "xp" | "level")}
                    >
                      <option value="activity_count">Jumlah Aktivitas</option>
                      <option value="streak">Streak Harian</option>
                      <option value="xp">Total XP</option>
                      <option value="level">Level</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi (ditampilkan ke member)</label>
                    <Textarea
                      value={task.description}
                      onChange={(e) => updateTaskField(index, "description", e.target.value)}
                      placeholder="Contoh: Masuk ke aplikasi untuk pertama kali"
                      className="min-h-16"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Aktivitas Target</label>
                    <Input
                      value={task.unlock_activity}
                      onChange={(e) => updateTaskField(index, "unlock_activity", e.target.value)}
                      placeholder="chat, breathing, journal, mood, forum, story"
                      disabled={task.unlock_type !== "activity_count"}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nilai Target</label>
                    <Input
                      type="number"
                      min={0}
                      value={task.unlock_value}
                      onChange={(e) => updateTaskField(index, "unlock_value", parseInt(e.target.value) || 0)}
                      placeholder="Contoh: 5"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> Reward EXP
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={task.xp_reward}
                      onChange={(e) => updateTaskField(index, "xp_reward", parseInt(e.target.value) || 0)}
                      placeholder="Contoh: 25"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-500" /> Reward Coin Emas
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={task.coin_reward}
                      onChange={(e) => updateTaskField(index, "coin_reward", parseInt(e.target.value) || 0)}
                      placeholder="Contoh: 10"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={cancelEdit}>
            <X className="w-4 h-4 mr-1" /> Batal
          </Button>
          <Button
            type="button"
            onClick={mode === "add" ? handleAdd : handleUpdate}
            disabled={saving}
            className="gradient-primary text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Level"
        description={`Apakah Anda yakin ingin menghapus Level ${levelToDelete?.level}? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl gradient-primary text-white grid place-items-center shadow-lg shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Level & Badge</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Konfigurasi level, badge, dan tugas untuk sistem gamifikasi.
              {!loading && levels.length > 0 && (
                <span className="text-primary font-medium"> {levels.length} level terdaftar.</span>
              )}
            </p>
          </div>
        </div>
        {!showAddForm && !editingId && (
          <Button
            onClick={() => {
              setShowAddForm(true);
              setFormData({
                level: (levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1),
                min_exp: (levels.length > 0 ? Math.max(...levels.map(l => l.min_exp)) + 500 : 0),
                badge_name: "",
                tasks: [createTaskTemplate(0), createTaskTemplate(1), createTaskTemplate(2)],
                badge_image: null,
              });
            }}
            className="gradient-primary text-white shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Level
          </Button>
        )}
      </div>

      {/* ── Add Form ── */}
      {showAddForm && renderLevelForm("add")}

      {/* ── Edit Form (shown above cards when editing) ── */}
      {editingId && renderLevelForm("edit")}

      {/* ── Level Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedLevels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedLevels.map((level) => {
            const isEditing = editingId === level.id;
            const taskLines = (level.task_description?.split("\n").filter(Boolean) || []);

            return (
              <div
                key={level.id}
                className={`group rounded-2xl border bg-white overflow-hidden transition-all duration-200 ${
                  isEditing
                    ? "border-primary/30 ring-2 ring-primary/10"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start gap-3.5">
                    {/* Badge Image */}
                    <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {level.badge_icon ? (
                        <Image
                          src={level.badge_icon}
                          alt={level.badge_name}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full p-1"
                        />
                      ) : (
                        <Star className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    {/* Level Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold shadow-sm">
                          {level.level}
                        </span>
                        <h3 className="font-bold text-gray-900 truncate">{level.badge_name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {level.min_exp.toLocaleString()} EXP
                        </span>
                        {taskLines.length > 0 && (
                          <span className="text-xs text-gray-400">
                            • {taskLines.length} tugas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Preview */}
                  {taskLines.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      {taskLines.slice(0, 3).map((taskLine, taskIndex) => (
                        <p key={`${level.id}-task-${taskIndex}`} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {taskIndex + 1}
                          </span>
                          <span className="line-clamp-1">{taskLine.replace(/^\d+\.\s*/, "")}</span>
                        </p>
                      ))}
                      {taskLines.length > 3 && (
                        <p className="text-xs text-gray-400 pl-6">+{taskLines.length - 3} tugas lainnya</p>
                      )}
                    </div>
                  )}

                  {taskLines.length === 0 && (
                    <p className="mt-4 text-xs text-gray-400 italic">Belum ada tugas dikonfigurasi</p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(level)}
                    disabled={editingId !== null || showAddForm}
                    className="h-8 text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
                    onClick={() => {
                      setLevelToDelete(level);
                      setDeleteModalOpen(true);
                    }}
                    disabled={editingId !== null || showAddForm}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Star className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Belum ada konfigurasi level</h3>
          <p className="text-gray-400 text-sm mt-1">Klik &quot;Tambah Level&quot; untuk memulai</p>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && levels.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* ── Info Box ── */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Cara Kerja Sinkronisasi</h4>
            <ul className="text-sm text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span><strong>Level & Badge</strong> — Nomor level, min EXP, dan badge ditampilkan di profil user dan leaderboard.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span><strong>Tugas Level</strong> — Otomatis tersinkron ke <strong>Progress Map</strong> sebagai landmark yang bisa diklaim member.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span><strong>Reward EXP & Coin</strong> — Diberikan saat member mengklaim tugas yang sudah selesai di Progress Map.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
