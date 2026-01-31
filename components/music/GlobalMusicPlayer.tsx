"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
    ChevronUp,
    Music,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusicPlayerStore } from "@/stores/musicPlayerStore";
import { cn } from "@/lib/utils";

// Format time in mm:ss
const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function GlobalMusicPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        queueIndex,
        playbackSource,
        shuffle,
        repeatMode,
        isPlayerVisible,
        isMinimized,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleRepeat,
        toggleMinimize,
        hidePlayer,
    } = useMusicPlayerStore();

    // Handle audio element events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleDurationChange = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            playNext();
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
        };
    }, [setCurrentTime, setDuration, setIsPlaying, playNext]);

    // Handle song change
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        if (currentSong.file_path.startsWith("http")) {
            audio.src = currentSong.file_path;
        } else {
            // Ensure we use the correct API URL
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
            // Remove /api/v1 if it exists in the path to avoid duplication
            // However, usually file_path might be /uploads/... or /api/v1/stream...
            // If it starts with /, we append it to the base URL (minus /api/v1 if it's there? No, usually API_URL includes /api/v1)
            // Let's check how images are handled. They usually strip /api/v1.
            const baseUrl = apiUrl.replace("/api/v1", "");
            audio.src = `${baseUrl}${currentSong.file_path}`;
        }
        audio.load();

        // We check the store's isPlaying state when song changes
        const store = useMusicPlayerStore.getState();
        if (store.isPlaying) {
            audio.play().catch(console.error);
        }
    }, [currentSong]);

    // Handle play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        if (isPlaying) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [isPlaying, currentSong]);

    // Handle volume change
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    // Handle seek
    const handleSeek = useCallback((value: number[]) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = value[0];
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    }, [setCurrentTime]);

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        setIsPlaying(!isPlaying);
    }, [isPlaying, setIsPlaying]);

    // Get repeat icon
    const getRepeatIcon = () => {
        switch (repeatMode) {
            case "one":
                return <Repeat1 className="w-4 h-4" />;
            default:
                return <Repeat className="w-4 h-4" />;
        }
    };

    if (!isPlayerVisible || !currentSong) return (
        <audio ref={audioRef} preload="metadata" />
    );

    return (
        <>
            {/* Hidden audio element */}
            <audio ref={audioRef} preload="metadata" />

            <AnimatePresence>
                {isPlayerVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg",
                            "lg:left-56" // Account for sidebar on desktop
                        )}
                    >
                        {/* Minimized Player */}
                        {isMinimized ? (
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
                                            {playbackSource?.name || currentSong.category?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={playPrevious}
                                    >
                                        <SkipBack className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        className="h-10 w-10 rounded-full gradient-primary"
                                        onClick={togglePlay}
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
                                        onClick={playNext}
                                    >
                                        <SkipForward className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={toggleMinimize}
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Full Player */
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
                                        onValueChange={handleSeek}
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
                                                {playbackSource?.name || currentSong.category?.name}
                                            </p>
                                            {queue.length > 1 && (
                                                <p className="text-xs text-gray-400">
                                                    {queueIndex + 1} / {queue.length}
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
                                            onClick={toggleShuffle}
                                        >
                                            <Shuffle className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={playPrevious}
                                        >
                                            <SkipBack className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            className="h-12 w-12 rounded-full gradient-primary border-0"
                                            onClick={togglePlay}
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
                                            onClick={playNext}
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
                                            onClick={toggleRepeat}
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
                                            onClick={toggleMute}
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
                                            onValueChange={(value: number[]) => setVolume(value[0] / 100)}
                                            className="flex-1"
                                        />
                                    </div>

                                    {/* Minimize/Close buttons */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={toggleMinimize}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                            onClick={hidePlayer}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
