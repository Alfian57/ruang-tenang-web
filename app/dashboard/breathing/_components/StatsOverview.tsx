import { BreathingStats } from "@/types/breathing";
import { Flame, Target, TrendingUp, Award } from "lucide-react";

interface StatsOverviewProps {
    stats: BreathingStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Current Streak */}
            <div className="p-4 rounded-xl bg-linear-to-br from-orange-500/10 to-red-500/10 border border-orange-200/50">
                <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">Streak</span>
                </div>
                <div className="text-3xl font-bold text-orange-600">
                    {stats.streak_info.current_streak}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Terbaik: {stats.streak_info.longest_streak} hari
                </p>
            </div>

            {/* Today's Sessions */}
            <div className="p-4 rounded-xl bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200/50">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Hari Ini</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                    {stats.today.sessions_count}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {stats.today.total_minutes} menit total
                </p>
            </div>

            {/* Total Sessions */}
            <div className="p-4 rounded-xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700">Total Sesi</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                    {stats.overall.total_sessions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {stats.overall.total_minutes} menit
                </p>
            </div>

            {/* Completion Rate */}
            <div className="p-4 rounded-xl bg-linear-to-br from-green-500/10 to-emerald-500/10 border border-green-200/50">
                <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Penyelesaian</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                    {Math.round(stats.overall.completion_rate)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Rata-rata {stats.overall.average_sessions_per_week.toFixed(1)}/minggu
                </p>
            </div>
        </div>
    );
}
