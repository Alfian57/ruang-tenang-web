"use client";

import { Search, ExternalLink, MessageSquare, Plus, Pencil, Trash2, AlertTriangle, Ban, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminForums } from "./_hooks/useAdminForums";

export default function AdminForumsPage() {
  const {
    user,
    activeTab,
    search,
    statusFilter,
    forums, // This is filteredForums
    allForums,
    categories,
    isLoading,
    deleteId,
    blockId,
    isCategoryModalOpen,
    editingCategory,
    categoryName,
    isSubmitting,
    setSearch,
    setStatusFilter,
    setActiveTab,
    setDeleteId,
    setBlockId,
    setIsCategoryModalOpen,
    setCategoryName,
    handleDeleteCategory,
    handleSaveCategory,
    openCategoryModal,
    confirmToggleFlag,
  } = useAdminForums();

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return <div className="p-8 text-center">Akses ditolak</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Forum</h1>
        <p className="text-gray-500">Kelola topik diskusi dan kategori forum</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="forums">Topik Forum</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        <TabsContent value="forums" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-3 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  placeholder="Cari topik forum..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Semua Status</option>
                <option value="published">Dipublikasi</option>
                <option value="flagged">Ditandai</option>
              </select>
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
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
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
                  ) : forums.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {search ? "Tidak ada topik yang cocok" : "Belum ada topik forum"}
                      </td>
                    </tr>
                  ) : (
                    forums.map((forum) => (
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
                        <td className="p-4">
                          {forum.is_flagged ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3" /> Ditandai
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                              Dipublikasi
                            </span>
                          )}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-500">{formatDate(forum.created_at)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end">
                            <Link href={`/dashboard/admin/forums/${forum.id}`}>
                              <Button variant="ghost" size="icon" title="Lihat">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setBlockId(forum.id)}
                              title={forum.is_flagged ? "Buka Blokir" : "Blokir"}
                              className={forum.is_flagged ? "text-green-500 hover:text-green-600" : "text-yellow-500 hover:text-yellow-600"}
                            >
                              {forum.is_flagged ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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
            <Button onClick={() => openCategoryModal()} className="gradient-primary text-white gap-2">
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
                                    onClick={() => setDeleteId(cat.id)}
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

      {/* Delete Category Confirmation Modal */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            Kategori akan dihapus. Forum dalam kategori ini mungkin akan kehilangan referensi kategori.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDeleteCategory}>
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

      {/* Block/Unblock Confirmation Modal */}
      <Dialog open={blockId !== null} onOpenChange={() => setBlockId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {allForums.find(f => f.id === blockId)?.is_flagged ? "Buka Blokir Forum?" : "Blokir Forum?"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${allForums.find(f => f.id === blockId)?.is_flagged ? "bg-green-100" : "bg-red-100"}`}>
               {allForums.find(f => f.id === blockId)?.is_flagged ? <CheckCircle className="w-8 h-8 text-green-600" /> : <Ban className="w-8 h-8 text-red-600" />}
            </div>
            <p className="text-gray-600">
               {allForums.find(f => f.id === blockId)?.is_flagged 
                 ? "Forum ini akan dapat diakses kembali oleh pengguna lain." 
                 : "Forum ini tidak akan dapat diakses oleh pengguna lain selain admin."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockId(null)}>Batal</Button>
            <Button 
               className={allForums.find(f => f.id === blockId)?.is_flagged ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"} 
               onClick={confirmToggleFlag}
            >
              {allForums.find(f => f.id === blockId)?.is_flagged ? "Buka Blokir" : "Blokir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
