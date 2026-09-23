"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Flag, Gift, Map } from "lucide-react";
import type { FullMapResponse } from "@/types/progress-map";

interface ProgressOverviewProps {
    mapData: FullMapResponse;
}

export function ProgressOverview({ mapData }: ProgressOverviewProps) {
    const prefersReducedMotion = useReducedMotion();
    const progress = Math.max(0, Math.min(100, mapData.overall_progress));
    const stats = [
        {
            icon: Map,
            label: "Area terbuka",
            value: `${mapData.unlocked_regions}/${mapData.total_regions}`,
            tone: "bg-emerald-50 text-emerald-600",
        },
        {
            icon: Flag,
            label: "Landmark",
            value: `${mapData.unlocked_landmarks}/${mapData.total_landmarks}`,
            tone: "bg-sky-50 text-sky-600",
        },
        {
            icon: Compass,
            label: "Peta selesai",
            value: `${Math.round(progress)}%`,
            tone: "bg-violet-50 text-violet-600",
        },
    ];

    return (
        <section className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,0.7fr))_minmax(18rem,1.7fr)]">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.08 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/88 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md lg:flex-col lg:items-start"
                >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stat.tone}`}>
                        <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xl font-black tracking-tight text-slate-950">{stat.value}</p>
                        <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                    </div>
                </motion.div>
            ))}

            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.24 }}
                className="relative overflow-hidden rounded-2xl border border-amber-100 bg-[linear-gradient(135deg,#fffbeb,#fff7ed)] p-4 shadow-sm"
            >
                <Compass className="pointer-events-none absolute -right-2 -top-3 h-20 w-20 text-amber-200/60" strokeWidth={1.2} />
                <div className="relative flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400 text-white shadow-sm">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black text-amber-950">Progres keseluruhan</p>
                                <p className="mt-0.5 text-xs text-amber-800/70">Hadiah menunggu di checkpoint yang selesai.</p>
                            </div>
                            <span className="text-lg font-black text-amber-700">{Math.round(progress)}%</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white shadow-inner">
                            <motion.div
                                className="h-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-primary"
                                initial={prefersReducedMotion ? false : { width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
