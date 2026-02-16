import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, TrendingUp, Brain } from "lucide-react";
import { format } from "date-fns";
import { parseApiDate } from "@/utils/date";
import { id } from "date-fns/locale";
import { JournalWeeklySummary as JournalWeeklySummaryType } from "@/types";

interface JournalWeeklySummaryProps {
    summary: JournalWeeklySummaryType | null;
    isLoading?: boolean;
}

const moodLabels: Record<string, string> = {
    happy: "Bahagia",
    neutral: "Netral",
    angry: "Marah",
    disappointed: "Kecewa",
    sad: "Sedih",
    crying: "Menangis",
};

export function JournalWeeklySummary({
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
                        {format(parseApiDate(summary.week_start), "d MMM", { locale: id })} -{" "}
                        {format(parseApiDate(summary.week_end), "d MMM yyyy", { locale: id })}
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
