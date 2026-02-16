import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Flame, TrendingUp } from "lucide-react";
import { JournalAnalytics } from "@/types";

interface JournalStatsCardsProps {
    analytics: JournalAnalytics;
}

export function JournalStatsCards({ analytics }: JournalStatsCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Jurnal</p>
                            <p className="text-2xl font-bold">{analytics.total_entries}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Bulan Ini</p>
                            <p className="text-2xl font-bold">{analytics.entries_this_month}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Flame className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Streak Menulis</p>
                            <p className="text-2xl font-bold">{analytics.writing_streak} <span className="text-sm font-normal">hari</span></p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Kata</p>
                            <p className="text-2xl font-bold">{(analytics.total_word_count ?? 0).toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
