"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import {
    Play,
    ListMusic,
    Plus,
    Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playlist, PlaylistItem, Song } from "@/types";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { SortableTrack } from "./SortableTrack";
import { PlaylistHeader } from "./PlaylistHeader";

interface PlaylistDetailProps {
    playlist: Playlist;
    onBack: () => void;
    onReorder: (itemIds: number[]) => Promise<void>;
    onRemoveItem: (itemId: number) => Promise<void>;
    onAddSongs: () => void;
}

export function PlaylistDetail({
    playlist,
    onBack,
    onReorder,
    onRemoveItem,
    onAddSongs,
}: PlaylistDetailProps) {
    const [items, setItems] = useState<PlaylistItem[]>(
        playlist.items?.sort((a, b) => a.position - b.position) || []
    );
    const [isReordering, setIsReordering] = useState(false);

    const {
        currentSong,
        isPlaying,
        playPlaylist,
        playSong,
        setIsPlaying,
    } = useMusicPlayerStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Update items when playlist changes
    useState(() => {
        setItems(playlist.items?.sort((a, b) => a.position - b.position) || []);
    });

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);

            // Save new order to backend
            setIsReordering(true);
            try {
                await onReorder(newItems.map((item) => item.id));
            } catch (error) {
                // Revert on error
                setItems(items);
                console.error("Failed to reorder:", error);
            } finally {
                setIsReordering(false);
            }
        }
    }, [items, onReorder]);

    const handlePlayAll = useCallback(() => {
        playPlaylist(playlist);
    }, [playlist, playPlaylist]);

    const handlePlaySong = useCallback((index: number) => {
        const songs = items
            .map((item) => item.song)
            .filter((song): song is Song => song !== undefined);

        const song = songs[index];
        if (!song) return;

        // If same song, toggle play
        if (currentSong?.id === song.id) {
            setIsPlaying(!isPlaying);
        } else {
            playSong(song, songs, {
                type: "playlist",
                id: playlist.id,
                name: playlist.name,
            });
        }
    }, [items, currentSong, isPlaying, playlist, playSong, setIsPlaying]);

    const handleRemoveItem = useCallback(async (itemId: number) => {
        // Optimistic update
        const prevItems = [...items];
        setItems(items.filter((item) => item.id !== itemId));

        try {
            await onRemoveItem(itemId);
        } catch (error) {
            // Revert on error
            setItems(prevItems);
            console.error("Failed to remove item:", error);
        }
    }, [items, onRemoveItem]);

    const handleShufflePlay = useCallback(() => {
        const songs = items
            .map((item) => item.song)
            .filter((song): song is Song => song !== undefined);

        if (songs.length === 0) return;

        // Shuffle songs
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        const firstSong = shuffled[0];

        playSong(firstSong, shuffled, {
            type: "playlist",
            id: playlist.id,
            name: playlist.name,
        });
    }, [items, playlist, playSong]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <PlaylistHeader
                playlist={playlist}
                onBack={onBack}
                itemCount={items.length}
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button
                    className="gradient-primary border-0"
                    onClick={handlePlayAll}
                    disabled={items.length === 0}
                >
                    <Play className="w-4 h-4 mr-2" />
                    Putar Semua
                </Button>
                <Button
                    variant="outline"
                    onClick={handleShufflePlay}
                    disabled={items.length === 0}
                >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Acak
                </Button>
                <Button variant="outline" onClick={onAddSongs}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Lagu
                </Button>
            </div>

            {/* Track list */}
            {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <ListMusic className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">Playlist ini masih kosong</p>
                    <Button variant="outline" onClick={onAddSongs}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Lagu
                    </Button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            <AnimatePresence>
                                {items.map((item, index) => (
                                    <SortableTrack
                                        key={item.id}
                                        item={item}
                                        isPlaying={isPlaying}
                                        isCurrentSong={currentSong?.id === item.song?.id}
                                        onPlay={() => handlePlaySong(index)}
                                        onRemove={() => handleRemoveItem(item.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Reordering indicator */}
            {isReordering && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm">
                    Menyimpan urutan...
                </div>
            )}
        </div>
    );
}
