"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Music,
  Play,
  Pause,
  ChevronDown,
  Search,
  Plus,
  ListMusic,
  Library,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { SongCategory, Song, Playlist, PlaylistListItem } from "@/types";
import { cn } from "@/lib/utils";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";
import { useAuthStore } from "@/stores/authStore";
import {
  PlaylistCard,
  PlaylistDialog,
  PlaylistDetail,
  AddSongsDialog
} from "@/components/music";

export default function MusicPage() {
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SongCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Playlist state
  const [playlists, setPlaylists] = useState<PlaylistListItem[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistListItem | null>(null);
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth
  const { token } = useAuthStore();

  // Global player store
  const {
    currentSong,
    isPlaying,
    playSong,
    setIsPlaying,
    playPlaylist
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

  useEffect(() => {
    loadCategories();
    loadPlaylists();
  }, [loadCategories, loadPlaylists]);

  const loadSongs = async (category: SongCategory) => {
    setSelectedCategory(category);
    setExpandedCategory(expandedCategory === category.id ? null : category.id);
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
          setSelectedCategory(null);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      };
      doSearch();
    } else {
      setSongs([]);
      loadCategories();
    }
  }, [debouncedSearch, loadCategories]);

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      playSong(song, songs, { type: "category", name: selectedCategory?.name || "Musik" });
    }
  };

  const handlePlaylistPlay = (playlist: Playlist) => {
    if (playlist.items && playlist.items.length > 0) {
      playPlaylist(playlist);
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

  const handlePlaylistEdit = (playlistItem: PlaylistListItem) => {
    setEditingPlaylist(playlistItem);
    setIsPlaylistDialogOpen(true);
  };

  const handlePlaylistDelete = async (playlistId: number) => {
    if (!token) return;
    if (!confirm("Apakah kamu yakin ingin menghapus playlist ini?")) return;
    try {
      await api.deletePlaylist(token, playlistId);
      loadPlaylists();
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error("Failed to delete playlist:", error);
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
      <div className="p-4 lg:p-6 pb-32">
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

  return (
    <div className="p-4 lg:p-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Biarkan Musik Menenangkan Harimu</h1>
        <p className="text-gray-500">
          Putar musik pilihan untuk bantu kamu melepas stres, mengatur napas, dan kembali fokus.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="browse" className="flex-1">
            <Library className="w-4 h-4 mr-2" />
            Jelajahi
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex-1">
            <ListMusic className="w-4 h-4 mr-2" />
            Playlist Saya
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari musik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Search Results or Categories */}
          {debouncedSearch ? (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Hasil Pencarian</h2>
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : songs.length > 0 ? (
                <div className="grid gap-2">
                  {songs.map((song) => (
                    <Card key={song.id} className="overflow-hidden bg-white hover:shadow-md transition-shadow">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {song.thumbnail ? (
                            <Image src={song.thumbnail} alt={song.title} fill className="object-cover" />
                          ) : (
                            <Music className="w-6 h-6 text-gray-400" />
                          )}
                          <button
                            onClick={() => handlePlaySong(song)}
                            className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            {currentSong?.id === song.id && isPlaying ? (
                              <Pause className="w-6 h-6 text-white" />
                            ) : (
                              <Play className="w-6 h-6 text-white" />
                            )}
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-1">{song.title}</h4>
                          <p className="text-xs text-gray-500">
                            {categories.find(c => c.id === song.category_id)?.name || "Musik"}
                          </p>
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
            /* Music Categories Accordion */
            <div className="space-y-3">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-1/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                categories.map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Category Header */}
                      <button
                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                        onClick={() => loadSongs(category)}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center shrink-0">
                          {category.thumbnail ? (
                            <Image
                              src={category.thumbnail}
                              alt={category.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.song_count || 0} Lagu</p>
                        </div>
                        <ChevronDown className={cn(
                          "w-5 h-5 text-gray-400 transition-transform",
                          expandedCategory === category.id && "rotate-180"
                        )} />
                      </button>

                      {/* Songs List */}
                      {expandedCategory === category.id && (
                        <div className="border-t bg-gray-50 p-3 space-y-2">
                          {songs.map((song) => (
                            <button
                              key={song.id}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                                currentSong?.id === song.id
                                  ? "bg-red-50 border border-primary/20"
                                  : "bg-white hover:bg-gray-100"
                              )}
                              onClick={() => handlePlaySong(song)}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                currentSong?.id === song.id ? "bg-primary" : "bg-gray-100"
                              )}>
                                {currentSong?.id === song.id && isPlaying ? (
                                  <Pause className={cn(
                                    "w-5 h-5",
                                    currentSong?.id === song.id ? "text-white" : "text-gray-500"
                                  )} />
                                ) : (
                                  <Play className={cn(
                                    "w-5 h-5",
                                    currentSong?.id === song.id ? "text-white" : "text-gray-500"
                                  )} />
                                )}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-gray-900">{song.title}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* Playlists Tab */}
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
            <div className="grid gap-4">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <div className="grid gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => handlePlaylistClick(playlist)}
                  onEdit={() => handlePlaylistEdit(playlist)}
                  onDelete={() => handlePlaylistDelete(playlist.id)}
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
  );
}
