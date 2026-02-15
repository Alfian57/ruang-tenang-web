"use client";

import { JournalAnalytics as JournalAnalyticsType, JournalWeeklySummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart2,
    TrendingUp,
    Calendar,
    Flame,
    FileText,
    Tag,
    Sparkles,
    Brain,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface JournalAnalyticsProps {
    analytics: JournalAnalyticsType | null;
    isLoading?: boolean;
}

interface JournalWeeklySummaryProps {
    summary: JournalWeeklySummary | null;
    isLoading?: boolean;
}

// Mood colors for chart
const moodColors: Record<string, string> = {
    happy: "#22c55e",
    neutral: "#eab308",
    angry: "#ef4444",
    disappointed: "#f97316",
    sad: "#3b82f6",
    crying: "#8b5cf6",
};

const moodLabels: Record<string, string> = {
    happy: "Bahagia",
    neutral: "Netral",
    angry: "Marah",
    disappointed: "Kecewa",
    sad: "Sedih",
    crying: "Menangis",
};

export function JournalAnalytics({ analytics, isLoading = false }: JournalAnalyticsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                            <div className="h-8 w-16 bg-gray-200 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-8">
                <BarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada data analitik. Tulis jurnalmu untuk mulai melacak perkembanganmu!</p>
            </div>
        );
    }

    // Prepare mood distribution data for pie chart
    const moodData = Object.entries(analytics.mood_distribution || {}).map(([mood, count]) => ({
        name: moodLabels[mood] || mood,
        value: count,
        color: moodColors[mood] || "#94a3b8",
    }));

    // Prepare entries by month data for bar chart
    const monthlyData = (analytics.entries_by_month || []).map((item) => ({
        month: item.month,
        count: item.count,
    }));

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <span className="text-xl">😊</span>
                            Distribusi Mood
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {moodData.length > 0 ? (
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={moodData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {moodData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                    {moodData.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-1 text-xs">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span>{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Belum ada data mood</p>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Entries */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart2 className="w-4 h-4" />
                            Jurnal per Bulan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyData.length > 0 ? (
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>
                                        <XAxis dataKey="month" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Belum ada data</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Tags */}
            {analytics.top_tags && analytics.top_tags.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Tag Populer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analytics.top_tags.map((item) => (
                                <span
                                    key={item.tag}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                                >
                                    #{item.tag}
                                    <span className="ml-1 text-gray-500">({item.count})</span>
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export function JournalWeeklySummaryCard({
    summary,
    isLoading = false,
}: JournalWeeklySummaryProps) {
    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-6 w-48 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-3/4 bg-gray-200 rounded" />
                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!summary) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Tulis beberapa jurnal minggu ini untuk mendapatkan ringkasan mingguan!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Ringkasan Mingguanmu
                    </CardTitle>
                    <span className="text-sm text-gray-500">
                        {format(new Date(summary.week_start), "d MMM", { locale: id })} -{" "}
                        {format(new Date(summary.week_end), "d MMM yyyy", { locale: id })}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>{summary.entry_count} jurnal</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span>{(summary.total_words ?? 0).toLocaleString()} kata</span>
                    </div>
                    {summary.dominant_mood && (
                        <div className="flex items-center gap-1">
                            <span>Mood dominan: {moodLabels[summary.dominant_mood] || summary.dominant_mood}</span>
                        </div>
                    )}
                </div>

                {/* AI Summary */}
                <div className="p-4 bg-white rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {summary.summary}
                    </p>
                </div>

                {/* Key Themes */}
                {summary.key_themes && summary.key_themes.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Tema Utama:</p>
                        <div className="flex flex-wrap gap-2">
                            {summary.key_themes.map((theme, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                >
                                    {theme}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {summary.recommendations && summary.recommendations.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Rekomendasi:</p>
                        <ul className="space-y-1">
                            {summary.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-purple-600">•</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
