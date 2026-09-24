"use client";

import { Search, X, Music, Play, Pause } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";
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
            <div className="theme-accent-border-soft rounded-2xl border bg-white/90 p-4 shadow-sm sm:p-5">
                <p className="mb-3 text-sm font-semibold text-slate-700">Cari suara yang menemanimu</p>
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input
                        aria-label="Cari musik"
                        className="h-11 rounded-xl bg-white pl-10 pr-10"
                        placeholder="Cari lagu, artis, atau kategori mood..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            aria-label="Bersihkan pencarian musik"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full rounded-xl" />
                    ))}
                </div>
            ) : debouncedSearch ? (
                // Search Results
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-bold text-slate-900">Hasil pencarian</h2>
                        {songs.length > 0 && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                                {songs.length} lagu di halaman ini
                            </span>
                        )}
                    </div>
                    {songs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {songs.map((song) => (
                                <Card
                                    key={song.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${currentSong?.id === song.id && isPlaying ? "Jeda" : "Putar"} ${song.title}`}
                                    className={cn(
                                        "theme-accent-border-soft group cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none",
                                        currentSong?.id === song.id && "bg-theme-accent-soft shadow-sm"
                                    )}
                                    onClick={() => onPlay(song)}
                                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onPlay(song); } }}
                                >
                                    <div className="flex items-center h-full gap-4 p-4">
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

                                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                                            <div className="min-w-0 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className="line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-primary">
                                                        {song.title}
                                                    </h4>
                                                    <p className="mt-1 text-xs text-gray-500">Musik relaksasi</p>
                                                </div>
                                                <div className={cn(
                                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                                                    currentSong?.id === song.id ? "bg-primary text-white" : "bg-theme-accent-soft text-primary group-hover:bg-primary group-hover:text-white"
                                                )}>
                                                    {currentSong?.id === song.id && isPlaying ? (
                                                        <Pause className="h-4 w-4" />
                                                    ) : (
                                                        <Play className="ml-0.5 h-4 w-4" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                    {categories.find(c => c.id === song.category_id)?.name || song.category?.name || "Musik"}
                                                </span>
                                                {currentSong?.id === song.id && (
                                                    <span className="rounded-full bg-theme-accent-light px-2.5 py-1 text-xs font-semibold text-theme-accent-dark">
                                                        {isPlaying ? "Sedang diputar" : "Dipilih"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <DashboardMascotEmpty image="/images/dashboard/mascot/music-headphones.webp" title="Belum ada lagu yang cocok" description="Coba kata kunci lain untuk menemukan teman dengarmu." />
                    )}
                </div>
            ) : (
                // Category Grid
                <div className="space-y-3">
                    <div><h2 className="text-base font-bold text-slate-900">Jelajahi suasana</h2><p className="text-sm text-slate-500">Pilih kategori yang cocok dengan kebutuhanmu saat ini.</p></div>
                    {categories.length === 0 ? <DashboardMascotEmpty image="/images/dashboard/mascot/music-headphones.webp" title="Belum ada kategori musik" description="Pilihan musik baru akan hadir di sini." /> : <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="transition-transform hover:-translate-y-1 motion-reduce:transition-none"
                        >
                            <MusicCategoryCard
                                category={category}
                                onClick={() => onCategoryClick(category)}
                            />
                        </div>
                    ))}
                    </div>}
                </div>
            )}
        </div>
    );
}
