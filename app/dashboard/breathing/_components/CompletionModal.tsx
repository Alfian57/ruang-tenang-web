"use client";

import {
    MOOD_OPTIONS,
    formatBreathingDuration,
    MoodId,
    SessionCompletionResult
} from "@/types/breathing";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletionModalProps {
    isOpen: boolean;
    result: SessionCompletionResult | null;
    moodAfter: MoodId | null;
    setMoodAfter: (mood: MoodId) => void;
    onExit: () => void;
}

export function CompletionModal({
    isOpen,
    result,
    moodAfter,
    setMoodAfter,
    onExit,
}: CompletionModalProps) {
    if (!isOpen || !result) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-md p-6 text-center">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                    result.session.completed ? "bg-green-500/20" : "bg-amber-500/20"
                )}>
                    <Check className={cn(
                        "w-10 h-10",
                        result.session.completed ? "text-green-500" : "text-amber-500"
                    )} />
                </div>

                <h3 className="text-2xl font-bold mb-2">
                    {result.session.completed ? "Sesi Selesai!" : "Sesi Belum Selesai"}
                </h3>
                <p className="text-muted-foreground mb-6">
                    Kamu telah berlatih selama {formatBreathingDuration(result.session.duration_seconds)}
                </p>

                {/* Daily Task Completion - Only show if completed */}
                {result.session.completed ? (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-2xl">✅</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                Daily Task Selesai!
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Klaim poin di menu Daily Tasks</p>
                            <p className="mt-1 font-medium text-green-600">+{result.xp_earned} XP</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-2xl">⚠️</span>
                            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                Belum Memenuhi Target
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Selesaikan latihan hingga penuh untuk menyelesaikan daily task
                        </p>
                    </div>
                )}

                {/* Streak Info - Only show if completed */}
                {result.session.completed && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="text-2xl">🔥</div>
                        <span className="text-lg font-semibold">{result.new_streak} Hari Streak</span>
                    </div>
                )}

                {/* Mood After */}
                <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Bagaimana perasaanmu sekarang?</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {MOOD_OPTIONS.filter(m => ["calm", "happy", "energized", "focused", "neutral"].includes(m.id)).map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => setMoodAfter(mood.id as MoodId)}
                                className={cn(
                                    "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
                                    moodAfter === mood.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                <span>{mood.emoji}</span>
                                <span>{mood.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onExit}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                    Selesai
                </button>
            </div>
        </div>
    );
}
