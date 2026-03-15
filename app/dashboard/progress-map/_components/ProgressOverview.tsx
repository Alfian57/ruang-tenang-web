"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FullMapResponse } from "@/types/progress-map";
import { Map, Compass, Flag, Sparkles, Gift, Zap, Coins } from "lucide-react";

interface ProgressOverviewProps {
    mapData: FullMapResponse;
}

export function ProgressOverview({ mapData }: ProgressOverviewProps) {
    const prefersReducedMotion = useReducedMotion();

    const stats = [
        {
            icon: Map,
            label: "Area Terbuka",
            value: `${mapData.unlocked_regions}/${mapData.total_regions}`,
            iconColor: "var(--theme-accent-dark)",
            bgColor: "var(--theme-accent-light)",
        },
        {
            icon: Flag,
            label: "Landmark",
            value: `${mapData.unlocked_landmarks}/${mapData.total_landmarks}`,
            iconColor: "var(--color-primary)",
            bgColor: "color-mix(in srgb, var(--color-primary) 14%, white)",
        },
        {
            icon: Compass,
            label: "Progress",
            value: `${Math.round(mapData.overall_progress)}%`,
            iconColor: "var(--theme-fab-to)",
            bgColor: "color-mix(in srgb, var(--theme-fab-to) 16%, white)",
        },
    ];

    return (
        <div className="space-y-4">
            <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.08 }}
                className="rounded-2xl border p-4"
                style={{
                    borderColor: "var(--theme-accent-border)",
                    background: "linear-gradient(to right, color-mix(in srgb, var(--theme-accent-light) 45%, white), color-mix(in srgb, var(--theme-accent-soft) 55%, white), color-mix(in srgb, var(--theme-accent-light) 40%, white))",
                }}
            >
                <div className="flex items-start gap-2" style={{ color: "var(--theme-accent-text)" }}>
                    <Gift className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs md:text-sm leading-relaxed font-medium">
                        Selesaikan landmark pada tiap area peta untuk membuka klaim hadiah.
                        Setiap klaim bisa memberi <span className="font-semibold inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> EXP</span> dan <span className="font-semibold inline-flex items-center gap-1"><Coins className="h-3.5 w-3.5" /> Gold</span>.
                    </p>
                </div>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: i * 0.1 }}
                        className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-sm p-4 text-center shadow-xs"
                    >
                        <div className="inline-flex p-2.5 rounded-xl mb-2" style={{ backgroundColor: stat.bgColor }}>
                            <stat.icon className="h-4 w-4" style={{ color: stat.iconColor }} />
                        </div>
                        <p className="text-xl font-black tracking-tight text-gray-900">{stat.value}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Overall progress bar */}
            <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
                className="rounded-2xl border border-white/70 bg-white/85 backdrop-blur-sm p-5 shadow-xs"
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" style={{ color: "var(--theme-accent)" }} />
                        <span className="text-sm font-semibold text-gray-700">
                            Perjalanan Keseluruhan
                        </span>
                    </div>
                    <span className="text-sm font-black" style={{ color: "var(--theme-accent-dark)" }}>
                        {Math.round(mapData.overall_progress)}%
                    </span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: "linear-gradient(to right, var(--theme-fab-from), var(--color-primary), var(--theme-fab-to))",
                        }}
                        initial={prefersReducedMotion ? undefined : { width: 0 }}
                        animate={{ width: `${mapData.overall_progress}%` }}
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                    Total capaian dihitung dari region dan landmark yang sudah terbuka.
                </p>
            </motion.div>
        </div>
    );
}
