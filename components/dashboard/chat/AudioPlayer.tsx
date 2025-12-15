"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { getUploadUrl } from "@/lib/api";

interface AudioPlayerProps {
  src: string;
  /** Apply inverted style for user messages on dark background */
  inverted?: boolean;
}

/**
 * A compact audio player with play/pause toggle, progress bar, and time display.
 */
export function AudioPlayer({ src, inverted = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-xl min-w-[200px] ${
        inverted ? "bg-white/20" : "bg-gray-100/50"
      }`}
    >
      <audio ref={audioRef} src={getUploadUrl(src)} preload="metadata" />
      
      <Button
        size="icon"
        variant="ghost"
        className={`w-8 h-8 rounded-full shadow-sm transition-colors ${
          inverted 
            ? "bg-white/30 hover:bg-white/40 text-white" 
            : "bg-white hover:bg-gray-50"
        }`}
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className={`w-4 h-4 ${inverted ? "text-white" : "text-primary"}`} />
        ) : (
          <Play className={`w-4 h-4 ml-0.5 ${inverted ? "text-white" : "text-primary"}`} />
        )}
      </Button>

      <div className="flex-1 space-y-1">
        {/* Progress bar */}
        <div className={`h-1 rounded-full w-full overflow-hidden ${
          inverted ? "bg-white/30" : "bg-gray-200"
        }`}>
          <div
            className={`h-full transition-all duration-100 ${
              inverted ? "bg-white" : "bg-primary"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Time display */}
        <div className={`flex justify-between text-[10px] font-medium ${
          inverted ? "text-white/70" : "text-gray-400"
        }`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
