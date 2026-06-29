"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Users, FileText, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { journalService } from "@/services/api";
import { useDebounce } from "@/hooks/use-debounce";
import type { PublicJournalListItem, PublicJournal } from "@/types";
import { cn } from "@/utils";
import { sanitizeHtml } from "@/utils/sanitize";

const AVATAR_GRADIENTS = [
    "from-blue-400 to-blue-600",
    "from-emerald-400 to-emerald-600",
    "from-purple-400 to-purple-600",
    "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600",
    "from-cyan-400 to-cyan-600",
] as const;

function hashString(value: string): number {
    return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function relativeTime(value: string): string {
    const date = new Date(value);
    const now = new Date();
    return formatDistanceToNow(date > now ? now : date, { addSuffix: true, locale: id });
}

function AuthorAvatar({ name, avatar, size = 40 }: { name: string; avatar?: string; size?: number }) {
    if (avatar) {
        return (
            <Image
                src={avatar}
                alt={name}
                width={size}
                height={size}
                className="shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                style={{ width: size, height: size }}
                unoptimized
            />
        );
    }
    const gradient = AVATAR_GRADIENTS[hashString(name || "?") % AVATAR_GRADIENTS.length];
    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm",
                gradient
            )}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {(name || "?").charAt(0).toUpperCase()}
        </div>
    );
}

export function JournalCommunity() {
    const { token } = useAuthStore();
    const [journals, setJournals] = useState<PublicJournalListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [detail, setDetail] = useState<PublicJournal | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const fetchJournals = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await journalService.listPublic(token, {
                page: 1,
                limit: 20,
                q: debouncedSearch || undefined,
            });
            setJournals(res.data ?? []);
        } catch {
            setJournals([]);
        } finally {
            setIsLoading(false);
        }
    }, [token, debouncedSearch]);

    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);

    const openDetail = async (uuid: string) => {
        if (!token) return;
        setSelectedUuid(uuid);
        setIsLoadingDetail(true);
        setDetail(null);
        try {
            const res = await journalService.getPublic(token, uuid);
            setDetail(res.data);
        } catch {
            setDetail(null);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const closeDetail = () => {
        setSelectedUuid(null);
        setDetail(null);
    };

    return (
        <div className="space-y-4">
            {/* Intro + search */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Users className="h-4 w-4 text-primary" />
                    Jurnal Komunitas
                </p>
                <p className="mt-1 text-xs text-gray-600">
                    Refleksi yang dibagikan publik oleh anggota komunitas. Jurnal pribadimu tetap aman dan hanya bisa kamu lihat.
                </p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Cari jurnal komunitas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white pl-10"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        aria-label="Bersihkan pencarian"
                    >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white" />
                    ))}
                </div>
            ) : journals.length === 0 ? (
                <div className="py-16 text-center">
                    <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-500">Belum ada jurnal komunitas</h3>
                    <p className="mt-1 text-sm text-gray-400">
                        {search
                            ? "Tidak ada hasil yang cocok dengan pencarianmu."
                            : "Jadilah yang pertama berbagi refleksi dengan menandai jurnalmu sebagai publik."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {journals.map((j) => (
                        <button
                            key={j.uuid}
                            type="button"
                            onClick={() => openDetail(j.uuid)}
                            className="group block w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                        >
                            <div className="flex items-center gap-3">
                                <AuthorAvatar name={j.author.name} avatar={j.author.avatar} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">{j.author.name}</p>
                                    <p className="text-xs text-gray-500">{relativeTime(j.created_at)}</p>
                                </div>
                                {j.mood_emoji && (
                                    <span className="text-xl" title={j.mood_label}>{j.mood_emoji}</span>
                                )}
                            </div>

                            <h3 className="mt-3 font-bold text-gray-900 transition-colors group-hover:text-primary line-clamp-1">
                                {j.title || "Tanpa Judul"}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
                                {j.preview || "Tidak ada konten..."}
                            </p>

                            {j.tags && j.tags.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                    {j.tags.slice(0, 4).map((tag) => (
                                        <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-3 flex items-center gap-2 border-t border-dashed pt-3 text-xs text-gray-500">
                                <FileText className="h-3.5 w-3.5" />
                                <span>{j.word_count} kata</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Read-only detail */}
            <Dialog open={!!selectedUuid} onOpenChange={(open) => !open && closeDetail()}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    {isLoadingDetail ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : detail ? (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 pr-6">
                                    <AuthorAvatar name={detail.author.name} avatar={detail.author.avatar} size={44} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-gray-900">{detail.author.name}</p>
                                        <p className="text-xs text-gray-500">{relativeTime(detail.created_at)}</p>
                                    </div>
                                </div>
                                <DialogTitle className="mt-3 flex items-center gap-2 text-left text-xl">
                                    {detail.mood_emoji && <span>{detail.mood_emoji}</span>}
                                    {detail.title || "Tanpa Judul"}
                                </DialogTitle>
                            </DialogHeader>

                            <div
                                className="prose prose-sm mt-2 max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.content) }}
                            />

                            {detail.tags && detail.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-4">
                                    {detail.tags.map((tag) => (
                                        <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                <FileText className="h-3.5 w-3.5" />
                                <span>{detail.word_count} kata</span>
                            </div>
                        </>
                    ) : (
                        <div className="py-16 text-center text-sm text-gray-500">
                            Jurnal tidak ditemukan atau sudah tidak dibagikan publik.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
