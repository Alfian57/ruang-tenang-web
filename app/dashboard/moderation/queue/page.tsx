"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ChevronLeft,
    Search,
    Filter,
    Eye,
    RefreshCw,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { moderationService } from "@/services/api";
import { formatDate } from "@/lib/utils";
import type { ModerationQueueItem, ArticleModerationStatus } from "@/types/moderation";

const STATUS_LABELS: Record<ArticleModerationStatus, { label: string; color: string }> = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    flagged: { label: "Ditandai", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
    approved: { label: "Disetujui", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    rejected: { label: "Ditolak", color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300" },
    revision_needed: { label: "Perlu Revisi", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
};

export default function ModerationQueuePage() {
    const { token } = useAuthStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // URL state
    const statusFilter = searchParams.get("status") || "pending";
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
    const setSearchQuery = (value: string) => updateUrl({ search: value || null });
    const setPage = (value: number) => updateUrl({ page: value > 1 ? value.toString() : null });

    const [items, setItems] = useState<ModerationQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const loadQueue = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await moderationService.getQueue(token, {
                status: statusFilter === "all" ? undefined : statusFilter,
                page,
                limit,
            });

            const data = res as { data: ModerationQueueItem[]; total_pages: number };
            setItems(data.data || []);
            setTotalPages(data.total_pages || 1);
        } catch (error) {
            console.error("Failed to load moderation queue:", error);
        } finally {
            setIsLoading(false);
        }
    }, [token, statusFilter, page]);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    const filteredItems = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href={ROUTES.ADMIN.MODERATION}>
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Antrian Moderasi</h1>
                    <p className="text-muted-foreground">
                        Tinjau dan moderasi artikel yang dikirim pengguna
                    </p>
                </div>
                <Button onClick={loadQueue} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                            <Input
                                placeholder="Cari berdasarkan judul atau penulis..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Filter className="h-4 w-4 mr-2" />
                                    {statusFilter === "all" ? "Semua Status" : STATUS_LABELS[statusFilter as ArticleModerationStatus]?.label || statusFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                                    Semua Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                    Menunggu
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("flagged")}>
                                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                    Ditandai
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("revision_needed")}>
                                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                    Perlu Revisi
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Queue List */}
            <Card>
                <CardHeader>
                    <CardTitle>Artikel ({filteredItems.length})</CardTitle>
                    <CardDescription>
                        Klik pada artikel untuk melihat detail dan melakukan moderasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="h-12 w-12 bg-muted rounded" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-muted rounded w-1/2" />
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                    </div>
                                    <div className="h-8 w-20 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Tidak ada artikel</h3>
                            <p className="text-muted-foreground">
                                {searchQuery
                                    ? "Tidak ada artikel yang cocok dengan pencarian"
                                    : "Tidak ada artikel yang menunggu moderasi"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="shrink-0">
                                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                            <FileText className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium truncate">{item.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_LABELS[item.moderation_status]?.color}`}>
                                                {STATUS_LABELS[item.moderation_status]?.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Oleh {item.author_name} • {formatDate(item.created_at)}
                                        </p>
                                        {item.flag_reasons && item.flag_reasons.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.flag_reasons.slice(0, 3).map((reason, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 text-xs bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded"
                                                    >
                                                        {reason}
                                                    </span>
                                                ))}
                                                {item.flag_reasons.length > 3 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        +{item.flag_reasons.length - 3} lainnya
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.severity && (
                                            <span className={`px-2 py-1 text-xs rounded ${item.severity === "high" ? "bg-red-100 text-red-700" :
                                                    item.severity === "medium" ? "bg-amber-100 text-amber-700" :
                                                        "bg-gray-100 text-gray-700"
                                                }`}>
                                                {item.severity === "high" ? "Tinggi" :
                                                    item.severity === "medium" ? "Sedang" : "Rendah"}
                                            </span>
                                        )}
                                        <Button asChild size="sm">
                                            <Link href={ROUTES.moderationArticle(item.id)}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Tinjau
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
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
