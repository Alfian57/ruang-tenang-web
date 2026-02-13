"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Play,
  Pause,
  Search,
  Plus,
  ListMusic,
  Library,
  Compass,
  ChevronLeft,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";
import { SongCategory, Song, Playlist, PlaylistListItem } from "@/types";
import { cn } from "@/lib/utils";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";
import { useAuthStore } from "@/stores/authStore";
import {
  PlaylistCard,
  PlaylistDialog,
  PlaylistDetail,
  AddSongsDialog,
  MusicCategoryCard,
  PublicPlaylistCard,
} from "@/components/music";

export default function MusicPage() {
  // URL state management — must come first
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuthStore();

  const updateUrlParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Read from URL
  const activeTab = searchParams.get("tab") || "browse";
  const search = searchParams.get("search") || "";
  const categoryIdParam = searchParams.get("categoryId");
  const viewMode = (searchParams.get("view") || "browse") as "browse" | "category";

  const setActiveTab = (tab: string) => updateUrlParam("tab", tab === "browse" ? null : tab);
  const setSearch = (value: string) => updateUrlParam("search", value || null);
  const setViewMode = (mode: "browse" | "category") => updateUrlParam("view", mode === "browse" ? null : mode);
  const setSelectedCategoryId = (id: number | null) => updateUrlParam("categoryId", id ? String(id) : null);

  // Data state
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Derive selectedCategory from URL + loaded categories
  const selectedCategory = categoryIdParam ? categories.find(c => c.id === parseInt(categoryIdParam, 10)) || null : null;

  // Playlist state
  const [playlists, setPlaylists] = useState<PlaylistListItem[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<PlaylistListItem[]>([]);
  const [adminPlaylists, setAdminPlaylists] = useState<PlaylistListItem[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistListItem | null>(null);
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [publicPlaylistsLoading, setPublicPlaylistsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete playlist confirmation
  const [deletePlaylistId, setDeletePlaylistId] = useState<number | null>(null);
  const [showDeletePlaylistDialog, setShowDeletePlaylistDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global player store
  const {
    currentSong,
    isPlaying,
    playSong,
    setIsPlaying,
  } = useMusicPlayerStore();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.getSongCategories() as { data: SongCategory[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPlaylists = useCallback(async () => {
    if (!token) return;
    setPlaylistsLoading(true);
    try {
      const response = await api.getMyPlaylists(token) as { data: PlaylistListItem[] };
      setPlaylists(response.data || []);
    } catch (error) {
      console.error("Failed to load playlists:", error);
    } finally {
      setPlaylistsLoading(false);
    }
  }, [token]);

  const loadPublicPlaylists = useCallback(async () => {
    setPublicPlaylistsLoading(true);
    try {
      const response = await api.getPublicPlaylists({ limit: 20 }) as { data: PlaylistListItem[] };
      const allPublic = response.data || [];
      
      // Separate admin playlists from regular public playlists
      setAdminPlaylists(allPublic.filter(p => p.is_admin_playlist));
      setPublicPlaylists(allPublic.filter(p => !p.is_admin_playlist));
    } catch (error) {
      console.error("Failed to load public playlists:", error);
    } finally {
      setPublicPlaylistsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadPlaylists();
    loadPublicPlaylists();
  }, [loadCategories, loadPlaylists, loadPublicPlaylists]);

  // Auto-load songs when navigating to a category via URL
  useEffect(() => {
    if (selectedCategory && viewMode === "category" && songs.length === 0) {
      const doLoadSongs = async () => {
        try {
          const response = await api.getSongsByCategory(selectedCategory.id) as { data: Song[] };
          setSongs(response.data || []);
        } catch (error) {
          console.error("Failed to load songs:", error);
        }
      };
      doLoadSongs();
    }
  }, [selectedCategory, viewMode, songs.length]);

  const loadSongs = async (category: SongCategory) => {
    setSelectedCategoryId(category.id);
    setViewMode("category");
    try {
      const response = await api.getSongsByCategory(category.id) as { data: Song[] };
      setSongs(response.data || []);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      const doSearch = async () => {
        setIsLoading(true);
        try {
          const response = await api.search(debouncedSearch);
          setSongs(response.data?.songs || []);
          setSelectedCategoryId(null);
          setViewMode("category");
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      };
      doSearch();
    } else if (viewMode === "category" && !selectedCategory) {
      setViewMode("browse");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      playSong(song, songs, { type: "category", name: selectedCategory?.name || "Musik" });
    }
  };

  const handlePlaylistClick = async (playlistItem: PlaylistListItem) => {
    if (!token) return;
    try {
      const response = await api.getPlaylist(token, playlistItem.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error("Failed to load playlist:", error);
    }
  };

  const handlePublicPlaylistClick = async (playlistItem: PlaylistListItem) => {
    // For public playlists, we might need different handling
    if (!token) return;
    try {
      const response = await api.getPlaylist(token, playlistItem.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error("Failed to load playlist:", error);
    }
  };

  const handlePlaylistEdit = (playlistItem: PlaylistListItem) => {
    setEditingPlaylist(playlistItem);
    setIsPlaylistDialogOpen(true);
  };

  const handlePlaylistDeleteClick = (playlistId: number) => {
    setDeletePlaylistId(playlistId);
    setShowDeletePlaylistDialog(true);
  };

  const handlePlaylistDelete = async () => {
    if (!token || !deletePlaylistId) return;
    setIsDeleting(true);
    try {
      await api.deletePlaylist(token, deletePlaylistId);
      loadPlaylists();
      if (selectedPlaylist?.id === deletePlaylistId) {
        setSelectedPlaylist(null);
      }
      setShowDeletePlaylistDialog(false);
      setDeletePlaylistId(null);
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlaylistSave = async (data: { name: string; description?: string; is_public?: boolean }) => {
    if (!token) return;
    setIsSaving(true);
    try {
      if (editingPlaylist) {
        await api.updatePlaylist(token, editingPlaylist.id, data);
      } else {
        await api.createPlaylist(token, data);
      }
      loadPlaylists();
      setIsPlaylistDialogOpen(false);
      setEditingPlaylist(null);
    } catch (error) {
      console.error("Failed to save playlist:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSongs = async (songIds: number[]) => {
    if (!selectedPlaylist || !token) return;
    try {
      await api.addSongsToPlaylist(token, selectedPlaylist.id, songIds);
      const response = await api.getPlaylist(token, selectedPlaylist.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
      loadPlaylists();
    } catch (error) {
      console.error("Failed to add songs:", error);
    }
  };

  const handleRemoveSong = async (itemId: number) => {
    if (!selectedPlaylist || !token) return;
    try {
      await api.removeItemFromPlaylist(token, selectedPlaylist.id, itemId);
      const response = await api.getPlaylist(token, selectedPlaylist.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
      loadPlaylists();
    } catch (error) {
      console.error("Failed to remove song:", error);
    }
  };

  const handleReorderSongs = async (itemIds: number[]) => {
    if (!selectedPlaylist || !token) return;
    try {
      await api.reorderPlaylistItems(token, selectedPlaylist.id, itemIds);
      const response = await api.getPlaylist(token, selectedPlaylist.id) as { data: Playlist };
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error("Failed to reorder songs:", error);
    }
  };

  // If viewing a playlist detail
  if (selectedPlaylist) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl pb-32">
        <PlaylistDetail
          playlist={selectedPlaylist}
          onBack={() => setSelectedPlaylist(null)}
          onReorder={handleReorderSongs}
          onRemoveItem={handleRemoveSong}
          onAddSongs={() => setIsAddSongsDialogOpen(true)}
        />

        <AddSongsDialog
          open={isAddSongsDialogOpen}
          onOpenChange={setIsAddSongsDialogOpen}
          playlist={selectedPlaylist}
          onAddSongs={handleAddSongs}
          existingSongIds={selectedPlaylist.items?.map(item => item.song_id) || []}
        />
      </div>
    );
  }

  // Category detail view
  if (viewMode === "category" && selectedCategory) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key="category-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Compact Header */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setViewMode("browse");
                  setSelectedCategoryId(null);
                  setSongs([]);
                }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
              >
                <ChevronLeft className="w-4 h-4" />
                Kembali
              </button>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                  {selectedCategory.thumbnail ? (
                    <Image
                      src={selectedCategory.thumbnail}
                      alt={selectedCategory.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                      <Music className="w-8 h-8 text-primary/60" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kategori</p>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h1>
                  <p className="text-sm text-gray-500">{songs.length} lagu tersedia</p>
                </div>
                <Button
                  className="gradient-primary rounded-full px-6"
                  onClick={() => songs.length > 0 && handlePlaySong(songs[0])}
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Putar Semua
                </Button>
              </div>
            </div>

              {/* Songs List */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="border-b px-6 py-3 bg-gray-50/50 flex text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="w-12 text-center">#</div>
                  <div className="flex-1">Judul Lagu</div>
                  <div className="w-24 text-right pr-4">Aksi</div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {songs.map((song, index) => (
                    <div
                      key={song.id}
                      className={cn(
                        "group flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
                        currentSong?.id === song.id && "bg-primary/5 hover:bg-primary/10"
                      )}
                      onClick={() => handlePlaySong(song)}
                    >
                      <div className="w-10 text-center text-sm text-gray-400 font-medium group-hover:hidden">
                        {index + 1}
                      </div>
                      <div className="w-10 text-center hidden group-hover:flex justify-center">
                        {currentSong?.id === song.id && isPlaying ? (
                           <Pause className="w-4 h-4 text-primary fill-current" />
                        ) : (
                           <Play className="w-4 h-4 text-gray-600 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-gray-100 relative overflow-hidden shrink-0">
                          {song.thumbnail ? (
                            <Image src={song.thumbnail} alt="" fill className="object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <Music className="w-4 h-4 text-gray-400" />
                             </div>
                          )}
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium text-sm truncate",
                            currentSong?.id === song.id ? "text-primary" : "text-gray-900"
                          )}>
                            {song.title}
                          </p>
                          <p className="text-xs text-gray-500">Ruang Tenang</p>
                        </div>
                      </div>

                      <div className="w-24 flex justify-end pr-2">
                        {/* Add interaction buttons here like add to playlist or like */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Optional: Show modal to add to playlist
                            if (playlists.length > 0) {
                               // Assuming we can default to adding to first playlist or showing a selector
                               // For simplicity, just handling click event to prevent bubbling
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      {/* Delete Playlist Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeletePlaylistDialog}
        onClose={() => {
          setShowDeletePlaylistDialog(false);
          setDeletePlaylistId(null);
        }}
        onConfirm={handlePlaylistDelete}
        title="Hapus Playlist"
        description="Apakah kamu yakin ingin menghapus playlist ini? Semua lagu dalam playlist akan dihapus. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl pb-32">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Musik Relaksasi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Biarkan musik menenangkan harimu
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="browse" className="text-xs sm:text-sm">
              <Library className="w-4 h-4 mr-1.5" />
              Jelajahi
            </TabsTrigger>
            <TabsTrigger value="explore" className="text-xs sm:text-sm">
              <Compass className="w-4 h-4 mr-1.5" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="playlists" className="text-xs sm:text-sm">
              <ListMusic className="w-4 h-4 mr-1.5" />
              Playlist
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab - Categories */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search Input */}
            <div className="relative flex-1 mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                className="pl-10 bg-white"
                placeholder="Cari lagu, artis, atau kategori mood..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Categories Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : debouncedSearch ? (
              // Search Results
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-500">Hasil Pencarian</h2>
                {songs.length > 0 ? (
                  <div className="grid gap-3">
                    {songs.map((song) => (
                      <Card
                        key={song.id}
                        className="overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handlePlaySong(song)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {song.thumbnail ? (
                              <Image src={song.thumbnail} alt={song.title} fill className="object-cover" />
                            ) : (
                              <Music className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 line-clamp-1">{song.title}</h4>
                            <p className="text-xs text-gray-500">
                              {categories.find(c => c.id === song.category_id)?.name || "Musik"}
                            </p>
                          </div>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            currentSong?.id === song.id ? "bg-primary text-white" : "bg-gray-100"
                          )}>
                            {currentSong?.id === song.id && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
                    Tidak ada lagu yang ditemukan
                  </div>
                )}
              </div>
            ) : (
              // Category Grid
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MusicCategoryCard
                      category={category}
                      onClick={() => loadSongs(category)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Explore Tab - Public Playlists */}
          <TabsContent value="explore" className="space-y-6">
            {publicPlaylistsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Featured Admin Playlists */}
                {adminPlaylists.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-gray-900">Playlist Resmi</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminPlaylists.map((playlist) => (
                        <PublicPlaylistCard
                          key={playlist.id}
                          playlist={playlist}
                          onClick={() => handlePublicPlaylistClick(playlist)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Playlists */}
                <div className="space-y-4">
                  <h2 className="font-semibold text-gray-900">Playlist Komunitas</h2>
                  {publicPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {publicPlaylists.map((playlist) => (
                        <PublicPlaylistCard
                          key={playlist.id}
                          playlist={playlist}
                          onClick={() => handlePublicPlaylistClick(playlist)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                      <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-1">Belum ada playlist publik</p>
                      <p className="text-sm text-gray-400">
                        Jadilah yang pertama membagikan playlist-mu!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* My Playlists Tab */}
          <TabsContent value="playlists" className="space-y-6">
            {/* Create Playlist Button */}
            <Button
              onClick={() => {
                setEditingPlaylist(null);
                setIsPlaylistDialogOpen(true);
              }}
              className="w-full gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Playlist Baru
            </Button>

            {/* Playlists List */}
            {playlistsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : playlists.length > 0 ? (
              <div className="grid gap-4">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => handlePlaylistClick(playlist)}
                    onEdit={() => handlePlaylistEdit(playlist)}
                    onDelete={() => handlePlaylistDeleteClick(playlist.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                <ListMusic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">Belum ada playlist</p>
                <p className="text-sm text-gray-400">
                  Buat playlist pertamamu untuk menyimpan lagu favorit
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Playlist Dialog */}
        <PlaylistDialog
          open={isPlaylistDialogOpen}
          onOpenChange={(open) => {
            setIsPlaylistDialogOpen(open);
            if (!open) setEditingPlaylist(null);
          }}
          playlist={editingPlaylist}
          onSave={handlePlaylistSave}
          isLoading={isSaving}
        />
      </div>
    </>
  );
}
