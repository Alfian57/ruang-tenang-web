"use client";
import { env } from "@/config/env";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { cn } from "@/utils";
import { MinimizedPlayer } from "./player/MinimizedPlayer";
import { ExpandedPlayer } from "./player/ExpandedPlayer";

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
            const apiUrl = env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
            // Remove /api/v1 if it exists in the path to avoid duplication
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
                            <MinimizedPlayer
                                currentSong={currentSong}
                                playbackSourceName={playbackSource?.name}
                                isPlaying={isPlaying}
                                onPlayPrevious={playPrevious}
                                onTogglePlay={togglePlay}
                                onPlayNext={playNext}
                                onToggleMinimize={toggleMinimize}
                            />
                        ) : (
                            /* Full Player */
                            <ExpandedPlayer
                                currentSong={currentSong}
                                playbackSourceName={playbackSource?.name}
                                isPlaying={isPlaying}
                                currentTime={currentTime}
                                duration={duration}
                                volume={volume}
                                isMuted={isMuted}
                                queueLength={queue.length}
                                queueIndex={queueIndex}
                                shuffle={shuffle}
                                repeatMode={repeatMode}
                                onSeek={handleSeek}
                                onTogglePlay={togglePlay}
                                onPlayPrevious={playPrevious}
                                onPlayNext={playNext}
                                onToggleShuffle={toggleShuffle}
                                onToggleRepeat={toggleRepeat}
                                onToggleMute={toggleMute}
                                onVolumeChange={setVolume}
                                onToggleMinimize={toggleMinimize}
                                onHidePlayer={hidePlayer}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
