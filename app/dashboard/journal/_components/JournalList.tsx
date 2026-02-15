"use client";

import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Journal } from "@/types";
import {
    Lock,
    Eye,
    EyeOff,
    MoreVertical,
    Trash2,
    Edit,
    Tag,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface JournalListProps {
    journals: Journal[];
    activeJournalId?: number;
    onSelect: (journal: Journal) => void;
    onEdit: (journal: Journal) => void;
    onDelete: (journal: Journal) => void;
    onToggleAIShare: (journal: Journal) => void;
    isLoading?: boolean;
}

function JournalListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="p-4 bg-white rounded-lg border border-gray-200"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4 bg-gray-200" />
                            <Skeleton className="h-4 w-full bg-gray-200" />
                            <Skeleton className="h-4 w-2/3 bg-gray-200" />
                        </div>
                        <Skeleton className="h-8 w-8 bg-gray-200 ml-4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function JournalListItem({
    journal,
    isActive,
    onSelect,
    onEdit,
    onDelete,
    onToggleAIShare,
}: {
    journal: Journal;
    isActive: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleAIShare: () => void;
}) {
    // Strip HTML and truncate content for preview
    const contentPreview = journal.content
        .replace(/<[^>]*>/g, "")
        .slice(0, 150)
        .trim();

    return (
        <div
            className={cn(
                "group p-4 bg-white rounded-lg border transition-all cursor-pointer hover:shadow-md",
                isActive
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300"
            )}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Title & Mood */}
                    <div className="flex items-center gap-2 mb-1">
                        {journal.mood_emoji && (
                            <span className="text-lg" title={journal.mood_label}>
                                {journal.mood_emoji}
                            </span>
                        )}
                        <h3 className="font-medium text-gray-900 truncate">
                            {journal.title}
                        </h3>
                    </div>

                    {/* Content Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {contentPreview || "Tidak ada konten..."}
                    </p>

                    {/* Tags */}
                    {journal.tags && journal.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mb-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            {journal.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {journal.tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                    +{journal.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                            {formatDistanceToNow(new Date(journal.created_at), {
                                addSuffix: true,
                                locale: id,
                            })}
                        </span>
                        <span>•</span>
                        <span>{journal.word_count} kata</span>
                        {journal.is_private && (
                            <>
                                <span>•</span>
                                <Lock className="w-3 h-3" />
                            </>
                        )}
                        {journal.share_with_ai ? (
                            <>
                                <span>•</span>
                                <span title="AI dapat membaca">
                                    <Eye className="w-3 h-3 text-purple-500" />
                                </span>
                            </>
                        ) : (
                            <>
                                <span>•</span>
                                <span title="AI tidak dapat membaca">
                                    <EyeOff className="w-3 h-3" />
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleAIShare}>
                            {journal.share_with_ai ? (
                                <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Sembunyikan dari AI
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Bagikan ke AI
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export function JournalList({
    journals,
    activeJournalId,
    onSelect,
    onEdit,
    onDelete,
    onToggleAIShare,
    isLoading = false,
}: JournalListProps) {
    if (isLoading) {
        return <JournalListSkeleton />;
    }

    if (journals.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada jurnal
                </h3>
                <p className="text-sm text-gray-600">
                    Mulai menulis jurnal pertamamu hari ini!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {journals.map((journal) => (
                <JournalListItem
                    key={journal.id}
                    journal={journal}
                    isActive={journal.id === activeJournalId}
                    onSelect={() => onSelect(journal)}
                    onEdit={() => onEdit(journal)}
                    onDelete={() => onDelete(journal)}
                    onToggleAIShare={() => onToggleAIShare(journal)}
                />
            ))}
        </div>
    );
}
