"use client";

import {
    DURATION_OPTIONS,
    MOOD_OPTIONS,
    BACKGROUND_SOUNDS,
    formatBreathingDuration,
    MoodId,
    BackgroundSoundId,
    BreathingTechnique
} from "@/types/breathing";
import { X, Volume2, Vibrate } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTechnique?: BreathingTechnique | null;
    selectedDuration: number;
    setSelectedDuration: (duration: number) => void;
    moodBefore: MoodId | null;
    setMoodBefore: (mood: MoodId) => void;
    voiceGuidance: boolean;
    setVoiceGuidance: (enabled: boolean) => void;
    hapticFeedback: boolean;
    setHapticFeedback: (enabled: boolean) => void;
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
    voiceGuidance,
    setVoiceGuidance,
    hapticFeedback,
    setHapticFeedback,
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

                {/* Session Settings */}
                <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Panduan suara</span>
                        </div>
                        <button
                            onClick={() => setVoiceGuidance(!voiceGuidance)}
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative",
                                voiceGuidance ? "bg-primary" : "bg-muted"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    voiceGuidance ? "translate-x-5" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Vibrate className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Getaran</span>
                        </div>
                        <button
                            onClick={() => setHapticFeedback(!hapticFeedback)}
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative",
                                hapticFeedback ? "bg-primary" : "bg-muted"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    hapticFeedback ? "translate-x-5" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>
                </div>

                {/* Background Sound */}
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Suara latar</label>
                    <div className="flex flex-wrap gap-2">
                        {BACKGROUND_SOUNDS.slice(0, 5).map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => setBackgroundSound(sound.id as BackgroundSoundId)}
                                className={cn(
                                    "py-1.5 px-3 rounded-full text-sm transition-colors flex items-center gap-1.5",
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
