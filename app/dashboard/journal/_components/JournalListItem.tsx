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
    Brain,
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
        <article
            className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5",
                isActive
                    ? "border-primary/40 ring-2 ring-primary/10"
                    : "border-slate-200/80 hover:border-primary/25"
            )}
            onClick={() => router.push(`/dashboard/journal/${journalIdentifier}`)}
        >
            <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-theme-accent-soft opacity-60 blur-3xl transition-opacity group-hover:opacity-90" />

            <div className="relative p-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            {journal.mood_label ? (
                                <span className="max-w-full truncate rounded-full border border-theme-accent-border-soft bg-theme-accent-soft px-2.5 py-1 text-[11px] font-semibold text-theme-accent-dark">
                                    {journal.mood_label}
                                </span>
                            ) : (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                    Catatan refleksi
                                </span>
                            )}
                            <span className="text-xs text-slate-500">{createdLabel}</span>
                            <span aria-hidden="true" className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{journal.word_count.toLocaleString()} kata</span>
                        </div>

                        <h3 className="truncate text-base font-semibold text-slate-900 transition-colors group-hover:text-theme-accent-dark sm:text-lg">
                            {journal.title || "Tanpa Judul"}
                        </h3>
                    </div>

                    {/* Actions stay visible without relying on hover. */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition-colors hover:border-theme-accent-border hover:bg-theme-accent-soft hover:text-theme-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
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

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {contentPreview || "Tidak ada konten..."}
                </p>

                {journal.tags && journal.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {journal.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                            >
                                #{tag}
                            </span>
                        ))}
                        {journal.tags.length > 4 && (
                            <span className="text-xs text-slate-400">+{journal.tags.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 text-xs">
                    {journal.is_private ? (
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600"
                            title="Hanya kamu yang bisa membaca jurnal ini"
                        >
                            <Lock className="h-3 w-3" />
                            Privat
                        </span>
                    ) : (
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700"
                            title="Jurnal ini bisa dilihat komunitas"
                        >
                            <Globe className="h-3 w-3" />
                            Publik
                        </span>
                    )}

                    {journal.share_with_ai ? (
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent-soft px-2.5 py-1 font-medium text-theme-accent-dark"
                            title="AI dapat membaca jurnal ini"
                        >
                            <Brain className="h-3 w-3" />
                            AI
                        </span>
                    ) : (
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-500"
                            title="AI tidak dapat membaca jurnal ini"
                        >
                            <EyeOff className="h-3 w-3" />
                            AI
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
