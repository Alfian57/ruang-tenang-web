"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminArticles } from "./_hooks/useAdminArticles";
import {
  ArticleTable,
  CategoryTable,
  ArticleFormModal,
  CategoryFormModal,
  ArticleDeleteModal,
  ArticleBlockModal,
  CategoryDeleteModal,
  CategoryCannotDeleteModal
} from "./_components";

export default function AdminArticlesPage() {
  const {
    user,
    token,
    activeTab,
    search,
    statusFilter,
    categorySearch,
    articles,
    categories,
    isLoading,
    editDialog,
    editingArticle,
    formData,
    deleteId,
    blockId,
    isSaving,
    categoryDialog,
    editingCategory,
    categoryForm,
    deleteCategoryId,
    cannotDeleteCategoryDialog,
    isCategorySaving,
    setSearch,
    setStatusFilter,
    setCategorySearch,
    setActiveTab,
    setEditDialog,
    setFormData,
    setDeleteId,
    setBlockId,
    setCategoryDialog,
    setCategoryForm,
    setDeleteCategoryId,
    setCannotDeleteCategoryDialog,
    openCreateDialog,
    openEditDialog,
    saveArticle,
    handleDelete,
    handleBlock,
    handleApprove,
    handleReject,
    openCategoryDialog,
    saveCategory,
    handleDeleteCategory
  } = useAdminArticles();

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return <div className="p-8 text-center">Akses ditolak</div>;
  }

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Artikel</h1>
        <p className="text-gray-500">Kelola artikel dan kategori artikel</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Artikel</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                placeholder="Cari artikel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
              <Button onClick={openCreateDialog} className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" /> Tambah
              </Button>
            </div>
          </div>

          <ArticleTable
            articles={filteredArticles}
            isLoading={isLoading}
            search={search}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={openEditDialog}
            onBlock={setBlockId}
            onDelete={setDeleteId}
          />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
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

          <CategoryTable
            categories={filteredCategories}
            isLoading={isLoading}
            search={categorySearch}
            onEdit={openCategoryDialog}
            onDelete={(category) => {
              if ((category.article_count || 0) > 0) {
                setCannotDeleteCategoryDialog(true);
              } else {
                setDeleteCategoryId(category.id);
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ArticleFormModal
        isOpen={editDialog}
        onClose={() => setEditDialog(false)}
        isEditing={!!editingArticle}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        token={token}
        isSaving={isSaving}
        onSave={saveArticle}
      />

      <CategoryFormModal
        isOpen={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        isEditing={!!editingCategory}
        formData={categoryForm}
        setFormData={setCategoryForm}
        isSaving={isCategorySaving}
        onSave={saveCategory}
      />

      <ArticleDeleteModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <ArticleBlockModal
        isOpen={blockId !== null}
        onClose={() => setBlockId(null)}
        article={articles.find(a => a.id === blockId)}
        onConfirm={handleBlock}
      />

      <CategoryDeleteModal
        isOpen={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
      />

      <CategoryCannotDeleteModal
        isOpen={cannotDeleteCategoryDialog}
        onClose={() => setCannotDeleteCategoryDialog(false)}
      />
    </div>
  );
}
