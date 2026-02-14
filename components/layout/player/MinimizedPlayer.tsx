"use client";

import Image from "next/image";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    ChevronUp,
    Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/types/song";

interface MinimizedPlayerProps {
    currentSong: Song;
    playbackSourceName?: string;
    isPlaying: boolean;
    onPlayPrevious: () => void;
    onTogglePlay: () => void;
    onPlayNext: () => void;
    onToggleMinimize: () => void;
}

export function MinimizedPlayer({
    currentSong,
    playbackSourceName,
    isPlaying,
    onPlayPrevious,
    onTogglePlay,
    onPlayNext,
    onToggleMinimize,
}: MinimizedPlayerProps) {
    return (
        <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {currentSong.thumbnail ? (
                        <Image
                            src={currentSong.thumbnail}
                            alt={currentSong.title}
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
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">
                        {currentSong.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {playbackSourceName || currentSong.category?.name}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onPlayPrevious}
                >
                    <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                    size="icon"
                    className="h-10 w-10 rounded-full gradient-primary"
                    onClick={onTogglePlay}
                >
                    {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                    ) : (
                        <Play className="w-5 h-5 text-white" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onPlayNext}
                >
                    <SkipForward className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onToggleMinimize}
                >
                    <ChevronUp className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
