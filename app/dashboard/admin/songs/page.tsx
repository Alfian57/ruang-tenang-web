"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSongs } from "./_hooks/useAdminSongs";
import {
  CategoryTable,
  SongTable,
  CategoryFormModal,
  SongFormModal,
  CategoryDeleteModal,
  CategoryCannotDeleteModal,
  SongDeleteModal,
  ErrorDialog
} from "./_components";
import { Pagination } from "@/components/ui/pagination";

export default function AdminSongsPage() {
  const {
    user,
    token,
    activeTab,
    searchSong,
    searchCategory,
    selectedCategoryId,
    categories,
    songs,
    categoryDialog,
    songDialog,
    categoryForm,
    songForm,
    isUploadingAudio,
    deleteCategoryId,
    deleteSongId,
    editingCategory,
    editingSong,
    cannotDeleteDialog,
    errorDialog,
    audioInputRef,
    setSearchSong,
    setSearchCategory,
    setSelectedCategoryId,
    setActiveTab,
    setCategoryDialog,
    setSongDialog,
    setCategoryForm,
    setSongForm,
    setDeleteCategoryId,
    setDeleteSongId,
    setCannotDeleteDialog,
    setErrorDialog,
    openCategoryDialog,
    saveCategory,
    handleDeleteCategory,
    handleAudioUpload,
    saveSong,
    openSongDialog,
    handleDeleteSong,
    page,
    totalPages,
    setPage
  } = useAdminSongs();

  if (user?.role !== "admin") {
    return <div className="p-8 text-center">Akses ditolak</div>;
  }

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchSong.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Musik</h1>
        <p className="text-gray-500">Kelola kategori dan lagu</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="songs">Lagu</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                placeholder="Cari kategori..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => openCategoryDialog()} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
            </Button>
          </div>

          <CategoryTable
            categories={filteredCategories}
            search={searchCategory}
            onEdit={openCategoryDialog}
            onDelete={(cat) => {
              if ((cat.song_count || 0) > 0) {
                setCannotDeleteDialog(true);
              } else {
                setDeleteCategoryId(cat.id);
              }
            }}
          />
        </TabsContent>

        {/* Songs Tab */}
        <TabsContent value="songs" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  placeholder="Cari lagu..."
                  value={searchSong}
                  onChange={(e) => setSearchSong(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <select
                className="admin-select"
                value={selectedCategoryId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategoryId(value === "all" ? "all" : Number(value));
                }}
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => openSongDialog()} className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Tambah Lagu
            </Button>
          </div>

          <SongTable
            songs={filteredSongs}
            search={searchSong}
            onEdit={openSongDialog}
            onDelete={setDeleteSongId}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CategoryFormModal
        isOpen={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        isEditing={!!editingCategory}
        formData={categoryForm}
        setFormData={setCategoryForm}
        token={token}
        onSave={saveCategory}
      />

      <SongFormModal
        isOpen={songDialog}
        onClose={() => setSongDialog(false)}
        isEditing={!!editingSong}
        formData={songForm}
        setFormData={setSongForm}
        categories={categories}
        token={token}
        isUploadingAudio={isUploadingAudio}
        audioInputRef={audioInputRef}
        handleAudioUpload={handleAudioUpload}
        onSave={saveSong}
      />

      <CategoryDeleteModal
        isOpen={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
      />

      <CategoryCannotDeleteModal
        isOpen={cannotDeleteDialog}
        onClose={() => setCannotDeleteDialog(false)}
      />

      <SongDeleteModal
        isOpen={deleteSongId !== null}
        onClose={() => setDeleteSongId(null)}
        onConfirm={handleDeleteSong}
      />

      <ErrorDialog
        isOpen={errorDialog.open}
        title={errorDialog.title}
        message={errorDialog.message}
        onClose={() => setErrorDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
