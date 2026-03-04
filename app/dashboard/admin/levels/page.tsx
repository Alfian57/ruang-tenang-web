"use client";

import { Plus, Pencil, Trash2, Loader2, Save, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Preview URL for selected file
  const previewUrl = formData.badge_image
    ? URL.createObjectURL(formData.badge_image)
    : null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
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
          <h1 className="text-2xl font-bold">Kelola Level & Badge</h1>
          <p className="text-gray-500">Atur konfigurasi level dan badge untuk sistem gamifikasi</p>
        </div>
        {!showAddForm && !editingId && (
          <Button
            onClick={() => {
              setShowAddForm(true);
              setFormData({
                level: (levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1),
                min_exp: (levels.length > 0 ? Math.max(...levels.map(l => l.min_exp)) + 500 : 0),
                badge_name: "",
                badge_image: null,
              });
            }}
            className="gradient-primary text-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Badge</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {formData.badge_image ? formData.badge_image.name : "Pilih Gambar"}
                </Button>
                {previewUrl && (
                  <div className="w-10 h-10 rounded-lg border overflow-hidden flex-shrink-0">
                    <Image src={previewUrl} alt="Preview" width={40} height={40} className="object-cover w-full h-full" />
                  </div>
                )}
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
                <th className="text-left p-4 text-sm font-medium text-gray-500">Level</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Min EXP</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Badge</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Gambar</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLevels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  {editingId === level.id ? (
                    <>
                      <td className="p-4">
                        <Input
                          type="number"
                          min={1}
                          value={formData.level}
                          onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                          className="w-20"
                        />
                      </td>
                      <td className="p-4">
                        <Input
                          type="number"
                          min={0}
                          value={formData.min_exp}
                          onChange={(e) => setFormData({ ...formData, min_exp: parseInt(e.target.value) || 0 })}
                          className="w-28"
                        />
                      </td>
                      <td className="p-4">
                        <Input
                          type="text"
                          value={formData.badge_name}
                          onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                          className="w-32"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => editFileInputRef.current?.click()}
                          >
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {formData.badge_image ? "Ganti" : "Ubah"}
                          </Button>
                          {formData.badge_image ? (
                            <div className="w-8 h-8 rounded border overflow-hidden flex-shrink-0">
                              <Image
                                src={URL.createObjectURL(formData.badge_image)}
                                alt="Preview"
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : level.badge_icon ? (
                            <div className="w-8 h-8 rounded border overflow-hidden flex-shrink-0">
                              <Image
                                src={level.badge_icon}
                                alt={level.badge_name}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 text-right">
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
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-yellow-400 to-amber-500 text-white font-bold">
                          {level.level}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-gray-700">{level.min_exp.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-800">{level.badge_name}</span>
                      </td>
                      <td className="p-4">
                        {level.badge_icon ? (
                          <div className="w-10 h-10 rounded-lg border overflow-hidden">
                            <Image
                              src={level.badge_icon}
                              alt={level.badge_name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg border bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
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
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Belum ada konfigurasi level. Klik &quot;Tambah Level&quot; untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && levels.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Informasi</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Level</strong>: Nomor level yang ditampilkan kepada user</li>
          <li>• <strong>Min EXP</strong>: Minimum EXP yang dibutuhkan untuk mencapai level ini</li>
          <li>• <strong>Badge</strong>: Nama badge yang ditampilkan di profil user</li>
          <li>• <strong>Gambar</strong>: Gambar badge yang merepresentasikan level</li>
        </ul>
      </div>
    </div>
  );
}
