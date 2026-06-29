"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/utils";
import { Journal } from "@/types";
import {
    Lock,
    Globe,
    Eye,
    EyeOff,
    MoreVertical,
    Trash2,
    Edit,
    FileText,
    Sparkles,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JournalListItemProps {
    journal: Journal;
    isActive: boolean;
    onDelete: () => void;
    onToggleAIShare: () => void;
}

export function JournalListItem({
    journal,
    isActive,
    onDelete,
    onToggleAIShare,
}: JournalListItemProps) {
    const router = useRouter();
    const journalIdentifier = journal.slug || journal.uuid || String(journal.id);

    // Strip HTML and truncate content for preview
    const rawContent = (journal.preview || journal.content || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const contentPreview = rawContent.length > 320
        ? `${rawContent.slice(0, 320).trimEnd()}…`
        : rawContent;

    const createdLabel = (() => {
        const date = new Date(journal.created_at);
        const now = new Date();
        const displayDate = date > now ? now : date;
        return formatDistanceToNow(displayDate, { addSuffix: true, locale: id });
    })();

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-white transition-all cursor-pointer",
                "hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5",
                isActive
                    ? "border-primary ring-2 ring-primary/15"
                    : "border-gray-200 hover:border-primary/30"
            )}
            onClick={() => router.push(`/dashboard/journal/${journalIdentifier}`)}
        >
            {/* Active/hover accent rail */}
            <span
                className={cn(
                    "absolute inset-y-0 left-0 w-1 bg-primary transition-transform duration-200 origin-top",
                    isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                )}
            />

            <div className="flex items-start gap-3 p-4">
                {/* Mood / icon badge */}
                <div
                    className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl",
                        journal.mood_emoji ? "bg-primary/10" : "bg-gray-100 text-gray-400"
                    )}
                    title={journal.mood_label}
                >
                    {journal.mood_emoji || <FileText className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                    {/* Title row */}
                    <div className="flex items-center gap-2">
                        <h3 className="min-w-0 flex-1 truncate font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {journal.title || "Tanpa Judul"}
                        </h3>
                        {journal.mood_label && (
                            <span className="hidden shrink-0 rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary/80 sm:inline">
                                {journal.mood_label}
                            </span>
                        )}
                    </div>

                    {/* Content Preview */}
                    <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-gray-600">
                        {contentPreview || "Tidak ada konten..."}
                    </p>

                    {/* Tags */}
                    {journal.tags && journal.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            {journal.tags.slice(0, 4).map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {journal.tags.length > 4 && (
                                <span className="text-xs text-gray-400">
                                    +{journal.tags.length - 4}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Meta + privacy badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-dashed pt-3 text-xs text-gray-500">
                        <span>{createdLabel}</span>
                        <span className="text-gray-300">•</span>
                        <span>{journal.word_count} kata</span>

                        <span className="ml-auto flex items-center gap-1.5">
                            {/* Visibility to community (public/private) */}
                            {journal.is_private ? (
                                <span
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600"
                                    title="Hanya kamu yang bisa membaca jurnal ini"
                                >
                                    <Lock className="h-3 w-3" />
                                    Privat
                                </span>
                            ) : (
                                <span
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600"
                                    title="Jurnal ini bisa dilihat komunitas"
                                >
                                    <Globe className="h-3 w-3" />
                                    Publik
                                </span>
                            )}

                            {/* Visibility to AI */}
                            {journal.share_with_ai ? (
                                <span
                                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
                                    title="AI dapat membaca jurnal ini"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    AI
                                </span>
                            ) : (
                                <span
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-500"
                                    title="AI tidak dapat membaca jurnal ini"
                                >
                                    <EyeOff className="h-3 w-3" />
                                    AI
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Actions — always visible */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Opsi jurnal"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/journal/${journalIdentifier}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleAIShare}>
                            {journal.share_with_ai ? (
                                <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Sembunyikan dari AI
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Bagikan ke AI
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
