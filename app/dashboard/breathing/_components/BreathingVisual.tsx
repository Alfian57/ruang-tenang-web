"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
    BreathingPhase,
    BreathingTechnique,
    getPhaseLabel,
} from "@/types/breathing";
import { cn } from "@/utils";

const BREATH_PHASES: BreathingPhase[] = ["inhale", "inhale_hold", "exhale", "exhale_hold"];

interface BreathingVisualProps {
    technique: BreathingTechnique;
    phase: BreathingPhase;
    elapsedTime: number;
    targetDurationSeconds: number;
    scale: number;
    phaseProgress: number;
    phaseDurations: Record<BreathingPhase | "ready" | "complete", number>;
    isActive: boolean;
}

function getPhaseSecondsRemaining(
    phase: BreathingPhase,
    phaseProgress: number,
    phaseDurations: Record<BreathingPhase | "ready" | "complete", number>,
) {
    if (phase === "ready" || phase === "complete") return null;
    const duration = phaseDurations[phase] || 0;
    return Math.max(0, Math.ceil(duration - (duration * phaseProgress) / 100));
}

function CircleVisual({ color, scale, reduceMotion }: { color: string; scale: number; reduceMotion: boolean }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {[1, 0.78, 0.56].map((ringScale, index) => (
                <motion.div
                    key={ringScale}
                    className="absolute rounded-full border"
                    style={{
                        width: `${210 * ringScale}px`,
                        height: `${210 * ringScale}px`,
                        borderColor: `${color}${index === 0 ? "66" : "38"}`,
                        backgroundColor: index === 2 ? `${color}16` : "transparent",
                    }}
                    animate={{ scale: scale + index * 0.025, opacity: index === 0 ? 0.9 : 0.55 }}
                    transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
                />
            ))}
        </div>
    );
}

function WaveVisual({
    color,
    phase,
    scale,
    reduceMotion,
}: {
    color: string;
    phase: BreathingPhase;
    scale: number;
    reduceMotion: boolean;
}) {
    const bars = [0.45, 0.7, 0.95, 1.15, 0.95, 0.7, 0.45];
    const phaseDirection = phase === "exhale" || phase === "exhale_hold" ? 0.72 : 1;

    return (
        <div className="absolute inset-x-8 top-16 bottom-16 flex items-center justify-center gap-3">
            {bars.map((height, index) => (
                <motion.div
                    key={`${height}-${index}`}
                    className="w-3 rounded-full"
                    style={{ height: `${88 * height}px`, backgroundColor: color }}
                    animate={{
                        scaleY: Math.max(0.35, scale * height * phaseDirection),
                        opacity: 0.35 + height * 0.35,
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.025 }}
                />
            ))}
        </div>
    );
}

function LungsVisual({ color, scale, reduceMotion }: { color: string; scale: number; reduceMotion: boolean }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-40 w-52">
                <motion.div
                    className="absolute left-4 top-4 h-32 w-20 rounded-full border-2"
                    style={{ borderColor: color, backgroundColor: `${color}16` }}
                    animate={{ scaleX: scale, scaleY: scale * 1.04 }}
                    transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute right-4 top-4 h-32 w-20 rounded-full border-2"
                    style={{ borderColor: color, backgroundColor: `${color}16` }}
                    animate={{ scaleX: scale, scaleY: scale * 1.04 }}
                    transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
                />
                <div
                    className="absolute left-1/2 top-2 h-36 w-1 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: `${color}66` }}
                />
                <div
                    className="absolute left-1/2 top-20 h-1 w-20 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: `${color}66` }}
                />
            </div>
        </div>
    );
}

function BarVisual({
    color,
    phase,
    phaseProgress,
    reduceMotion,
}: {
    color: string;
    phase: BreathingPhase;
    phaseProgress: number;
    reduceMotion: boolean;
}) {
    const activeIndex = BREATH_PHASES.indexOf(phase);

    return (
        <div className="absolute inset-x-10 top-16 bottom-16 flex flex-col justify-center gap-3">
            {BREATH_PHASES.map((item, index) => {
                const isCurrent = item === phase;
                const isPast = phase === "complete" || (activeIndex > index && activeIndex !== -1);
                const width = isCurrent ? phaseProgress : isPast ? 100 : 12;

                return (
                    <div key={item} className="grid grid-cols-[5rem_1fr] items-center gap-3 text-xs">
                        <span className={cn("text-right font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                            {getPhaseLabel(item)}
                        </span>
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                                animate={{ width: `${width}%`, opacity: isCurrent || isPast ? 0.85 : 0.25 }}
                                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function BreathingVisual({
    technique,
    phase,
    elapsedTime,
    targetDurationSeconds,
    scale,
    phaseProgress,
    phaseDurations,
    isActive,
}: BreathingVisualProps) {
    const reduceMotion = Boolean(useReducedMotion());
    const phaseSecondsRemaining = getPhaseSecondsRemaining(phase, phaseProgress, phaseDurations);
    const sessionProgress = Math.min(100, Math.max(0, (elapsedTime / targetDurationSeconds) * 100));
    const visualType = technique.animation_type || "circle";

    return (
        <div className="relative mb-6 flex w-full justify-center">
            <div
                className="relative h-[280px] w-[280px] overflow-hidden rounded-[2rem] border sm:h-[340px] sm:w-[340px]"
                style={{
                    borderColor: `${technique.color}33`,
                    background: `linear-gradient(145deg, ${technique.color}14, rgba(148, 163, 184, 0.08))`,
                }}
            >
                {visualType === "wave" && (
                    <WaveVisual color={technique.color} phase={phase} scale={scale} reduceMotion={reduceMotion} />
                )}
                {visualType === "lungs" && (
                    <LungsVisual color={technique.color} scale={scale} reduceMotion={reduceMotion} />
                )}
                {visualType === "bar" && (
                    <BarVisual
                        color={technique.color}
                        phase={phase}
                        phaseProgress={phaseProgress}
                        reduceMotion={reduceMotion}
                    />
                )}
                {visualType === "circle" && (
                    <CircleVisual color={technique.color} scale={scale} reduceMotion={reduceMotion} />
                )}

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center">
                    <motion.div
                        className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full px-4 sm:h-40 sm:w-40"
                        style={{
                            background: `radial-gradient(circle, ${technique.color}20 0%, ${technique.color}10 54%, transparent 74%)`,
                            boxShadow: `0 0 42px ${technique.color}24`,
                        }}
                        animate={{ scale: reduceMotion ? 1 : Math.max(0.96, Math.min(1.08, scale * 0.96)) }}
                        transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
                    >
                        <div
                            className="absolute inset-3 rounded-full border"
                            style={{ borderColor: `${technique.color}26` }}
                        />
                        <p className="relative text-[11px] font-semibold uppercase text-muted-foreground">
                            {isActive ? "Ikuti Ritme" : "Perjalanan Napas"}
                        </p>
                        <p className="relative mt-2 text-3xl font-semibold drop-shadow-sm" style={{ color: technique.color }}>
                            {phase === "ready" ? "Siap" : phase === "complete" ? "Selesai" : getPhaseLabel(phase)}
                        </p>
                        {phaseSecondsRemaining !== null && (
                            <p className="relative mt-1 text-sm text-muted-foreground">{phaseSecondsRemaining} detik lagi</p>
                        )}
                    </motion.div>
                </div>

                <div className="absolute inset-x-6 bottom-5 h-1.5 overflow-hidden rounded-full bg-background/70">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: technique.color }}
                        animate={{ width: `${sessionProgress}%` }}
                        transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    />
                </div>
            </div>
        </div>
    );
}
