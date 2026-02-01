"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Flag,
    ChevronLeft,
    Search,
    Filter,
    Eye,
    RefreshCw,
    FileText,
    MessageSquare,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Sparkles,
    MessageCircle,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { UserReport, ReportStatus, ReportType, ReportReason } from "@/types/moderation";

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", icon: Clock },
    reviewing: { label: "Ditinjau", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: Eye },
    resolved: { label: "Selesai", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: CheckCircle2 },
    dismissed: { label: "Ditolak", color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300", icon: AlertCircle },
};

const TYPE_CONFIG: Record<ReportType, { label: string; icon: React.ElementType }> = {
    article: { label: "Artikel", icon: FileText },
    forum: { label: "Forum", icon: MessageSquare },
    forum_post: { label: "Postingan", icon: MessageSquare },
    user: { label: "Pengguna", icon: User },
    story: { label: "Kisah Inspiratif", icon: Sparkles },
    story_comment: { label: "Komentar Kisah", icon: MessageCircle },
};

const REASON_LABELS: Record<ReportReason, string> = {
    misinformation: "Informasi Keliru",
    harmful: "Konten Berbahaya",
    harassment: "Pelecehan",
    spam: "Spam",
    impersonation: "Penyamaran",
    other: "Lainnya",
};

export default function ModerationReportsPage() {
    const { token } = useAuthStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // URL state
    const statusFilter = searchParams.get("status") || "pending";
    const typeFilter = searchParams.get("type") || "all";
    const searchQuery = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    const setStatusFilter = (value: string) => updateUrl({ status: value === "pending" ? null : value, page: null });
    const setTypeFilter = (value: string) => updateUrl({ type: value === "all" ? null : value, page: null });
    const setSearchQuery = (value: string) => updateUrl({ search: value || null });
    const setPage = (value: number) => updateUrl({ page: value > 1 ? value.toString() : null });

    const [reports, setReports] = useState<UserReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const loadReports = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await api.getModerationReports(token, {
                status: statusFilter === "all" ? undefined : statusFilter,
                report_type: typeFilter === "all" ? undefined : typeFilter,
                page,
                limit,
            });

            const data = res as { data: UserReport[]; total_pages: number };
            setReports(data.data || []);
            setTotalPages(data.total_pages || 1);
        } catch (error) {
            console.error("Failed to load reports:", error);
        } finally {
            setIsLoading(false);
        }
    }, [token, statusFilter, typeFilter, page]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const filteredReports = reports.filter((report) =>
    (report.content_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reporter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reported_user_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/dashboard/moderation">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Laporan Pengguna</h1>
                    <p className="text-muted-foreground">
                        Tinjau dan tangani laporan dari pengguna
                    </p>
                </div>
                <Button onClick={loadReports} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                                placeholder="Cari berdasarkan konten atau pengguna..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    {statusFilter === "all" ? "Semua Status" : STATUS_CONFIG[statusFilter as ReportStatus]?.label}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                                    Semua Status
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                                            <Icon className="h-4 w-4 mr-2" />
                                            {config.label}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {typeFilter === "all" ? "Semua Tipe" : TYPE_CONFIG[typeFilter as ReportType]?.label}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                                    Semua Tipe
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <DropdownMenuItem key={key} onClick={() => setTypeFilter(key)}>
                                            <Icon className="h-4 w-4 mr-2" />
                                            {config.label}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
                <CardHeader>
                    <CardTitle>Laporan ({filteredReports.length})</CardTitle>
                    <CardDescription>
                        Klik pada laporan untuk melihat detail dan mengambil tindakan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="h-10 w-10 bg-muted rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-muted rounded w-1/2" />
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                    </div>
                                    <div className="h-8 w-20 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Tidak ada laporan</h3>
                            <p className="text-muted-foreground">
                                {searchQuery
                                    ? "Tidak ada laporan yang cocok dengan pencarian"
                                    : "Tidak ada laporan yang menunggu penanganan"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredReports.map((report) => {
                                const TypeIcon = TYPE_CONFIG[report.report_type]?.icon || Flag;
                                const StatusIcon = STATUS_CONFIG[report.status]?.icon || Clock;

                                return (
                                    <div
                                        key={report.id}
                                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                                <TypeIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium truncate">
                                                    {report.content_title || report.reported_user_name || `Laporan #${report.id}`}
                                                </h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_CONFIG[report.status]?.color}`}>
                                                    <StatusIcon className="h-3 w-3 inline mr-1" />
                                                    {STATUS_CONFIG[report.status]?.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="inline-flex items-center gap-1">
                                                    <TypeIcon className="h-3 w-3" />
                                                    {TYPE_CONFIG[report.report_type]?.label}
                                                </span>
                                                {" • "}
                                                <span>{REASON_LABELS[report.reason]}</span>
                                                {" • "}
                                                <span>Dilaporkan oleh {report.reporter_name}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDate(report.created_at)}
                                            </p>
                                        </div>

                                        <Button asChild size="sm">
                                            <Link href={`/dashboard/moderation/reports/${report.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Tinjau
                                            </Link>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1 || isLoading}
                            >
                                Sebelumnya
                            </Button>
                            <span className="flex items-center px-4 text-sm text-muted-foreground">
                                Halaman {page} dari {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages || isLoading}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
