"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, ChevronDown, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { SongCategory, Song } from "@/types";
import { cn } from "@/lib/utils";

export default function MusicPage() {
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SongCategory | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.getSongCategories() as { data: SongCategory[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadSongs = async (category: SongCategory) => {
    setSelectedCategory(category);
    setExpandedCategory(expandedCategory === category.id ? null : category.id);
    try {
      const response = await api.getSongsByCategory(category.id) as { data: Song[] };
      setSongs(response.data || []);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  };

  useEffect(() => {
    // If searching, fetch songs from search API
    if (debouncedSearch) {
      const doSearch = async () => {
        setIsLoading(true);
        try {
          // Assuming api.search returns generic search results, we might need to filter or if backend supports song search
          // The search endpoint returns { articles: [], songs: [] }
          const response = await api.search(debouncedSearch);
          setSongs(response.data?.songs || []);
          setSelectedCategory(null); // Clear selected category when searching
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      };
      doSearch();
    } else {
      // If search cleared, reset (optional: reload categories or clear songs)
      setSongs([]);
      loadCategories();
    }
  }, [debouncedSearch, loadCategories]);

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = song.file_path;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  const playPrev = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  };

  return (
    <div className="p-4 lg:p-6 pb-32">
      <audio
        ref={audioRef}
        onEnded={playNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Biarkan Musik Menenangkan Harimu</h1>
        <p className="text-gray-500">
          Putar musik pilihan untuk bantu kamu melepas stres, mengatur napas, dan kembali fokus.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari musik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Search Results or Categories */}
      {debouncedSearch ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Hasil Pencarian</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : songs.length > 0 ? (
            <div className="grid gap-2">
              {songs.map((song) => (
                <Card key={song.id} className="overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                       {song.thumbnail ? (
                        <Image src={song.thumbnail} alt={song.title} fill className="object-cover" />
                       ) : (
                         <Music className="w-6 h-6 text-gray-400" />
                       )}
                       <button
                         onClick={() => playSong(song)}
                         className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                       >
                         {currentSong?.id === song.id && isPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                         ) : (
                            <Play className="w-6 h-6 text-white" />
                         )}
                       </button>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 line-clamp-1">{song.title}</h4>
                      <p className="text-xs text-gray-500">
                        {categories.find(c => c.id === song.category_id)?.name || "Musik"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
               Tidak ada lagu yang ditemukan
             </div>
          )}
        </div>
      ) : (
      /* Music Categories Accordion */
      <div className="space-y-3">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Category Header */}
                <button
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() => loadSongs(category)}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center shrink-0">
                    {category.thumbnail ? (
                      <Image
                        src={category.thumbnail}
                        alt={category.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.song_count || 0} Lagu</p>
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-gray-400 transition-transform",
                    expandedCategory === category.id && "rotate-180"
                  )} />
                </button>

                {/* Songs List */}
                {expandedCategory === category.id && (
                  <div className="border-t bg-gray-50 p-3 space-y-2">
                    {songs.map((song) => (
                      <button
                        key={song.id}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                          currentSong?.id === song.id
                            ? "bg-red-50 border border-primary/20"
                            : "bg-white hover:bg-gray-100"
                        )}
                        onClick={() => playSong(song)}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          currentSong?.id === song.id ? "bg-primary" : "bg-gray-100"
                        )}>
                          {currentSong?.id === song.id && isPlaying ? (
                            <Pause className={cn(
                              "w-5 h-5",
                              currentSong?.id === song.id ? "text-white" : "text-gray-500"
                            )} />
                          ) : (
                            <Play className={cn(
                              "w-5 h-5",
                              currentSong?.id === song.id ? "text-white" : "text-gray-500"
                            )} />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{song.title}</p>
                        </div>
                        {currentSong?.id === song.id && (
                          <span className="text-xs text-primary">0:00 - 01:25</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      )}

      {/* Player Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-56 h-20 bg-white border-t shadow-lg px-4 flex items-center gap-4 z-50">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center shrink-0 overflow-hidden">
              {currentSong.thumbnail ? (
                <Image
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{currentSong.title}</h4>
              <p className="text-sm text-gray-500 truncate">
                {selectedCategory?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={playPrev}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="w-14 h-14 rounded-full gradient-primary border-0"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext}>
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-3 w-40">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-primary rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
