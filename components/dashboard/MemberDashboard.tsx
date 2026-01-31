"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { UserMood, MoodType, ChatSession, Article, SongCategory, Song, DailyTask } from "@/types";
import { BreathingWidgetData } from "@/types/breathing";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowRight,
  ChevronDown,
  Music,
  MessageCircle,
  Play,
  Pause,
  AlertTriangle,
  MoreVertical
} from "lucide-react";
import { BreathingWidget } from "@/components/breathing";
import { DailyTaskWidget, InspiringStoryWidget } from "@/components/gamification";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { MoodCheckinModal } from "./MoodCheckinModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

const moodEmojis: { type: MoodType; emoji: string; label: string; active: string; inactive: string; color: string }[] = [
  { type: "happy", emoji: "😊", label: "Bahagia", active: "/images/1-happy-active.png", inactive: "/images/1-smile.png", color: "#22c55e" },
  { type: "neutral", emoji: "😐", label: "Netral", active: "/images/2-netral-active.png", inactive: "/images/2-netral.png", color: "#eab308" },
  { type: "angry", emoji: "😠", label: "Marah", active: "/images/3-angry-active.png", inactive: "/images/3-angry.png", color: "#ef4444" },
  { type: "disappointed", emoji: "😞", label: "Kecewa", active: "/images/4-disappointed-active.png", inactive: "/images/4-disappointed.png", color: "#f97316" },
  { type: "sad", emoji: "😢", label: "Sedih", active: "/images/5-sad-active.png", inactive: "/images/5-sad.png", color: "#3b82f6" },
  { type: "crying", emoji: "😭", label: "Menangis", active: "/images/6-cry-active.png", inactive: "/images/6-cry.png", color: "#8b5cf6" },
];

