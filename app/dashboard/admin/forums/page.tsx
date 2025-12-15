"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Search, ExternalLink, MessageSquare, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { Forum, ForumCategory } from "@/types/forum";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminForumsPage() {
  const { token, user } = useAuthStore();
  
  const [forums, setForums] = useState<Forum[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"forum" | "category" | null>(null);

  // Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [forumsRes, categoriesRes] = await Promise.all([
        api.getForums(token, 100, 0),
        api.adminGetForumCategories(token)
      ]);
      setForums(forumsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!token || !deleteId || !deleteType) return;
    try {
      if (deleteType === "forum") {
        await api.deleteForum(token, deleteId);
        toast.success("Forum berhasil dihapus");
      } else {
        await api.deleteForumCategory(token, deleteId);
        toast.success("Kategori berhasil dihapus");
      }
      setDeleteId(null);
      setDeleteType(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Gagal menghapus item");
    }
  };

  const handleSaveCategory = async () => {
    if (!token || !categoryName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.updateForumCategory(token, editingCategory.id, categoryName);
        toast.success("Kategori diperbarui");
      } else {
        await api.createForumCategory(token, categoryName);
        toast.success("Kategori dibuat");
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      loadData();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Gagal menyimpan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCategoryModal = (category?: ForumCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setIsCategoryModalOpen(true);
  };

  if (user?.role !== "admin") {
    return <div className="p-8 text-center">Akses ditolak</div>;
  }

  const filteredForums = forums.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Forum</h1>
        <p className="text-gray-500">Kelola topik diskusi dan kategori forum</p>
      </div>

      <Tabs defaultValue="forums" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="forums">Topik Forum</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        <TabsContent value="forums" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari topik forum..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Topik</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Penulis</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden sm:table-cell">Stats</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Tanggal</th>
                    <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4" colSpan={6}>
                          <div className="h-12 bg-gray-100 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : filteredForums.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {search ? "Tidak ada topik yang cocok" : "Belum ada topik forum"}
                      </td>
                    </tr>
                  ) : (
                    filteredForums.map((forum) => (
                      <tr key={forum.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-500">
                               <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">{forum.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{forum.content}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {forum.category?.name || "Umum"}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                              {forum.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-600">{forum.user?.name || "User"}</span>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-600">{forum.replies_count || 0} balasan</span>
                            <span className="text-xs text-gray-600">{forum.likes_count || 0} suka</span>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-500">{formatDate(forum.created_at)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end">
                            <Link href={`/dashboard/forum/${forum.id}`} target="_blank">
                               <Button variant="ghost" size="icon" title="Lihat">
                                  <ExternalLink className="w-4 h-4" />
                               </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => { setDeleteId(forum.id); setDeleteType("forum"); }}
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => openCategoryModal()} className="gap-2">
              <Plus className="w-4 h-4" /> Tambah Kategori
            </Button>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
             <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Nama Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600">Tanggal Dibuat</th>
                    <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                   {categories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">Belum ada kategori</td>
                      </tr>
                   ) : (
                     categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50">
                           <td className="p-4 font-medium">{cat.name}</td>
                           <td className="p-4 text-gray-500 text-sm">{formatDate(cat.created_at)}</td>
                           <td className="p-4">
                              <div className="flex gap-1 justify-end">
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openCategoryModal(cat)}
                                 >
                                    <Pencil className="w-4 h-4" />
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => { setDeleteId(cat.id); setDeleteType("category"); }}
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </div>
                           </td>
                        </tr>
                     ))
                   )}
                </tbody>
             </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {deleteType === "forum" ? "Topik Forum" : "Kategori"}?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            {deleteType === "forum" 
               ? "Topik dan semua balasannya akan dihapus permanen." 
               : "Kategori akan dihapus. Forum dalam kategori ini mungkin akan kehilangan referensi kategori."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kategori</label>
              <Input 
                 placeholder="Contoh: Diskusi Umum, Kesehatan Mental"
                 value={categoryName}
                 onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveCategory} disabled={isSubmitting || !categoryName.trim()}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
