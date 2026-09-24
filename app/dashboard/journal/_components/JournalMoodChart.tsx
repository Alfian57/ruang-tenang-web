import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import Image from "next/image";
import { JournalAnalytics } from "@/types";

interface JournalMoodChartProps {
    analytics: JournalAnalytics;
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

export function JournalMoodChart({ analytics }: JournalMoodChartProps) {
    // Prepare mood distribution data for pie chart
    const moodData = Object.entries(analytics.mood_distribution || {}).filter(([, count]) => count > 0).map(([mood, count]) => ({
        name: moodLabels[mood] || mood,
        value: count,
        color: moodColors[mood] || "#94a3b8",
    }));

    return (
        <Card className="theme-accent-border-soft overflow-hidden rounded-2xl border bg-white shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-theme-accent-soft" aria-hidden="true">
                        <Image src="/images/1-smile.png" alt="" fill sizes="40px" className="p-2 object-contain" />
                    </span>
                    <div className="min-w-0">
                        <CardTitle className="text-base text-slate-900">Distribusi mood</CardTitle>
                        <p className="mt-1 text-xs text-slate-500">Suasana hati yang tercatat di jurnalmu</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {moodData.length > 0 ? (
                    <>
                    <div className="h-48 w-full sm:h-52">
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
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {moodData.map((entry) => (
                            <div key={entry.name} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span>{entry.name}</span>
                                <span className="font-semibold text-slate-800">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                    </>
                ) : (
                    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl bg-slate-50/80 px-4 text-center">
                        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
                            <PieChartIcon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Belum ada data mood</p>
                        <p className="mt-1 text-xs text-slate-500">Tambahkan mood saat menulis jurnal untuk melihat polanya.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