const moodLevels: Record<MoodType, number> = {
  happy: 6,
  neutral: 5,
  angry: 4,
  disappointed: 3,
  sad: 2,
  crying: 1,
};

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function MemberDashboard() {
  const { token } = useAuthStore();
  const [latestMood, setLatestMood] = useState<UserMood | null>(null);
  const [moodHistory, setMoodHistory] = useState<UserMood[]>([]);
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMoodCheckin, setShowMoodCheckin] = useState(false);
  const [hasCheckedInitialMood, setHasCheckedInitialMood] = useState(false);
  const [isMoodDataLoaded, setIsMoodDataLoaded] = useState(false);

  // Check if user needs to check in mood - only runs AFTER data is loaded
  useEffect(() => {
    // Skip if already checked, no token, or mood data hasn't been loaded yet
    if (hasCheckedInitialMood || !token || !isMoodDataLoaded) return;

    // Now we know data has been loaded, check if user needs to check in
    if (!latestMood) {
      // No mood recorded at all - show check-in
      setShowMoodCheckin(true);
    } else {
      // Compare dates using LOCAL timezone (not UTC!) for proper comparison
      const today = new Date();
      const moodDate = new Date(latestMood.created_at);
      
      // Compare year, month, and day in local timezone
      const isSameDay = 
        today.getFullYear() === moodDate.getFullYear() &&
        today.getMonth() === moodDate.getMonth() &&
        today.getDate() === moodDate.getDate();
      
      if (!isSameDay) {
        // Mood was recorded on a different day - show check-in
        setShowMoodCheckin(true);
      }
    }
    setHasCheckedInitialMood(true);
  }, [latestMood, hasCheckedInitialMood, token, isMoodDataLoaded]);

  // Breathing widget state
  const [breathingWidgetData, setBreathingWidgetData] = useState<BreathingWidgetData | null>(null);

  // Chart filter states
  const [chartPeriod, setChartPeriod] = useState<"7days" | "1month">("7days");
  const [showChartDropdown, setShowChartDropdown] = useState(false);

  // Music player states
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [categorySongs, setCategorySongs] = useState<Record<number, Song[]>>({});
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      const moodLimit = chartPeriod === "1month" ? 30 : 7;
      const [moodRes, sessionsRes, articlesRes, categoriesRes, breathingWidgetRes, dailyTasksRes] = await Promise.all([
        api.getMoodHistory(token, { limit: moodLimit }).catch(() => null) as Promise<{ data: { moods: UserMood[] } } | null>,
        api.getChatSessions(token).catch(() => null) as Promise<{ data: ChatSession[] } | null>,
        api.getArticles({ limit: 5 }).catch(() => null) as Promise<{ data: Article[] } | null>,
        api.getSongCategories().catch(() => null) as Promise<{ data: SongCategory[] } | null>,
        api.getBreathingWidgetData(token).catch(() => null) as Promise<{ data: BreathingWidgetData } | null>,
        api.getDailyTasks(token).catch(() => null) as Promise<{ data: DailyTask[] } | null>,
      ]);

      if (moodRes?.data?.moods) {
        setMoodHistory(moodRes.data.moods);
        setLatestMood(moodRes.data.moods[0] || null);
      } else {
        // API returned but no moods - user has no mood history
        setLatestMood(null);
      }
      // Mark mood data as loaded regardless of whether there are moods
      setIsMoodDataLoaded(true);
      if (sessionsRes?.data) {
        setRecentSessions(sessionsRes.data.slice(0, 2));
      }
      if (articlesRes?.data) {
        setArticles(articlesRes.data);
      }
      if (categoriesRes?.data) {
        setCategories(categoriesRes.data);
      }
      if (breathingWidgetRes?.data) {
        setBreathingWidgetData(breathingWidgetRes.data);
      }
      if (dailyTasksRes?.data) {
        // API returns DailyTaskSummary which has tasks property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const taskData = dailyTasksRes.data as any;
        if (taskData?.tasks && Array.isArray(taskData.tasks)) {
          setDailyTasks(taskData.tasks);
        } else if (Array.isArray(taskData)) {
          setDailyTasks(taskData);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }, [token, chartPeriod]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const recordMood = async (mood: MoodType) => {
    if (!token || isRecording) return;
    setIsRecording(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.recordMood(token, mood) as any;
      if (response?.data) {
        toast.success("Mood berhasil dicatat!", {
          description: "Semoga harimu menyenangkan 😊",
        });
        await loadDashboardData();
        setShowMoodPicker(false);
        setShowMoodCheckin(false);
      } else {
        toast.error("Gagal mencatat mood");
      }
    } catch (error) {
      console.error("Failed to record mood:", error);
      toast.error("Gagal mencatat mood", {
        description: "Silakan coba lagi",
      });
    } finally {
      setIsRecording(false);
    }
  };

  const handleDeleteChatClick = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteChatId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = async () => {
    if (!token || !deleteChatId) return;

    setIsDeleting(true);
    try {
      await api.deleteChatSession(token, deleteChatId);

      // Update UI immediately (Optimistic/Local update)
      setRecentSessions(prev => prev.filter(session => session.id !== deleteChatId));

      // Reload data to ensure consistency
      await loadDashboardData();

      setShowDeleteModal(false);
      setDeleteChatId(null);
    } catch (error) {
      console.error("Failed to delete chat session:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Music player functions
  const handleCategoryClick = async (categoryId: number) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryId);

    // Fetch songs if not already loaded
    if (!categorySongs[categoryId]) {
      try {
        const response = await api.getSongsByCategory(categoryId) as { data: Song[] };
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
      // Toggle play/pause for same song
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      // Play new song
      setCurrentSong(song);
      setIsPlaying(true);
      setAudioProgress(0);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const handleTimeUpdate = () => {
      setAudioProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    // Auto-play when song changes
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

  // Prepare chart data for bar chart (7 days)
  // Create a map of day index (0=Sunday, 1=Monday, etc.) to mood
  const moodByDayOfWeek = new Map<number, UserMood>();

  // Get today's date components in local timezone
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  // Calculate the date 7 days ago for comparison
  const sevenDaysAgo = new Date(todayYear, todayMonth, todayDate - 6); // 6 days back = 7 day range including today

  // Map each mood entry to its day of week
  moodHistory.forEach(mood => {
    const moodDate = new Date(mood.created_at);
    
    // Get mood date components in local timezone
    const moodYear = moodDate.getFullYear();
    const moodMonth = moodDate.getMonth();
    const moodDay = moodDate.getDate();
    
    // Create date objects with only date components (no time) for comparison
    const moodDateOnly = new Date(moodYear, moodMonth, moodDay);
    const todayDateOnly = new Date(todayYear, todayMonth, todayDate);
    const sevenDaysAgoDateOnly = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

    // Only include moods from the last 7 days (including today)
    if (moodDateOnly >= sevenDaysAgoDateOnly && moodDateOnly <= todayDateOnly) {
      const dayOfWeek = moodDate.getDay(); // 0=Sunday, 1=Monday, etc.
      // Keep the most recent mood for each day (first one in array since sorted desc)
      if (!moodByDayOfWeek.has(dayOfWeek)) {
        moodByDayOfWeek.set(dayOfWeek, mood);
      }
    }
  });

  // Map Indonesian day names to day index (Senin=1, Selasa=2, etc.)
  const dayIndexMap: Record<string, number> = {
    "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5, "Sabtu": 6, "Minggu": 0
  };

  const weeklyChartData = days.map((day) => {
    const dayIndex = dayIndexMap[day];
    const moodEntry = moodByDayOfWeek.get(dayIndex);
    const mood = moodEntry?.mood;
    const moodInfo = moodEmojis.find(m => m.type === mood);
    return {
      name: day,
      bahagia: mood === "happy" ? moodLevels.happy : 0,
      netral: mood === "neutral" ? moodLevels.neutral : 0,
      marah: mood === "angry" ? moodLevels.angry : 0,
      kecewa: mood === "disappointed" ? moodLevels.disappointed : 0,
      sedih: mood === "sad" ? moodLevels.sad : 0,
      menangis: mood === "crying" ? moodLevels.crying : 0,
      mood: mood,
      color: moodInfo?.color || "#94a3b8",
      value: mood ? moodLevels[mood] : 0,
    };
  });

  // Prepare chart data for line chart (30 days)
  const monthlyChartData = moodHistory.slice().reverse().map((item, index) => {
    const date = new Date(item.created_at);
    // Use Indonesian timezone for display
    const dateIndonesia = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const dayLabel = dateIndonesia.getDate().toString();
    const moodInfo = moodEmojis.find(m => m.type === item.mood);
    return {
      name: dayLabel,
      fullDate: dateIndonesia.toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }),
      value: moodLevels[item.mood] || 0,
      mood: item.mood,
      emoji: moodInfo?.emoji || "",
      label: moodInfo?.label || "",
      color: moodInfo?.color || "#94a3b8",
      index,
    };
  });

  return (
    <div className="p-4 lg:p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* Alert Banner */}
      <div className="bg-linear-to-r from-primary to-red-600 rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <p className="text-white">
            Hari ini kamu terlihat <strong>sedikit lelah</strong>,
            <br /><span className="text-white/80">Ingin ngobrol sebentar?</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Image src="/images/home-banner-emote.png" alt="" width={64} height={64} className="hidden sm:block" />
          <Link href="/dashboard/chat">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all font-semibold">
              Ngobrol Sekarang!
            </Button>
          </Link>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteChat}
        title="Hapus Sesi Chat"
        description="Apakah Anda yakin ingin menghapus sesi chat ini? Riwayat percakapan tidak dapat dipulihkan."
        isLoading={isDeleting}
      />

      <MoodCheckinModal 
        isOpen={showMoodCheckin} 
        onMoodSelected={recordMood} 
        isSubmitting={isRecording} 
      />

      {/* Top Row: Mood Check-in (Hidden/Modal) + Daily Task + Breathing */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Daily Task Widget (Expanded) */}
        <div className="lg:col-span-8">
           <DailyTaskWidget tasks={dailyTasks} onTaskClaimed={loadDashboardData} />
        </div>

        {/* Breathing Exercise Widget */}
        <div className="lg:col-span-4">
          {breathingWidgetData && <BreathingWidget data={breathingWidgetData} />}
        </div>
      </div>

      {/* Second Row: Mood Chart + Music */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Mood Chart */}
        <Card className="lg:col-span-8 shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  {chartPeriod === "7days" ? "Perjalanan Emosimu Sepanjang Minggu" : "Tren Emosimu Sebulan Terakhir"}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Pantau fluktuasi emosi harian dan temukan pola yang bisa kamu sadari lebih awal.
                </p>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChartDropdown(!showChartDropdown)}
                  className="rounded-full text-xs gap-1 border-gray-200"
                >
                  {chartPeriod === "7days" ? "7 Hari terakhir" : "1 Bulan terakhir"} <ChevronDown className="w-3 h-3" />
                </Button>
                {showChartDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[140px]">
                    <button
                      onClick={() => {
                        setChartPeriod("7days");
                        setShowChartDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                        chartPeriod === "7days" && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      7 Hari terakhir
                    </button>
                    <button
                      onClick={() => {
                        setChartPeriod("1month");
                        setShowChartDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                        chartPeriod === "1month" && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      1 Bulan terakhir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                {chartPeriod === "7days" ? (
                  <BarChart data={weeklyChartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis
                      domain={[0, 7]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      width={70}
                      tickFormatter={(value) => {
                        const labels: Record<number, string> = {
                          6: "Bahagia",
                          5: "Netral",
                          4: "Marah",
                          3: "Kecewa",
                          2: "Sedih",
                          1: "Menangis"
                        };
                        return labels[value] || "";
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const moodInfo = moodEmojis.find(m => m.type === data.mood);
                          return (
                            <div className="bg-white p-3 rounded-xl shadow-lg border">
                              <p className="text-sm font-medium text-gray-800">
                                {moodInfo?.emoji} {moodInfo?.label || "Belum ada"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {moodEmojis.map((mood) => (
                      <Bar
                        key={mood.type}
                        dataKey={mood.label.toLowerCase()}
                        fill={mood.color}
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    ))}
                  </BarChart>
                ) : (
                  <AreaChart data={monthlyChartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      interval={Math.ceil(monthlyChartData.length / 10)}
                    />
                    <YAxis
                      domain={[0, 7]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      width={70}
                      tickFormatter={(value) => {
                        const labels: Record<number, string> = {
                          6: "Bahagia",
                          5: "Netral",
                          4: "Marah",
                          3: "Kecewa",
                          2: "Sedih",
                          1: "Menangis"
                        };
                        return labels[value] || "";
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-xl shadow-lg border">
                              <p className="text-xs text-gray-500 mb-1">{data.fullDate}</p>
                              <p className="text-sm font-medium text-gray-800">
                                {data.emoji} {data.label || "Belum ada"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#colorMood)"
                      dot={{ fill: "#ef4444", strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 6, fill: "#ef4444" }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-500 mt-4 pt-4 border-t">
              {moodEmojis.map((m) => (
                <div key={m.type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Music Widget */}
        <Card className="lg:col-span-4 bg-linear-to-br from-primary to-red-600 text-white border-0 shadow-lg overflow-hidden relative">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white text-lg font-bold">Biarkan Musik Menenangkan Harimu</CardTitle>
                <p className="text-white/80 text-sm">
                  Putar musik pilihan untuk bantu kamu melepas stres, mengatur napas, dan kembali fokus.
                </p>
              </div>
              <Link href="/dashboard/music">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 gap-1">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Hidden audio element */}
            {currentSong && (
              <audio
                ref={audioRef}
                src={currentSong.file_path.startsWith("http") ? currentSong.file_path : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8080"}${currentSong.file_path}`}
                preload="metadata"
              />
            )}

            {categories.slice(0, 3).map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={cn(
                    "w-full rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer",
                    expandedCategory === cat.id ? "bg-white text-gray-800" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0",
                    expandedCategory === cat.id ? "bg-gray-100" : "bg-white/20"
                  )}>
                    {cat.thumbnail ? (
                      <Image src={cat.thumbnail} alt="" width={48} height={48} className="object-cover" />
                    ) : (
                      <Music className={cn("w-6 h-6", expandedCategory === cat.id ? "text-gray-600" : "")} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn("font-semibold truncate", expandedCategory === cat.id ? "text-gray-800" : "text-white")}>{cat.name}</p>
                    <p className={cn("text-xs", expandedCategory === cat.id ? "text-gray-500" : "text-white/60")}>{cat.song_count || 0} Lagu</p>
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 transition-transform",
                    expandedCategory === cat.id ? "text-gray-400 rotate-180" : "text-white/60"
                  )} />
                </button>

                {/* Expanded song list */}
                {expandedCategory === cat.id && (
                  <div className="mt-2 space-y-1 bg-white/10 rounded-xl p-2 max-h-48 overflow-y-auto">
                    {categorySongs[cat.id]?.length > 0 ? (
                      categorySongs[cat.id].map((song) => (
                        <button
                          key={song.id}
                          onClick={() => playSong(song)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left",
                            currentSong?.id === song.id ? "bg-white text-gray-800" : "hover:bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            currentSong?.id === song.id ? "bg-primary" : "bg-white/20"
                          )}>
                            {currentSong?.id === song.id && isPlaying ? (
                              <Pause className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white" fill={currentSong?.id === song.id ? "white" : "none"} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              currentSong?.id === song.id ? "text-gray-800" : "text-white"
                            )}>{song.title}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-3 text-white/60">
                        <p className="text-xs">Memuat lagu...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Now Playing Bar */}
            {currentSong && (
              <div className="mt-3 bg-white rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playSong(currentSong)}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" fill="white" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{currentSong.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{formatTime(audioProgress)}</span>
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-100"
                          style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(audioDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {categories.length === 0 && (
              <div className="text-center py-4 text-white/60">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada kategori musik</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        {/* Inspiring Story Widget */}
        <div className="lg:col-span-6">
          <InspiringStoryWidget />
        </div>

        {/* Last Chat Sessions */}
        <Card className="lg:col-span-6 shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Image src="/images/ai-chat-blue.png" alt="" width={24} height={24} style={{ width: 'auto', height: 'auto' }} />
              </div>
              <span className="font-semibold text-gray-800">Lanjutkan chat terakhir</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/chat`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 group bg-white"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">{session.title}</p>
                    <p className="text-sm text-gray-500 truncate">{session.last_message || "Tidak ada pesan"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <button className="p-2 hover:bg-gray-100 rounded-full outline-none transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        onClick={(e) => handleDeleteChatClick(e, session.id)}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Hapus Chat</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada sesi chat</p>
                <Link href="/dashboard/chat">
                  <Button variant="outline" size="sm" className="mt-3 rounded-full text-xs">
                    Mulai Chat Baru
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fourth Row: Articles */}
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Artikel Terbaru</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x scrollbar-hide">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/dashboard/reading/${article.id}`}
                className="shrink-0 w-64 snap-start group"
              >
                <Card className="overflow-hidden card-hover h-full border-0 shadow-sm group-hover:shadow-lg transition-all bg-white">
                  <div className="h-40 relative overflow-hidden">
                    {article.thumbnail ? (
                      <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center">
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-white text-xs px-3 py-1 rounded-full shadow font-medium">
                        Artikel
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-3 text-gray-800 group-hover:text-primary transition-colors leading-snug">{article.title}</h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <Link href="/dashboard/reading">
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 gap-1">
            Lihat Semua Artikel <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
