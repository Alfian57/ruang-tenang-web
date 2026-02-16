"use client";

import { usePlaylist } from "../../_hooks/usePlaylist";
import { PlaylistDetail } from "../../_components/PlaylistDetail";
import { AddSongsDialog } from "../../_components/AddSongsDialog";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PlaylistPage() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params.playlistId as string;
  const {
    playlist,
    isLoading,
    isAddSongsDialogOpen,
    setIsAddSongsDialogOpen,
    handleAddSongs,
    handleRemoveSong,
    handleReorderSongs,
  } = usePlaylist(playlistId);

  // Additional state for editing that wasn't in the hook but needed for Dialog
  // We can just pass the playlist itself to the dialog if it's open
    
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-xl font-semibold mb-2">Playlist tidak ditemukan</h2>
            <p className="text-gray-500 mb-4">Playlist yang kamu cari mungkin telah dihapus atau tidak tersedia.</p>
            <button 
                onClick={() => router.push("/dashboard/music")}
                className="text-primary hover:underline"
            >
                Kembali ke Musik
            </button>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl pb-32">
      <PlaylistDetail
        playlist={playlist}
        onBack={() => router.back()} // Or router.push('/dashboard/music')
        onReorder={handleReorderSongs}
        onRemoveItem={handleRemoveSong}
        onAddSongs={() => setIsAddSongsDialogOpen(true)}
      />

      <AddSongsDialog
        open={isAddSongsDialogOpen}
        onOpenChange={setIsAddSongsDialogOpen}
        playlist={playlist}
        onAddSongs={handleAddSongs}
        existingSongIds={playlist.items?.map((item) => item.song_id) || []}
      />

       {/* Edit Playlist Dialog - Assuming we might want to edit it here or maybe not? 
           The original design didn't explicitly show edit button in detail view, 
           but usually there's a way. For now, adhering strictly to what was there. 
           Wait, PlaylistDetail likely has a header with actions? 
           Let's check PlaylistHeader later. If needed, we add it. 
        */}
    </div>
  );
}
