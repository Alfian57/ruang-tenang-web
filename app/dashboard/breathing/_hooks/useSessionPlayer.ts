"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    BreathingTechnique,
    BreathingPhase,
    BreathingState,
} from "@/types/breathing";

interface UseSessionPlayerProps {
    technique: BreathingTechnique;
    targetDurationSeconds: number;
    hapticFeedback?: boolean;
}

export function useSessionPlayer({
    technique,
    targetDurationSeconds,
    hapticFeedback = false,
}: UseSessionPlayerProps) {
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

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const phaseStartTimeRef = useRef<number>(0);
    // Raw (sub-second) elapsed milliseconds captured at pause, so resume does
    // not lose up to ~1s per pause cycle from second-flooring.
    const pausedElapsedMsRef = useRef<number>(0);

    const cycleDuration =
        technique.inhale_duration +
        technique.inhale_hold_duration +
        technique.exhale_duration +
        technique.exhale_hold_duration;

    const totalCycles = Math.floor(targetDurationSeconds / cycleDuration);

    const phaseDurations = useMemo(() => ({
        inhale: technique.inhale_duration,
        inhale_hold: technique.inhale_hold_duration,
        exhale: technique.exhale_duration,
        exhale_hold: technique.exhale_hold_duration,
        ready: 3,
        complete: 0,
    }), [technique.inhale_duration, technique.inhale_hold_duration, technique.exhale_duration, technique.exhale_hold_duration]);

    const getPhaseFromCycleTime = useCallback((cycleTime: number): BreathingPhase => {
        let accumulated = 0;

        if (technique.inhale_duration > 0) {
            accumulated += technique.inhale_duration;
            if (cycleTime < accumulated) return "inhale";
        }

        if (technique.inhale_hold_duration > 0) {
            accumulated += technique.inhale_hold_duration;
            if (cycleTime < accumulated) return "inhale_hold";
        }

        if (technique.exhale_duration > 0) {
            accumulated += technique.exhale_duration;
            if (cycleTime < accumulated) return "exhale";
        }

        if (technique.exhale_hold_duration > 0) {
            return "exhale_hold";
        }

        // Degenerate fallback: prefer the first non-zero phase.
        if (technique.inhale_duration > 0) return "inhale";
        if (technique.exhale_duration > 0) return "exhale";
        return "inhale";
    }, [technique]);

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

            if (remaining <= 0) {
                setState(prev => ({
                    ...prev,
                    phase: "complete",
                    elapsedTime: targetDurationSeconds,
                    remainingTime: 0,
                    phaseProgress: 100,
                    isActive: false,
                    currentCycle: totalCycles,
                }));
                triggerHaptic();
                return;
            }

            const currentCycle = Math.floor(elapsed / cycleDuration) + 1;
            const timeInCycle = elapsed % cycleDuration;
            const newPhase = getPhaseFromCycleTime(timeInCycle);

            let phaseStartInCycle = 0;
            if (newPhase === "inhale_hold") phaseStartInCycle = technique.inhale_duration;
            else if (newPhase === "exhale") phaseStartInCycle = technique.inhale_duration + technique.inhale_hold_duration;
            else if (newPhase === "exhale_hold") phaseStartInCycle = technique.inhale_duration + technique.inhale_hold_duration + technique.exhale_duration;

            const timeInPhase = timeInCycle - phaseStartInCycle;
            const phaseDuration = phaseDurations[newPhase];
            const phaseProgress = phaseDuration > 0 ? (timeInPhase / phaseDuration) * 100 : 100;

            setState(prev => {
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

    const handlePause = () => {
        // Capture exact elapsed ms so resume doesn't lose the sub-second part.
        pausedElapsedMsRef.current = Date.now() - startTimeRef.current;
        setState(prev => ({ ...prev, isPaused: true }));
    };

    const handleResume = () => {
        startTimeRef.current = Date.now() - pausedElapsedMsRef.current;
        setState(prev => ({ ...prev, isPaused: false }));
    };

    const handleStop = () => {
        // Completed cycles is always derived the same way across every exit
        // path (manual stop, natural timeout) to keep backend stats consistent.
        const cyclesCompleted = cycleDuration > 0
            ? Math.min(totalCycles, Math.floor(state.elapsedTime / cycleDuration))
            : 0;
        const completedPercentage = targetDurationSeconds > 0
            ? Math.min(100, Math.round((state.elapsedTime / targetDurationSeconds) * 100))
            : 0;
        const completionData = {
            durationSeconds: state.elapsedTime,
            cyclesCompleted,
            completed: completedPercentage >= 95,
            completedPercentage,
        };

        setState(prev => ({
            ...prev,
            isActive: false,
            isPaused: false,
            remainingTime: Math.max(0, targetDurationSeconds - prev.elapsedTime),
            phase: completionData.completed ? "complete" : prev.phase,
        }));

        return completionData;
    };

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

    return {
        state,
        totalCycles,
        phaseDurations,
        scale: getAnimationScale(),
        completedCycles: cycleDuration > 0
            ? Math.min(totalCycles, Math.floor(state.elapsedTime / cycleDuration))
            : 0,
        handleStart,
        handlePause,
        handleResume,
        handleStop,
        handleReset,
    };
}
