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
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { BreathingCircle } from "./BreathingCircle";
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
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-125 p-6">
            <audio ref={audioRef} preload="none" />

            {/* Status bar */}
            <div className="flex items-center justify-between w-full max-w-sm mb-8">
                <div className="text-sm text-muted-foreground">
                    Siklus: <span className="font-semibold text-foreground">{state.currentCycle}/{totalCycles}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Sisa: <span className="font-semibold text-foreground">{formatBreathingDuration(state.remainingTime)}</span>
                </div>
                {shouldShowSoundToggle ? (
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                ) : (
                    <div className="w-9 h-9" />
                )}
            </div>

            {/* Main breathing circle */}
            <BreathingCircle
                technique={technique}
                phase={state.phase}
                elapsedTime={state.elapsedTime}
                targetDurationSeconds={targetDurationSeconds}
                scale={scale}
                phaseProgress={state.phaseProgress}
                phaseDurations={phaseDurations}
                isActive={state.isActive}
            />

            {/* Phase indicator */}
            <div className="flex items-center gap-4 mb-8">
                {["inhale", "inhale_hold", "exhale", "exhale_hold"].map((phase) => (
                    <div
                        key={phase}
                        className={cn(
                            "flex items-center gap-1.5 text-xs transition-all",
                            state.phase === phase
                                ? "text-foreground font-medium scale-110"
                                : "text-muted-foreground"
                        )}
                    >
                        <div
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                state.phase === phase ? "scale-125" : ""
                            )}
                            style={{
                                backgroundColor: state.phase === phase ? technique.color : "#9ca3af"
                            }}
                        />
                        <span>{getPhaseLabel(phase as BreathingPhase)}</span>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {!state.isActive && state.phase === "ready" && (
                    <button
                        onClick={handleStart}
                        className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
                    >
                        <Play className="w-6 h-6" />
                        Mulai
                    </button>
                )}

                {state.isActive && !state.isPaused && state.phase !== "complete" && (
                    <>
                        <button
                            onClick={handlePause}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                        >
                            <Pause className="w-5 h-5" />
                            Jeda
                        </button>
                        <button
                            onClick={() => onComplete(handleStop())}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
                        >
                            <Square className="w-5 h-5" />
                            Selesai
                        </button>
                    </>
                )}

                {state.isPaused && (
                    <>
                        <button
                            onClick={handleResume}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Play className="w-5 h-5" />
                            Lanjut
                        </button>
                        <button
                            onClick={() => onComplete(handleStop())}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
                        >
                            <Square className="w-5 h-5" />
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
                            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
                        >
                            Selesaikan Sesi
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Ulangi
                        </button>
                    </>
                )}
            </div>

            {/* Exit button */}
            {onExit && (
                <button
                    onClick={onExit}
                    className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Kembali ke pemilihan teknik
                </button>
            )}
        </div>
    );
}
