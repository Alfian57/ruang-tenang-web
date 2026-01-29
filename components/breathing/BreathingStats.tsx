"use client";

import { BreathingStats, BreathingCalendarDay, TechniqueUsageStats } from "@/types/breathing";
import { Flame, Target, Clock, TrendingUp, Calendar, Award } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface StreakBannerProps {
    currentStreak: number;
    streakAtRisk?: boolean;
    needsPractice?: boolean;
}

export function StreakBanner({ currentStreak, streakAtRisk, needsPractice }: StreakBannerProps) {
    if (currentStreak === 0 && !needsPractice) return null;

    return (
        <div className={cn(
            "p-4 rounded-xl flex items-center gap-4",
            streakAtRisk
                ? "bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-300"
                : currentStreak >= 7
                    ? "bg-linear-to-r from-orange-500/20 to-red-500/20 border border-orange-300"
                    : "bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20"
        )}>
            <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                streakAtRisk ? "bg-amber-500" : currentStreak >= 7 ? "bg-orange-500" : "bg-primary"
            )}>
                <Flame className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
                <h3 className={cn(
                    "font-semibold text-lg",
                    streakAtRisk ? "text-amber-700" : currentStreak >= 7 ? "text-orange-700" : "text-primary"
                )}>
                    {streakAtRisk
                        ? "Streak dalam bahaya!"
                        : currentStreak >= 7
                            ? `🔥 ${currentStreak} Hari Berturut-turut!`
                            : `${currentStreak} Hari Streak`}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {streakAtRisk
                        ? "Latihan hari ini untuk menjaga streak kamu"
                        : needsPractice
                            ? "Latihan hari ini untuk melanjutkan streak"
                            : "Pertahankan semangat bernapasmu!"}
                </p>
            </div>
        </div>
    );
}

interface CalendarHeatmapProps {
    days: BreathingCalendarDay[];
    month: number;
    year: number;
}

export function CalendarHeatmap({ days, month, year }: CalendarHeatmapProps) {
    // Create a map for quick lookup
    const dayMap = new Map(days.map(d => [d.date, d]));

    // Get first day of month and total days
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday

    // Day names
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    // Generate calendar grid
    const calendarDays: (BreathingCalendarDay | null)[] = [];

    // Add empty slots for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        calendarDays.push(dayMap.get(dateStr) || {
            date: dateStr,
            sessions_count: 0,
            total_minutes: 0,
            techniques_used: [],
            intensity: 0,
        });
    }

    // Intensity colors
    const getIntensityColor = (intensity: number) => {
        switch (intensity) {
            case 3: return "bg-green-500";
            case 2: return "bg-green-400";
            case 1: return "bg-green-300";
            default: return "bg-muted";
        }
    };

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return (
        <div className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{monthNames[month - 1]} {year}</h3>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            "aspect-square rounded-md flex items-center justify-center text-xs",
                            day ? getIntensityColor(day.intensity) : "bg-transparent",
                            day && day.sessions_count > 0 && "cursor-pointer hover:ring-2 hover:ring-primary"
                        )}
                        title={day ? `${day.date}: ${day.sessions_count} sesi, ${day.total_minutes} menit` : ""}
                    >
                        {day && (
                            <span className={cn(
                                day.intensity > 0 ? "text-white font-medium" : "text-muted-foreground"
                            )}>
                                {parseInt(day.date.split("-")[2])}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Kurang</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-muted" />
                    <div className="w-3 h-3 rounded bg-green-300" />
                    <div className="w-3 h-3 rounded bg-green-400" />
                    <div className="w-3 h-3 rounded bg-green-500" />
                </div>
                <span>Banyak</span>
            </div>
        </div>
    );
}

interface TechniqueUsageChartProps {
    usage: TechniqueUsageStats[];
}

export function TechniqueUsageChart({ usage }: TechniqueUsageChartProps) {
    if (usage.length === 0) {
        return (
            <div className="p-4 rounded-xl bg-card border text-center py-8">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Belum ada data penggunaan teknik</p>
            </div>
        );
    }

    // Color palette
    const colors = [
        "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
        "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    ];

    return (
        <div className="p-4 rounded-xl bg-card border">
            <h3 className="font-semibold mb-4">Teknik yang Digunakan</h3>

            <div className="space-y-3">
                {usage.map((item, index) => (
                    <div key={item.technique_id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">{item.technique_name}</span>
                            <span className="text-muted-foreground">
                                {item.sessions_count} sesi ({Math.round(item.percentage)}%)
                            </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${item.percentage}%`,
                                    backgroundColor: colors[index % colors.length],
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
