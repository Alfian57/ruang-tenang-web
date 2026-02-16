import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";
import { formatDate } from "@/utils";
import { ModerationQueueItem as ModerationQueueItemType } from "@/types/moderation";
import { STATUS_LABELS } from "./ModerationQueueHeader";

interface ModerationQueueItemProps {
    item: ModerationQueueItemType;
}

export function ModerationQueueItem({ item }: ModerationQueueItemProps) {
    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="shrink-0">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                            STATUS_LABELS[item.moderation_status]?.color
                        }`}
                    >
                        {STATUS_LABELS[item.moderation_status]?.label}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">
                    Oleh {item.author_name} • {formatDate(item.created_at)}
                </p>
                {item.flag_reasons && item.flag_reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {item.flag_reasons.slice(0, 3).map((reason, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded"
                            >
                                {reason}
                            </span>
                        ))}
                        {item.flag_reasons.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{item.flag_reasons.length - 3} lainnya
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {item.severity && (
                    <span
                        className={`px-2 py-1 text-xs rounded ${
                            item.severity === "high"
                                ? "bg-red-100 text-red-700"
                                : item.severity === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {item.severity === "high"
                            ? "Tinggi"
                            : item.severity === "medium"
                            ? "Sedang"
                            : "Rendah"}
                    </span>
                )}
                <Button asChild size="sm">
                    <Link href={ROUTES.moderationArticle(item.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Tinjau
                    </Link>
                </Button>
            </div>
        </div>
    );
}
