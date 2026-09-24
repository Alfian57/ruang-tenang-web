"use client";

import { useEffect, useState, useMemo } from "react";
import { communityService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { ExpHistory } from "@/types";
import { BarChart3, PieChart, CalendarDays, Loader2 } from "lucide-react";

// ==========================================
// Helper Functions
// ==========================================

function formatDateShort(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

function getDayName(dateStr: string): string {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    return days[new Date(dateStr).getDay()];
}

function getMonthName(month: number): string {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return months[month];
}

function getActivityLabel(type: string): string {
    const labels: Record<string, string> = {
        "article_read": "Baca Artikel",
        "article_submit": "Tulis Artikel",
        "article_approved": "Artikel Disetujui",
        "forum_create": "Buat Forum",
        "forum_post": "Posting Forum",
        "post_upvote_given": "Upvote Diberikan",
        "post_upvote_received": "Upvote Diterima",
        "story_approved": "Cerita Disetujui",
        "heart_received": "Hati Diterima",
        "mood_track": "Rekam Mood",
        "journal_create": "Tulis Jurnal",
        "chat_session": "Sesi AI Chat",
        "daily_login": "Login Harian",
        "daily_task": "Tugas Harian",
    };
    return labels[type] || type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

const COLORS = [
    "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b",
    "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#f97316",
];

// ==========================================
// Sub-Components
// ==========================================

interface DailyXP {
    date: string;
    total: number;
}

function XPPerDayChart({ data }: { data: DailyXP[] }) {
    const maxXP = Math.max(...data.map(d => d.total), 1);

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-violet-100 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-foreground">XP Per Hari</h3>
                <span className="text-xs text-muted-foreground ml-auto">30 hari terakhir</span>
            </div>
            <div className="space-y-1.5 max-h-100 overflow-y-auto pr-1">
                {data.map((day) => (
                    <div key={day.date} className="flex items-center gap-2 group">
                        <span className="text-[10px] text-muted-foreground w-12 shrink-0 text-right font-mono">
                            {formatDateShort(day.date)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 w-6 shrink-0">
                            {getDayName(day.date)}
                        </span>
                        <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500 group-hover:from-violet-400 group-hover:to-indigo-400"
                                style={{ width: `${Math.max((day.total / maxXP) * 100, day.total > 0 ? 2 : 0)}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-10 text-right tabular-nums">
                            {day.total > 0 ? `+${day.total}` : "0"}
                        </span>
                    </div>
                ))}
            </div>
            {data.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Belum ada data XP</p>
            )}
        </div>
    );
}

interface ActivityXP {
    type: string;
    total: number;
    count: number;
}

function XPByActivityChart({ data }: { data: ActivityXP[] }) {
    const totalXP = data.reduce((sum, d) => sum + d.total, 0);
    const sorted = [...data].sort((a, b) => b.total - a.total);

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <PieChart className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground">XP Per Aktivitas</h3>
            </div>

            {/* Visual ring */}
            <div className="flex items-center justify-center mb-5">
                <div className="relative w-36 h-36">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {(() => {
                            let offset = 0;
                            return sorted.map((item, i) => {
                                const pct = totalXP > 0 ? (item.total / totalXP) * 100 : 0;
                                const dashArray = `${pct * 2.51327} ${251.327 - pct * 2.51327}`;
                                const dashOffset = -offset * 2.51327;
                                offset += pct;
                                return (
                                    <circle
                                        key={item.type}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke={COLORS[i % COLORS.length]}
                                        strokeWidth="12"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={dashOffset}
                                        className="transition-all duration-500"
                                    />
                                );
                            });
                        })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-foreground">{totalXP.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">Total XP</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 max-h-62.5 overflow-y-auto">
                {sorted.map((item, i) => {
                    const pct = totalXP > 0 ? ((item.total / totalXP) * 100).toFixed(1) : "0";
                    return (
                        <div key={item.type} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <span className="text-sm text-foreground truncate flex-1">
                                {getActivityLabel(item.type)}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {item.count}×
                            </span>
                            <span className="text-xs font-semibold text-foreground tabular-nums w-14 text-right">
                                {item.total} XP
                            </span>
                            <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">
                                {pct}%
                            </span>
                        </div>
                    );
                })}
            </div>

            {data.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Belum ada data aktivitas</p>
            )}
        </div>
    );
}

interface HeatmapDay {
    date: string;
    total: number;
}

function CalendarHeatmap({ data }: { data: HeatmapDay[] }) {
    // Build lookup
    const lookup = useMemo(() => {
        const map = new Map<string, number>();
        data.forEach(d => {
            const key = d.date.split("T")[0];
            map.set(key, (map.get(key) || 0) + d.total);
        });
        return map;
    }, [data]);

    // Generate 12 weeks of dates (84 days)
    const weeks = useMemo(() => {
        const result: string[][] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start from 83 days ago
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 83);

        // Align to start of week (Sunday)
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);

        let currentWeek: string[] = [];
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + (6 - today.getDay())); // fill rest of current week

        const cursor = new Date(startDate);
        while (cursor <= endDate) {
            const key = cursor.toISOString().split("T")[0];
            currentWeek.push(key);
            if (currentWeek.length === 7) {
                result.push(currentWeek);
                currentWeek = [];
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        if (currentWeek.length > 0) result.push(currentWeek);
        return result;
    }, []);

    const maxXP = useMemo(() => {
        let max = 0;
        lookup.forEach(v => { if (v > max) max = v; });
        return max || 1;
    }, [lookup]);

    const getIntensity = (xp: number): string => {
        if (xp === 0) return "bg-muted/40";
        const ratio = xp / maxXP;
        if (ratio <= 0.25) return "bg-violet-200";
        if (ratio <= 0.5) return "bg-violet-300";
        if (ratio <= 0.75) return "bg-violet-400";
        return "bg-violet-500";
    };

    const todayStr = new Date().toISOString().split("T")[0];
    const dayLabels = ["Min", "", "Sel", "", "Kam", "", "Sab"];

    // Month labels
    const monthLabels = useMemo(() => {
        const labels: { label: string; col: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            const firstDay = new Date(week[0]);
            const month = firstDay.getMonth();
            if (month !== lastMonth) {
                labels.push({ label: getMonthName(month), col: wi });
                lastMonth = month;
            }
        });
        return labels;
    }, [weeks]);

    const visibleDays = weeks.flat().filter((day) => day <= todayStr);
    const periodSummary = visibleDays.reduce(
        (summary, day) => {
            const xp = lookup.get(day) || 0;
            summary.totalXP += xp;
            if (xp > 0) summary.activeDays += 1;
            if (xp > summary.bestDayXP) {
                summary.bestDay = day;
                summary.bestDayXP = xp;
            }
            return summary;
        },
        { totalXP: 0, activeDays: 0, bestDay: "", bestDayXP: 0 }
    );
    const activeDayPercent = visibleDays.length > 0
        ? Math.round((periodSummary.activeDays / visibleDays.length) * 100)
        : 0;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">Kalender Aktivitas</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Ritme aktivitasmu dalam 12 minggu terakhir</p>
                </div>
                <span className="ml-auto rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-700">12 minggu</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.8fr)]">
                <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4">
                    <div className="overflow-x-auto pb-1">
                        <div className="w-full min-w-[30rem]">
                            <div className="relative mb-2 ml-7 h-4">
                                {monthLabels.map((month) => (
                                    <span
                                        key={`${month.label}-${month.col}`}
                                        className="absolute top-0 text-[10px] font-medium text-slate-400"
                                        style={{ left: `${(month.col / weeks.length) * 100}%` }}
                                    >
                                        {month.label}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-1">
                                <div className="mr-1 flex w-6 shrink-0 flex-col gap-1">
                                    {dayLabels.map((label, index) => (
                                        <div key={index} className="flex h-4 items-center justify-end pr-1">
                                            <span className="text-[9px] text-slate-400">{label}</span>
                                        </div>
                                    ))}
                                </div>

                                {weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className="flex min-w-5 flex-1 flex-col items-center gap-1">
                                        {week.map((day) => {
                                            const xp = lookup.get(day) || 0;
                                            const isToday = day === todayStr;
                                            const isFuture = day > todayStr;
                                            return (
                                                <div
                                                    key={day}
                                                    className={`h-4 w-4 rounded-[5px] transition-colors ${isFuture ? "bg-transparent" : getIntensity(xp)} ${isToday ? "ring-1 ring-slate-500/50 ring-offset-1" : ""}`}
                                                    title={`${day}: ${xp} XP`}
                                                    aria-label={`${day}: ${xp} XP`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-1.5">
                        <span className="mr-1 text-[10px] text-slate-400">Sedikit</span>
                        <div className="h-3 w-3 rounded-[4px] bg-slate-200" />
                        <div className="h-3 w-3 rounded-[4px] bg-violet-200" />
                        <div className="h-3 w-3 rounded-[4px] bg-violet-300" />
                        <div className="h-3 w-3 rounded-[4px] bg-violet-400" />
                        <div className="h-3 w-3 rounded-[4px] bg-violet-500" />
                        <span className="ml-1 text-[10px] text-slate-400">Banyak</span>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,white_72%)] p-4 sm:col-span-2 lg:col-span-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">XP terkumpul · 12 minggu</p>
                        <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{periodSummary.totalXP.toLocaleString("id-ID")} <span className="text-sm font-bold text-violet-500">XP</span></p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600" style={{ width: `${activeDayPercent}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Ada aktivitas pada {periodSummary.activeDays} dari {visibleDays.length} hari.</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                        <p className="text-xs font-medium text-slate-500">Hari paling aktif</p>
                        <p className="mt-2 text-xl font-black text-slate-900">+{periodSummary.bestDayXP.toLocaleString("id-ID")} XP</p>
                        <p className="mt-1 text-xs text-slate-400">{periodSummary.bestDay ? `${periodSummary.bestDay.slice(8, 10)}/${periodSummary.bestDay.slice(5, 7)}` : "Belum ada aktivitas"}</p>
                    </div>

                    <div className="flex items-center rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:col-span-2 lg:col-span-1">
                        <p className="text-sm leading-relaxed text-emerald-800">Konsistensi tumbuh dari langkah kecil yang kamu ulangi.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Main Component
// ==========================================

export function XPVisualizationsSection() {
    const { token } = useAuthStore();
    const [expHistory, setExpHistory] = useState<ExpHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                // Fetch last 90 days of exp history (single page to avoid excessive requests)
                const endDate = new Date().toISOString().split("T")[0];
                const start = new Date();
                start.setDate(start.getDate() - 90);
                const startDate = start.toISOString().split("T")[0];

                const res = await communityService.getExpHistory(token, {
                    page: 1,
                    limit: 100,
                    start_date: startDate,
                    end_date: endDate,
                });

                setExpHistory(Array.isArray(res.data) ? res.data : []);
            } catch {
                setExpHistory([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    // Process data for charts
    const dailyXP = useMemo((): DailyXP[] => {
        const map = new Map<string, number>();

        // Initialize last 30 days with 0
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            map.set(d.toISOString().split("T")[0], 0);
        }

        // Fill with actual data
        expHistory.forEach(entry => {
            const key = entry.created_at.split("T")[0];
            if (map.has(key)) {
                map.set(key, (map.get(key) || 0) + entry.points);
            }
        });

        return Array.from(map.entries())
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [expHistory]);

    const activityXP = useMemo((): ActivityXP[] => {
        const map = new Map<string, { total: number; count: number }>();
        expHistory.forEach(entry => {
            const existing = map.get(entry.activity_type) || { total: 0, count: 0 };
            existing.total += entry.points;
            existing.count += 1;
            map.set(entry.activity_type, existing);
        });
        return Array.from(map.entries()).map(([type, stats]) => ({
            type,
            total: stats.total,
            count: stats.count,
        }));
    }, [expHistory]);

    const heatmapData = useMemo((): HeatmapDay[] => {
        return expHistory.map(entry => ({
            date: entry.created_at,
            total: entry.points,
        }));
    }, [expHistory]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
                <p className="text-sm text-muted-foreground">Memuat data statistik...</p>
            </div>
        );
    }

    if (expHistory.length === 0) {
        return (
            <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">
                    Belum Ada Data Statistik
                </h3>
                <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                    Mulai beraktivitas untuk melihat visualisasi XP kamu di sini.
                    Baca artikel, tulis jurnal, atau ikut berdiskusi di forum!
                </p>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,white_75%)] p-4 sm:p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">XP 30 hari</p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-violet-600">
                            {dailyXP.reduce((sum, day) => sum + day.total, 0).toLocaleString("id-ID")}
                        </p>
                    </div>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,white_75%)] p-4 sm:p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jenis aktivitas</p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-blue-600">{activityXP.length}</p>
                    </div>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <PieChart className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,white_75%)] p-4 sm:p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hari aktif</p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-emerald-600">
                            {dailyXP.filter(d => d.total > 0).length}
                        </p>
                    </div>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <CalendarHeatmap data={heatmapData} />
            <div className="grid md:grid-cols-2 gap-6">
                <XPPerDayChart data={dailyXP} />
                <XPByActivityChart data={activityXP} />
            </div>
        </div>
    );
}
