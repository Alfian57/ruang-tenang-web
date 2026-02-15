"use client";
import { env } from "@/config/env";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { breathingService, moodService, songService, journalService, articleService } from "@/services/api";
import { UserMood, SongCategory, Song, Journal, Article } from "@/types";
import { BreathingWidgetData } from "@/types/breathing";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  Music,
  Play,
  Pause,
  Sparkles,
  Calendar,
} from "lucide-react";
import { BreathingWidget } from "@/app/dashboard/breathing/_components";
import { useDashboardStore } from "@/store/dashboardStore";
import { MoodCalendar } from "./MoodCalendar";
import { QuickJournalWidget } from "./widgets/QuickJournalWidget";
import { MoodInsightWidget } from "./widgets/MoodInsightWidget";
import { RecommendedArticlesWidget } from "./widgets/RecommendedArticlesWidget";
import { ConsultationPromoWidget } from "./widgets/ConsultationPromoWidget";

export function MemberDashboard() {
  const { user, token } = useAuthStore();
  const [moodHistory, setMoodHistory] = useState<UserMood[]>([]);
  const [categories, setCategories] = useState<SongCategory[]>([]);
  
  // New Widget States
  const [latestJournal, setLatestJournal] = useState<Journal | null>(null);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);

  // Breathing widget state
  const [breathingWidgetData, setBreathingWidgetData] = useState<BreathingWidgetData | null>(null);

  // Music player states
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [categorySongs, setCategorySongs] = useState<Record<number, Song[]>>({});
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { moodRefreshTrigger } = useDashboardStore();

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setIsLoadingWidgets(true);
    try {
      // Load all data in parallel
      const [moodRes, categoriesRes, breathingWidgetRes, journalRes, articlesRes] = await Promise.all([
        moodService.getHistory(token, { limit: 100 }).catch(() => null) as Promise<{ data: { moods: UserMood[] } } | null>,
        songService.getCategories().catch(() => null) as Promise<{ data: SongCategory[] } | null>,
        breathingService.getWidgetData(token).catch(() => null) as Promise<{ data: BreathingWidgetData } | null>,
        journalService.list(token, { limit: 1 }).catch(() => null) as Promise<{ data: any } | null>,
        articleService.getArticles({ limit: 3 }).catch(() => null) as Promise<{ data: Article[] } | null>,
      ]);

      if (moodRes?.data?.moods) {
        setMoodHistory(moodRes.data.moods);
      }

      if (categoriesRes?.data) {
        setCategories(categoriesRes.data);
      }
      if (breathingWidgetRes?.data) {
        setBreathingWidgetData(breathingWidgetRes.data);
      }
      
      if (journalRes?.data) {
          // Handle potential paginated response or array
          const journals = Array.isArray(journalRes.data) ? journalRes.data : (journalRes.data as any).data;
          if (Array.isArray(journals) && journals.length > 0) {
              setLatestJournal(journals[0]);
          }
      }
      
      if (articlesRes?.data) {
        // Handle potential paginated response or array
        const articles = Array.isArray(articlesRes.data) ? articlesRes.data : (articlesRes.data as any).data;
        if (Array.isArray(articles)) {
             setRecommendedArticles(articles);
        }
      }

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoadingWidgets(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, moodRefreshTrigger]);

  // Music Player Logic
  const handleCategoryClick = async (categoryId: number) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryId);

    if (!categorySongs[categoryId]) {
      try {
        const response = await songService.getSongsByCategory(categoryId) as { data: Song[] };
        if (response.data) {
          setCategorySongs(prev => ({ ...prev, [categoryId]: response.data }));
        }
      } catch (error) {
        console.error("Failed to load songs:", error);
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
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 space-y-8">
      
      {/* 1. Welcoming Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
             Halo, <span className="text-primary">{user?.name?.split(" ")[0] || "Teman"}!</span> 👋
           </h1>
           <p className="text-gray-500 mt-1 text-lg">
             Bagaimana perasaanmu hari ini? Luangkan waktu sejenak untuk dirimu.
           </p>
        </div>
        <div className="flex items-center gap-3">
            <Link href={ROUTES.JOURNAL}>
                <Button variant="outline" className="rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors gap-2">
                   <Calendar className="w-4 h-4" />
                   Tulis Jurnal
                </Button>
            </Link>
            <Link href={ROUTES.CHAT}>
                <Button className="rounded-full shadow-lg hover:shadow-xl transition-all gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 border-0">
                    <Sparkles className="w-4 h-4" />
                    Teman Cerita AI
                </Button>
            </Link>
        </div>
      </div>


      {/* 2. Main Dashboard Grid (Bento Box Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Widgets & Mood Calendar */}
        <div className="md:col-span-8 space-y-6">
            
            {/* Top Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-full">
                    <QuickJournalWidget latestJournal={latestJournal} isLoading={isLoadingWidgets} />
                </div>
                <div className="h-full">
                    <MoodInsightWidget moods={moodHistory} isLoading={isLoadingWidgets} />
                </div>
            </div>

            {/* Consultation Promo */}
            <ConsultationPromoWidget />

            {/* Mood Calendar Section */}
            <MoodCalendar moods={moodHistory} />
        </div>

        {/* Right Column: Widgets */}
        <div className="md:col-span-4 space-y-6">
             {/* Recommended Articles */}
             <RecommendedArticlesWidget articles={recommendedArticles} isLoading={isLoadingWidgets} />
            
            {/* Breathing Widget */}
            {breathingWidgetData && (
                <div className="transform hover:scale-[1.02] transition-transform duration-300">
                    <BreathingWidget data={breathingWidgetData} />
                </div>
            )}

            {/* Music Player Widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Music className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-bold text-lg">Ruang Musik</h3>
                        </div>
                        <Link href={ROUTES.MUSIC}>
                           <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                               <ArrowRight className="w-4 h-4" />
                           </Button>
                        </Link>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-2">
                        Dengarkan musik relaksasi untuk menemanimu
                    </p>
                </div>

                {/* Audio Player (Hidden functionality) */}
                {currentSong && (
                  <audio
                    ref={audioRef}
                    src={currentSong.file_path.startsWith("http") ? currentSong.file_path : `${env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:8080"}${currentSong.file_path}`}
                    preload="metadata"
                  />
                )}
                
                {/* Now Playing Bar (Mini) */}
                {currentSong && (
                  <div className="bg-gray-900 p-3 text-white flex items-center gap-3">
                      <button
                        onClick={() => playSong(currentSong)}
                        className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="currentColor" />}
                      </button>
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{currentSong.title}</p>
                          <div className="text-xs text-white/50 flex justify-between mt-0.5">
                              <span>{formatTime(audioProgress)}</span>
                              <span>{formatTime(audioDuration)}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1 w-full bg-white/20 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-white/80 rounded-full" 
                                style={{ width: `${(audioProgress / audioDuration) * 100}%`}}
                              />
                          </div>
                      </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
                    {(categories || []).slice(0, 5).map((cat) => (
                        <div key={cat.id} className="group">
                             <button
                                onClick={() => handleCategoryClick(cat.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-xl transition-all",
                                    expandedCategory === cat.id ? "bg-indigo-50 border-indigo-100" : "hover:bg-gray-50 border border-transparent"
                                )}
                             >
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                    {cat.thumbnail ? (
                                        <Image src={cat.thumbnail} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <Music className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={cn("text-sm font-semibold", expandedCategory === cat.id ? "text-indigo-700" : "text-gray-700")}>
                                        {cat.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{cat.song_count || 0} Lagu</p>
                                </div>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-gray-400 transition-transform duration-300",
                                    expandedCategory === cat.id && "rotate-180 text-indigo-500"
                                )} />
                             </button>

                             {/* Songs Dropdown */}
                             <div className={cn(
                                 "grid transition-all duration-300 ease-in-out overflow-hidden",
                                 expandedCategory === cat.id ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                             )}>
                                 <div className="min-h-0 pl-4 space-y-1 border-l-2 border-indigo-100 ml-6">
                                     {categorySongs[cat.id]?.map((song) => (
                                         <button
                                            key={song.id}
                                            onClick={() => playSong(song)}
                                            className={cn(
                                                "w-full text-left text-sm py-2 px-3 rounded-lg flex items-center gap-2 group/song",
                                                currentSong?.id === song.id ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                                            )}
                                         >
                                            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                                {currentSong?.id === song.id && isPlaying ? (
                                                     <div className="w-2 h-2 bg-indigo-500 rounded-sm animate-pulse" />
                                                ) : (
                                                     <Play className="w-3 h-3 text-gray-400 group-hover/song:text-indigo-500 ml-0.5" />
                                                )}
                                            </div>
                                            <span className="truncate">{song.title}</span>
                                         </button>
                                     ))}
                                     {(!categorySongs[cat.id] || categorySongs[cat.id].length === 0) && (
                                         <p className="text-xs text-gray-400 py-2 pl-2">Memuat lagu...</p>
                                     )}
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
