"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Play,
    Pause,
    GripVertical,
    Trash2,
    Music,
    MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaylistItem } from "@/types";
import { cn } from "@/utils";

interface SortableTrackProps {
    item: PlaylistItem;
    isPlaying: boolean;
    isCurrentSong: boolean;
    onPlay: () => void;
    onRemove: () => void;
}

export function SortableTrack({
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
