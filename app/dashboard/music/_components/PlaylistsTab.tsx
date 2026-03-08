"use client";

import { Loader2, Plus, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistCard } from "./PlaylistCard";
import { PlaylistListItem } from "@/types";

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
            {/* Create Playlist Button */}
            <Button
                onClick={onCreateClick}
                variant="outline"
                className="w-full border-dashed border-2 border-gray-200 hover:border-primary hover:text-primary hover:bg-purple-50 text-gray-500 h-12"
            >
                <Plus className="w-4 h-4 mr-2" />
                Buat Playlist Baru
            </Button>

            {/* Playlists List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                <div className="text-center py-16">
                    <ListMusic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Belum ada playlist</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Buat playlist pertamamu untuk menyimpan lagu favorit
                    </p>
                </div>
            )}
        </div>
    );
}
