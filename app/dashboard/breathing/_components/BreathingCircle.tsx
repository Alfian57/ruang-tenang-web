"use client";

import { BreathingPhase, BreathingTechnique, getPhaseLabel } from "@/types/breathing";

interface BreathingCircleProps {
    technique: BreathingTechnique;
    phase: BreathingPhase;
    elapsedTime: number;
    targetDurationSeconds: number;
    scale: number;
    phaseProgress: number;
    phaseDurations: Record<BreathingPhase | "ready" | "complete", number>;
    isActive: boolean;
}

export function BreathingCircle({
    technique,
    phase,
    elapsedTime,
    targetDurationSeconds,
    scale,
    phaseProgress,
    phaseDurations,
    isActive,
}: BreathingCircleProps) {
    return (
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
                        {phase === "ready" && "Siap?"}
                        {phase === "complete" && "Selesai!"}
                        {phase !== "ready" && phase !== "complete" && (
                            <span className="font-medium">{getPhaseLabel(phase)}</span>
                        )}
                    </div>

                    {isActive && phase !== "complete" && (
                        <div className="text-sm text-muted-foreground">
                            {Math.ceil(phaseDurations[phase] - (phaseDurations[phase] * phaseProgress / 100))}s
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
                    strokeDasharray={`${(elapsedTime / targetDurationSeconds) * 100 * 3.14}, 314`}
                    transform="rotate(-90)"
                    style={{ transformOrigin: "center" }}
                />
            </svg>
        </div>
    );
}
