"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Music,
    Check,
    Loader2,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { Song, SongCategory, Playlist } from "@/types";
import { searchService, songService } from "@/services/api";
import { cn } from "@/lib/utils";

interface AddSongsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    playlist: Playlist | null;
    onAddSongs: (songIds: number[]) => Promise<void>;
    existingSongIds: number[];
}

export function AddSongsDialog({
    open,
    onOpenChange,
    playlist,
    onAddSongs,
    existingSongIds,
}: AddSongsDialogProps) {
    const [categories, setCategories] = useState<SongCategory[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
    const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load categories when dialog opens
    useEffect(() => {
        if (open) {
            loadCategories();
            setSelectedSongs(new Set());
            setSearch("");
            setSearchResults([]);
        }
    }, [open]);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const response = await songService.getCategories() as { data: SongCategory[] };
            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSongs = async (categoryId: number) => {
        if (expandedCategory === categoryId) {
            setExpandedCategory(null);
            return;
        }

        try {
            const response = await songService.getSongsByCategory(categoryId) as { data: Song[] };
            setSongs(response.data || []);
            setExpandedCategory(categoryId);
        } catch (error) {
            console.error("Failed to load songs:", error);
        }
    };

    // Search songs
    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await searchService.search(search);
                setSearchResults(response.data?.songs || []);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const toggleSong = (songId: number) => {
        const newSelected = new Set(selectedSongs);
        if (newSelected.has(songId)) {
            newSelected.delete(songId);
        } else {
            newSelected.add(songId);
        }
        setSelectedSongs(newSelected);
    };

    const handleSave = async () => {
        if (selectedSongs.size === 0) return;

        setIsSaving(true);
        try {
            await onAddSongs(Array.from(selectedSongs));
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to add songs:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const renderSongItem = (song: Song) => {
        const isSelected = selectedSongs.has(song.id);
        const isAlreadyInPlaylist = existingSongIds.includes(song.id);

        return (
            <button
                key={song.id}
                className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                    isAlreadyInPlaylist
                        ? "opacity-50 cursor-not-allowed"
                        : isSelected
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-gray-100"
                )}
                onClick={() => !isAlreadyInPlaylist && toggleSong(song.id)}
                disabled={isAlreadyInPlaylist}
            >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {song.thumbnail ? (
                        <Image
                            src={song.thumbnail}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-5 h-5 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sm text-gray-900 truncate">
                        {song.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {song.category?.name || "Unknown"}
                    </p>
                </div>
                {isAlreadyInPlaylist ? (
                    <span className="text-xs text-gray-400">Sudah ada</span>
                ) : isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
            </button>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>
                        Tambah Lagu ke {playlist?.name}
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Cari lagu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <ScrollArea className="h-100 pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : search.trim() ? (
                        // Search results
                        <div className="space-y-1">
                            {isSearching ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(renderSongItem)
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    Tidak ada hasil ditemukan
                                </p>
                            )}
                        </div>
                    ) : (
                        // Category view
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id}>
                                    <button
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                        onClick={() => loadSongs(category.id)}
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
                                            {songs.map(renderSongItem)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        {selectedSongs.size} lagu dipilih
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            Batal
                        </Button>
                        <Button
                            className="gradient-primary border-0"
                            onClick={handleSave}
                            disabled={selectedSongs.size === 0 || isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menambahkan...
                                </>
                            ) : (
                                `Tambah ${selectedSongs.size} Lagu`
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
