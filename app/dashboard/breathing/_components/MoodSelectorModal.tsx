"use client";

import {
    BACKGROUND_SOUNDS,
    BREATHING_INTENT_PRESETS,
    BreathingIntentPreset,
    BreathingTechnique,
    DURATION_OPTIONS,
    MOOD_OPTIONS,
    BackgroundSoundId,
    BreathingIntentId,
    MoodId,
    formatBreathingDuration,
} from "@/types/breathing";
import { Clock, Music2, Sparkles, Target, X } from "lucide-react";
import { cn } from "@/utils";

interface MoodSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTechnique?: BreathingTechnique | null;
    selectedDuration: number;
    setSelectedDuration: (duration: number) => void;
    selectedIntentId: BreathingIntentId | null;
    onSelectIntent: (preset: BreathingIntentPreset) => void;
    moodBefore: MoodId | null;
    setMoodBefore: (mood: MoodId) => void;
    backgroundSound: BackgroundSoundId;
    setBackgroundSound: (sound: BackgroundSoundId) => void;
    onStart: () => void;
}

export function MoodSelectorModal({
    isOpen,
    onClose,
    selectedTechnique,
    selectedDuration,
    setSelectedDuration,
    selectedIntentId,
    onSelectIntent,
    moodBefore,
    setMoodBefore,
    backgroundSound,
    setBackgroundSound,
    onStart,
}: MoodSelectorModalProps) {
    if (!isOpen || !selectedTechnique) return null;

    const cycleDuration =
        selectedTechnique.total_cycle_duration ||
        selectedTechnique.inhale_duration +
            selectedTechnique.inhale_hold_duration +
            selectedTechnique.exhale_duration +
            selectedTechnique.exhale_hold_duration;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-2 min-[420px]:p-4 sm:items-center">
            <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card shadow-xl min-[420px]:rounded-2xl sm:max-h-[88dvh]">
                <div className="flex shrink-0 items-start justify-between gap-3 border-b bg-card px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">Persiapan Perjalanan Napas</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">Pilih tujuan, ritme, dan suasana sesi.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-lg p-2 transition-colors hover:bg-muted"
                        aria-label="Tutup persiapan sesi"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
                    <div className="rounded-2xl border p-4 sm:p-5">
                        <div className="flex flex-col gap-4">
                            <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">Teknik terpilih</p>
                                <h4 className="mt-1 break-words text-lg font-semibold leading-tight sm:text-xl">{selectedTechnique.name}</h4>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedTechnique.description}</p>
                            </div>
                            <div className="grid w-full grid-cols-1 gap-2 text-sm min-[360px]:grid-cols-2">
                                <div className="rounded-xl bg-muted/50 p-3">
                                    <p className="whitespace-nowrap text-xs text-muted-foreground">Siklus</p>
                                    <p className="mt-1 whitespace-nowrap font-semibold">{cycleDuration}s</p>
                                </div>
                                <div className="rounded-xl bg-muted/50 p-3">
                                    <p className="whitespace-nowrap text-xs text-muted-foreground">Durasi</p>
                                    <p className="mt-1 whitespace-nowrap font-semibold">{formatBreathingDuration(selectedDuration)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold">Tujuan sesi</h4>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {BREATHING_INTENT_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => onSelectIntent(preset)}
                                    className={cn(
                                        "min-w-0 rounded-xl border p-4 text-left transition-all",
                                        selectedIntentId === preset.id
                                            ? "border-primary bg-primary/10 shadow-sm"
                                            : "border-muted bg-muted/30 hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex min-w-0 items-center gap-2 font-semibold">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="min-w-0 break-words">{preset.label}</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{preset.description}</p>
                                    <p className="mt-3 text-xs font-medium text-muted-foreground">
                                        {formatBreathingDuration(preset.durationSeconds)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold">Durasi latihan</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:grid-cols-6">
                            {DURATION_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedDuration(option.value)}
                                    className={cn(
                                        "min-h-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        selectedDuration === option.value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    )}
                                >
                                    {option.shortLabel}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4 className="mb-3 font-semibold">Bagaimana perasaanmu sekarang?</h4>
                        <div className="flex flex-wrap gap-2">
                            {MOOD_OPTIONS.map((mood) => (
                                <button
                                    key={mood.id}
                                    type="button"
                                    onClick={() => setMoodBefore(mood.id as MoodId)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors",
                                        moodBefore === mood.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    )}
                                >
                                    <span>{mood.emoji}</span>
                                    <span>{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="mb-3 flex items-center gap-2">
                            <Music2 className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold">Suara latar</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {BACKGROUND_SOUNDS.map((sound) => (
                                <button
                                    key={sound.id}
                                    type="button"
                                    onClick={() => setBackgroundSound(sound.id as BackgroundSoundId)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors",
                                        backgroundSound === sound.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    )}
                                >
                                    <span>{sound.icon}</span>
                                    <span>{sound.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <button
                        type="button"
                        onClick={onStart}
                        className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Mulai {formatBreathingDuration(selectedDuration)}
                    </button>
                </div>
            </div>
        </div>
    );
}
