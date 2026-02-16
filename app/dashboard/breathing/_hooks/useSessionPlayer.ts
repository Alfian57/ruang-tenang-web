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

        accumulated += technique.inhale_duration;
        if (cycleTime < accumulated) return "inhale";

        accumulated += technique.inhale_hold_duration;
        if (cycleTime < accumulated) return "inhale_hold";

        accumulated += technique.exhale_duration;
        if (cycleTime < accumulated) return "exhale";

        return "exhale_hold";
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
        setState(prev => ({ ...prev, isPaused: true }));
    };

    const handleResume = () => {
        const pausedDuration = state.elapsedTime * 1000;
        startTimeRef.current = Date.now() - pausedDuration;
        setState(prev => ({ ...prev, isPaused: false }));
    };

    const handleStop = () => {
        const completedPercentage = Math.round((state.elapsedTime / targetDurationSeconds) * 100);
        return {
            durationSeconds: state.elapsedTime,
            cyclesCompleted: state.currentCycle > 0 ? state.currentCycle - 1 : 0,
            completed: completedPercentage >= 95,
            completedPercentage,
        };
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
        handleStart,
        handlePause,
        handleResume,
        handleStop,
        handleReset,
    };
}
