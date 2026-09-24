"use client";

import dynamic from "next/dynamic";
import { ListMusic, Library, Compass } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DashboardHubTabList } from "@/components/shared/dashboard/DashboardHubTabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useMusic } from "./_hooks/useMusic";
import { useRouter } from "next/navigation";
import { DashboardMascotHero } from "@/components/shared/dashboard/DashboardMascotHero";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";
import { Pagination } from "@/components/ui/pagination";

const BrowseTab = dynamic(() => import("./_components/BrowseTab").then((module) => module.BrowseTab));
const ExploreTab = dynamic(() => import("./_components/ExploreTab").then((module) => module.ExploreTab));
const PlaylistsTab = dynamic(() => import("./_components/PlaylistsTab").then((module) => module.PlaylistsTab));
const PlaylistDialog = dynamic(() => import("./_components/PlaylistDialog").then((module) => module.PlaylistDialog));

const MUSIC_TABS = [
  { value: "browse", label: "Jelajahi", icon: Library },
  { value: "explore", label: "Eksplorasi", icon: Compass },
  { value: "playlists", label: "Playlist", icon: ListMusic },
] as const;

export default function MusicPage() {
  const router = useRouter(); // Helper to navigate
  const {
    // State
    activeTab,
    page,
    setPage,
    totalPages,
    hasError,
    retry,
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
  const navigateToPlaylist = (playlist: { id?: number; slug?: string; uuid?: string }) => {
    const identifier = playlist.slug || playlist.uuid || playlist.id;
    if (!identifier) return;
    router.push(`/dashboard/music/playlist/${identifier}`);
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

      <div className="min-w-0 pb-32">
        {/* Header */}
        <DashboardMascotHero eyebrow="Dengarkan yang kamu butuhkan" title="Musik Relaksasi" description="Pilih ritme yang menemanimu bernapas, fokus, atau beristirahat sejenak." image="/images/dashboard/mascot/music-headphones.webp" imageAlt="Bulan Pulih mendengarkan musik" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
          <DashboardHubTabList tabs={MUSIC_TABS} tourTarget="music-tabs" />

          {/* Browse Tab - Categories */}
          <TabsContent value="browse" className="min-w-0 overflow-x-hidden">
            {hasError && !isLoading ? <DashboardMascotEmpty image="/images/dashboard/mascot/music-headphones.webp" title="Musik belum bisa dimuat" description="Coba lagi saat koneksimu sudah stabil." action={<Button onClick={retry}>Coba lagi</Button>} /> : <BrowseTab
              search={search}
              setSearch={setSearch}
              isLoading={isLoading}
              debouncedSearch={debouncedSearch}
              songs={songs}
              categories={categories}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlay={handlePlaySong}
              onCategoryClick={(category) => router.push(`/dashboard/music/categories/${category.slug || category.id}`)}
            />}
            {!isLoading && !hasError && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </TabsContent>

          {/* Explore Tab - Public Playlists */}
          <TabsContent value="explore" className="min-w-0 overflow-x-hidden">
            {hasError && !publicPlaylistsLoading ? <DashboardMascotEmpty image="/images/dashboard/mascot/music-headphones.webp" title="Playlist komunitas belum bisa dimuat" description="Coba beberapa saat lagi." action={<Button onClick={retry}>Coba lagi</Button>} /> : <ExploreTab
              isLoading={publicPlaylistsLoading}
              adminPlaylists={adminPlaylists}
              publicPlaylists={publicPlaylists}
              onPlaylistClick={navigateToPlaylist}
            />}
            {!publicPlaylistsLoading && !hasError && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </TabsContent>

          {/* My Playlists Tab */}
          <TabsContent value="playlists" className="min-w-0 overflow-x-hidden">
            {hasError && !playlistsLoading ? <DashboardMascotEmpty image="/images/dashboard/mascot/music-headphones.webp" title="Playlistmu belum bisa dimuat" description="Coba lagi saat koneksimu sudah stabil." action={<Button onClick={retry}>Coba lagi</Button>} /> : <PlaylistsTab
              isLoading={playlistsLoading}
              playlists={playlists}
              onCreateClick={() => {
                setEditingPlaylist(null);
                setIsPlaylistDialogOpen(true);
              }}
              onPlaylistClick={navigateToPlaylist}
              onEditClick={handlePlaylistEdit}
              onDeleteClick={handlePlaylistDeleteClick}
            />}
            {!playlistsLoading && !hasError && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </TabsContent>
        </Tabs>

        {/* Playlist Dialog */}
        {isPlaylistDialogOpen && <PlaylistDialog
          open={isPlaylistDialogOpen}
          onOpenChange={(open) => {
            setIsPlaylistDialogOpen(open);
            if (!open) setEditingPlaylist(null);
          }}
          playlist={editingPlaylist}
          onSave={handlePlaylistSave}
          isLoading={isSaving}
        />}
      </div>
    </>
  );
}
