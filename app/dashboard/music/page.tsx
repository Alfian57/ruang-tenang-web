"use client";

import {
  ListMusic,
  Library,
  Compass,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  PlaylistDialog,
  BrowseTab,
  ExploreTab,
  PlaylistsTab
} from "./_components";
import { useMusic } from "./_hooks/useMusic";
import { useRouter } from "next/navigation";

export default function MusicPage() {
  const router = useRouter(); // Helper to navigate
  const {
    // State
    activeTab,
    search,
    categories,
    songs,
    isLoading,
    playlists,
    publicPlaylists,
    adminPlaylists,
    isPlaylistDialogOpen,
    editingPlaylist,
    playlistsLoading,
    publicPlaylistsLoading,
    isSaving,
    showDeletePlaylistDialog,
    isDeleting,
    debouncedSearch,
    
    // Actions - Setters
    setActiveTab,
    setSearch,
    setIsPlaylistDialogOpen,
    setEditingPlaylist,
    setShowDeletePlaylistDialog,
    setDeletePlaylistId,

    // Actions - Handlers
    handlePlaySong,
    handlePlaylistEdit,
    handlePlaylistDeleteClick,
    handlePlaylistDelete,
    handlePlaylistSave,

    // Player State
    currentSong,
    isPlaying,
  } = useMusic();

  // Navigation handlers
  const navigateToPlaylist = (playlist: { id: number }) => {
    router.push(`/dashboard/music/playlist/${playlist.id}`);
  };

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
          <TabsContent value="browse">
            <BrowseTab
              search={search}
              setSearch={setSearch}
              isLoading={isLoading}
              debouncedSearch={debouncedSearch}
              songs={songs}
              categories={categories}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlay={handlePlaySong}
              onCategoryClick={(category) => router.push(`/dashboard/music/categories/${category.id}`)}
            />
          </TabsContent>

          {/* Explore Tab - Public Playlists */}
          <TabsContent value="explore">
            <ExploreTab
              isLoading={publicPlaylistsLoading}
              adminPlaylists={adminPlaylists}
              publicPlaylists={publicPlaylists}
              onPlaylistClick={navigateToPlaylist}
            />
          </TabsContent>

          {/* My Playlists Tab */}
          <TabsContent value="playlists">
            <PlaylistsTab
              isLoading={playlistsLoading}
              playlists={playlists}
              onCreateClick={() => {
                setEditingPlaylist(null);
                setIsPlaylistDialogOpen(true);
              }}
              onPlaylistClick={navigateToPlaylist}
              onEditClick={handlePlaylistEdit}
              onDeleteClick={handlePlaylistDeleteClick}
            />
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
