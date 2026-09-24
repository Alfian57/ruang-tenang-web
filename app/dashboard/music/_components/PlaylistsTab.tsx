"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistCard } from "./PlaylistCard";
import { PlaylistListItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

interface PlaylistsTabProps {
    isLoading: boolean;
    playlists: PlaylistListItem[];
    onCreateClick: () => void;
    onPlaylistClick: (playlist: PlaylistListItem) => void;
    onEditClick: (playlist: PlaylistListItem) => void;
    onDeleteClick: (id: number) => void;
}

export function PlaylistsTab({
    isLoading,
    playlists,
    onCreateClick,
    onPlaylistClick,
    onEditClick,
    onDeleteClick
}: PlaylistsTabProps) {
    return (
        <div className="space-y-6">
            <div><h2 className="text-base font-bold text-slate-900">Playlist milikmu</h2><p className="text-sm text-slate-500">Simpan lagu favorit untuk kembali didengar kapan saja.</p></div>
            {/* Create Playlist Button */}
            <Button
                onClick={onCreateClick}
                variant="outline"
                className="h-12 w-full rounded-2xl border-2 border-dashed border-theme-accent-border bg-white/80 text-slate-600 hover:border-primary hover:bg-theme-accent-soft hover:text-primary"
            >
                <Plus className="w-4 h-4 mr-2" />
                Buat Playlist Baru
            </Button>

            {/* Playlists List */}
            {isLoading ? (
                <div className="grid gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            ) : playlists.length > 0 ? (
                <div className="grid gap-4">
                    {playlists.map((playlist) => (
                        <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            onClick={() => onPlaylistClick(playlist)}
                            onEdit={() => onEditClick(playlist)}
                            onDelete={() => onDeleteClick(playlist.id)}
                        />
                    ))}
                </div>
            ) : (
                <DashboardMascotEmpty image="/images/dashboard/mascot/music-headphones.webp" title="Belum ada playlist" description="Buat daftar putar pertamamu untuk menyimpan lagu favorit." />
            )}
        </div>
    );
}
