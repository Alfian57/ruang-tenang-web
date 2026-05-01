"use client";

import {
    BreathingSessionDraft,
    MOOD_OPTIONS,
    MoodId,
    SessionCompletionResult,
    formatBreathingDuration,
} from "@/types/breathing";
import { CheckCircle2, Flame, Loader2, RotateCcw, Save, Trophy } from "lucide-react";
import { cn } from "@/utils";

interface CompletionModalProps {
    isOpen: boolean;
    draft: BreathingSessionDraft | null;
    result: SessionCompletionResult | null;
    moodAfter: MoodId | null;
    setMoodAfter: (mood: MoodId) => void;
    isSaving: boolean;
    onSubmit: () => void;
    onRepeat: () => void;
    onExit: () => void;
}

export function CompletionModal({
    isOpen,
    draft,
    result,
    moodAfter,
    setMoodAfter,
    isSaving,
    onSubmit,
    onRepeat,
    onExit,
}: CompletionModalProps) {
    if (!isOpen || (!draft && !result)) return null;

    const hasResult = Boolean(result);
    const completed = result?.session.completed ?? draft?.completed ?? false;
    const durationSeconds = result?.session.duration_seconds ?? draft?.durationSeconds ?? 0;
    const cyclesCompleted = result?.session.cycles_completed ?? draft?.cyclesCompleted ?? 0;
    const completedPercentage = result?.session.completed_percentage ?? draft?.completedPercentage ?? 0;
    const afterMoodOptions = MOOD_OPTIONS.filter((mood) =>
        ["calm", "happy", "energized", "focused", "neutral"].includes(mood.id)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 text-center shadow-xl">
                <div
                    className={cn(
                        "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                        completed ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"
                    )}
                >
                    {hasResult ? <CheckCircle2 className="h-8 w-8" /> : <Save className="h-8 w-8" />}
                </div>

                <h3 className="text-2xl font-bold">
                    {hasResult ? (completed ? "Sesi Tersimpan" : "Sesi Dicatat") : "Refleksi Setelah Sesi"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {hasResult
                        ? "Catatan latihan sudah masuk ke statistik pernapasanmu."
                        : "Sebelum menyimpan, catat perubahan yang kamu rasakan agar progresnya lebih bermakna."}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2 text-left">
                    <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Durasi</p>
                        <p className="mt-1 text-sm font-semibold">{formatBreathingDuration(durationSeconds)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Siklus</p>
                        <p className="mt-1 text-sm font-semibold">{cyclesCompleted}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Progres</p>
                        <p className="mt-1 text-sm font-semibold">{completedPercentage}%</p>
                    </div>
                </div>

                {!hasResult ? (
                    <>
                        <div className="mt-6 text-left">
                            <p className="text-sm font-semibold">Bagaimana perasaanmu sekarang?</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {afterMoodOptions.map((mood) => (
                                    <button
                                        key={mood.id}
                                        type="button"
                                        onClick={() => setMoodAfter(mood.id as MoodId)}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors",
                                            moodAfter === mood.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        <span>{mood.emoji}</span>
                                        <span>{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={isSaving}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {isSaving ? "Menyimpan..." : "Simpan Sesi"}
                        </button>
                    </>
                ) : (
                    <>
                        {completed ? (
                            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                                <div className="flex items-center justify-center gap-2 font-semibold text-green-700 dark:text-green-300">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Misi harian selesai
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">Klaim poin di menu Misi Harian.</p>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                                <p className="font-semibold text-amber-700 dark:text-amber-300">Belum memenuhi target</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Selesaikan latihan hingga penuh untuk menyelesaikan Misi Harian.
                                </p>
                            </div>
                        )}

                        {completed && result && (
                            <div className="mt-4 rounded-xl bg-muted/50 p-4">
                                {result.streak_milestone ? (
                                    <div>
                                        <Trophy className="mx-auto h-7 w-7 text-primary" />
                                        <p className="mt-2 font-semibold">
                                            {result.new_streak >= 30 ? "30 hari berturut-turut" : "7 hari berturut-turut"}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Bonus streak +{result.streak_milestone_xp} XP.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Flame className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{result.new_streak} hari streak</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={onRepeat}
                                className="flex items-center justify-center gap-2 rounded-xl bg-muted py-3 font-semibold text-foreground transition-colors hover:bg-muted/80"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Ulangi Teknik
                            </button>
                            <button
                                type="button"
                                onClick={onExit}
                                className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Kembali
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
