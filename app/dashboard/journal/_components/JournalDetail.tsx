"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Journal } from "@/types";
import {
    Lock,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    ArrowLeft,
    Tag,
    Clock,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JournalDetailProps {
    journal: Journal;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleAIShare: () => void;
}

export function JournalDetail({
    journal,
    onBack,
    onEdit,
    onDelete,
    onToggleAIShare,
}: JournalDetailProps) {
    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onToggleAIShare}>
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
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {/* Title & Mood */}
                <div className="flex items-start gap-3 mb-4">
                    {journal.mood_emoji && (
                        <span className="text-4xl" title={journal.mood_label}>
                            {journal.mood_emoji}
                        </span>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {journal.title}
                        </h1>
                        {journal.mood_label && (
                            <p className="text-sm text-gray-500 mt-1">
                                Mood: {journal.mood_label}
                            </p>
                        )}
                    </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 flex-wrap">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                            {format(new Date(journal.created_at), "EEEE, d MMMM yyyy 'pukul' HH:mm", {
                                locale: id,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{journal.word_count} kata</span>
                    </div>
                    {journal.is_private && (
                        <div className="flex items-center gap-1 text-green-600">
                            <Lock className="w-4 h-4" />
                            <span>Privat</span>
                        </div>
                    )}
                    <div
                        className={cn(
                            "flex items-center gap-1",
                            journal.share_with_ai
                                ? "text-purple-600"
                                : "text-gray-500"
                        )}
                    >
                        {journal.share_with_ai ? (
                            <>
                                <Eye className="w-4 h-4" />
                                <span>AI dapat membaca</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-4 h-4" />
                                <span>AI tidak dapat membaca</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Tags */}
                {journal.tags && journal.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-6">
                        <Tag className="w-4 h-4 text-gray-400" />
                        {journal.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* AI Access Info */}
                {journal.ai_accessed_at && (
                    <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-purple-700">
                            <Eye className="w-4 h-4" />
                            <span>
                                AI terakhir membaca jurnal ini:{" "}
                                {format(new Date(journal.ai_accessed_at!), "d MMMM yyyy 'pukul' HH:mm", {
                                    locale: id,
                                })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Journal Content */}
                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: journal.content }}
                />
            </div>
        </div>
    );
}
