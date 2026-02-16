import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle, Flag, CheckCircle2 } from "lucide-react";
import { ModerationStats } from "@/types/moderation";

interface ModerationStatsGridProps {
    stats: ModerationStats | null;
}

export function ModerationStatsGrid({ stats }: ModerationStatsGridProps) {
    return (
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
                    <div className="text-2xl font-bold">
                        {stats?.resolved_reports_today ?? "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">Laporan terselesaikan</p>
                </CardContent>
            </Card>
        </div>
    );
}
