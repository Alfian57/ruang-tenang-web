"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  MessageCircle, 
  Music, 
  Heart, 
  TrendingUp,
  TrendingDown,
  Activity,
  Ban,
  FolderOpen,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";

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

export default function AdminDashboardPage() {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

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
                      style={{ height: `${Math.max(10, (value / Math.max(...stats.users.chart_data)) * 100)}%` }}
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
                <Link href="/dashboard/admin/categories" className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-5 h-5 text-orange-500" />
                      <span>Kategori Artikel</span>
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
