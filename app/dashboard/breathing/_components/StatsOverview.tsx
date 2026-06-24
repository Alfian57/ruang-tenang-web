import { BreathingStats } from "@/types/breathing";
import { Flame, Target, TrendingUp, Award } from "lucide-react";

interface StatsOverviewProps {
    stats: BreathingStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-4">
            {/* Current Streak */}
            <div className="p-4 rounded-xl theme-streak-bg border theme-streak-border">
                <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 theme-accent-text" />
                    <span className="text-sm font-medium theme-accent-text-heading">Streak</span>
                </div>
                <div className="text-3xl font-bold" style={{ color: `var(--theme-accent)` }}>
                    {stats.streak_info.current_streak}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Terbaik: {stats.streak_info.longest_streak} hari
                </p>
            </div>

            {/* Today's Sessions */}
            <div className="p-4 rounded-xl bg-linear-to-br from-primary/10 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-primary/80" />
                    <span className="text-sm font-medium text-primary">Hari Ini</span>
                </div>
                <div className="text-3xl font-bold text-primary/80">
                    {stats.today.sessions_count}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {stats.today.total_minutes} menit total
                </p>
            </div>

            {/* Total Sessions */}
            <div className="p-4 rounded-xl bg-linear-to-br from-primary/10 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary/80" />
                    <span className="text-sm font-medium text-primary">Total Sesi</span>
                </div>
                <div className="text-3xl font-bold text-primary/80">
                    {stats.overall.total_sessions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {stats.overall.total_minutes} menit
                </p>
            </div>

            {/* Completion Rate */}
            <div className="p-4 rounded-xl bg-linear-to-br from-primary/10 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-primary/80" />
                    <span className="text-sm font-medium text-primary">Penyelesaian</span>
                </div>
                <div className="text-3xl font-bold text-primary/80">
                    {Math.round(stats.overall.completion_rate)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Rata-rata {stats.overall.average_sessions_per_week.toFixed(1)}/minggu
                </p>
            </div>
        </div>
    );
}
