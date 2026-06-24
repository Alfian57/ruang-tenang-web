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
    Music,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils";
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
        <div className="py-2 px-3 md:px-4">
            <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-2 md:gap-4">
                {/* Left: Album Info */}
                <div className="flex items-center gap-3 w-[30%] min-w-0 shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden theme-placeholder-bg shrink-0">
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
                                <Music className="w-5 h-5 text-primary" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {currentSong.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                            {playbackSourceName || currentSong.category?.name}
                        </p>
                    </div>
                </div>

                {/* Center: Controls & Progress */}
                <div className="flex items-center justify-center flex-1 gap-2 md:gap-4 min-w-0">
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 hidden lg:flex", shuffle && "text-primary")}
                            onClick={onToggleShuffle}
                        >
                            <Shuffle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPlayPrevious}>
                            <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full gradient-primary border-0 shrink-0"
                            onClick={onTogglePlay}
                        >
                            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPlayNext}>
                            <SkipForward className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 hidden lg:flex", repeatMode !== "off" && "text-primary")}
                            onClick={onToggleRepeat}
                        >
                            {getRepeatIcon()}
                        </Button>
                    </div>

                    <div className="hidden md:flex items-center gap-2 w-full max-w-md">
                        <span className="text-xs text-gray-500 w-9 text-right shrink-0">
                            {formatTime(currentTime)}
                        </span>
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={1}
                            onValueChange={onSeek}
                            className="flex-1"
                        />
                        <span className="text-xs text-gray-500 w-9 shrink-0">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Right: Volume & Actions */}
                <div className="flex items-center justify-end gap-2 w-[30%] min-w-0 shrink-0">
                    <div className="hidden md:flex items-center gap-2 w-28">
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onToggleMute}>
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
                    <div className="flex items-center shrink-0 md:ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={onHidePlayer}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Progress Bar (Absolute Top or Bottom) */}
            <div className="md:hidden absolute top-0 left-0 right-0 -mt-2 px-2">
                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={onSeek}
                    className="w-full"
                />
            </div>
        </div>
    );
}
