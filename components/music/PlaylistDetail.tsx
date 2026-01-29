"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
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
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    GripVertical,
    Trash2,
    Music,
    ListMusic,
    ArrowLeft,
    MoreHorizontal,
    Plus,
    Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Playlist, PlaylistItem, Song } from "@/types";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";
import { cn } from "@/lib/utils";

interface SortableTrackProps {
    item: PlaylistItem;
    isPlaying: boolean;
    isCurrentSong: boolean;
    onPlay: () => void;
    onRemove: () => void;
}

function SortableTrack({
    item,
    isPlaying,
    isCurrentSong,
    onPlay,
    onRemove,
}: SortableTrackProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    const song = item.song;
    if (!song) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg transition-all",
                isDragging ? "bg-gray-100 shadow-lg" : "bg-white hover:bg-gray-50",
                isCurrentSong && "bg-primary/5 border border-primary/20"
            )}
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none p-1"
            >
                <GripVertical className="w-4 h-4 text-gray-400" />
            </button>

            {/* Thumbnail with play button */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {song.thumbnail ? (
                    <Image
                        src={song.thumbnail}
                        alt={song.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-gray-400" />
                    </div>
                )}
                <button
                    onClick={onPlay}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {isCurrentSong && isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                    ) : (
                        <Play className="w-5 h-5 text-white" />
                    )}
                </button>
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "font-medium truncate",
                    isCurrentSong ? "text-primary" : "text-gray-900"
                )}>
                    {song.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                    {song.category?.name || "Unknown"}
                </p>
            </div>

            {/* Playing indicator */}
            {isCurrentSong && isPlaying && (
                <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-primary rounded-full animate-pulse delay-150" />
                </div>
            )}

            {/* Remove button */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onPlay}>
                        <Play className="w-4 h-4 mr-2" />
                        Putar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={onRemove}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus dari playlist
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="w-20 h-20 rounded-xl overflow-hidden bg-linear-to-br from-purple-100 to-purple-200 shrink-0">
                    {playlist.thumbnail ? (
                        <Image
                            src={playlist.thumbnail}
                            alt={playlist.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ListMusic className="w-10 h-10 text-purple-500" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                        {playlist.name}
                    </h2>
                    {playlist.description && (
                        <p className="text-sm text-gray-500 truncate">
                            {playlist.description}
                        </p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                        {items.length} lagu
                    </p>
                </div>
            </div>

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
