"use client";

import { Loader2, Sparkles, Compass, AudioLines, ArrowRight, BadgeCheck } from "lucide-react";
import { PublicPlaylistCard } from "./PublicPlaylistCard";
import { PlaylistListItem } from "@/types";
import { Button } from "@/components/ui/button";

export interface MusicJourneyCard {
    id: string;
    title: string;
    situation: string;
    direction: string;
    duration: string;
    categoryKeywords: string[];
    fallbackSearch: string;
    nextActionLabel: string;
    nextActionHref: string;
}

interface ExploreTabProps {
    isLoading: boolean;
    adminPlaylists: PlaylistListItem[];
    publicPlaylists: PlaylistListItem[];
    onPlaylistClick: (playlist: PlaylistListItem) => void;
    journeys: MusicJourneyCard[];
    onJourneyStart: (journey: MusicJourneyCard) => void;
}

export function ExploreTab({
    isLoading,
    adminPlaylists,
    publicPlaylists,
    onPlaylistClick,
    journeys,
    onJourneyStart,
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
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <AudioLines className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-gray-900">Journey Sesuai Kondisi</h2>
                    <span className="text-[10px] px-2 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary font-semibold">
                        MUSIC-1
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {journeys.map((journey) => (
                        <div
                            key={journey.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <p className="text-xs font-semibold text-primary uppercase tracking-wide">{journey.duration}</p>
                            <h3 className="text-base font-semibold text-gray-900 mt-1">{journey.title}</h3>
                            <p className="text-sm text-gray-600 mt-2">{journey.situation}</p>
                            <p className="text-xs text-gray-500 mt-2">Arah: {journey.direction}</p>
                            <p className="text-xs text-gray-500 mt-1">Setelahnya: {journey.nextActionLabel}</p>
                            <Button
                                type="button"
                                size="sm"
                                className="mt-3 w-full justify-between"
                                onClick={() => onJourneyStart(journey)}
                            >
                                Mulai Journey
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Admin Playlists */}
            {adminPlaylists.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-gray-900">Playlist Resmi</h2>
                        <span className="text-[10px] px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold inline-flex items-center gap-1">
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
                    <div className="text-center py-16">
                        <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">Belum ada playlist publik</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Jadilah yang pertama membagikan playlist-mu!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
