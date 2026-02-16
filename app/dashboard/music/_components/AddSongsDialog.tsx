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
import { Loader2 } from "lucide-react";
import { Playlist } from "@/types";
import { useAddSongs } from "../_hooks/useAddSongs";
import { SongSearch } from "./SongSearch";
import { CategoryList } from "./CategoryList";

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
            <DialogContent className="sm:max-w-lg max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Tambah Lagu ke {playlist?.name}</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <SongSearch
                    search={search}
                    setSearch={setSearch}
                    isLoading={false} // Loading handled inside if only search is loading, but here we separate
                    isSearching={isSearching}
                    searchResults={searchResults}
                    selectedSongs={selectedSongs}
                    existingSongIds={existingSongIds}
                    onToggleSong={toggleSong}
                />

                <ScrollArea className="h-100 pr-4 mt-2">
                    {isLoading ? (
                         <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : !search.trim() ? (
                        <CategoryList
                            categories={categories}
                            songs={songs}
                            expandedCategory={expandedCategory}
                            selectedSongs={selectedSongs}
                            existingSongIds={existingSongIds}
                            onToggleCategory={loadSongs}
                            onToggleSong={toggleSong}
                        />
                    ) : null}
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
