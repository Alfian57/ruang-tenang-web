import { useState } from "react";
import { JournalAIAccessLog } from "@/types";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { parseApiDate } from "@/utils/date";
import { id } from "date-fns/locale";

interface JournalAIAccessLogsProps {
    logs: JournalAIAccessLog[];
    isLoading?: boolean;
}

export function JournalAIAccessLogs({ logs = [], isLoading = false }: JournalAIAccessLogsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary animate-spin" />
                        <CardTitle className="text-lg">Memuat log akses...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Log Akses AI</CardTitle>
                        <span className="text-sm text-gray-500">({logs.length} akses)</span>
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
                    {logs.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            Belum ada log akses AI.
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-auto">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-sm">
                                            {log.journal?.title || `Jurnal #${log.journal_id}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Konteks: {log.context_type}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {(() => {
                
                                            // Clamp future dates to now to avoid "in about X hours"
                                            // The parseApiDate handles the Z suffix correctly
                                            return formatDistanceToNow(parseApiDate(log.accessed_at), {
                                                addSuffix: true,
                                                locale: id,
                                            });
                                        })()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
