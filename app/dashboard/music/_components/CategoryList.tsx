"use client";

import Image from "next/image";
import { Music, ChevronDown, ChevronRight } from "lucide-react";
import { Song, SongCategory } from "@/types";
import { SongItem } from "./SongItem";

interface CategoryListProps {
    categories: SongCategory[];
    songs: Song[];
    expandedCategory: number | null;
    selectedSongs: Set<number>;
    existingSongIds: number[];
    onToggleCategory: (categoryId: number) => void;
    onToggleSong: (songId: number) => void;
}

export function CategoryList({
    categories,
    songs,
    expandedCategory,
    selectedSongs,
    existingSongIds,
    onToggleCategory,
    onToggleSong,
}: CategoryListProps) {
    return (
        <div className="space-y-2">
            {categories.map((category) => (
                <div key={category.id}>
                    <button
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => onToggleCategory(category.id)}
                    >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-linear-to-br from-red-100 to-red-200 shrink-0">
                            {category.thumbnail ? (
                                <Image
                                    src={category.thumbnail}
                                    alt={category.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Music className="w-5 h-5 text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-xs text-gray-500">
                                {category.song_count || 0} lagu
                            </p>
                        </div>
                        {expandedCategory === category.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                    </button>

                    {expandedCategory === category.id && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
                            {songs.map((song) => (
                                <SongItem
                                    key={song.id}
                                    song={song}
                                    isSelected={selectedSongs.has(song.id)}
                                    isAlreadyInPlaylist={existingSongIds.includes(song.id)}
                                    onToggle={onToggleSong}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
