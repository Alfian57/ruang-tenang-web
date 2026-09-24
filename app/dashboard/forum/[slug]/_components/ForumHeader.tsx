"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Trash2, Flag, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportModal, BlockUserButton } from "@/components/shared/moderation";
import { useRouter } from "next/navigation";
import { Forum, User } from "@/types";
import { parseApiDate } from "@/utils/date";
import { ROUTES } from "@/lib/routes";

interface ForumHeaderProps {
    forum: Forum;
    user: User | null;
    isOwner: boolean;
    isAdmin: boolean;
    onDeleteClick: () => void;
}

export function ForumHeader({
    forum,
    user,
    isOwner,
    isAdmin,
    onDeleteClick,
}: ForumHeaderProps) {
    const router = useRouter();

    return (
        <header className="space-y-4">
            <div className="flex">
                <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(ROUTES.communityTab("forum"))}
                        className="h-9 gap-2 rounded-xl px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke komunitas
                    </Button>
                    {(isOwner || isAdmin || (user && user.id !== forum.user_id)) && (
                        <>
                            <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" aria-label="Aksi topik" className="h-9 gap-2 rounded-xl px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                                        <MoreVertical className="h-4 w-4" />
                                        Aksi
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {(isOwner || isAdmin) && (
                                        <DropdownMenuItem
                                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                            onClick={onDeleteClick}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus Topik
                                        </DropdownMenuItem>
                                    )}
                                    {user && user.id !== forum.user_id && (
                                        <>
                                            <ReportModal
                                                type="forum"
                                                contentId={forum.id}
                                                trigger={
                                                    <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50">
                                                        <Flag className="mr-2 h-4 w-4" />
                                                        Laporkan Topik
                                                    </div>
                                                }
                                            />
                                            <BlockUserButton
                                                userId={forum.user_id}
                                                userName={forum.user?.name || "User"}
                                                className="h-auto w-full justify-start px-2 py-1.5 text-sm font-normal text-red-600 hover:bg-red-50 hover:text-red-600"
                                            />
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            <div className="theme-story-bg theme-story-border relative isolate overflow-hidden rounded-[1.75rem] border p-5 shadow-sm sm:p-7 md:p-8">
                <div aria-hidden="true" className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-white/55 blur-3xl" />
                <div className="relative z-10 max-w-3xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-theme-story-heading shadow-sm">
                            <MessageCircle className="h-3.5 w-3.5" /> Diskusi komunitas
                        </span>
                        {forum.category && (
                            <span className="max-w-full truncate rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600">
                                {forum.category.name}
                            </span>
                        )}
                        <span className="text-xs text-slate-500">
                            {formatDistanceToNow(parseApiDate(forum.created_at), {
                                addSuffix: true,
                                locale: idLocale,
                            })}
                        </span>
                    </div>
                    <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                        {forum.title}
                    </h1>
                </div>
            </div>
        </header>
    );
}
