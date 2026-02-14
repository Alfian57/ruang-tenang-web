"use client";

import { Loader2, Sparkles, Compass } from "lucide-react";
import { PublicPlaylistCard } from "./PublicPlaylistCard";
import { PlaylistListItem } from "@/types";

interface ExploreTabProps {
    isLoading: boolean;
    adminPlaylists: PlaylistListItem[];
    publicPlaylists: PlaylistListItem[];
    onPlaylistClick: (playlist: PlaylistListItem) => void;
}

export function ExploreTab({
    isLoading,
    adminPlaylists,
    publicPlaylists,
    onPlaylistClick
}: ExploreTabProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                                onClick={() => onPlaylistClick(playlist)}
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
                                onClick={() => onPlaylistClick(playlist)}
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
        </div>
    );
}
