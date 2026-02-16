import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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
    const moodData = Object.entries(analytics.mood_distribution || {}).map(([mood, count]) => ({
        name: moodLabels[mood] || mood,
        value: count,
        color: moodColors[mood] || "#94a3b8",
    }));

    return (
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
    );
}
