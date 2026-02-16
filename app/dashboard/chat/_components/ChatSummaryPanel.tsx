import { ChatSessionSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface ChatSummaryPanelProps {
    summary?: ChatSessionSummary | null;
    isGenerating: boolean;
    onGenerate: () => void;
}

export function ChatSummaryPanel({ summary, isGenerating, onGenerate }: ChatSummaryPanelProps) {
    return (
        <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Ringkasan Percakapan
                </h4>
                {(!summary || !summary.summary) && (
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

            {summary && summary.summary ? (
                <div className="space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>

                    {summary.main_topics && summary.main_topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500">Topik:</span>
                            {summary.main_topics.map((topic, i) => (
                                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    )}

                    {summary.sentiment && (
                        <p className="text-xs text-gray-500">
                            <span className="font-medium">Mood:</span> {summary.sentiment}
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
