"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Music, Play, Pause, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Song, SongCategory } from "@/types";

interface CategoryDetailViewProps {
    category: SongCategory;
    songs: Song[];
    onBack: () => void;
    currentSong: Song | null;
    isPlaying: boolean;
    onPlay: (song: Song) => void;
}

export function CategoryDetailView({
    category,
    songs,
    onBack,
    currentSong,
    isPlaying,
    onPlay
}: CategoryDetailViewProps) {
    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl pb-32">
            <AnimatePresence mode="wait">
                <motion.div
                    key="category-detail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Compact Header */}
                    <div className="mb-6">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Kembali
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                                {category.thumbnail ? (
                                    <Image
                                        src={category.thumbnail}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                                        <Music className="w-8 h-8 text-primary/60" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kategori</p>
                                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                                <p className="text-sm text-gray-500">{songs.length} lagu tersedia</p>
                            </div>
                            <Button
                                className="gradient-primary rounded-full px-6"
                                onClick={() => songs.length > 0 && onPlay(songs[0])}
                            >
                                <Play className="w-4 h-4 mr-2 fill-current" />
                                Putar Semua
                            </Button>
                        </div>
                    </div>

                    {/* Songs List */}
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="border-b px-6 py-3 bg-gray-50/50 flex text-xs font-medium text-gray-400 uppercase tracking-wider">
                            <div className="w-12 text-center">#</div>
                            <div className="flex-1">Judul Lagu</div>
                            <div className="w-24 text-right pr-4">Aksi</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {songs.map((song, index) => (
                                <div
                                    key={song.id}
                                    className={cn(
                                        "group flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
                                        currentSong?.id === song.id && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                    onClick={() => onPlay(song)}
                                >
                                    <div className="w-10 text-center text-sm text-gray-400 font-medium group-hover:hidden">
                                        {index + 1}
                                    </div>
                                    <div className="w-10 text-center hidden group-hover:flex justify-center">
                                        {currentSong?.id === song.id && isPlaying ? (
                                            <Pause className="w-4 h-4 text-primary fill-current" />
                                        ) : (
                                            <Play className="w-4 h-4 text-gray-600 fill-current" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded bg-gray-100 relative overflow-hidden shrink-0">
                                            {song.thumbnail ? (
                                                <Image src={song.thumbnail} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "font-medium text-sm truncate",
                                                currentSong?.id === song.id ? "text-primary" : "text-gray-900"
                                            )}>
                                                {song.title}
                                            </p>
                                            <p className="text-xs text-gray-500">Ruang Tenang</p>
                                        </div>
                                    </div>

                                    <div className="w-24 flex justify-end pr-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Optional: Show modal to add to playlist
                                            }}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
