"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    RefreshCw,
    Search,
    Filter,
    Clock,
    AlertTriangle,
    FileText,
} from "lucide-react";
import { ArticleModerationStatus } from "@/types/moderation";

const STATUS_LABELS: Record<ArticleModerationStatus, { label: string; color: string }> = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    flagged: { label: "Ditandai", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
    approved: { label: "Disetujui", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    rejected: { label: "Ditolak", color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300" },
    revision_needed: { label: "Perlu Revisi", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
};

interface ModerationQueueHeaderProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    isLoading: boolean;
    onRefresh: () => void;
}

export function ModerationQueueHeader({
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    onRefresh,
}: ModerationQueueHeaderProps) {
    return (
        <div className="space-y-6">
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
                <Button onClick={onRefresh} variant="outline" size="sm">
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
                                    {statusFilter === "all"
                                        ? "Semua Status"
                                        : STATUS_LABELS[statusFilter as ArticleModerationStatus]?.label ||
                                          statusFilter}
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
        </div>
    );
}

// Re-export STATUS_LABELS to be used in items as well if needed
export { STATUS_LABELS };
