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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    RefreshCw,
    Search,
    Filter,
    Clock,
    Eye,
    CheckCircle2,
    AlertCircle,
    FileText,
    MessageSquare,
    User,
    Sparkles,
    MessageCircle,
} from "lucide-react";
import { ReportStatus, ReportType } from "@/types/moderation";

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

interface ModerationReportsHeaderProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    isLoading: boolean;
    onRefresh: () => void;
}

export function ModerationReportsHeader({
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    onRefresh,
}: ModerationReportsHeaderProps) {
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
                    <h1 className="text-2xl font-bold">Laporan Pengguna</h1>
                    <p className="text-muted-foreground">
                        Tinjau dan tangani laporan dari pengguna
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
                                placeholder="Cari berdasarkan konten atau pengguna..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white"
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
        </div>
    );
}

export { STATUS_CONFIG, TYPE_CONFIG };
