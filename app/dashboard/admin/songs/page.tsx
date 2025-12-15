"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Plus, Music, Upload, Loader2, Edit, Search, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuthStore } from "@/stores/authStore";
import { api, getUploadUrl } from "@/lib/api";
import { SongCategory, Song } from "@/types";

interface SongWithCategory extends Omit<Song, 'category'> {
  category?: { id: number; name: string };
}

export default function AdminSongsPage() {
  const { token, user } = useAuthStore();
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [songs, setSongs] = useState<SongWithCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [songDialog, setSongDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", thumbnail: "" });
  const [songForm, setSongForm] = useState({ title: "", file_path: "", thumbnail: "", category_id: 0 });
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deleteSongId, setDeleteSongId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<SongCategory | null>(null);
  const [editingSong, setEditingSong] = useState<SongWithCategory | null>(null);
  const [searchSong, setSearchSong] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [cannotDeleteDialog, setCannotDeleteDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, title: "", message: "" });
  const audioInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/song-categories`);
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  const loadSongs = useCallback(async () => {
    if (!token) return;
    try {
      const categoryId = selectedCategoryId === "all" ? undefined : selectedCategoryId;
      const response = await api.adminGetAllSongs(token, categoryId) as { data: SongWithCategory[] };
      setSongs(response.data || []);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  }, [token, selectedCategoryId]);

  useEffect(() => {
    loadCategories();
    loadSongs();
  }, [loadCategories, loadSongs]);

  const openCategoryDialog = (category?: SongCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, thumbnail: category.thumbnail || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", thumbnail: "" });
    }
    setCategoryDialog(true);
  };

  const saveCategory = async () => {
    if (!token || !categoryForm.name) return;
    try {
      if (editingCategory) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/song-categories/${editingCategory.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(categoryForm),
          }
        );
      } else {
        await api.adminCreateSongCategory(token, categoryForm);
      }
      setCategoryDialog(false);
      setCategoryForm({ name: "", thumbnail: "" });
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!token || !deleteCategoryId) return;
    try {
      await api.adminDeleteSongCategory(token, deleteCategoryId);
      setDeleteCategoryId(null);
      loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploadingAudio(true);
    try {
      const response = await api.uploadAudio(token, file);
      setSongForm({ ...songForm, file_path: response.data.url });
    } catch (error) {
      console.error("Failed to upload audio:", error);
      setErrorDialog({
        open: true,
        title: "Gagal Mengunggah Audio",
        message: (error as Error).message || "Terjadi kesalahan saat mengunggah file audio."
      });
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  const saveSong = async () => {
    if (!token || !songForm.title || !songForm.file_path || !songForm.category_id) return;
    try {
      if (editingSong) {
        await api.adminUpdateSong(token, editingSong.id, { ...songForm, category_id: songForm.category_id });
      } else {
        await api.adminCreateSong(token, { ...songForm, category_id: songForm.category_id });
      }
      setSongDialog(false);
      setSongForm({ title: "", file_path: "", thumbnail: "", category_id: 0 });
      setEditingSong(null);
      loadSongs();
    } catch (error) {
      console.error("Failed to save song:", error);
    }
  };

  const openSongDialog = (song?: SongWithCategory) => {
    if (song) {
      setEditingSong(song);
      setSongForm({
        title: song.title,
        file_path: song.file_path,
        thumbnail: song.thumbnail || "",
        category_id: song.category_id || (song.category?.id || 0),
      });
    } else {
      setEditingSong(null);
      setSongForm({ title: "", file_path: "", thumbnail: "", category_id: 0 });
    }
    setSongDialog(true);
  };

  const handleDeleteSong = async () => {
    if (!token || !deleteSongId) return;
    try {
      await api.adminDeleteSong(token, deleteSongId);
      setDeleteSongId(null);
      loadSongs();
    } catch (error) {
      console.error("Failed to delete song:", error);
    }
  };

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
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Musik</h1>
        <p className="text-gray-500">Kelola kategori dan lagu</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="categories">Kategori</TabsTrigger>
          <TabsTrigger value="songs">Lagu</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

          {/* Categories Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600">Jumlah Lagu</th>
                    <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        {searchCategory ? "Tidak ada kategori yang cocok" : "Belum ada kategori"}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-linear-to-br from-red-100 to-red-200 shrink-0 flex items-center justify-center">
                              {cat.thumbnail ? (
                                <Image src={getUploadUrl(cat.thumbnail)} alt={cat.name} width={48} height={48} className="w-full h-full object-cover" />
                              ) : (
                                <Music className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            <span className="font-medium">{cat.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            {cat.song_count || 0} lagu
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCategoryDialog(cat)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                if ((cat.song_count || 0) > 0) {
                                  setCannotDeleteDialog(true);
                                } else {
                                  setDeleteCategoryId(cat.id);
                                }
                              }}
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

        {/* Songs Tab */}
        <TabsContent value="songs" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari lagu..."
                  value={searchSong}
                  onChange={(e) => setSearchSong(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="p-2 border rounded-lg bg-white"
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

          {/* Songs Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Lagu</th>
                    <th className="text-left p-4 font-medium text-gray-600 hidden sm:table-cell">Kategori</th>
                    <th className="text-right p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSongs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        {searchSong ? "Tidak ada lagu yang cocok" : "Belum ada lagu"}
                      </td>
                    </tr>
                  ) : (
                    filteredSongs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                              {song.thumbnail ? (
                                <Image src={getUploadUrl(song.thumbnail)} alt={song.title} width={48} height={48} className="w-full h-full object-cover" />
                              ) : (
                                <Music className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{song.title}</p>
                              <p className="text-xs text-gray-500 sm:hidden">{song.category?.name || "Tanpa Kategori"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-600">{song.category?.name || "Tanpa Kategori"}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openSongDialog(song)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => setDeleteSongId(song.id)}
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
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input 
                value={categoryForm.name} 
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Masukkan nama kategori" 
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {token && (
                <ImageUpload
                  value={categoryForm.thumbnail}
                  onChange={(url) => setCategoryForm({ ...categoryForm, thumbnail: url })}
                  token={token}
                  aspectRatio="square"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Batal</Button>
            <Button onClick={saveCategory} className="gradient-primary">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Song Dialog */}
      <Dialog open={songDialog} onOpenChange={setSongDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSong ? "Edit Lagu" : "Tambah Lagu"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input 
                value={songForm.title} 
                onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                placeholder="Masukkan judul lagu" 
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <select
                className="w-full p-2 border rounded-lg bg-white"
                value={songForm.category_id || ""}
                onChange={(e) => setSongForm({ ...songForm, category_id: Number(e.target.value) })}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>File Audio</Label>
                <div className="flex gap-2">
                <Input 
                  value={songForm.file_path ? "File audio terupload" : ""} 
                  readOnly
                  placeholder="Upload file audio"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploadingAudio}
                >
                  {isUploadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </Button>
              </div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500">Upload file audio (mp3, wav, ogg max 10MB)</p>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {token && (
                <ImageUpload
                  value={songForm.thumbnail}
                  onChange={(url) => setSongForm({ ...songForm, thumbnail: url })}
                  token={token}
                  aspectRatio="square"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSongDialog(false)}>Batal</Button>
            <Button onClick={saveSong} className="gradient-primary" disabled={!songForm.category_id}>Simpan</Button>
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

      {/* Cannot Delete Category Modal */}
      <Dialog open={cannotDeleteDialog} onOpenChange={setCannotDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tidak Bisa Menghapus Kategori</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-center text-gray-600">
              Kategori ini masih memiliki lagu di dalamnya. Silakan hapus atau pindahkan lagu-lagu tersebut terlebih dahulu sebelum menghapus kategori ini.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setCannotDeleteDialog(false)} className="gradient-primary w-full">
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Song Modal */}
      <Dialog open={deleteSongId !== null} onOpenChange={() => setDeleteSongId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Lagu?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            Lagu yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSongId(null)}>Batal</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDeleteSong}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errorDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-gray-600">
            {errorDialog.message}
          </div>
          <DialogFooter>
            <Button onClick={() => setErrorDialog(prev => ({ ...prev, open: false }))} className="gradient-primary w-full sm:w-auto">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
