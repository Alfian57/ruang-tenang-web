"use client";

import { Input } from "@/components/ui/input";

import { Search, Loader2 } from "lucide-react";
import { Song } from "@/types";
import { SongItem } from "./SongItem";

interface SongSearchProps {
    search: string;
    setSearch: (value: string) => void;
    isLoading: boolean;
    isSearching: boolean;
    searchResults: Song[];
    selectedSongs: Set<number>;
    existingSongIds: number[];
    onToggleSong: (songId: number) => void;
}

export function SongSearch({
    search,
    setSearch,
    isLoading,
    isSearching,
    searchResults,
    selectedSongs,
    existingSongIds,
    onToggleSong,
}: SongSearchProps) {
    return (
        <>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Cari lagu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {isSearching ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((song) => (
                                <SongItem
                                    key={song.id}
                                    song={song}
                                    isSelected={selectedSongs.has(song.id)}
                                    isAlreadyInPlaylist={existingSongIds.includes(song.id)}
                                    onToggle={onToggleSong}
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                Tidak ada hasil ditemukan
                            </p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
