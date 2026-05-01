"use client";

import { useEffect, useRef, useState } from "react";
import {
    BreathingTechnique,
    BreathingPhase,
    getPhaseLabel,
    formatBreathingDuration,
} from "@/types/breathing";
import type { Song } from "@/types";
import { cn } from "@/utils";
import {
    CheckCircle2,
    Mic2,
    MicOff,
    Pause,
    Play,
    RotateCcw,
    Route,
    Square,
    Volume2,
    VolumeX,
} from "lucide-react";
import { BreathingVisual } from "./BreathingVisual";
import { useSessionPlayer } from "../_hooks/useSessionPlayer";
import { getUploadUrl } from "@/services/http/upload-url";

interface SessionPlayerProps {
    technique: BreathingTechnique;
    targetDurationSeconds: number;
    onComplete: (data: {
        durationSeconds: number;
        cyclesCompleted: number;
        completed: boolean;
        completedPercentage: number;
    }) => void;
    onExit?: () => void;
    voiceGuidance?: boolean;
    hapticFeedback?: boolean;
    backgroundSound?: string;
    backgroundTrack?: Song | null;
}

const PHASE_CUES: Record<BreathingPhase, { title: string; description: string; voice: string }> = {
    ready: {
        title: "Ambil posisi nyaman",
        description: "Lemaskan rahang, turunkan bahu, lalu biarkan layar menjadi pemandu ritme.",
        voice: "Ambil posisi nyaman. Kita mulai perlahan.",
    },
    inhale: {
        title: "Tarik napas perlahan",
        description: "Biarkan dada dan perut mengembang mengikuti visual, tanpa memaksa.",
        voice: "Tarik napas perlahan.",
    },
    inhale_hold: {
        title: "Tahan dengan lembut",
        description: "Jaga tubuh tetap ringan. Cukup diam sebentar di puncak napas.",
        voice: "Tahan dengan lembut.",
    },
    exhale: {
        title: "Hembuskan lebih pelan",
        description: "Lepaskan tegang dari wajah, bahu, dan tangan saat napas keluar.",
        voice: "Hembuskan pelan.",
    },
    exhale_hold: {
        title: "Berhenti sejenak",
        description: "Nikmati ruang pendek sebelum napas berikutnya datang kembali.",
        voice: "Berhenti sejenak.",
    },
    complete: {
        title: "Sesi selesai",
        description: "Perhatikan perubahan kecil pada tubuh sebelum mencatat refleksi akhir.",
        voice: "Sesi selesai. Perhatikan tubuhmu sebentar.",
    },
};

const JOURNEY_MILESTONES = [
    { at: 0, label: "Mulai Tenang", description: "Tubuh mengenali ritme" },
    { at: 25, label: "Ritme Stabil", description: "Napas mulai konsisten" },
    { at: 55, label: "Fokus Lembut", description: "Perhatian lebih mudah kembali" },
    { at: 85, label: "Pulang Tenang", description: "Siap menutup sesi" },
];

const ACTIVE_PHASES: BreathingPhase[] = ["inhale", "inhale_hold", "exhale", "exhale_hold"];

function getMilestoneIndex(progress: number) {
    return JOURNEY_MILESTONES.reduce((activeIndex, milestone, index) => {
        return progress >= milestone.at ? index : activeIndex;
    }, 0);
}

