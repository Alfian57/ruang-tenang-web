"use client";

import { useState } from "react";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    Play,
    MoreHorizontal,
    Edit2,
    Trash2,
    ListMusic,
    Globe,
    Lock,
    BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaylistListItem } from "@/types";
import { cn } from "@/utils";

interface PlaylistCardProps {
    playlist: PlaylistListItem;
    onPlay?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    isSelected?: boolean;
}

export function PlaylistCard({
    playlist,
    onPlay,
    onEdit,
    onDelete,
    onClick,
    isSelected,
}: PlaylistCardProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                "group relative bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary"
            )}
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-linear-to-br from-purple-100 to-purple-200 shrink-0">
                    {playlist.thumbnail && !imgError ? (
                        <Image
                            src={playlist.thumbnail}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-50">
                            <ListMusic className="w-8 h-8 text-purple-300" />
                        </div>
                    )}

                    {/* Play overlay */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPlay?.();
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary fill-primary" />
                        </div>
                    </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{playlist.name}</h3>
                        {playlist.is_admin_playlist ? (
                            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                        ) : playlist.is_public ? (
                            <Globe className="w-4 h-4 text-gray-400" />
                        ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        {playlist.item_count} lagu
                    </p>
                    {playlist.description && (
                        <p className="text-sm text-gray-400 truncate mt-1">
                            {playlist.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPlay?.(); }}>
                            <Play className="w-4 h-4 mr-2" />
                            Putar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}

// Compact version for sidebar or small lists
interface PlaylistItemCompactProps {
    playlist: PlaylistListItem;
    onPlay?: () => void;
    onClick?: () => void;
    isActive?: boolean;
}

export function PlaylistCardCompact({
    playlist,
    onPlay,
    onClick,
    isActive,
}: PlaylistItemCompactProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                isActive ? "bg-primary/10" : "hover:bg-gray-100"
            )}
            onClick={onClick}
        >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-linear-to-br from-purple-100 to-purple-200 shrink-0">
                {playlist.thumbnail && !imgError ? (
                    <Image
                        src={playlist.thumbnail}
                        alt={playlist.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-50">
                        <ListMusic className="w-5 h-5 text-purple-300" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{playlist.name}</p>
                <p className="text-xs text-gray-500">{playlist.item_count} lagu</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                    e.stopPropagation();
                    onPlay?.();
                }}
            >
                <Play className="w-4 h-4" />
            </Button>
        </div>
    );
}
