"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Search, Plus, Ban, CheckCircle, Eye, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { ArticleCategory } from "@/types";

interface AdminArticle {
  id: number;
  title: string;
  thumbnail: string;
  category_id: number;
  category: { id: number; name: string };
  status: string;
  user_id?: number;
  author?: { id: number; name: string };
  created_at: string;
}

export default function AdminArticlesPage() {
  const { token, user } = useAuthStore();
  
  // Articles state
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", category_id: 0, thumbnail: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [blockId, setBlockId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Categories state
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [isCategorySaving, setIsCategorySaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        api.adminGetArticles(token, { status: statusFilter || undefined }) as Promise<{ data: AdminArticle[] }>,
        api.getArticleCategories() as Promise<{ data: ArticleCategory[] }>,
      ]);
      setArticles(articlesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Article Functions
  const openCreateDialog = () => {
    setEditingArticle(null);
    setFormData({ title: "", content: "", category_id: categories[0]?.id || 0, thumbnail: "" });
    setEditDialog(true);
  };

  const saveArticle = async () => {
    if (!token || !formData.title || !formData.content) return;
    setIsSaving(true);
    try {
      const url = editingArticle
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/articles/${editingArticle.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/articles`;
      
      await fetch(url, {
        method: editingArticle ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      setEditDialog(false);
      loadData();
    } catch (error) {
      console.error("Failed to save article:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await api.adminDeleteArticle(token, deleteId);
      setDeleteId(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const handleBlock = async () => {
    if (!token || !blockId) return;
    const article = articles.find(a => a.id === blockId);
    if (!article) return;

    try {
      if (article.status === "blocked") {
        await api.adminUnblockArticle(token, blockId);
      } else {
        await api.adminBlockArticle(token, blockId);
      }
      setBlockId(null);
      loadData();
    } catch (error) {
      console.error("Failed to block/unblock article:", error);
    }
  };

  // Category Functions
  const openCategoryDialog = (category?: ArticleCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setCategoryDialog(true);
  };

  const saveCategory = async () => {
    if (!token || !categoryForm.name) return;
    setIsCategorySaving(true);
    try {
      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/article-categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/article-categories`;
      
      await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryForm),
      });
      setCategoryDialog(false);
      loadData();
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setIsCategorySaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!token || !deleteCategoryId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/article-categories/${deleteCategoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteCategoryId(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  if (user?.role !== "admin") {
    return <div className="p-8 text-center">Akses ditolak</div>;
  }

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Dipublikasikan</span>;
      case "draft":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draf</span>;
      case "blocked":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Diblokir</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Artikel</h1>
        <p className="text-gray-500">Kelola artikel dan kategori artikel</p>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="articles">Artikel</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari artikel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("")}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("published")}
              >
                Published
              </Button>
              <Button
                variant={statusFilter === "blocked" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("blocked")}
              >
                Blocked
              </Button>
              <Button onClick={openCreateDialog} className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" /> Tambah
              </Button>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Artikel</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Penulis</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden sm:table-cell">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Tanggal</th>
                    <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg" />
                            <div className="h-4 bg-gray-200 rounded w-32" />
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                        <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                        <td className="p-4 hidden sm:table-cell"><div className="h-6 bg-gray-200 rounded w-20" /></td>
                        <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                        <td className="p-4"><div className="h-8 bg-gray-200 rounded w-24 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {search ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {article.thumbnail ? (
                                <Image
                                  src={article.thumbnail}
                                  alt={article.title}
                                  width={64}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">📄</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-52">{article.title}</p>
                              <p className="text-xs text-gray-500 sm:hidden">{article.category?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{article.category?.name}</span>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{article.author?.name || "-"}</span>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {getStatusBadge(article.status)}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-500">{formatDate(article.created_at)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end">
                            <Link href={`/articles/${article.id}`}>
                              <Button variant="ghost" size="icon" title="Lihat">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setBlockId(article.id)}
                              title={article.status === "blocked" ? "Unblock" : "Block"}
                              className={article.status === "blocked" ? "text-green-500 hover:text-green-600" : "text-yellow-500 hover:text-yellow-600"}
                            >
                              {article.status === "blocked" ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => setDeleteId(article.id)}
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

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari kategori..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => openCategoryDialog()} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
            </Button>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Nama Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden sm:table-cell">Deskripsi</th>
                    <th className="text-left p-4 font-medium text-gray-600">Jumlah Artikel</th>
                    <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                        <td className="p-4 hidden sm:table-cell"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                        <td className="p-4"><div className="h-8 bg-gray-200 rounded w-20 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        {categorySearch ? "Tidak ada kategori yang cocok" : "Belum ada kategori"}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-medium">{category.name}</span>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-600 line-clamp-2">{category.description || "-"}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            {category.article_count || 0} artikel
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCategoryDialog(category)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => setDeleteCategoryId(category.id)}
                              title="Hapus"
                              disabled={(category.article_count || 0) > 0}
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
      </Tabs>

      {/* Create/Edit Article Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Artikel" : "Tambah Artikel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul artikel"
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <select
                  className="w-full p-2 border rounded-lg bg-white"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                >
                  <option value={0}>Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {token && (
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  token={token}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Batal</Button>
            <Button onClick={saveArticle} className="gradient-primary" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Masukkan nama kategori"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <textarea
                className="w-full p-3 border rounded-lg min-h-24 resize-none"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Deskripsi kategori (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Batal</Button>
            <Button onClick={saveCategory} className="gradient-primary" disabled={isCategorySaving}>
              {isCategorySaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Article Modal */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Artikel?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            Artikel yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Article Modal */}
      <Dialog open={blockId !== null} onOpenChange={() => setBlockId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {articles.find(a => a.id === blockId)?.status === "blocked" ? "Unblock Artikel?" : "Block Artikel?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            {articles.find(a => a.id === blockId)?.status === "blocked"
              ? "Artikel akan dipublikasikan kembali dan dapat dilihat oleh semua orang."
              : "Artikel akan disembunyikan dari publik dan pemilik tidak dapat mengeditnya."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockId(null)}>Batal</Button>
            <Button
              className={articles.find(a => a.id === blockId)?.status === "blocked"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"}
              onClick={handleBlock}
            >
              {articles.find(a => a.id === blockId)?.status === "blocked" ? "Unblock" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Modal */}
      <Dialog open={deleteCategoryId !== null} onOpenChange={() => setDeleteCategoryId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            Kategori yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryId(null)}>Batal</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDeleteCategory}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
