"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { Playlist } from "@/types";
import { useAddSongs } from "../_hooks/useAddSongs";
import { CategoryList } from "./CategoryList";
import { SongItem } from "./SongItem";

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
    const {
        categories,
        songs,
        expandedCategory,
        selectedSongs,
        isLoading,
        isSaving,
        search,
        searchResults,
        isSearching,
        setSearch,
        loadSongs,
        toggleSong,
        handleSave,
    } = useAddSongs({ open, onAddSongs, onOpenChange });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Tambah Lagu ke {playlist?.name}</DialogTitle>
                </DialogHeader>

                {/* Sticky Search Input */}
                <div className="relative mt-2 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Cari lagu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-hidden min-h-0 mt-4">
                    <ScrollArea className="h-full pr-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : search.trim() ? (
                            <div className="space-y-1 pb-4">
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
                                            onToggle={toggleSong}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        Tidak ada hasil ditemukan
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="pb-4">
                                <CategoryList
                                    categories={categories}
                                    songs={songs}
                                    expandedCategory={expandedCategory}
                                    selectedSongs={selectedSongs}
                                    existingSongIds={existingSongIds}
                                    onToggleCategory={loadSongs}
                                    onToggleSong={toggleSong}
                                />
                            </div>
                        )}
                    </ScrollArea>
                </div>

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
