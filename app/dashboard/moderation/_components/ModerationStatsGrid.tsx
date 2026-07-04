import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle, Flag, CheckCircle2 } from "lucide-react";
import { ModerationStats } from "@/types/moderation";

interface ModerationStatsGridProps {
    stats: ModerationStats | null;
}

export function ModerationStatsGrid({ stats }: ModerationStatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-amber-500 flex flex-col h-full">
                <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Artikel Pending</p>
                            <h3 className="text-3xl font-bold">{stats?.pending_articles ?? "-"}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Menunggu moderasi</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 flex flex-col h-full">
                <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Artikel Ditandai</p>
                            <h3 className="text-3xl font-bold">{stats?.flagged_articles ?? "-"}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Perlu ditinjau</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary flex flex-col h-full">
                <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Laporan Pending</p>
                            <h3 className="text-3xl font-bold">{stats?.pending_reports ?? "-"}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Menunggu penanganan</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Flag className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary flex flex-col h-full">
                <CardContent className="flex-1 p-6 pt-6 sm:p-6 sm:pt-6 flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Diselesaikan Hari Ini</p>
                            <h3 className="text-3xl font-bold">{stats?.resolved_reports_today ?? "-"}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Laporan terselesaikan</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
