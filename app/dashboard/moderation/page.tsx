"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Flag,
    Shield,
} from "lucide-react";
import { useModerationDashboard } from "./_hooks/useModerationDashboard";
import { ModerationStatsGrid } from "./_components/ModerationStatsGrid";
import { ModerationSecondaryStats } from "./_components/ModerationSecondaryStats";
import { ModerationPendingArticles } from "./_components/ModerationPendingArticles";
import { ModerationRecentReports } from "./_components/ModerationRecentReports";

export default function ModerationDashboardPage() {
    const {
        isModerator,
        stats,
        pendingArticles,
        recentReports,
        isLoading,
    } = useModerationDashboard();

    if (!isModerator) {
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
                        <Link href={ROUTES.ADMIN.MODERATION_REPORTS}>
                            <Flag className="h-4 w-4 mr-2" />
                            Laporan
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={ROUTES.ADMIN.MODERATION_QUEUE}>
                            <FileText className="h-4 w-4 mr-2" />
                            Antrian Moderasi
                        </Link>
                    </Button>
                </div>
            </div>

            <ModerationStatsGrid stats={stats} />
            <ModerationSecondaryStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModerationPendingArticles articles={pendingArticles} isLoading={isLoading} />
                <ModerationRecentReports reports={recentReports} isLoading={isLoading} />
            </div>
        </div>
    );
}
