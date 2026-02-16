import { useState } from "react";
import { JournalAIContext } from "@/types";
import { Info, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface JournalAIContextPreviewProps {
    context: JournalAIContext | null;
    isLoading?: boolean;
}

export function JournalAIContextPreview({
    context,
    isLoading = false,
}: JournalAIContextPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary animate-spin" />
                        <CardTitle className="text-lg">Memuat konteks...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    if (!context) return null;

    const entries = context.entries || [];

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Yang AI Bisa Baca</CardTitle>
                        <span className="text-sm text-gray-500">
                            ({context.total_shared} jurnal dibagikan)
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent>
                    {entries.length === 0 ? (
                        <div className="text-center py-4">
                            <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                                AI tidak dapat membaca jurnal apapun saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {entry.mood_emoji && (
                                            <span className="text-sm">{entry.mood_emoji}</span>
                                        )}
                                        <p className="font-medium text-sm">{entry.title}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {entry.content_preview}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span>
                                            {format(new Date(entry.created_at), "d MMM yyyy", { locale: id })}
                                        </span>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{entry.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
