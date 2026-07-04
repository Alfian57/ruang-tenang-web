import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Flame, TrendingUp } from "lucide-react";
import { JournalAnalytics } from "@/types";

interface JournalStatsCardsProps {
    analytics: JournalAnalytics;
}

export function JournalStatsCards({ analytics }: JournalStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-4">
            <Card className="flex flex-col justify-center">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 leading-tight">Total Jurnal</p>
                            <p className="text-2xl font-bold leading-tight mt-0.5">{analytics.total_entries}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col justify-center">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Calendar className="w-5 h-5 text-primary/80" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 leading-tight">Bulan Ini</p>
                            <p className="text-2xl font-bold leading-tight mt-0.5">{analytics.entries_this_month}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col justify-center">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 theme-accent-light-bg rounded-lg shrink-0">
                            <Flame className="w-5 h-5 theme-accent-text" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 leading-tight">Streak Menulis</p>
                            <p className="text-2xl font-bold leading-tight mt-0.5">{analytics.writing_streak} <span className="text-sm font-normal">hari</span></p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col justify-center">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <TrendingUp className="w-5 h-5 text-primary/80" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 leading-tight">Total Kata</p>
                            <p className="text-2xl font-bold leading-tight mt-0.5">{(analytics.total_word_count ?? 0).toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
