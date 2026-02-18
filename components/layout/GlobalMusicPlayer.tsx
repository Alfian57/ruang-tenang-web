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

    // Handle song change (load source)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        // Construct source URL
        let src = currentSong.file_path;
        if (!src.startsWith("http")) {
             const apiUrl = env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
             const baseUrl = apiUrl.replace("/api/v1", "");
             src = `${baseUrl}${currentSong.file_path}`;
        }
        
        // Only reload if src actually changed to prevent loop
        if (audio.src !== src) {
            audio.src = src;
            audio.load();
        }
        
        // If we were already playing, try to play the new song
        // Note: This relies on the separate play/pause effect
    }, [currentSong]);

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

    const togglePlay = useCallback(() => {
        setIsPlaying(!isPlaying);
    }, [isPlaying, setIsPlaying]);

    // Media Session API Integration
    useEffect(() => {
        if (!("mediaSession" in navigator) || !currentSong) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: "Ruang Tenang",
            album: "Ruang Tenang",
            artwork: currentSong.thumbnail
                ? [{ src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" }]
                : undefined,
        });

        navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious());
        navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
        navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.seekTime && audioRef.current) {
                audioRef.current.currentTime = details.seekTime;
                setCurrentTime(details.seekTime);
            }
        });

        return () => {
             // Cleanup if needed, though usually overwriting handlers is enough
        };
    }, [currentSong, setIsPlaying, playPrevious, playNext, setCurrentTime]);

    // Update Media Session playback state
    useEffect(() => {
        if (!("mediaSession" in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }, [isPlaying]);

    // Handle play/pause with Autoplay Policy
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        if (isPlaying) {
             const playPromise = audio.play();
             if (playPromise !== undefined) {
                 playPromise.catch((error) => {
                     console.warn("Autoplay prevented:", error);
                     // If autoplay is blocked, revert state to paused
                     setIsPlaying(false);
                 });
             }
        } else {
            audio.pause();
        }
    }, [isPlaying, currentSong, setIsPlaying]);

    return (
        <>
            <audio ref={audioRef} />
            <AnimatePresence>
                {isPlayerVisible && currentSong && (
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
