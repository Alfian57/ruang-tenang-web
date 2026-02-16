"use client";

import { Search, X, Loader2, Music, Play, Pause } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { MusicCategoryCard } from "./MusicCategoryCard";
import { Song, SongCategory } from "@/types";

interface BrowseTabProps {
    search: string;
    setSearch: (val: string) => void;
    isLoading: boolean;
    debouncedSearch: string;
    songs: Song[];
    categories: SongCategory[];
    currentSong: Song | null;
    isPlaying: boolean;
    onPlay: (song: Song) => void;
    onCategoryClick: (category: SongCategory) => void;
}

export function BrowseTab({
    search,
    setSearch,
    isLoading,
    debouncedSearch,
    songs,
    categories,
    currentSong,
    isPlaying,
    onPlay,
    onCategoryClick
}: BrowseTabProps) {
    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative flex-1 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                    className="pl-10 bg-white"
                    placeholder="Cari lagu, artis, atau kategori mood..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Categories Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : debouncedSearch ? (
                // Search Results
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-gray-500">Hasil Pencarian</h2>
                    {songs.length > 0 ? (
                        <div className="grid gap-3">
                            {songs.map((song) => (
                                <Card
                                    key={song.id}
                                    className="overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => onPlay(song)}
                                >
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                                            {song.thumbnail ? (
                                                <Image src={song.thumbnail} alt={song.title} fill className="object-cover" />
                                            ) : (
                                                <Music className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 line-clamp-1">{song.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                {categories.find(c => c.id === song.category_id)?.name || "Musik"}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center",
                                            currentSong?.id === song.id ? "bg-primary text-white" : "bg-gray-100"
                                        )}>
                                            {currentSong?.id === song.id && isPlaying ? (
                                                <Pause className="w-4 h-4" />
                                            ) : (
                                                <Play className="w-4 h-4 ml-0.5" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
                            Tidak ada lagu yang ditemukan
                        </div>
                    )}
                </div>
            ) : (
                // Category Grid
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MusicCategoryCard
                                category={category}
                                onClick={() => onCategoryClick(category)}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
