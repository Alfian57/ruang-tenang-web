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
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-medium text-gray-500">Hasil Pencarian</h2>
                        {songs.length > 0 && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                                {songs.length} lagu
                            </span>
                        )}
                    </div>
                    {songs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {songs.map((song) => (
                                <Card
                                    key={song.id}
                                    className={cn(
                                        "group overflow-hidden border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-red-100 hover:shadow-md",
                                        currentSong?.id === song.id && "border-red-200 bg-red-50/50 shadow-sm"
                                    )}
                                    onClick={() => onPlay(song)}
                                >
                                    <CardContent className="flex h-full gap-4 p-3">
                                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-100">
                                            {song.thumbnail ? (
                                                <Image
                                                    src={song.thumbnail}
                                                    alt={song.title}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <Music className="h-7 w-7 text-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h4 className="line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-primary">
                                                            {song.title}
                                                        </h4>
                                                        <p className="mt-1 text-xs text-gray-500">Musik relaksasi</p>
                                                    </div>
                                                    <div className={cn(
                                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                                                        currentSong?.id === song.id ? "bg-primary text-white" : "bg-red-50 text-primary group-hover:bg-primary group-hover:text-white"
                                                    )}>
                                                        {currentSong?.id === song.id && isPlaying ? (
                                                            <Pause className="h-4 w-4" />
                                                        ) : (
                                                            <Play className="ml-0.5 h-4 w-4" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                    {categories.find(c => c.id === song.category_id)?.name || song.category?.name || "Musik"}
                                                </span>
                                                {currentSong?.id === song.id && (
                                                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                        {isPlaying ? "Sedang diputar" : "Dipilih"}
                                                    </span>
                                                )}
                                            </div>
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
                <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-4">
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
