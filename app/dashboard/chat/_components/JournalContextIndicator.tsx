import Link from "next/link";
import { BookOpen, Eye, ArrowRight } from "lucide-react";

interface JournalContextIndicatorProps {
    journalSharedCount: number;
}

export function JournalContextIndicator({ journalSharedCount }: JournalContextIndicatorProps) {
    if (journalSharedCount <= 0) return null;

    return (
        <div className="px-4 py-2 bg-primary/10 dark:bg-primary/20 border-b border-primary/20 dark:border-primary/60">
            <Link
                href="/dashboard/journal"
                className="flex items-center justify-between group"
            >
                <div className="flex items-center gap-2 text-sm text-primary dark:text-primary/60">
                    <BookOpen className="w-4 h-4" />
                    <span>
                        AI dapat membaca <strong>{journalSharedCount}</strong> jurnal pribadimu
                    </span>
                    <Eye className="w-3 h-3 opacity-50" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-primary/80 group-hover:text-primary dark:group-hover:text-primary/60 transition-colors">
                    Kelola <ArrowRight className="w-3 h-3" />
                </span>
            </Link>
        </div>
    );
}
