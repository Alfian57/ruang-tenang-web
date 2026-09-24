"use client";

import { Compass, BadgeCheck } from "lucide-react";
import { PublicPlaylistCard } from "./PublicPlaylistCard";
import { PlaylistListItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

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
    onPlaylistClick,
}: ExploreTabProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Featured Admin Playlists */}
            {adminPlaylists.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-gray-900">Playlist Resmi</h2>
                        <span className="text-[10px] px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary font-semibold inline-flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" />
                            Kurasi Tim
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-4">
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
                    <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-4">
                        {publicPlaylists.map((playlist) => (
                            <PublicPlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                onClick={() => onPlaylistClick(playlist)}
                            />
                        ))}
                    </div>
                ) : (
                    <DashboardMascotEmpty image="/images/dashboard/mascot/music-headphones.webp" title="Belum ada playlist publik" description="Jadilah yang pertama membagikan daftar putarmu." />
                )}
            </div>
        </div>
    );
}
