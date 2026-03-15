"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Trash2, Flag } from "lucide-react";
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
import { Forum, User } from "@/types"; // Handle types
import { parseApiDate } from "@/utils/date";

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
        <div className="bg-white border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sticky top-0 z-10 shrink-0 shadow-sm">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        {forum.category && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wide max-w-full truncate">
                                {forum.category.name}
                            </span>
                        )}
                        <span className="text-xs text-gray-400">
                            {formatDistanceToNow(parseApiDate(forum.created_at), {
                                addSuffix: true,
                                locale: idLocale,
                            })}
                        </span>
                    </div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-800 line-clamp-2 sm:line-clamp-1 wrap-break-word">
                        {forum.title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {(isOwner || isAdmin) && (
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                onClick={onDeleteClick}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Topik
                            </DropdownMenuItem>
                        )}
                        {user && user.id !== forum.user_id && (
                            <>
                                <ReportModal
                                    type="forum"
                                    contentId={forum.id}
                                    trigger={
                                        <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 cursor-pointer">
                                            <Flag className="w-4 h-4 mr-2" />
                                            Laporkan Topik
                                        </div>
                                    }
                                />
                                <BlockUserButton
                                    userId={forum.user_id}
                                    userName={forum.user?.name || "User"}
                                    className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto text-red-600 hover:text-red-600 hover:bg-red-50"
                                />
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
