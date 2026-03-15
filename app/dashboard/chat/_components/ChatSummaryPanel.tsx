import { ChatSessionSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

function normalizeSummary(summary?: ChatSessionSummary | null): ChatSessionSummary | null {
    if (!summary) return null;

    if ((summary.main_topics && summary.main_topics.length > 0) ||
        (summary.key_insights && summary.key_insights.length > 0) ||
        (summary.action_items && summary.action_items.length > 0)) {
        return summary;
    }

    const raw = summary.summary?.trim();
    if (!raw || !raw.startsWith("{")) {
        return summary;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<ChatSessionSummary>;
        return {
            ...summary,
            summary: typeof parsed.summary === "string" ? parsed.summary : summary.summary,
            main_topics: Array.isArray(parsed.main_topics) ? parsed.main_topics : summary.main_topics,
            key_insights: Array.isArray(parsed.key_insights) ? parsed.key_insights : summary.key_insights,
            action_items: Array.isArray(parsed.action_items) ? parsed.action_items : summary.action_items,
            sentiment: parsed.sentiment ?? summary.sentiment,
        };
    } catch {
        return summary;
    }
}

interface ChatSummaryPanelProps {
    summary?: ChatSessionSummary | null;
    isGenerating: boolean;
    onGenerate: () => void;
}

export function ChatSummaryPanel({ summary, isGenerating, onGenerate }: ChatSummaryPanelProps) {
    const normalizedSummary = normalizeSummary(summary);

    return (
        <div className="border-b bg-linear-to-r from-primary/5 to-primary/10 p-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Ringkasan Percakapan
                </h4>
                {(!normalizedSummary || !normalizedSummary.summary) && (
                    <Button
                        size="sm"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="text-xs"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Membuat...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Buat Ringkasan
                            </>
                        )}
                    </Button>
                )}
            </div>

            {normalizedSummary && normalizedSummary.summary ? (
                <div className="space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{normalizedSummary.summary}</p>

                    {normalizedSummary.main_topics && normalizedSummary.main_topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500">Topik:</span>
                            {normalizedSummary.main_topics.map((topic, i) => (
                                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    )}

                    {normalizedSummary.sentiment && (
                        <p className="text-xs text-gray-500">
                            <span className="font-medium">Mood:</span> {normalizedSummary.sentiment}
                        </p>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="text-xs text-gray-500 hover:text-primary"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Memperbarui...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Perbarui Ringkasan
                            </>
                        )}
                    </Button>
                </div>
            ) : !isGenerating ? (
                <p className="text-sm text-gray-500">Belum ada ringkasan. Klik tombol untuk membuat ringkasan percakapan.</p>
            ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Membuat ringkasan...
                </div>
            )}
        </div>
    );
}
