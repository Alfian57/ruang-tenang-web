"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Flag,
    AlertTriangle,
    Shield,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Ban,
    Eye,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import type { ModerationStats, ModerationQueueItem, UserReport } from "@/types/moderation";

export default function ModerationDashboardPage() {
    const { token, user } = useAuthStore();
    const [stats, setStats] = useState<ModerationStats | null>(null);
    const [pendingArticles, setPendingArticles] = useState<ModerationQueueItem[]>([]);
    const [recentReports, setRecentReports] = useState<UserReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token && (user?.role === "moderator" || user?.role === "admin")) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user]);

    const loadData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [statsRes, queueRes, reportsRes] = await Promise.all([
                api.getModerationStats(token),
                api.getModerationQueue(token, { status: "pending", limit: 5 }),
                api.getModerationReports(token, { status: "pending", limit: 5 }),
            ]);

            setStats((statsRes as { data: ModerationStats }).data);
            setPendingArticles((queueRes as { data: ModerationQueueItem[] }).data || []);
            setRecentReports((reportsRes as { data: UserReport[] }).data || []);
        } catch (error) {
            console.error("Failed to load moderation data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role !== "moderator" && user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
                        <p className="text-muted-foreground">
                            Anda tidak memiliki izin untuk mengakses halaman ini.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Moderasi</h1>
                    <p className="text-muted-foreground">
                        Kelola konten dan laporan pengguna
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/moderation/reports">
                            <Flag className="h-4 w-4 mr-2" />
                            Laporan
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/moderation/queue">
                            <FileText className="h-4 w-4 mr-2" />
                            Antrian Moderasi
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Artikel Pending</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pending_articles ?? "-"}</div>
                        <p className="text-xs text-muted-foreground">Menunggu moderasi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Artikel Ditandai</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.flagged_articles ?? "-"}</div>
                        <p className="text-xs text-muted-foreground">Perlu ditinjau</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Laporan Pending</CardTitle>
                        <Flag className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pending_reports ?? "-"}</div>
                        <p className="text-xs text-muted-foreground">Menunggu penanganan</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Diselesaikan Hari Ini</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.resolved_reports_today ?? "-"}</div>
                        <p className="text-xs text-muted-foreground">Laporan terselesaikan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Strike Aktif</CardTitle>
                        <XCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.active_strikes ?? "-"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pengguna Disuspend</CardTitle>
                        <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.suspended_users ?? "-"}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pengguna Dibanned</CardTitle>
                        <Ban className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.banned_users ?? "-"}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Articles */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Artikel Menunggu Moderasi</CardTitle>
                            <CardDescription>Artikel terbaru yang perlu ditinjau</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/moderation/queue">
                                Lihat Semua
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <div className="h-10 w-10 bg-muted-foreground/20 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                                            <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : pendingArticles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Tidak ada artikel yang menunggu moderasi</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="shrink-0">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{article.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                oleh {article.author_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {article.moderation_status === "flagged" && (
                                                <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded">
                                                    Ditandai
                                                </span>
                                            )}
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/dashboard/moderation/articles/${article.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Reports */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Laporan Terbaru</CardTitle>
                            <CardDescription>Laporan pengguna yang perlu ditangani</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/moderation/reports">
                                Lihat Semua
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <div className="h-10 w-10 bg-muted-foreground/20 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                                            <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentReports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Tidak ada laporan yang menunggu</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="shrink-0">
                                            <Flag className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {report.content_title || `Laporan ${report.report_type}`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Dilaporkan oleh {report.reporter_name} • {report.reason}
                                            </p>
                                        </div>
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={`/dashboard/moderation/reports/${report.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