export function SessionPlayer({
    technique,
    targetDurationSeconds,
    onComplete,
    onExit,
    voiceGuidance = false,
    hapticFeedback = false,
    backgroundSound = "none",
    backgroundTrack,
}: SessionPlayerProps) {
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastVoiceCueRef = useRef("");

    const {
        state,
        totalCycles,
        phaseDurations,
        scale,
        handleStart,
        handlePause,
        handleResume,
        handleStop,
        handleReset,
    } = useSessionPlayer({ technique, targetDurationSeconds, hapticFeedback });

    const shouldShowSoundToggle = backgroundSound !== "none";
    const sessionProgress = Math.min(100, Math.max(0, (state.elapsedTime / targetDurationSeconds) * 100));
    const activeMilestoneIndex = getMilestoneIndex(sessionProgress);
    const currentCue = PHASE_CUES[state.phase];

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!backgroundTrack || !backgroundTrack.file_path) {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            return;
        }

        const src = getUploadUrl(backgroundTrack.file_path);
        if (audio.src !== src) {
            audio.src = src;
            audio.load();
        }
    }, [backgroundTrack]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.loop = true;
        audio.volume = isMuted ? 0 : 0.45;
    }, [isMuted]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !backgroundTrack) return;

        if (state.isActive && !state.isPaused && state.phase !== "complete") {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn("Breathing background audio autoplay blocked:", error);
                });
            }
            return;
        }

        audio.pause();
    }, [state.isActive, state.isPaused, state.phase, backgroundTrack]);

    useEffect(() => {
        const audio = audioRef.current;

        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

        const synth = window.speechSynthesis;

        if (
            !voiceGuidance ||
            state.isPaused ||
            state.phase === "ready" ||
            (!state.isActive && state.phase !== "complete")
        ) {
            synth.cancel();
            return;
        }

        const cue = PHASE_CUES[state.phase]?.voice;
        if (!cue) return;

        const cueKey = `${state.currentCycle}-${state.phase}`;
        if (lastVoiceCueRef.current === cueKey) return;

        lastVoiceCueRef.current = cueKey;
        const utterance = new SpeechSynthesisUtterance(cue);
        utterance.lang = "id-ID";
        utterance.rate = 0.88;
        utterance.pitch = 1;

        synth.cancel();
        synth.speak(utterance);

        return () => {
            synth.cancel();
        };
    }, [state.currentCycle, state.isActive, state.isPaused, state.phase, voiceGuidance]);

    return (
        <div className="flex min-h-125 flex-col items-center p-4 sm:p-6">
            <audio ref={audioRef} preload="none" />

            <div className="w-full max-w-5xl space-y-5">
                <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Route className="h-4 w-4" />
                                Perjalanan Napas
                            </div>
                            <h2 className="mt-1 text-xl font-semibold text-foreground">{technique.name}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm xs:grid-cols-2 sm:grid-cols-4 lg:min-w-[32rem]">
                            <div>
                                <p className="text-xs text-muted-foreground">Siklus</p>
                                <p className="font-semibold">{state.currentCycle || 0}/{totalCycles}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Sisa</p>
                                <p className="font-semibold">{formatBreathingDuration(state.remainingTime)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Panduan</p>
                                <p className="flex items-center gap-1 font-semibold">
                                    {voiceGuidance ? <Mic2 className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                    {voiceGuidance ? "Suara" : "Visual"}
                                </p>
                            </div>
                            <div className="flex items-end justify-between gap-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Suara</p>
                                    <p className="font-semibold">{backgroundSound === "none" ? "Hening" : "Latar"}</p>
                                </div>
                                {shouldShowSoundToggle ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                                        aria-label={isMuted ? "Nyalakan suara latar" : "Matikan suara latar"}
                                        title={isMuted ? "Nyalakan suara latar" : "Matikan suara latar"}
                                    >
                                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${sessionProgress}%`, backgroundColor: technique.color }}
                        />
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
                    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
                        <BreathingVisual
                            technique={technique}
                            phase={state.phase}
                            elapsedTime={state.elapsedTime}
                            targetDurationSeconds={targetDurationSeconds}
                            scale={scale}
                            phaseProgress={state.phaseProgress}
                            phaseDurations={phaseDurations}
                            isActive={state.isActive}
                        />

                        <div className="mx-auto max-w-xl text-center">
                            <p className="text-lg font-semibold">{currentCue.title}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentCue.description}</p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-4">
                            {ACTIVE_PHASES.map((phase) => (
                                <div
                                    key={phase}
                                    className={cn(
                                        "rounded-xl border px-3 py-2 text-center text-xs transition-all",
                                        state.phase === phase
                                            ? "border-primary bg-primary/10 text-foreground shadow-sm"
                                            : "border-muted bg-muted/30 text-muted-foreground"
                                    )}
                                >
                                    <span className="font-medium">{getPhaseLabel(phase)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            {!state.isActive && state.phase === "ready" && (
                                <button
                                    onClick={handleStart}
                                    className="flex min-h-12 items-center gap-2 rounded-xl bg-primary px-7 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    <Play className="h-5 w-5" />
                                    Mulai Perjalanan
                                </button>
                            )}

                            {state.isActive && !state.isPaused && state.phase !== "complete" && (
                                <>
                                    <button
                                        onClick={handlePause}
                                        className="flex min-h-11 items-center gap-2 rounded-xl bg-muted px-5 py-3 font-medium text-foreground transition-colors hover:bg-muted/80"
                                    >
                                        <Pause className="h-5 w-5" />
                                        Jeda
                                    </button>
                                    <button
                                        onClick={() => onComplete(handleStop())}
                                        className="flex min-h-11 items-center gap-2 rounded-xl bg-destructive/10 px-5 py-3 font-medium text-destructive transition-colors hover:bg-destructive/20"
                                    >
                                        <Square className="h-5 w-5" />
                                        Selesai
                                    </button>
                                </>
                            )}

                            {state.isPaused && (
                                <>
                                    <button
                                        onClick={handleResume}
                                        className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        <Play className="h-5 w-5" />
                                        Lanjut
                                    </button>
                                    <button
                                        onClick={() => onComplete(handleStop())}
                                        className="flex min-h-11 items-center gap-2 rounded-xl bg-destructive/10 px-5 py-3 font-medium text-destructive transition-colors hover:bg-destructive/20"
                                    >
                                        <Square className="h-5 w-5" />
                                        Selesai
                                    </button>
                                </>
                            )}

                            {state.phase === "complete" && (
                                <>
                                    <button
                                        onClick={() => onComplete({
                                            durationSeconds: state.elapsedTime,
                                            cyclesCompleted: state.currentCycle,
                                            completed: true,
                                            completedPercentage: 100,
                                        })}
                                        className="flex min-h-12 items-center gap-2 rounded-xl bg-primary px-7 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Catat Refleksi
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="flex min-h-11 items-center gap-2 rounded-xl bg-muted px-5 py-3 font-medium text-foreground transition-colors hover:bg-muted/80"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                        Ulangi
                                    </button>
                                </>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border bg-card p-4 shadow-sm">
                            <h3 className="font-semibold">Tahap Sesi</h3>
                            <div className="mt-4 space-y-4">
                                {JOURNEY_MILESTONES.map((milestone, index) => {
                                    const isActive = activeMilestoneIndex === index;
                                    const isDone = activeMilestoneIndex > index;

                                    return (
                                        <div key={milestone.label} className="flex gap-3">
                                            <div
                                                className={cn(
                                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                                                    isActive || isDone
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-muted bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                                                    {milestone.label}
                                                </p>
                                                <p className="text-xs leading-5 text-muted-foreground">{milestone.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-card p-4 shadow-sm">
                            <h3 className="font-semibold">Ritme Teknik</h3>
                            <div className="mt-4 grid grid-cols-1 gap-3 text-sm xs:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Tarik</p>
                                    <p className="font-semibold">{technique.inhale_duration}s</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Tahan</p>
                                    <p className="font-semibold">{technique.inhale_hold_duration}s</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Hembus</p>
                                    <p className="font-semibold">{technique.exhale_duration}s</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Jeda</p>
                                    <p className="font-semibold">{technique.exhale_hold_duration}s</p>
                                </div>
                            </div>
                        </div>

                        {onExit && (
                            <button
                                onClick={onExit}
                                className="w-full rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                Kembali ke pemilihan teknik
                            </button>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
