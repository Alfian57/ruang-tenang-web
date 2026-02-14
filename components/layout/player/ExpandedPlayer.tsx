"use client";

import Image from "next/image";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Repeat1,
    Shuffle,
    ChevronDown,
    Music,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Song } from "@/types/song";

// Format time in mm:ss
const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface ExpandedPlayerProps {
    currentSong: Song;
    playbackSourceName?: string;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    queueLength: number;
    queueIndex: number;
    shuffle: boolean;
    repeatMode: "off" | "all" | "one";
    onSeek: (value: number[]) => void;
    onTogglePlay: () => void;
    onPlayPrevious: () => void;
    onPlayNext: () => void;
    onToggleShuffle: () => void;
    onToggleRepeat: () => void;
    onToggleMute: () => void;
    onVolumeChange: (value: number) => void;
    onToggleMinimize: () => void;
    onHidePlayer: () => void;
}

export function ExpandedPlayer({
    currentSong,
    playbackSourceName,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queueLength,
    queueIndex,
    shuffle,
    repeatMode,
    onSeek,
    onTogglePlay,
    onPlayPrevious,
    onPlayNext,
    onToggleShuffle,
    onToggleRepeat,
    onToggleMute,
    onVolumeChange,
    onToggleMinimize,
    onHidePlayer,
}: ExpandedPlayerProps) {
    // Get repeat icon
    const getRepeatIcon = () => {
        switch (repeatMode) {
            case "one":
                return <Repeat1 className="w-4 h-4" />;
            default:
                return <Repeat className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-4">
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-gray-500 w-10 text-right">
                    {formatTime(currentTime)}
                </span>
                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={onSeek}
                    className="flex-1"
                />
                <span className="text-xs text-gray-500 w-10">
                    {formatTime(duration)}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Song info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-linear-to-br from-red-100 to-red-200 shrink-0">
                        {currentSong.thumbnail ? (
                            <Image
                                src={currentSong.thumbnail}
                                alt={currentSong.title}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-6 h-6 text-primary" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                            {currentSong.title}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                            {playbackSourceName || currentSong.category?.name}
                        </p>
                        {queueLength > 1 && (
                            <p className="text-xs text-gray-400">
                                {queueIndex + 1} / {queueLength}
                            </p>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 hidden sm:flex",
                            shuffle && "text-primary"
                        )}
                        onClick={onToggleShuffle}
                    >
                        <Shuffle className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={onPlayPrevious}
                    >
                        <SkipBack className="w-5 h-5" />
                    </Button>
                    <Button
                        size="icon"
                        className="h-12 w-12 rounded-full gradient-primary border-0"
                        onClick={onTogglePlay}
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                        ) : (
                            <Play className="w-6 h-6 text-white" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={onPlayNext}
                    >
                        <SkipForward className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 hidden sm:flex",
                            repeatMode !== "off" && "text-primary"
                        )}
                        onClick={onToggleRepeat}
                    >
                        {getRepeatIcon()}
                    </Button>
                </div>

                {/* Volume & Actions */}
                <div className="hidden md:flex items-center gap-3 w-40">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onToggleMute}
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-gray-400" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-gray-400" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={(value: number[]) => onVolumeChange(value[0] / 100)}
                        className="flex-1"
                    />
                </div>

                {/* Minimize/Close buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onToggleMinimize}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        onClick={onHidePlayer}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
