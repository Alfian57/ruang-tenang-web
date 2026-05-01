"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { SongCategory, Song } from "@/types";
import { cn } from "@/utils";
import { ArrowRight, Music, Play, Pause, ChevronDown } from "lucide-react";
import { songService } from "@/services/api";
import { getUploadUrl } from "@/services/http/upload-url";

interface MusicPlayerWidgetProps {
  categories: SongCategory[];
}

export function MusicPlayerWidget({ categories }: MusicPlayerWidgetProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [categorySongs, setCategorySongs] = useState<Record<number, Song[]>>({});
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCategoryClick = async (categoryId: number) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryId);

    if (!categorySongs[categoryId]) {
      try {
        const category = categories.find((c) => c.id === categoryId);
        const categoryKey = category?.slug || categoryId;
        const response = await songService.getSongsByCategory(categoryKey) as { data: Song[] };
        setCategorySongs(prev => ({ ...prev, [categoryId]: response.data || [] }));
      } catch (error) {
        console.error("Failed to load songs:", error);
        setCategorySongs(prev => ({ ...prev, [categoryId]: [] }));
      }
    }
  };

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setAudioProgress(0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const handleTimeUpdate = () => setAudioProgress(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    if (isPlaying) {
      audio.play().catch(console.error);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-linear-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Ruang Musik</h3>
              <p className="text-white/80 text-xs">Dengarkan musik relaksasi untuk menemanimu</p>
            </div>
          </div>
          <Link href={ROUTES.MUSIC}>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Audio Element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={getUploadUrl(currentSong.file_path)}
          preload="metadata"
        />
      )}

      {/* Now Playing Bar */}
      {currentSong && (
        <div className="bg-gray-900 px-4 py-3 text-white flex items-center gap-4 border-b-4 border-indigo-600">
          <button
            onClick={() => playSong(currentSong)}
            className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shrink-0 hover:bg-gray-100 transition-transform hover:scale-105"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate tracking-wide">{currentSong.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-gray-400 tabular-nums font-medium">{formatTime(audioProgress)}</span>
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 tabular-nums font-medium">{formatTime(audioDuration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="p-4 bg-gray-50/50 flex-1">
        <div className="grid grid-cols-1 gap-4 items-start xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(categories || []).slice(0, 8).map((cat) => {
            const isExpanded = expandedCategory === cat.id;

            return (
              <div key={cat.id} className="flex flex-col gap-2 h-full">
                {/* Category Card */}
                <div
                  className={cn(
                    "bg-white rounded-2xl overflow-hidden border transition-all duration-300 group flex flex-col w-full h-full relative",
                    isExpanded
                      ? "border-indigo-400 shadow-md ring-2 ring-indigo-400/20"
                      : "border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md cursor-pointer"
                  )}
                  onClick={() => !isExpanded && handleCategoryClick(cat.id)}
                >
                  {/* Top Image / Song List Area */}
                  <div className="aspect-square w-full relative bg-gray-50 overflow-hidden shrink-0">
                    {/* Image View (Visible when not expanded) */}
                    <div
                      className={cn(
                        "absolute inset-0 transition-all duration-500 z-10",
                        isExpanded ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
                      )}
                    >
                      {cat.thumbnail ? (
                        <Image
                          src={cat.thumbnail}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                          <Music className="w-10 h-10 text-indigo-300" />
                        </div>
                      )}
                      {/* Play icon overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
                        <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center shadow-lg">
                           <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    {/* Song List View (Visible when expanded) */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-white transition-all duration-500 z-20 flex flex-col",
                        isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                      )}
                    >
                      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-thumb-indigo-200">
                        {categorySongs[cat.id] === undefined && (
                          <div className="h-full flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-xs text-gray-500 font-medium tracking-wide">Memuat lagu...</p>
                          </div>
                        )}
                        {categorySongs[cat.id] !== undefined && categorySongs[cat.id].length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Music className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-xs text-gray-500">Kategori ini belum memiliki lagu</p>
                          </div>
                        )}
                        <div className="space-y-1 pb-2">
                          {categorySongs[cat.id]?.map((song) => {
                            const isSelected = currentSong?.id === song.id;
                            return (
                              <button
                                key={song.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSong(song);
                                }}
                                className={cn(
                                  "w-full text-left text-xs py-2.5 px-3 rounded-xl flex items-center gap-3 transition-all group/song border",
                                  isSelected
                                    ? "bg-indigo-50 text-indigo-700 font-bold border-indigo-200 shadow-none"
                                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 border-transparent hover:border-gray-100"
                                )}
                              >
                                <div className="shrink-0 w-6 h-6 rounded-full bg-white border shadow-xs flex items-center justify-center border-gray-100 group-hover/song:border-indigo-200 transition-colors">
                                  {isSelected && isPlaying ? (
                                    <div className="flex items-center gap-0.5 h-3">
                                      <div className="w-0.5 bg-indigo-500 h-1.5 animate-[ping_1s_ease-in-out_infinite]" />
                                      <div className="w-0.5 bg-indigo-500 h-3 animate-[ping_1.2s_ease-in-out_infinite]" />
                                      <div className="w-0.5 bg-indigo-500 h-2 animate-[ping_0.8s_ease-in-out_infinite]" />
                                    </div>
                                  ) : (
                                    <Play className={cn(
                                      "w-2.5 h-2.5 ml-0.5", 
                                      isSelected ? "text-indigo-500 fill-indigo-500" : "text-gray-400 group-hover/song:text-indigo-500"
                                    )} />
                                  )}
                                </div>
                                <span className="truncate flex-1 leading-relaxed">{song.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Footer Info */}
                  <div className="p-3.5 flex items-center justify-between border-t border-gray-100 bg-white z-30 relative shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className={cn("font-bold text-[15px] leading-tight transition-colors line-clamp-1", isExpanded ? "text-indigo-700" : "text-gray-800")}>
                        {cat.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{cat.song_count || 0} Lagu</p>
                    </div>
                    {isExpanded ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCategory(null);
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-600 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-rose-100 shrink-0 shadow-sm"
                      >
                        Batal
                      </button>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors shrink-0">
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
