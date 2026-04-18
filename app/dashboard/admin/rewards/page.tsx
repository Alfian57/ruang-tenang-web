"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  Eye,
  EyeOff,
  Package,
  History,
  Users,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CoinIcon } from "@/components/shared/CoinIcon";
import { cn } from "@/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { rewardService } from "@/services/api";
import { uploadService } from "@/services/api";
import { getUploadUrl } from "@/services/http/upload-url";
import type { Reward, RewardClaim } from "@/types";
import { AdminCompactTabs } from "../_components/AdminCompactTabs";

interface RewardFormData {
  name: string;
  description: string;
  image: string;
  coin_cost: number;
  stock: number;
  is_active: boolean;
}

const defaultForm: RewardFormData = {
  name: "",
  description: "",
  image: "",
  coin_cost: 10,
  stock: -1,
  is_active: true,
};

export default function AdminRewardsPage() {
  const { token } = useAuthStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"rewards" | "claims">("rewards");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RewardFormData>(defaultForm);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(token, file);
      if (res.data?.url) {
        setFormData({ ...formData, image: res.data.url });
        toast.success("Gambar berhasil diupload");
      }
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rewardsRes, claimsRes] = await Promise.all([
        rewardService.adminGetAllRewards(token),
        rewardService.adminGetAllClaims(token, { page: 1, page_size: 50 }),
      ]);
      if (rewardsRes.data) setRewards(rewardsRes.data);
      if (claimsRes.data) setClaims(claimsRes.data.claims || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!token || !formData.name || formData.coin_cost <= 0) {
      toast.error("Nama dan harga koin harus diisi");
      return;
    }
    setSaving(true);
    try {
      await rewardService.adminCreateReward(token, formData);
      toast.success("Hadiah berhasil ditambahkan");
      setShowAddForm(false);
      setFormData(defaultForm);
      fetchData();
    } catch {
      toast.error("Gagal menambahkan hadiah");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setFormData({
      name: reward.name,
      description: reward.description,
      image: reward.image,
      coin_cost: reward.coin_cost,
      stock: reward.stock,
      is_active: reward.is_active,
    });
  };

  const handleUpdate = async () => {
    if (!token || editingId === null) return;
    setSaving(true);
    try {
      await rewardService.adminUpdateReward(token, editingId, formData);
      toast.success("Hadiah berhasil diupdate");
      setEditingId(null);
      setFormData(defaultForm);
      fetchData();
    } catch {
      toast.error("Gagal mengupdate hadiah");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !rewardToDelete) return;
    try {
      await rewardService.adminDeleteReward(token, rewardToDelete.id);
      toast.success("Hadiah berhasil dihapus");
      setDeleteModalOpen(false);
      setRewardToDelete(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus hadiah");
    }
  };

  const handleToggleActive = async (reward: Reward) => {
    if (!token) return;
    try {
      await rewardService.adminUpdateReward(token, reward.id, {
        is_active: !reward.is_active,
      });
      toast.success(reward.is_active ? "Hadiah dinonaktifkan" : "Hadiah diaktifkan");
      fetchData();
    } catch {
      toast.error("Gagal mengubah status hadiah");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData(defaultForm);
  };

  return (
    <div className="p-4 lg:p-6">
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Hadiah"
        description={`Apakah Anda yakin ingin menghapus "${rewardToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-7 h-7 text-amber-500" />
            Kelola Hadiah
          </h1>
          <p className="text-gray-500">Atur hadiah yang bisa diklaim oleh member dengan koin emas</p>
        </div>
        {!showAddForm && !editingId && activeTab === "rewards" && (
          <Button
            onClick={() => {
              setShowAddForm(true);
              setFormData(defaultForm);
            }}
            className="bg-linear-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Hadiah
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "rewards" | "claims")}
        className="space-y-6"
      >
        <AdminCompactTabs
          items={[
            {
              value: "rewards",
              label: (
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Daftar Hadiah ({rewards.length})
                </span>
              ),
            },
            {
              value: "claims",
              label: (
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Riwayat Klaim ({claims.length})
                </span>
              ),
            },
          ]}
        />

        <TabsContent value="rewards" className="space-y-6">
          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Tambah Hadiah Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Hadiah *</label>
                  <Input
                    type="text"
                    placeholder="e.g., Voucher Gopay 50rb"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Koin) *</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.coin_cost}
                    onChange={(e) => setFormData({ ...formData, coin_cost: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    rows={3}
                    placeholder="Deskripsi hadiah..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Hadiah</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {formData.image ? (
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg border overflow-hidden relative shrink-0">
                        <Image
                          src={formData.image.startsWith("http") ? formData.image : getUploadUrl(formData.image)}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ganti"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setFormData({ ...formData, image: "" })}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Gambar
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok (-1 = unlimited)</label>
                  <Input
                    type="number"
                    min={-1}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-1" /> Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleAdd}
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                  Simpan
                </Button>
              </div>
            </div>
          )}

          {/* Rewards Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada hadiah</h3>
              <p className="text-gray-400 text-sm mt-1">Klik &quot;Tambah Hadiah&quot; untuk memulai</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto table-scroll-indicator">
                <table className="w-full min-w-160">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Hadiah</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500 whitespace-nowrap">Harga</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500 whitespace-nowrap">Stok</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500 whitespace-nowrap">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-500 whitespace-nowrap w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rewards.map((reward) => (
                      <tr key={reward.id} className="hover:bg-gray-50">
                        {editingId === reward.id ? (
                          <>
                            <td className="p-4">
                              <div className="space-y-2">
                                <Input
                                  type="text"
                                  placeholder="Nama"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <textarea
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-amber-500 resize-none"
                                  rows={2}
                                  value={formData.description}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <div className="flex items-center gap-2">
                                  {formData.image && (
                                    <div className="w-10 h-10 rounded-lg border overflow-hidden relative shrink-0">
                                      <Image
                                        src={formData.image.startsWith("http") ? formData.image : getUploadUrl(formData.image)}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                      />
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="edit-image-input"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => document.getElementById("edit-image-input")?.click()}
                                    disabled={uploading}
                                    className="text-xs"
                                  >
                                    {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                                    {formData.image ? "Ganti" : "Upload"} Gambar
                                  </Button>
                                  {formData.image && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="text-xs text-red-500"
                                      onClick={() => setFormData({ ...formData, image: "" })}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Input
                                type="number"
                                min={1}
                                value={formData.coin_cost}
                                onChange={(e) =>
                                  setFormData({ ...formData, coin_cost: parseInt(e.target.value) || 1 })
                                }
                                className="w-24"
                              />
                            </td>
                            <td className="p-4">
                              <Input
                                type="number"
                                min={-1}
                                value={formData.stock}
                                onChange={(e) =>
                                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                                }
                                className="w-20"
                              />
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs font-medium",
                                  formData.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                )}
                              >
                                {formData.is_active ? "Aktif" : "Nonaktif"}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleUpdate}
                                  disabled={saving}
                                  className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
                                  {reward.image ? (
                                    <Image src={reward.image.startsWith("http") ? reward.image : getUploadUrl(reward.image)} alt={reward.name} fill className="object-cover" sizes="40px" />
                                  ) : (
                                    <Gift className="w-5 h-5 text-amber-400" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900 text-sm">{reward.name}</span>
                                  {reward.description && (
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{reward.description}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="flex items-center gap-1 font-medium text-amber-700">
                                <CoinIcon className="h-4 w-4" /> {reward.coin_cost}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-600">
                                {reward.stock === -1 ? "∞" : reward.stock}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleActive(reward)}
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                                  reward.is_active
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                              >
                                {reward.is_active ? (
                                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Aktif</span>
                                ) : (
                                  <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Nonaktif</span>
                                )}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(reward)}
                                  disabled={editingId !== null || showAddForm}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setRewardToDelete(reward);
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
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada klaim</h3>
              <p className="text-gray-400 text-sm mt-1">Belum ada member yang mengklaim hadiah</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto table-scroll-indicator">
                <table className="w-full min-w-160">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Member</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Hadiah</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500 whitespace-nowrap">Koin</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500 whitespace-nowrap">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 relative overflow-hidden">
                              {claim.user?.avatar ? (
                                <Image src={claim.user.avatar} alt={claim.user.name || "Avatar"} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                              ) : (
                                <Users className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-medium">{claim.user?.name || "User"}</span>
                              <p className="text-xs text-gray-500">{claim.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{claim.reward?.name || "Hadiah"}</span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-sm font-medium text-amber-700">
                            <CoinIcon className="h-4 w-4" /> {claim.coin_spent}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-500">
                            {new Date(claim.claimed_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
