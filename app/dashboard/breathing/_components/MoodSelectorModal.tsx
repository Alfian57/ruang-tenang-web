"use client";

import {
    DURATION_OPTIONS,
    MOOD_OPTIONS,
    formatBreathingDuration,
    MoodId,
    BackgroundSoundId,
    BreathingTechnique
} from "@/types/breathing";
import { X } from "lucide-react";
import { cn } from "@/utils";

interface MoodSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTechnique?: BreathingTechnique | null;
    selectedDuration: number;
    setSelectedDuration: (duration: number) => void;
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
    moodBefore,
    setMoodBefore,
    backgroundSound,
    setBackgroundSound,
    onStart,
}: MoodSelectorModalProps) {
    if (!isOpen || !selectedTechnique) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Persiapan Sesi</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Duration Selection */}
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Durasi Latihan</label>
                    <div className="grid grid-cols-3 gap-2">
                        {DURATION_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedDuration(option.value)}
                                className={cn(
                                    "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                    selectedDuration === option.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                {option.shortLabel}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mood Selection */}
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Bagaimana perasaanmu sekarang?</label>
                    <div className="flex flex-wrap gap-2">
                        {MOOD_OPTIONS.map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => setMoodBefore(mood.id as MoodId)}
                                className={cn(
                                    "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
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
                </div>

                {/* Background Sound */}
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Suara latar</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setBackgroundSound("none")}
                            className={cn(
                                "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
                                backgroundSound === "none"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                            )}
                        >
                            <span>🔇</span>
                            <span>Tidak Ada</span>
                        </button>
                        <button
                            onClick={() => setBackgroundSound("rain")}
                            className={cn(
                                "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
                                backgroundSound !== "none"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                            )}
                        >
                            <span>🎵</span>
                            <span>Ada</span>
                        </button>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={onStart}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                    Mulai Latihan {formatBreathingDuration(selectedDuration)}
                </button>
            </div>
        </div>
    );
}
