"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    BreathingTechnique,
    BreathingPhase,
    BreathingState,
    getPhaseLabel,
    formatBreathingDuration,
} from "@/types/breathing";
import { cn } from "@/lib/utils";
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX } from "lucide-react";

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
}

export function SessionPlayer({
    technique,
    targetDurationSeconds,
    onComplete,
    onExit,
    voiceGuidance = false,
    hapticFeedback = false,
}: SessionPlayerProps) {
    const [state, setState] = useState<BreathingState>({
        phase: "ready",
        currentCycle: 0,
        totalCycles: 0,
        elapsedTime: 0,
        remainingTime: targetDurationSeconds,
        phaseProgress: 0,
        isActive: false,
        isPaused: false,
    });

    const [isMuted, setIsMuted] = useState(!voiceGuidance);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const phaseStartTimeRef = useRef<number>(0);

    // Calculate total cycle duration
    const cycleDuration =
        technique.inhale_duration +
        technique.inhale_hold_duration +
        technique.exhale_duration +
        technique.exhale_hold_duration;

    const totalCycles = Math.floor(targetDurationSeconds / cycleDuration);

    // Get phase durations (memoized to prevent unnecessary re-renders)
    const phaseDurations = useMemo(() => ({
        inhale: technique.inhale_duration,
        inhale_hold: technique.inhale_hold_duration,
        exhale: technique.exhale_duration,
        exhale_hold: technique.exhale_hold_duration,
        ready: 3, // Countdown
        complete: 0,
    }), [technique.inhale_duration, technique.inhale_hold_duration, technique.exhale_duration, technique.exhale_hold_duration]);

    // Determine current phase based on elapsed time in cycle
    const getPhaseFromCycleTime = useCallback((cycleTime: number): BreathingPhase => {
        let accumulated = 0;

        accumulated += technique.inhale_duration;
        if (cycleTime < accumulated) return "inhale";

        accumulated += technique.inhale_hold_duration;
        if (cycleTime < accumulated) return "inhale_hold";

        accumulated += technique.exhale_duration;
        if (cycleTime < accumulated) return "exhale";

        return "exhale_hold";
    }, [technique]);

    // Haptic feedback
    const triggerHaptic = useCallback(() => {
        if (hapticFeedback && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }, [hapticFeedback]);

    // Main timer loop
    useEffect(() => {
        if (!state.isActive || state.isPaused) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimeRef.current) / 1000);
            const remaining = Math.max(0, targetDurationSeconds - elapsed);

            // Check if completed
            if (remaining <= 0) {
                setState(prev => ({
                    ...prev,
                    phase: "complete",
                    elapsedTime: targetDurationSeconds,
                    remainingTime: 0,
                    isActive: false,
                    currentCycle: totalCycles,
                }));
                triggerHaptic();
                return;
            }

            // Calculate current cycle and phase
            const currentCycle = Math.floor(elapsed / cycleDuration) + 1;
            const timeInCycle = elapsed % cycleDuration;
            const newPhase = getPhaseFromCycleTime(timeInCycle);

            // Calculate phase progress
            let phaseStartInCycle = 0;
            if (newPhase === "inhale_hold") phaseStartInCycle = technique.inhale_duration;
            else if (newPhase === "exhale") phaseStartInCycle = technique.inhale_duration + technique.inhale_hold_duration;
            else if (newPhase === "exhale_hold") phaseStartInCycle = technique.inhale_duration + technique.inhale_hold_duration + technique.exhale_duration;

            const timeInPhase = timeInCycle - phaseStartInCycle;
            const phaseDuration = phaseDurations[newPhase];
            const phaseProgress = phaseDuration > 0 ? (timeInPhase / phaseDuration) * 100 : 100;

            setState(prev => {
                // Trigger haptic on phase change
                if (prev.phase !== newPhase && newPhase !== "ready") {
                    triggerHaptic();
                }

                return {
                    ...prev,
                    phase: newPhase,
                    currentCycle: Math.min(currentCycle, totalCycles),
                    totalCycles,
                    elapsedTime: elapsed,
                    remainingTime: remaining,
                    phaseProgress,
                };
            });
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [
        state.isActive,
        state.isPaused,
        targetDurationSeconds,
        cycleDuration,
        totalCycles,
        getPhaseFromCycleTime,
        phaseDurations,
        technique,
        triggerHaptic,
    ]);

    // Start session
    const handleStart = () => {
        startTimeRef.current = Date.now();
        phaseStartTimeRef.current = Date.now();
        setState(prev => ({
            ...prev,
            phase: "inhale",
            currentCycle: 1,
            totalCycles,
            elapsedTime: 0,
            remainingTime: targetDurationSeconds,
            phaseProgress: 0,
            isActive: true,
            isPaused: false,
        }));
        triggerHaptic();
    };

    // Pause/resume
    const handlePause = () => {
        setState(prev => ({ ...prev, isPaused: true }));
    };

    const handleResume = () => {
        // Adjust start time to account for pause
        const pausedDuration = state.elapsedTime * 1000;
        startTimeRef.current = Date.now() - pausedDuration;
        setState(prev => ({ ...prev, isPaused: false }));
    };

    // Stop and complete
    const handleStop = () => {
        const completedPercentage = Math.round((state.elapsedTime / targetDurationSeconds) * 100);
        onComplete({
            durationSeconds: state.elapsedTime,
            cyclesCompleted: state.currentCycle > 0 ? state.currentCycle - 1 : 0,
            completed: completedPercentage >= 80,
            completedPercentage,
        });
    };

    // Reset
    const handleReset = () => {
        setState({
            phase: "ready",
            currentCycle: 0,
            totalCycles: 0,
            elapsedTime: 0,
            remainingTime: targetDurationSeconds,
            phaseProgress: 0,
            isActive: false,
            isPaused: false,
        });
    };

    // Animation scale based on phase
    const getAnimationScale = () => {
        switch (state.phase) {
            case "inhale":
                return 1 + (state.phaseProgress / 100) * 0.3;
            case "inhale_hold":
                return 1.3;
            case "exhale":
                return 1.3 - (state.phaseProgress / 100) * 0.3;
            case "exhale_hold":
                return 1;
            default:
                return 1;
        }
    };

    const scale = getAnimationScale();

    return (
        <div className="flex flex-col items-center justify-center min-h-125 p-6">
            {/* Status bar */}
            <div className="flex items-center justify-between w-full max-w-sm mb-8">
                <div className="text-sm text-muted-foreground">
                    Siklus: <span className="font-semibold text-foreground">{state.currentCycle}/{totalCycles}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Sisa: <span className="font-semibold text-foreground">{formatBreathingDuration(state.remainingTime)}</span>
                </div>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Main breathing circle */}
            <div className="relative flex items-center justify-center mb-8">
                {/* Outer glow ring */}
                <div
                    className="absolute rounded-full transition-all duration-500 opacity-30"
                    style={{
                        width: `${240 * scale + 40}px`,
                        height: `${240 * scale + 40}px`,
                        backgroundColor: technique.color,
                        filter: "blur(40px)",
                    }}
                />

                {/* Main circle */}
                <div
                    className="relative rounded-full flex items-center justify-center transition-all ease-linear"
                    style={{
                        width: `${240 * scale}px`,
                        height: `${240 * scale}px`,
                        backgroundColor: `${technique.color}20`,
                        borderWidth: "4px",
                        borderColor: technique.color,
                        transitionDuration: "100ms",
                    }}
                >
                    {/* Inner content */}
                    <div className="text-center">
                        <div
                            className="text-4xl font-light mb-2 transition-colors"
                            style={{ color: technique.color }}
                        >
                            {state.phase === "ready" && "Siap?"}
                            {state.phase === "complete" && "Selesai!"}
                            {state.phase !== "ready" && state.phase !== "complete" && (
                                <span className="font-medium">{getPhaseLabel(state.phase)}</span>
                            )}
                        </div>

                        {state.isActive && state.phase !== "complete" && (
                            <div className="text-sm text-muted-foreground">
                                {Math.ceil(phaseDurations[state.phase] - (phaseDurations[state.phase] * state.phaseProgress / 100))}s
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress ring */}
                <svg
                    className="absolute"
                    style={{ width: `${240 * scale + 20}px`, height: `${240 * scale + 20}px` }}
                >
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke={`${technique.color}30`}
                        strokeWidth="4"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke={technique.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${(state.elapsedTime / targetDurationSeconds) * 100 * 3.14}, 314`}
                        transform="rotate(-90)"
                        style={{ transformOrigin: "center" }}
                    />
                </svg>
            </div>

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
                            onClick={handleStop}
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
                            onClick={handleStop}
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
