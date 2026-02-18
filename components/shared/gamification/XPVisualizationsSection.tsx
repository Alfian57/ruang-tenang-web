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
        "breathing_session": "Latihan Napas",
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
        <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-violet-100 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-foreground">XP Per Hari</h3>
                <span className="text-xs text-muted-foreground ml-auto">30 hari terakhir</span>
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
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
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500 group-hover:from-violet-400 group-hover:to-indigo-400"
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
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data XP</p>
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
        <div className="bg-card rounded-xl border p-5">
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
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
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
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data aktivitas</p>
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

    return (
        <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground">Kalender Aktivitas</h3>
                <span className="text-xs text-muted-foreground ml-auto">12 minggu terakhir</span>
            </div>

            <div className="overflow-x-auto">
                {/* Month labels */}
                <div className="flex mb-1 ml-8">
                    {monthLabels.map((m, i) => (
                        <span
                            key={i}
                            className="text-[10px] text-muted-foreground"
                            style={{
                                position: "relative",
                                left: `${m.col * 18}px`,
                                marginRight: i < monthLabels.length - 1
                                    ? `${Math.max(0, (monthLabels[i + 1]?.col - m.col) * 18 - 24)}px`
                                    : 0,
                            }}
                        >
                            {m.label}
                        </span>
                    ))}
                </div>

                <div className="flex gap-0.5">
                    {/* Day labels */}
                    <div className="flex flex-col gap-0.5 mr-1">
                        {dayLabels.map((label, i) => (
                            <div key={i} className="h-[14px] w-6 flex items-center justify-end pr-1">
                                <span className="text-[9px] text-muted-foreground">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-0.5">
                            {week.map((day) => {
                                const xp = lookup.get(day) || 0;
                                const isToday = day === todayStr;
                                const isFuture = day > todayStr;
                                return (
                                    <div
                                        key={day}
                                        className={`w-[14px] h-[14px] rounded-sm transition-colors ${
                                            isFuture ? "bg-transparent" : getIntensity(xp)
                                        } ${isToday ? "ring-1 ring-foreground/30" : ""}`}
                                        title={`${day}: ${xp} XP`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-3">
                <span className="text-[10px] text-muted-foreground mr-1">Sedikit</span>
                <div className="w-[12px] h-[12px] rounded-sm bg-muted/40" />
                <div className="w-[12px] h-[12px] rounded-sm bg-violet-200" />
                <div className="w-[12px] h-[12px] rounded-sm bg-violet-300" />
                <div className="w-[12px] h-[12px] rounded-sm bg-violet-400" />
                <div className="w-[12px] h-[12px] rounded-sm bg-violet-500" />
                <span className="text-[10px] text-muted-foreground ml-1">Banyak</span>
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
                // Fetch last 90 days of exp history (all pages)
                const endDate = new Date().toISOString().split("T")[0];
                const start = new Date();
                start.setDate(start.getDate() - 90);
                const startDate = start.toISOString().split("T")[0];

                const allHistory: ExpHistory[] = [];
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    const res = await communityService.getExpHistory(token, {
                        page,
                        limit: 100,
                        start_date: startDate,
                        end_date: endDate,
                    });
                    if (res.data && res.data.length > 0) {
                        allHistory.push(...res.data);
                        const totalPages = res.meta?.total_pages || 1;
                        hasMore = page < totalPages;
                        page++;
                    } else {
                        hasMore = false;
                    }
                }

                setExpHistory(allHistory);
            } catch (error) {
                console.error("Failed to fetch XP data:", error);
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
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Belum Ada Data Statistik
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Mulai beraktivitas untuk melihat visualisasi XP kamu di sini.
                    Baca artikel, tulis jurnal, atau ikut berdiskusi di forum!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-card rounded-xl border p-4 text-center">
                    <p className="text-2xl font-bold text-violet-600">
                        {dailyXP.reduce((s, d) => s + d.total, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">XP 30 Hari</p>
                </div>
                <div className="bg-card rounded-xl border p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                        {activityXP.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Jenis Aktivitas</p>
                </div>
                <div className="bg-card rounded-xl border p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {dailyXP.filter(d => d.total > 0).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Hari Aktif</p>
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
