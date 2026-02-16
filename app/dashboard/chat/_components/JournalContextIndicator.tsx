import Link from "next/link";
import { BookOpen, Eye } from "lucide-react";

interface JournalContextIndicatorProps {
    journalSharedCount: number;
}

export function JournalContextIndicator({ journalSharedCount }: JournalContextIndicatorProps) {
    if (journalSharedCount <= 0) return null;

    return (
        <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
            <Link
                href="/dashboard/journal"
                className="flex items-center justify-between group"
            >
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-400">
                    <BookOpen className="w-4 h-4" />
                    <span>
                        AI dapat membaca <strong>{journalSharedCount}</strong> jurnal pribadimu
                    </span>
                    <Eye className="w-3 h-3 opacity-50" />
                </div>
                <span className="text-xs text-purple-500 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    Kelola →
                </span>
            </Link>
        </div>
    );
}
