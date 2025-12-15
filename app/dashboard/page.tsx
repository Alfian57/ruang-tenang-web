"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { UserMood, MoodType, ChatSession, Article, SongCategory } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { 
  ArrowRight, 
  ChevronDown, 
  Music, 
  MessageCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Users,
  FileText,
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Ban,
  FolderOpen,
  ChevronRight,
  AlertTriangle,
  MoreVertical,
  Shuffle
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
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

// Admin Dashboard Stats Interface
interface DashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    this_month: number;
    growth: number;
    chart_data: number[];
  };
  articles: {
    total: number;
    this_month: number;
    blocked: number;
    categories: number;
  };
  chat_sessions: {
    total: number;
    today: number;
    chart_data: number[];
  };
  messages: {
    total: number;
    today: number;
  };
  songs: {
    total: number;
    categories: number;
  };
  moods: {
    total: number;
    today: number;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    is_blocked: boolean;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <MemberDashboard />;
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard() {
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadStats = async () => {
    if (!token) return;
    try {
      const response = await api.adminGetStats(token) as { success: boolean; data: DashboardStats };
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Activity className="w-4 h-4" />
          Admin Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Pantau performa platform dan kelola konten Ruang Tenang
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <>
          {/* Alert Cards - Only show if there are issues */}
          {(stats.users.blocked > 0 || stats.articles.blocked > 0) && (
            <div className="mb-6 grid sm:grid-cols-2 gap-4">
              {stats.users.blocked > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Ban className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-orange-800">{stats.users.blocked} Pengguna Diblokir</p>
                        <p className="text-sm text-orange-600">Memerlukan perhatian</p>
                      </div>
                    </div>
                    <Link href="/dashboard/admin/users">
                      <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                        Lihat <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              {stats.articles.blocked > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-red-800">{stats.articles.blocked} Artikel Diblokir</p>
                        <p className="text-sm text-red-600">Perlu ditinjau</p>
                      </div>
                    </div>
                    <Link href="/dashboard/admin/articles">
                      <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                        Lihat <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pengguna</p>
                    <h3 className="text-3xl font-bold">{stats.users.total.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {stats.users.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${stats.users.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.users.growth >= 0 ? '+' : ''}{stats.users.growth.toFixed(1)}% bulan ini
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                {/* Mini Chart */}
                <div className="flex items-end gap-1 mt-4 h-10">
                  {stats.users.chart_data.map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t"
                      style={{ height: `${Math.max(10, (value / Math.max(...stats.users.chart_data, 1)) * 100)}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Artikel</p>
                    <h3 className="text-3xl font-bold">{stats.articles.total}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      +{stats.articles.this_month} bulan ini
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sesi Chat</p>
                    <h3 className="text-3xl font-bold">{stats.chat_sessions.total.toLocaleString()}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      +{stats.chat_sessions.today} hari ini
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                {/* Mini Chart */}
                <div className="flex items-end gap-1 mt-4 h-10">
                  {stats.chat_sessions.chart_data.map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-orange-500/20 rounded-t"
                      style={{ height: `${Math.max(10, (value / Math.max(...stats.chat_sessions.chart_data, 1)) * 100)}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pesan</p>
                    <h3 className="text-3xl font-bold">{stats.messages.total.toLocaleString()}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      +{stats.messages.today} hari ini
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Pengguna Terbaru</CardTitle>
                <CardDescription>5 pengguna terdaftar terbaru</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recent_users.map((recentUser) => (
                    <div key={recentUser.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      recentUser.is_blocked ? 'bg-red-50 border border-red-100' : 'bg-muted/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          recentUser.is_blocked ? 'bg-red-100' : 'bg-primary/10'
                        }`}>
                          <span className={recentUser.is_blocked ? 'text-red-600 font-semibold' : 'text-primary font-semibold'}>
                            {recentUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{recentUser.name}</p>
                            {recentUser.is_blocked && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-600">Diblokir</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{recentUser.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          recentUser.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {recentUser.role}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(recentUser.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/admin/users">
                  <Button variant="outline" className="w-full mt-4">
                    Lihat Semua Pengguna <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Kelola konten platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/admin/users" className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Kelola Pengguna</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/dashboard/admin/articles" className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span>Kelola Artikel</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/dashboard/admin/songs" className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-purple-500" />
                      <span>Kelola Musik</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Third Row - Summary */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                    <p className="font-semibold">{stats.users.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kategori Artikel</p>
                    <p className="font-semibold">{stats.articles.categories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Music className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Musik</p>
                    <p className="font-semibold">{stats.songs.total} lagu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mood Hari Ini</p>
                    <p className="font-semibold">{stats.moods.today}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== MEMBER DASHBOARD ====================
function MemberDashboard() {
  const { token } = useAuthStore();
  const [, setLatestMood] = useState<UserMood | null>(null);
  const [moodHistory, setMoodHistory] = useState<UserMood[]>([]);
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedDuration] = useState(5);
  const [deleteChatId, setDeleteChatId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      const [moodRes, sessionsRes, articlesRes, categoriesRes] = await Promise.all([
        api.getMoodHistory(token, { limit: 7 }).catch(() => null) as Promise<{ data: { moods: UserMood[] } } | null>,
        api.getChatSessions(token).catch(() => null) as Promise<{ data: ChatSession[] } | null>,
        api.getArticles({ limit: 5 }).catch(() => null) as Promise<{ data: Article[] } | null>,
        api.getSongCategories().catch(() => null) as Promise<{ data: SongCategory[] } | null>,
      ]);
      
      if (moodRes?.data?.moods) {
        setMoodHistory(moodRes.data.moods);
        setLatestMood(moodRes.data.moods[0] || null);
      }
      if (sessionsRes?.data) {
        setRecentSessions(sessionsRes.data.slice(0, 2));
      }
      if (articlesRes?.data) {
        setArticles(articlesRes.data);
      }
      if (categoriesRes?.data) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const recordMood = async (mood: MoodType) => {
    if (!token || isRecording) return;
    setIsRecording(true);
    try {
      await api.recordMood(token, mood);
      loadDashboardData();
      setShowMoodPicker(false);
    } catch (error) {
      console.error("Failed to record mood:", error);
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

  // Prepare chart data for bar chart
  const chartData = days.map((day, i) => {
    const mood = moodHistory[moodHistory.length - 1 - i]?.mood;
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
    };
  });

  return (
    <div className="p-4 lg:p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-primary to-red-600 rounded-2xl p-5 flex items-center justify-between shadow-lg">
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

      {/* Top Row: Mood + Chat + Breathing */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Mood Picker Card */}
        <Card className="lg:col-span-3 bg-gradient-to-br from-sky-400 to-blue-500 text-white border-0 shadow-lg overflow-hidden relative">
          <CardContent className="p-6 text-center relative z-10">
            <h3 className="text-xl font-bold mb-1">Gimana Kondisimu</h3>
            <h3 className="text-xl font-bold mb-6">Hari ini?</h3>
            
            {showMoodPicker ? (
              <div className="grid grid-cols-3 gap-3">
                {moodEmojis.map((m) => (
                  <button 
                    key={m.type}
                    onClick={() => recordMood(m.type)}
                    disabled={isRecording}
                    className="mood-btn w-14 h-14 bg-white/20 rounded-xl flex flex-col items-center justify-center mx-auto hover:bg-white/30 transition-all disabled:opacity-50"
                  >
                    <Image src={m.inactive} alt={m.label} width={32} height={32} />
                  </button>
                ))}
              </div>
            ) : (
              <button 
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto hover:bg-white/30 hover:scale-105 transition-all"
                onClick={() => setShowMoodPicker(true)}
              >
                <Image src="/images/smile-plus.png" alt="Add mood" width={40} height={40} />
              </button>
            )}
          </CardContent>
        </Card>

        {/* Last Chat Sessions */}
        <Card className="lg:col-span-5 shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Image src="/images/ai-chat-blue.png" alt="" width={24} height={24} />
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

        {/* Breathing Exercise */}
        <Card className="lg:col-span-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-gray-800">Atur Napasmu,<br/>Atur Tenangmu</h4>
              <div className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-3 py-1.5">
                <Image src="/images/timer.png" alt="" width={14} height={14} />
                <span className="text-gray-600 font-medium">{selectedDuration} detik</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-3 mb-5">
              {[
                { label: "Tarik Nafas", width: "60%", color: "bg-red-300" },
                { label: "Tahan Nafas", width: "100%", color: "bg-red-400" },
                { label: "Buang Nafas", width: "75%", color: "bg-red-500" },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600 font-medium">{step.label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", step.color)} 
                      style={{ width: step.width }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="text-xs rounded-full gap-1.5 bg-primary hover:bg-primary/90 text-white px-4">
                <Play className="w-3 h-3" /> Mulai
              </Button>
              <Button size="sm" variant="outline" className="text-xs rounded-full gap-1.5 px-4">
                <Pause className="w-3 h-3" /> Jeda
              </Button>
              <Button size="sm" variant="outline" className="text-xs rounded-full gap-1.5 px-4">
                <RotateCcw className="w-3 h-3" /> Ulangi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Mood Chart + Music */}
      <div className="grid lg:grid-cols-12 gap-4">
        {/* Mood Chart */}
        <Card className="lg:col-span-8 shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Perjalanan Emosimu Sepanjang Minggu</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Pantau fluktuasi emosi harian dan temukan pola yang bisa kamu sadari lebih awal.
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full text-xs gap-1 border-gray-200">
                7 Hari terakhir <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bar Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    domain={[0, 7]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      const labels: Record<number, string> = {
                        6: 'Bahagia',
                        5: 'Netral',
                        4: 'Marah',
                        3: 'Kecewa',
                        2: 'Sedih',
                        1: 'Menangis'
                      };
                      return labels[value] || '';
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
                              {moodInfo?.emoji} {moodInfo?.label || 'Belum ada'}
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
        <Card className="lg:col-span-4 bg-gradient-to-br from-primary to-red-600 text-white border-0 shadow-lg overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg font-bold">Biarkan Musik Menenangkan Harimu</CardTitle>
            <p className="text-white/80 text-sm">
              Putar musik pilihan untuk bantu kamu melepas stres, mengatur napas, dan kembali fokus.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.slice(0, 3).map((cat, idx) => (
              <Link
                key={cat.id}
                href="/dashboard/music"
                className={cn(
                  "rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer group",
                  idx === 1 ? "bg-white text-gray-800" : "bg-white/10 hover:bg-white/20"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden",
                  idx === 1 ? "bg-gray-100" : "bg-white/20"
                )}>
                  {cat.thumbnail ? (
                    <Image src={cat.thumbnail} alt="" width={48} height={48} className="object-cover" />
                  ) : (
                    <Music className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold truncate", idx === 1 ? "text-gray-800" : "text-white")}>{cat.name}</p>
                  <p className={cn("text-xs", idx === 1 ? "text-gray-500" : "text-white/60")}>{cat.song_count || 0} Lagu</p>
                </div>
                {idx === 1 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">0:00 - 01:25</span>
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" fill="white" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Shuffle className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
                {idx !== 1 && (
                  <ChevronDown className="w-5 h-5 text-white/60" />
                )}
              </Link>
            ))}
            
            {categories.length === 0 && (
              <div className="text-center py-4 text-white/60">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada kategori musik</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Articles Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Artikel Terbaru</h2>
          <Link href="/dashboard/reading" className="text-primary text-sm flex items-center gap-1 hover:gap-2 transition-all font-medium">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x scrollbar-hide">
          {articles.map((article) => (
            <Link 
              key={article.id}
              href={`/dashboard/reading/${article.id}`}
              className="flex-shrink-0 w-56 snap-start group"
            >
              <Card className="overflow-hidden card-hover h-full border-0 shadow-sm group-hover:shadow-lg transition-all bg-white">
                <div className="h-32 relative overflow-hidden">
                  {article.thumbnail ? (
                    <Image 
                      src={article.thumbnail} 
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
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
                  <p className="text-xs text-primary flex items-center gap-1 font-medium">
                    Baca Selengkapnya <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}

          {articles.length === 0 && (
            <div className="w-full text-center py-8 text-gray-400">
              <p>Belum ada artikel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
