"use client";


import Image from "next/image";
import { Music, Check } from "lucide-react";
import { cn } from "@/utils";
import { Song } from "@/types";

interface SongItemProps {
    song: Song;
    isSelected: boolean;
    isAlreadyInPlaylist: boolean;
    onToggle: (songId: number) => void;
}

export function SongItem({ song, isSelected, isAlreadyInPlaylist, onToggle }: SongItemProps) {
    return (
        <button
            className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                isAlreadyInPlaylist
                    ? "opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-gray-100"
            )}
            onClick={() => !isAlreadyInPlaylist && onToggle(song.id)}
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
}
